/**
 * M5.1 — Session Pattern Reader
 * Truth Class D: Derived Pattern Intelligence
 * Authority: M5.1_Session_Pattern_Reader_Contract_UPDATED.md
 *
 * Pure computation layer. Reads eligible HARI session history and produces
 * a PatternSummary. No UI. No M4 modification. No side effects beyond the
 * PatternSummary cache.
 *
 * Public API (M5.1 §11):
 *   computePatternSummary()          — compute fresh from eligible history
 *   getOrComputePatternSummary()     — cache-first convenience accessor
 *   loadCachedPatternSummary()       — load cache or null if stale/absent
 *   savePatternSummary()             — persist computed summary
 *   invalidatePatternSummaryCache()  — discard cache on history change
 *
 * Consumer rules (M5.1 §11.1):
 *   M5.2 — may act on 'active' | 'high_confidence' for dimensions 1–4
 *   M5.3 — may act on 'active' | 'high_confidence' for dimensions 5–6
 *   M5.4 — may read any state including 'candidate' for display
 *   No consumer may modify a PatternSummary.
 */

import type { HistoryEntry } from '../../types'
import type { FlareSensitivity, RoundCountProfile } from '../../types/hari'
import type {
  DetectedPattern,
  PatternState,
  PatternDimension,
  PatternSummary,
  OutcomeTrajectory,
} from '../../types/patterns'
import { getEligibleHariHistory } from '../../storage/sessionHistory'
import {
  loadCachedPatternSummary,
  savePatternSummary,
  invalidatePatternSummaryCache,
} from '../../storage/patternSummary'

// Re-export storage primitives as part of the public API surface
export { loadCachedPatternSummary, savePatternSummary, invalidatePatternSummaryCache }

// ── Declared constants (M5.1 §5.1, §6, §7) ───────────────────────────────────

const RECENCY_DECAY_BASE = 0.80
const RECENCY_AGE_CAP_DAYS = 90
const RECENCY_AGE_CAP_WEIGHT = 0.25
const RECENCY_STALENESS_FLOOR = 0.15
const UNCERTAIN_VALUE_WEIGHT = 0.5
const FLARE_HIGH_MIN_WEIGHT = 0.50         // §5.6 safety floor for 'high' flare observations

const CONTRADICTION_PENALTY_MULTIPLIER = 2.0
const SAFETY_CONTRADICTION_MULTIPLIER = 3.0

const CANDIDATE_MIN_RAW_COUNT = 2
const ACTIVE_MIN_RAW_COUNT = 3
const ACTIVE_MIN_NET_WEIGHTED_SCORE = 1.8
const HIGH_CONFIDENCE_MIN_RAW_COUNT = 5
const HIGH_CONFIDENCE_MIN_NET_WEIGHTED_SCORE = 3.0
const HIGH_CONFIDENCE_CLEAN_WINDOW = 3     // no contradictions at positions 0–2

// ── Internal types ────────────────────────────────────────────────────────────

type EligibleSession = HistoryEntry & {
  hari_metadata: NonNullable<HistoryEntry['hari_metadata']>
}

interface WeightedObs<T> {
  value: T
  effectiveWeight: number
  position: number        // 0 = most recent
  sessionIsSafetyConcern: boolean
}

// ── Weight computation (M5.1 §5) ─────────────────────────────────────────────

function ageInDays(timestamp: string, now: Date): number {
  return (now.getTime() - new Date(timestamp).getTime()) / (86_400_000)
}

function effectiveWeight(position: number, ageDays: number): number {
  const positional = Math.pow(RECENCY_DECAY_BASE, position)
  const ageCap = ageDays > RECENCY_AGE_CAP_DAYS ? RECENCY_AGE_CAP_WEIGHT : Infinity
  return Math.min(positional, ageCap)
}

// ── Safety concern detection (M5.1 §6.3) ─────────────────────────────────────

function sessionIsSafetyConcern(session: EligibleSession): boolean {
  if (session.result === 'worse' || session.result === 'interrupted') return true
  return session.hari_metadata.reassessment_history.some((r) => r.response === 'worse')
}

// ── Pattern state gate (M5.1 §7) ─────────────────────────────────────────────

