/**
 * M4.4 MVP — Link Mapping Engine
 * Authority: M4.0–4.5_v1.1_CLARIFICATIONS.md §M4.4
 *
 * Models likely functional links between current session states, regions,
 * and regulation-relevant patterns.
 *
 * Rules:
 *   - Probabilistic in meaning, conservative in interpretation
 *   - Session-bound: no link becomes long-term truth here
 *   - 0–2 links typical (M4_GROUND_TRUTH §link_mapping)
 *   - No chains. No causal claims.
 *   - Low confidence = fewer links, reduced strength, simpler explanation
 *   - Current session must have veto power over history expectations
 *
 * This is NOT a structural diagnosis map.
 * This is NOT a causal certainty engine.
 * Links are working hypotheses to inform safer intervention choice.
 */
import type {
  HariSessionIntake,
  BodyContextSummary,
  StateEstimate,
  LinkMap,
  HariLink,
  LinkStrength,
  ConfidenceLevel,
} from '../../types/hari'

// ── Internal Types ────────────────────────────────────────────────────────────

interface LinkCandidate {
  link_type: HariLink['link_type']
  linked_elements: string[]
  strength_score: number  // 0=weak, 1=moderate, 2=elevated
  confidence: ConfidenceLevel
  support_factors: string[]
}

// ── Strength Helpers ──────────────────────────────────────────────────────────

function toStrength(score: number): LinkStrength {
  if (score <= 0) return 'weak'
  if (score === 1) return 'moderate'
  return 'elevated'
}

// ── Link Candidate Generators ─────────────────────────────────────────────────

/**
 * Guarding Distribution Link — M4.4 §10
 * When guarding load is elevated, breath and multiple regions may interact.
 */
function tryGuardingDistributionLink(
  intake: HariSessionIntake,
  state: StateEstimate
): LinkCandidate | null {
  if (state.guarding_load !== 'elevated' && state.guarding_load !== 'moderate') return null

  const elements: string[] = ['elevated guarding load']
  const factors: string[] = []

  if (intake.symptom_focus === 'jaw_facial') {
    elements.push('jaw tension')
    factors.push('jaw focus with elevated guarding')
  }
  if (intake.symptom_focus === 'neck_upper') {
    elements.push('neck/upper tension')
    factors.push('upper region focus with guarding load')
  }
  if (intake.symptom_focus === 'spread_tension') {
    elements.push('spread tension pattern')
    factors.push('distributed tension with elevated guarding')
  }
  if (state.compression_sensitivity !== 'low') {
    elements.push('compression sensitivity')
    factors.push('compression sensitivity co-present with guarding')
  }

  if (elements.length < 2) return null  // need at least 2 interacting elements

  const strengthScore = state.guarding_load === 'elevated' ? 2 : 1
  const confidence: ConfidenceLevel =
    state.confidence_level === 'high' && factors.length >= 2 ? 'high'
    : state.confidence_level === 'low' ? 'low'
    : 'moderate'

  return {
    link_type: 'guarding_distribution',
    linked_elements: elements.slice(0, 4),
    strength_score: strengthScore,
    confidence,
    support_factors: factors.slice(0, 3),
  }
}

/**
 * Posture-to-State Link — M4.4 §11
 * Context (driving, sitting, after-strain) may interact with current state.
 */
function tryPostureToStateLink(
  intake: HariSessionIntake,
  state: StateEstimate
): LinkCandidate | null {
  const context = intake.current_context

  if (context === 'lying_down') return null
  if (
    state.compression_sensitivity === 'low' &&
    state.guarding_load === 'low'
  ) {
    return null  // not enough state support for this link
  }

  const elements: string[] = []
  const factors: string[] = []
  let strengthScore = 0

  if (context === 'driving') {
    elements.push('driving context', 'compression-sensitive state')
    factors.push('driving context may contribute to compression-sensitive pattern')
    strengthScore = 2
  } else if (context === 'sitting') {
    elements.push('prolonged sitting', 'compression-sensitive state')
    factors.push('sitting context with elevated compression sensitivity')
    strengthScore = 1
  } else if (context === 'after_strain') {
    elements.push('post-strain context', 'guarding load')
    factors.push('after-strain context consistent with elevated protective response')
    strengthScore = state.guarding_load === 'elevated' ? 2 : 1
  } else if (context === 'standing') {
    elements.push('standing context')
    factors.push('standing context with current tension pattern')
    strengthScore = 0
  }

  if (elements.length < 2) return null

  const confidence: ConfidenceLevel = state.confidence_level

  return {
    link_type: 'posture_to_state',
    linked_elements: elements,
    strength_score: strengthScore,
    confidence,
    support_factors: factors,
  }
}

/**
 * Compression-Spread Link — M4.4 §9
 * Elevated compression sensitivity with spread or distributed symptoms.
 */
function tryCompressionSpreadLink(
  intake: HariSessionIntake,
  state: StateEstimate
): LinkCandidate | null {
  if (state.compression_sensitivity === 'low') return null
  if (
    intake.symptom_focus !== 'spread_tension' &&
    intake.symptom_focus !== 'mixed'
  ) {
    return null
  }

  const elements = ['compression-sensitive state', 'spread tension pattern']
  const factors: string[] = ['elevated compression sensitivity with spread symptom pattern']

  if (state.flare_sensitivity_estimate !== 'low') {
    factors.push('flare sensitivity may contribute to spread pattern')
    elements.push('flare sensitivity')
  }

  const strengthScore = state.compression_sensitivity === 'elevated' ? 2 : 1

  return {
    link_type: 'compression_spread',
    linked_elements: elements,
    strength_score: strengthScore,
    confidence: state.confidence_level,
    support_factors: factors,
  }
}