function resolveState(
  rawConcordant: number,
  netScore: number,
  hasRecentContradiction: boolean,
  hasSafetyAtPos0: boolean,
  cleanWindowOk: boolean
): PatternState {
  // Safety at position 0 always suspends (§7 suspended, §6.3)
  if (hasSafetyAtPos0) return 'suspended'

  // Determine uncapped state (ignoring recent contradiction for now)
  let uncapped: PatternState = 'insufficient'
  if (
    rawConcordant >= HIGH_CONFIDENCE_MIN_RAW_COUNT &&
    netScore >= HIGH_CONFIDENCE_MIN_NET_WEIGHTED_SCORE &&
    cleanWindowOk
  ) {
    uncapped = 'high_confidence'
  } else if (rawConcordant >= ACTIVE_MIN_RAW_COUNT && netScore >= ACTIVE_MIN_NET_WEIGHTED_SCORE) {
    uncapped = 'active'
  } else if (rawConcordant >= CANDIDATE_MIN_RAW_COUNT) {
    uncapped = 'candidate'
  }

  // Recent contradiction suspends patterns that would have reached active+ (§7 suspended)
  if (hasRecentContradiction && (uncapped === 'active' || uncapped === 'high_confidence')) {
    return 'suspended'
  }

  // Recent contradiction caps remaining states at candidate (§6.2)
  if (hasRecentContradiction) {
    return rawConcordant >= CANDIDATE_MIN_RAW_COUNT ? 'candidate' : 'insufficient'
  }

  return uncapped
}

// ── Generic intake-field dimension (Dimensions 1–4) ──────────────────────────
//
// Used for: symptom_focus_tendency, flare_sensitivity_tendency,
//           session_intent_tendency, session_length_tendency
//
// Each session contributes one observation (the intake field value).
// Dominant value = highest aggregate effective weight group.
// Safety contradiction = contradicting observation on a safety-concern session.

function computeIntakeDimension<T extends string>(
  dimension: PatternDimension,
  sessions: EligibleSession[],
  now: Date,
  getValue: (s: EligibleSession) => T | null,
  isUncertainValue: (v: T) => boolean,
  isSafetyContradictionByValue: ((v: T, dominant: T) => boolean) | null,
  flareHighException: boolean,
  formatSummary: (state: PatternState, dominant: T) => string
): DetectedPattern<T> | null {
  // Collect weighted observations
  const obs: WeightedObs<T>[] = []
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i]
    const value = getValue(s)
    if (value === null) continue  // absent field — skip (not a contradiction, §4.1)

    const age = ageInDays(s.timestamp, now)
    let w = effectiveWeight(i, age)

    if (w < RECENCY_STALENESS_FLOOR) continue  // staleness exclusion (§5.5)

    // Flare 'high' safety floor (§5.6)
    if (flareHighException && (value as string) === 'high') {
      w = Math.max(w, FLARE_HIGH_MIN_WEIGHT)
    }

    // Uncertainty weight reduction (§4.4)
    if (isUncertainValue(value)) w *= UNCERTAIN_VALUE_WEIGHT

    obs.push({ value, effectiveWeight: w, position: i, sessionIsSafetyConcern: sessionIsSafetyConcern(s) })
  }

  if (obs.length === 0) return null

  // Determine dominant value: highest sum of effective weights per value group
  const groupWeights = new Map<T, number>()
  for (const o of obs) {
    groupWeights.set(o.value, (groupWeights.get(o.value) ?? 0) + o.effectiveWeight)
  }
  let dominant: T | null = null
  let maxW = -Infinity
  for (const [v, w] of groupWeights) {
    if (w > maxW) { maxW = w; dominant = v }
  }
  if (dominant === null) return null

  // Classify and score
  let rawConcordant = 0
  let concordantSum = 0
  let contradictionPenalty = 0
  const contradictingPositions = new Set<number>()
  let hasSafetyAtPos0 = false

  for (const o of obs) {
    if (o.value === dominant) {
      rawConcordant++
      concordantSum += o.effectiveWeight
    } else {
      // Is this a safety-level contradiction?
      const safetyByValue = isSafetyContradictionByValue?.(o.value, dominant) ?? false
      const isSafety = safetyByValue || o.sessionIsSafetyConcern
      const multiplier = isSafety ? SAFETY_CONTRADICTION_MULTIPLIER : CONTRADICTION_PENALTY_MULTIPLIER
      contradictionPenalty += o.effectiveWeight * multiplier
      contradictingPositions.add(o.position)
      if (o.position === 0 && isSafety) hasSafetyAtPos0 = true
    }
  }

  if (rawConcordant < CANDIDATE_MIN_RAW_COUNT) return null

  const netScore = concordantSum - contradictionPenalty
  const hasRecentContradiction = contradictingPositions.has(0) || contradictingPositions.has(1)

  // Clean window: no contradictions at positions 0, 1, 2 (M5.1 §7 high_confidence)
  const cleanWindowOk =
    !contradictingPositions.has(0) &&
    !contradictingPositions.has(1) &&
    !contradictingPositions.has(2)

  const state = resolveState(rawConcordant, netScore, hasRecentContradiction, hasSafetyAtPos0, cleanWindowOk)

  return {
    dimension,
    state,
    dominant_value: dominant,
    raw_concordant_count: rawConcordant,
    net_weighted_concordance_score: Math.round(netScore * 1000) / 1000,
    has_recent_contradiction: hasRecentContradiction,
    plain_summary: formatSummary(state, dominant),
  }
}

// ── Dimension 5 — protocol_benefit_tendency ───────────────────────────────────
//
// Finds the protocol with the strongest net beneficial weighted score.
// adverse outcomes for a protocol = safety contradiction for that protocol.
// neutral ('same') observations contribute neither concordance nor contradiction.

function computeProtocolBenefitTendency(
  sessions: EligibleSession[],
  now: Date
): DetectedPattern<string> | null {
  interface ProtocolObs {
    protocol_id: string
    outcomeClass: 'beneficial' | 'neutral' | 'adverse'
    weight: number
    position: number
    isSafety: boolean
  }

  const all: ProtocolObs[] = []
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i]
    const protocol_id = s.hari_metadata.intervention.mapped_protocol_id
    if (!protocol_id) continue

    const age = ageInDays(s.timestamp, now)
    const w = effectiveWeight(i, age)
    if (w < RECENCY_STALENESS_FLOOR) continue

    const outcomeClass: 'beneficial' | 'neutral' | 'adverse' =
      s.result === 'better' ? 'beneficial' :
      (s.result === 'worse' || s.result === 'interrupted') ? 'adverse' :
      'neutral'

    all.push({
      protocol_id,
      outcomeClass,
      weight: w,
      position: i,
      isSafety: outcomeClass === 'adverse',
    })
  }

  if (all.length === 0) return null

  // Dominant = protocol with highest total BENEFICIAL weight.
  // Adverse observations are not used for selection — only for state scoring.
  // This ensures a real beneficial pattern can still be detected (and suspended)
  // even when recent adverse outcomes drive the net score negative.
  const beneficialWeightByProtocol = new Map<string, number>()
  for (const o of all) {
    if (o.outcomeClass === 'beneficial') {
      beneficialWeightByProtocol.set(
        o.protocol_id,
        (beneficialWeightByProtocol.get(o.protocol_id) ?? 0) + o.weight
      )
    }
  }

  let dominant: string | null = null
  let maxBeneficialWeight = 0
  for (const [pid, w] of beneficialWeightByProtocol) {
    if (w > maxBeneficialWeight) { maxBeneficialWeight = w; dominant = pid }
  }
  if (dominant === null) return null  // no beneficial observations at all

  // Now apply standard concordance logic for the dominant protocol only
  const dominantObs = all.filter((o) => o.protocol_id === dominant)
  let rawConcordant = 0
  let concordantSum = 0
  let contradictionPenalty = 0
  const contradictingPositions = new Set<number>()
  let hasSafetyAtPos0 = false

  for (const o of dominantObs) {
    if (o.outcomeClass === 'beneficial') {
      rawConcordant++
      concordantSum += o.weight
    } else if (o.outcomeClass === 'adverse') {
      contradictionPenalty += o.weight * SAFETY_CONTRADICTION_MULTIPLIER
      contradictingPositions.add(o.position)
      if (o.position === 0) hasSafetyAtPos0 = true
    }
    // neutral: skip
  }

  if (rawConcordant < CANDIDATE_MIN_RAW_COUNT) return null

  const netScore = concordantSum - contradictionPenalty
  const hasRecentContradiction = contradictingPositions.has(0) || contradictingPositions.has(1)
  const cleanWindowOk =
    !contradictingPositions.has(0) && !contradictingPositions.has(1) && !contradictingPositions.has(2)

  const state = resolveState(rawConcordant, netScore, hasRecentContradiction, hasSafetyAtPos0, cleanWindowOk)

  const summaryMap: Record<PatternState, string> = {
    insufficient: '',
    candidate: `Protocol "${dominant}" shows early benefit signal`,
    active: `Protocol "${dominant}" has helped in recent sessions`,
    high_confidence: `Protocol "${dominant}" consistently beneficial`,
    suspended: `Recent protocol outcome — pattern paused`,
  }

  return {
    dimension: 'protocol_benefit_tendency',
    state,
    dominant_value: dominant,
    raw_concordant_count: rawConcordant,
    net_weighted_concordance_score: Math.round(netScore * 1000) / 1000,
    has_recent_contradiction: hasRecentContradiction,
    plain_summary: summaryMap[state],
  }
}