/**
 * Preference/Tolerance Link — M4.4 §14
 * Today's session intent or length preference interacts with state tolerance.
 */
function tryPreferenceToleranceLink(
  intake: HariSessionIntake,
  state: StateEstimate
): LinkCandidate | null {
  // Only surface when preference and tolerance are in notable alignment or tension
  const wantsShort =
    intake.session_length_preference === 'shorter' ||
    intake.session_intent === 'quick_reset'
  const toleranceLimited = state.session_tolerance !== 'elevated'

  if (!wantsShort && !toleranceLimited) return null

  const elements: string[] = []
  const factors: string[] = []

  if (wantsShort && toleranceLimited) {
    elements.push("today's shorter-session preference", 'limited session tolerance')
    factors.push('preference and current tolerance aligned toward brevity')
  } else if (toleranceLimited) {
    elements.push('current session tolerance', 'session length preference')
    factors.push('current tolerance suggests keeping the session shorter than usual')
  }

  if (elements.length < 2) return null

  return {
    link_type: 'preference_tolerance',
    linked_elements: elements,
    strength_score: 1,
    confidence: 'moderate',
    support_factors: factors,
  }
}

// ── Confidence-Aware Link Filtering ─────────────────────────────────────────

/**
 * When confidence is low, reduce link count and strength.
 * Authority: M4.4 §22
 */
function applyConfidenceFilter(
  candidates: LinkCandidate[],
  confidence: ConfidenceLevel
): LinkCandidate[] {
  if (confidence === 'low') {
    // Only keep the strongest single link, and downgrade it
    const strongest = candidates.reduce<LinkCandidate | null>((best, c) =>
      !best || c.strength_score > best.strength_score ? c : best
    , null)
    if (!strongest) return []
    return [{ ...strongest, strength_score: Math.max(0, strongest.strength_score - 1) }]
  }

  if (confidence === 'moderate') {
    // Keep up to 2 links, no inflation
    return candidates
      .sort((a, b) => b.strength_score - a.strength_score)
      .slice(0, 2)
  }

  // High confidence: up to 3 links
  return candidates
    .sort((a, b) => b.strength_score - a.strength_score)
    .slice(0, 3)
}

// ── Distribution Determination ────────────────────────────────────────────────

function determineDistribution(
  intake: HariSessionIntake,
  state: StateEstimate
): boolean {
  const multiRegion =
    intake.symptom_focus === 'spread_tension' ||
    intake.symptom_focus === 'mixed'
  const highGuarding = state.guarding_load === 'elevated'
  const highCompression = state.compression_sensitivity === 'elevated'
  return multiRegion || (highGuarding && highCompression)
}

// ── Framing Note Builder ──────────────────────────────────────────────────────

function buildFramingNote(
  links: HariLink[],
  intake: HariSessionIntake,
  state: StateEstimate,
  distributed: boolean
): string {
  if (links.length === 0) {
    return 'Current pattern appears relatively localized and straightforward.'
  }

  const parts: string[] = []

  if (distributed) {
    parts.push('Current pattern appears more distributed than isolated.')
  }

  const guardingLink = links.find((l) => l.link_type === 'guarding_distribution')
  if (guardingLink) {
    parts.push(
      'Elevated guarding may be shaping multiple areas — softer whole-pattern regulation is appropriate.'
    )
  }

  const postureLink = links.find((l) => l.link_type === 'posture_to_state')
  if (postureLink) {
    parts.push(
      `${
        intake.current_context === 'driving'
          ? 'Driving context'
          : intake.current_context === 'after_strain'
          ? 'Post-strain context'
          : 'Current context'
      } may be interacting with the current protective state.`
    )
  }

  if (state.reassessment_urgency === 'elevated') {
    parts.push('Earlier check-in is suggested.')
  }

  return parts.join(' ')
}

// ── Main Link Mapping Function ────────────────────────────────────────────────

/**
 * Build the current-session link map from state and intake.
 * Authority: M4.4 §29 (Final Instruction to Claude Code)
 *
 * 0–2 links typical. No chain inflation. No causal claims.
 * Session-bound. Not long-term truth.
 */
export function buildLinkMap(
  intake: HariSessionIntake,
  state: StateEstimate,
  _bodyContext: BodyContextSummary
): LinkMap {
  const candidates: LinkCandidate[] = []

  const guardingLink = tryGuardingDistributionLink(intake, state)
  if (guardingLink) candidates.push(guardingLink)

  const postureLink = tryPostureToStateLink(intake, state)
  if (postureLink) candidates.push(postureLink)

  const compressionSpreadLink = tryCompressionSpreadLink(intake, state)
  if (compressionSpreadLink) candidates.push(compressionSpreadLink)

  // Only add preference/tolerance link if other links don't already dominate
  if (candidates.length < 2) {
    const prefLink = tryPreferenceToleranceLink(intake, state)
    if (prefLink) candidates.push(prefLink)
  }

  // Apply confidence-based filtering — low confidence = fewer, weaker links
  const filtered = applyConfidenceFilter(candidates, state.confidence_level)

  const links: HariLink[] = filtered.map((c) => ({
    link_type: c.link_type,
    linked_elements: c.linked_elements,
    link_strength: toStrength(c.strength_score),
    confidence_support: c.confidence,
    support_factors: c.support_factors,
    session_bound: true,
  }))

  const distributed = determineDistribution(intake, state)
  const framing_note = buildFramingNote(links, intake, state, distributed)

  return {
    links,
    appears_distributed: distributed,
    framing_note,
  }
}