// ── Dimension 6 — pacing_tendency ────────────────────────────────────────────
//
// Derives RoundCountProfile from round_plan.breath_count + reassessment_history.length.
// State is capped at 'candidate' due to D1 debt (round_plan singular). (M5.1 §13)

function deriveRoundCountProfile(breathCount: number, roundsCompleted: number): RoundCountProfile {
  if (roundsCompleted >= 3) return 'extended'
  if (breathCount <= 10 && roundsCompleted <= 1) return 'minimal'
  if (breathCount === 20 || (roundsCompleted >= 1 && roundsCompleted <= 2)) return 'short'
  return 'standard'
}

function computePacingTendency(
  sessions: EligibleSession[],
  now: Date
): DetectedPattern<RoundCountProfile> | null {
  const result = computeIntakeDimension<RoundCountProfile>(
    'pacing_tendency',
    sessions,
    now,
    (s) => {
      const breathCount = s.hari_metadata.round_plan.breath_count
      const roundsCompleted = s.hari_metadata.reassessment_history.length
      return deriveRoundCountProfile(breathCount, roundsCompleted)
    },
    () => false,  // no uncertain values for RoundCountProfile
    null,
    false,
    (state, dominant) => pacingSummary(state, dominant)
  )

  if (result === null) return null

  // D1 debt cap: state may not exceed 'candidate' (M5.1 §13, D1)
  const cappedState: PatternState =
    result.state === 'active' || result.state === 'high_confidence'
      ? 'candidate'
      : result.state

  return {
    ...result,
    state: cappedState,
    plain_summary: pacingSummary(cappedState, result.dominant_value),
  }
}

function pacingSummary(state: PatternState, dominant: RoundCountProfile): string {
  if (state === 'suspended') return 'Pacing pattern paused — recent changes detected'
  if (state === 'insufficient') return ''
  const label: Record<RoundCountProfile, string> = {
    minimal: 'shorter sessions',
    short: 'brief sessions',
    standard: 'standard-length sessions',
    extended: 'longer multi-round sessions',
  }
  return `Tends toward ${label[dominant]}`
}

// ── Dimension 7 — outcome_trajectory ─────────────────────────────────────────
//
// Observational only — never feeds M5.2 or M5.3 (M5.1 §10.3).
// 'adverse' is detected by recency (last 2 sessions); others by majority direction.

function computeOutcomeTrajectory(
  sessions: EligibleSession[],
  now: Date
): DetectedPattern<OutcomeTrajectory> | null {
  // Map result to trajectory class
  function toTrajectory(s: EligibleSession): OutcomeTrajectory {
    if (s.result === 'worse' || s.result === 'interrupted') return 'adverse'
    if (s.result === 'better') return 'improving'
    if (s.result === 'same') return 'stable'
    return 'variable'
  }

  const result = computeIntakeDimension<OutcomeTrajectory>(
    'outcome_trajectory',
    sessions,
    now,
    (s) => toTrajectory(s),
    (v) => v === 'variable',  // 'variable' is uncertain
    null,
    false,
    (state, dominant) => trajectorySummary(state, dominant)
  )

  if (result === null) return null

  // Recency override for 'adverse': if position 0 or 1 is 'adverse', dominant = 'adverse'
  // Check sessions directly to enforce (M5.1 §3 Dimension 7 trajectory rules)
  const recentSessions = sessions.slice(0, 2)
  const recentAdverse = recentSessions.some(
    (s) => s.result === 'worse' || s.result === 'interrupted'
  )
  if (recentAdverse && result.dominant_value !== 'adverse') {
    // Recompute with forced adverse dominance — rebuild from sessions
    const adverseCount = recentSessions.filter(
      (s) => s.result === 'worse' || s.result === 'interrupted'
    ).length
    return {
      dimension: 'outcome_trajectory',
      state: adverseCount >= CANDIDATE_MIN_RAW_COUNT ? 'candidate' : 'candidate',
      dominant_value: 'adverse',
      raw_concordant_count: adverseCount,
      net_weighted_concordance_score: adverseCount > 0 ? adverseCount * 0.9 : 0,
      has_recent_contradiction: false,
      plain_summary: 'Recent sessions reported as worse or interrupted',
    }
  }

  return result
}

function trajectorySummary(state: PatternState, dominant: OutcomeTrajectory): string {
  if (state === 'suspended' || state === 'insufficient') return ''
  const descriptions: Record<OutcomeTrajectory, string> = {
    improving: 'Most sessions reported as improved',
    stable:    'Sessions tend to feel stable or unchanged',
    variable:  'Session outcomes have been mixed',
    adverse:   'Recent sessions reported as worse or interrupted',
  }
  return descriptions[dominant]
}

// ── Plain summary helpers for intake dimensions ───────────────────────────────

function intakeSummary(state: PatternState, label: string): string {
  if (state === 'insufficient') return ''
  if (state === 'suspended') return `Recent change detected — ${label} pattern paused`
  return label
}

// ── Main computation (M5.1 §11) ───────────────────────────────────────────────

/**
 * Compute a fresh PatternSummary from eligible session history.
 *
 * Always returns a valid PatternSummary. On any failure, all pattern entries
 * are null (semantically 'insufficient'). Never throws.
 * Authority: M5.1 §12 (graceful degradation)
 */
export function computePatternSummary(): PatternSummary {
  const emptyPatterns = (): PatternSummary['patterns'] => ({
    symptom_focus_tendency:     null,
    flare_sensitivity_tendency: null,
    session_intent_tendency:    null,
    session_length_tendency:    null,
    protocol_benefit_tendency:  null,
    pacing_tendency:            null,
    outcome_trajectory:         null,
  })

  try {
    const raw = getEligibleHariHistory()

    // Filter to sessions with hari_metadata present (§2.3)
    const sessions = raw.filter(
      (s): s is EligibleSession => s.hari_metadata !== undefined && s.hari_metadata !== null
    )

    // Sort most recent first for positional indexing (§5.2)
    sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const now = new Date()
    const source_session_ids = sessions.map((s) => s.session_id)

    // Minimum session requirement (§2.2)
    if (sessions.length < CANDIDATE_MIN_RAW_COUNT) {
      return {
        schema_version: 1,
        computed_at: now.toISOString(),
        source_session_count: sessions.length,
        source_session_ids,
        patterns: emptyPatterns(),
      }
    }

    // ── Dimension 1: symptom_focus_tendency ───────────────────────────────────
    const symptomFocusLabels: Record<string, string> = {
      proactive:     'Proactive / no major focus selected often',
      neck_upper:    'Neck / upper region selected often',
      rib_side_back: 'Rib / side / back selected often',
      jaw_facial:    'Jaw / facial tension selected often',
      spread_tension:'Spread tension selected often',
      mixed:         'Mixed / uncertain focus selected often',
    }
    const symptom_focus_tendency = computeIntakeDimension(
      'symptom_focus_tendency', sessions, now,
      (s) => s.hari_metadata.intake.symptom_focus,
      (v) => v === 'mixed',
      null,
      false,
      (state, dominant) => intakeSummary(state, symptomFocusLabels[dominant] ?? dominant)
    )

    // ── Dimension 2: flare_sensitivity_tendency ───────────────────────────────
    // Safety constraint: toward-higher contradictions are safety-level (§6.4)
    const flareOrder: Record<FlareSensitivity, number> = { low: 0, moderate: 1, high: 2, not_sure: -1 }
    const flare_sensitivity_tendency = computeIntakeDimension(
      'flare_sensitivity_tendency', sessions, now,
      (s) => s.hari_metadata.intake.flare_sensitivity,
      (v) => v === 'not_sure',
      (v, dominant) => flareOrder[v] > flareOrder[dominant],  // higher = safety contradiction
      true,  // flare high exception (§5.6)
      (state, dominant) => {
        const labels: Record<FlareSensitivity, string> = {
          low:      'Flare sensitivity frequently reported as low',
          moderate: 'Flare sensitivity frequently reported as moderate',
          high:     'Flare sensitivity frequently reported as high',
          not_sure: 'Flare sensitivity tends to be uncertain',
        }
        return intakeSummary(state, labels[dominant])
      }
    )

    // ── Dimension 3: session_intent_tendency ──────────────────────────────────
    const intentLabels: Record<string, string> = {
      quick_reset:             'Quick reset sessions selected most often',
      deeper_regulation:       'Deeper regulation sessions selected most often',
      flare_sensitive_support: 'Flare-sensitive support sessions selected most often',
      cautious_test:           'Cautious test sessions selected most often',
    }
    const session_intent_tendency = computeIntakeDimension(
      'session_intent_tendency', sessions, now,
      (s) => s.hari_metadata.intake.session_intent,
      () => false,
      null,
      false,
      (state, dominant) => intakeSummary(state, intentLabels[dominant] ?? dominant)
    )

    // ── Dimension 4: session_length_tendency ──────────────────────────────────
    const lengthLabels: Record<string, string> = {
      shorter:  'Shorter sessions preferred most often',
      standard: 'Standard-length sessions preferred most often',
      longer:   'Longer sessions preferred most often',
      not_sure: 'Session length preference tends to be uncertain',
    }
    const session_length_tendency = computeIntakeDimension(
      'session_length_tendency', sessions, now,
      (s) => s.hari_metadata.intake.session_length_preference,
      (v) => v === 'not_sure',
      null,
      false,
      (state, dominant) => intakeSummary(state, lengthLabels[dominant] ?? dominant)
    )

    // ── Dimension 5: protocol_benefit_tendency ────────────────────────────────
    const protocol_benefit_tendency = computeProtocolBenefitTendency(sessions, now)

    // ── Dimension 6: pacing_tendency (D1 capped at candidate) ─────────────────
    const pacing_tendency = computePacingTendency(sessions, now)

    // ── Dimension 7: outcome_trajectory (observational only) ──────────────────
    const outcome_trajectory = computeOutcomeTrajectory(sessions, now)

    return {
      schema_version: 1,
      computed_at: now.toISOString(),
      source_session_count: sessions.length,
      source_session_ids,
      patterns: {
        symptom_focus_tendency,
        flare_sensitivity_tendency,
        session_intent_tendency,
        session_length_tendency,
        protocol_benefit_tendency,
        pacing_tendency,
        outcome_trajectory,
      },
    }
  } catch {
    // Graceful degradation — any error returns all-null summary (M5.1 §12)
    return {
      schema_version: 1,
      computed_at: new Date().toISOString(),
      source_session_count: 0,
      source_session_ids: [],
      patterns: emptyPatterns(),
    }
  }
}

// ── Cache staleness check (M5.1 §8.3) ────────────────────────────────────────

function isCacheStale(cached: PatternSummary): boolean {
  try {
    const current = getEligibleHariHistory()
      .filter((s) => s.hari_metadata !== undefined && s.hari_metadata !== null)
      .map((s) => s.session_id)
      .sort()
    const cachedIds = [...cached.source_session_ids].sort()
    if (current.length !== cachedIds.length) return true
    return current.some((id, i) => id !== cachedIds[i])
  } catch {
    return true
  }
}

// ── Primary consumer-facing entry point (M5.1 §11) ───────────────────────────

/**
 * Return PatternSummary from cache if valid, or compute and cache a fresh one.
 * This is the function M5.2, M5.3, and M5.4 should call.
 * Never throws — returns all-null patterns on any failure.
 * Authority: M5.1 §11
 */
export function getOrComputePatternSummary(): PatternSummary {
  try {
    const cached = loadCachedPatternSummary()
    if (cached && !isCacheStale(cached)) return cached

    const fresh = computePatternSummary()
    savePatternSummary(fresh)
    return fresh
  } catch {
    return computePatternSummary()
  }
}
