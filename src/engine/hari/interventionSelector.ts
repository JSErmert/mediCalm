/**
 * M4.5 — Intervention Selector
 * Authority: M4.0–4.5_v1.1_CLARIFICATIONS.md §M4.5
 *
 * Chooses the safest, best-matched breath-led regulation response
 * using state estimation and link mapping outputs.
 *
 * Rules:
 *   - Constraint-aware: what NOT to do is as important as what to do
 *   - Softness first: uncertainty / flare / guarding → bias softer
 *   - Worsening → downshift, never intensify
 *   - Session intent shapes but does not override safety
 *   - Stop/simplify is required capability — not an edge case
 *
 * Maps to one of 3 existing protocols:
 *   PROTO_REDUCED_EFFORT     → soft_decompression, short_reassessment_first
 *   PROTO_CALM_DOWNREGULATE  → reduced_effort_regulation, standard_guided_regulation
 *   PROTO_STABILIZE_BALANCE  → gentle_lateral_expansion (proactive/low-flare)
 *
 * This is NOT a treatment authority.
 * This does NOT choose intensity to appear advanced.
 */
import type {
  HariSessionIntake,
  StateEstimate,
  LinkMap,
  BodyContextSummary,
  InterventionPackage,
  InterventionClass,
  SoftnessLevel,
  RoundCountProfile,
  ReassessmentTiming,
} from '../../types/hari'
import type { ProtocolHintReinforcement } from '../../types/patterns'

// ── M5.3 Protocol Safety Rank ─────────────────────────────────────────────────
//
// Used to enforce that M5.3 hints never escalate a session beyond what M4.5 determined.
// A hint is only applied if it is equally or more conservative than the M4.5 selection.
// Authority: M5.3 §7.2 ("current safety always wins"), §6 (must not suppress safety downshifting)

const PROTOCOL_CONSERVATIVENESS_RANK: Record<string, number> = {
  'PROTO_REDUCED_EFFORT': 0,    // most conservative
  'PROTO_CALM_DOWNREGULATE': 1,
  'PROTO_STABILIZE_BALANCE': 2, // least conservative
}

// ── Protocol Mapping ──────────────────────────────────────────────────────────

const PROTOCOL_MAP: Record<InterventionClass, string> = {
  soft_decompression:             'PROTO_REDUCED_EFFORT',
  short_reassessment_first:       'PROTO_REDUCED_EFFORT',
  downshift_simplify:             'PROTO_REDUCED_EFFORT',
  pause_stop_recommendation:      'PROTO_REDUCED_EFFORT',
  reduced_effort_regulation:      'PROTO_CALM_DOWNREGULATE',
  standard_guided_regulation:     'PROTO_CALM_DOWNREGULATE',
  gentle_lateral_expansion:       'PROTO_STABILIZE_BALANCE',
  short_micro_reset:              'PROTO_CALM_DOWNREGULATE',
}

// ── Constraint System ─────────────────────────────────────────────────────────

interface InterventionConstraints {
  avoid_aggressive_breathing: boolean
  avoid_long_no_checkpoint: boolean
  avoid_strong_local_focus: boolean
  keep_effort_low: boolean
  downshift_if_worsening: boolean
  minimal_exploration: boolean
}

function deriveConstraints(
  state: StateEstimate,
  linkMap: LinkMap
): InterventionConstraints {
  return {
    avoid_aggressive_breathing:
      state.compression_sensitivity !== 'low' ||
      state.flare_sensitivity_estimate !== 'low',
    avoid_long_no_checkpoint:
      state.reassessment_urgency !== 'low',
    avoid_strong_local_focus:
      linkMap.appears_distributed ||
      state.guarding_load === 'elevated',
    keep_effort_low:
      state.intervention_softness_need !== 'low' ||
      state.guarding_load !== 'low',
    downshift_if_worsening: true,  // always active
    minimal_exploration:
      state.confidence_level === 'low' ||
      state.flare_sensitivity_estimate === 'elevated',
  }
}

function buildActiveConstraintStrings(c: InterventionConstraints): string[] {
  const result: string[] = []
  if (c.avoid_aggressive_breathing) result.push('avoid forceful or high-effort breathing')
  if (c.avoid_long_no_checkpoint) result.push('avoid long sequences without check-in')
  if (c.avoid_strong_local_focus) result.push('avoid pushing a single local target')
  if (c.keep_effort_low) result.push('keep overall effort low')
  if (c.minimal_exploration) result.push('minimal exploratory progression')
  result.push('stop or simplify immediately if any symptoms worsen')
  return result
}

// ── Softness Level ────────────────────────────────────────────────────────────

function selectSoftnessLevel(state: StateEstimate): SoftnessLevel {
  if (state.intervention_softness_need === 'elevated') return 'very_soft'
  if (state.intervention_softness_need === 'moderate') return 'soft'
  return 'standard'
}

// ── Round Count Profile ───────────────────────────────────────────────────────

function selectRoundCount(
  intake: HariSessionIntake,
  state: StateEstimate,
  /** M5.3 pacing advisory — subordinate to all M4.6 safety constraints (M5.3 §8) */
  pacingAdvisory?: RoundCountProfile
): RoundCountProfile {
  // Safety + state constraints first — these always win (M5.3 §8)
  if (
    state.flare_sensitivity_estimate === 'elevated' ||
    state.session_tolerance === 'low'
  ) {
    return 'minimal'
  }

  if (
    state.reassessment_urgency === 'elevated' ||
    intake.session_intent === 'quick_reset'
  ) {
    return 'short'
  }

  if (
    intake.session_length_preference === 'longer' &&
    state.flare_sensitivity_estimate === 'low'
  ) {
    return 'extended'
  }

  // M5.3 pacing advisory — applied only if safe (not 'extended', all constraints passed)
  // In practice always absent due to D1 debt (pacing_tendency capped at 'candidate').
  if (pacingAdvisory !== undefined && pacingAdvisory !== 'extended') {
    return pacingAdvisory
  }

  return 'standard'
}

// ── Reassessment Timing ───────────────────────────────────────────────────────

function selectReassessmentTiming(state: StateEstimate): ReassessmentTiming {
  if (state.reassessment_urgency === 'elevated') return 'immediate'
  if (state.reassessment_urgency === 'moderate') return 'early'
  if (state.confidence_level === 'low') return 'early'
  return 'standard'
}

// ── Intervention Class Selection ──────────────────────────────────────────────

/**
 * Core selection logic — constraint-aware, softness-first.
 * Authority: M4.5 §11 (Constraint-Based Selection Rule)
 */
function selectInterventionClass(
  intake: HariSessionIntake,
  state: StateEstimate,
  linkMap: LinkMap,
  _constraints: InterventionConstraints
): InterventionClass {
  // Very high softness need + high reassessment urgency → most conservative class
  if (
    state.intervention_softness_need === 'elevated' &&
    state.reassessment_urgency === 'elevated'
  ) {
    return 'short_reassessment_first'
  }

  // Elevated softness need → soft decompression
  if (state.intervention_softness_need === 'elevated') {
    return 'soft_decompression'
  }

  // Distributed pattern with guarding → reduced effort across regions
  if (linkMap.appears_distributed && state.guarding_load !== 'low') {
    return 'reduced_effort_regulation'
  }

  // Flare-sensitive support intent → cautious, soft
  if (intake.session_intent === 'flare_sensitive_support') {
    return state.intervention_softness_need === 'moderate'
      ? 'soft_decompression'
      : 'reduced_effort_regulation'
  }

  // Quick reset intent → short micro-reset
  if (intake.session_intent === 'quick_reset') {
    return 'short_micro_reset'
  }

  // Cautious test → start with reassessment-first
  if (intake.session_intent === 'cautious_test') {
    return 'short_reassessment_first'
  }

  // Moderate softness need + standard tolerance → calm regulation
  if (state.intervention_softness_need === 'moderate') {
    return 'reduced_effort_regulation'
  }

  // Low flare + proactive / deeper regulation → can use standard or expansion
  if (
    intake.session_intent === 'deeper_regulation' &&
    state.flare_sensitivity_estimate === 'low' &&
    state.guarding_load === 'low'
  ) {
    return 'gentle_lateral_expansion'
  }

  // Low constraints, proactive → standard regulation
  if (intake.symptom_focus === 'proactive' && state.intervention_softness_need === 'low') {
    return 'standard_guided_regulation'
  }

  // Default — safe middle ground
  return 'reduced_effort_regulation'
}

// ── Immediate Objective ───────────────────────────────────────────────────────

function buildImmedateObjective(
  cls: InterventionClass,
  _state: StateEstimate,
  linkMap: LinkMap
): string {
  switch (cls) {
    case 'soft_decompression':
      return 'Reduce guarding and lower compressive effort gently.'
    case 'gentle_lateral_expansion':
      return 'Improve comfort with expansion and increase breathing ease.'
    case 'reduced_effort_regulation':
      return linkMap.appears_distributed
        ? 'Reduce distributed tension and calm the protective pattern broadly.'
        : 'Calm the protective response and reduce tension through lower-effort breath.'
    case 'short_micro_reset':
      return 'Interrupt the current pattern and create a brief regulated pause.'
    case 'standard_guided_regulation':
      return 'Regulate and stabilize through controlled, even breathing.'
    case 'short_reassessment_first':
      return 'Test tolerability gently and check in before continuing.'
    case 'downshift_simplify':
      return 'Simplify and reduce the current approach in response to worsening.'
    case 'pause_stop_recommendation':
      return 'Pause the session — continuing is not appropriate right now.'
  }
}

// ── Adaptation Reasoning ──────────────────────────────────────────────────────

/**
 * Plain-language explanation of the intervention choice.
 * Authority: M4.5 §25, M4.0 §12 (Explanation Structure)
 * Must remain non-diagnostic, current-session-focused, conservative.
 */
function buildAdaptationReasoning(
  cls: InterventionClass,
  state: StateEstimate,
  intake: HariSessionIntake,
  linkMap: LinkMap
): string {
  const parts: string[] = []

  // Acknowledge current pattern
  if (state.flare_sensitivity_estimate === 'elevated') {
    parts.push("Today's session appears more flare-sensitive")
  } else if (state.guarding_load === 'elevated') {
    parts.push("There appears to be elevated protective guarding right now")
  } else if (state.compression_sensitivity === 'elevated') {
    parts.push("The current pattern suggests more compression sensitivity")
  } else {
    parts.push("The current pattern looks manageable")
  }

  // Add context contribution
  if (intake.current_context === 'driving') {
    parts[0] += ' with a driving context'
  } else if (intake.current_context === 'after_strain') {
    parts[0] += ' following recent strain'
  } else if (intake.symptom_focus === 'spread_tension' || linkMap.appears_distributed) {
    parts[0] += ' with a more distributed tension pattern'
  }

  parts[0] += '.'

  // Explain the intervention choice
  switch (cls) {
    case 'soft_decompression':
      parts.push("A soft decompression-focused approach is chosen to reduce effort and avoid pushing a compressed or braced system.")
      break
    case 'gentle_lateral_expansion':
      parts.push("A gentle expansion approach is appropriate given lower sensitivity and proactive intent.")
      break
    case 'reduced_effort_regulation':
      parts.push("A reduced-effort regulation approach supports calming the system without demanding more than it can comfortably give right now.")
      break
    case 'short_micro_reset':
      parts.push("A brief micro-reset will interrupt the current pattern quickly and without overextending.")
      break
    case 'standard_guided_regulation':
      parts.push("A standard guided regulation sequence is appropriate given the current state.")
      break
    case 'short_reassessment_first':
      parts.push("Starting with a short test sequence allows early check-in before committing to longer pacing.")
      break
    case 'downshift_simplify':
      parts.push("The approach has been simplified in response to the current level of sensitivity or worsening.")
      break
    case 'pause_stop_recommendation':
      parts.push("Pausing is the safest choice given the current session state.")
      break
  }

  // Remind of reassessment
  parts.push("Response will be reassessed before continuing.")

  return parts.join(' ')
}

// ── Escalation Permission ─────────────────────────────────────────────────────

function isEscalationPermitted(
  state: StateEstimate,
  cls: InterventionClass
): boolean {
  // No escalation for stop/pause/downshift classes
  if (cls === 'pause_stop_recommendation' || cls === 'downshift_simplify') return false

  // No escalation when flare-sensitive or high guarding
  if (state.flare_sensitivity_estimate === 'elevated') return false
  if (state.guarding_load === 'elevated') return false

  // Only permit escalation with stable low states
  return state.flare_sensitivity_estimate === 'low' && state.session_tolerance !== 'low'
}

// ── Main Selector Function ────────────────────────────────────────────────────

/**
 * Select the safest intervention package for this session.
 * Authority: M4.5 §29 (Final Instruction to Claude Code)
 *
 * @param protocolHint  Optional M5.3 protocol hint — advisory only. Applied at
 *                      the protocol ID step after all safety/constraint logic runs.
 *                      Ignored if suppressed, not eligible, or more aggressive than
 *                      the M4.5 selection. (M5.3 §7.2, §6)
 */
export function selectIntervention(
  intake: HariSessionIntake,
  state: StateEstimate,
  linkMap: LinkMap,
  _bodyContext: BodyContextSummary,
  protocolHint?: ProtocolHintReinforcement
): InterventionPackage {
  const constraints = deriveConstraints(state, linkMap)
  const cls = selectInterventionClass(intake, state, linkMap, constraints)
  const softness = selectSoftnessLevel(state)
  const rounds = selectRoundCount(intake, state, protocolHint?.pacing_advisory)
  const reassessment = selectReassessmentTiming(state)
  const active_constraints = buildActiveConstraintStrings(constraints)
  const immediate_objective = buildImmedateObjective(cls, state, linkMap)
  const reasoning = buildAdaptationReasoning(cls, state, intake, linkMap)
  const escalation_permitted = isEscalationPermitted(state, cls)

  // M4.5 determines protocol via intervention class — this is the safety-first baseline
  const m45ProtocolId = PROTOCOL_MAP[cls]

  // M5.3 — apply hint only when eligible, safe, and not more aggressive than M4.5 selection
  // Hint is never allowed to escalate a session beyond what M4.5 determined. (M5.3 §7.2)
  const mapped_protocol_id = resolveHintedProtocol(m45ProtocolId, protocolHint)

  return {
    intervention_class: cls,
    immediate_objective,
    softness_level: softness,
    round_count_profile: rounds,
    reassessment_timing: reassessment,
    active_constraints,
    adaptation_reasoning: reasoning,
    escalation_permitted,
    mapped_protocol_id,
  }
}

/**
 * Apply a M5.3 protocol hint with safety gating.
 *
 * The hint is accepted only when:
 *   1. hint_strength is not 'none'
 *   2. suppressed_by_safety is false
 *   3. hinted_protocol_id is a known protocol
 *   4. Hinted protocol is equally or more conservative than M4.5 selection
 *      (conservativeness rank: REDUCED_EFFORT=0, CALM=1, STABILIZE=2)
 *
 * Rule 4 ensures M5.3 can never use historical evidence to make a session
 * MORE aggressive than current-state safety demands.
 * Authority: M5.3 §7.2, §6 ("never suppress safety downshifting")
 */
function resolveHintedProtocol(
  m45ProtocolId: string,
  hint?: ProtocolHintReinforcement
): string {
  if (
    hint === undefined ||
    hint.hint_strength === 'none' ||
    hint.suppressed_by_safety ||
    hint.hinted_protocol_id === undefined
  ) {
    return m45ProtocolId
  }

  const hintedId = hint.hinted_protocol_id
  const hintedRank = PROTOCOL_CONSERVATIVENESS_RANK[hintedId]
  const currentRank = PROTOCOL_CONSERVATIVENESS_RANK[m45ProtocolId]

  // Unknown protocol or hint is less conservative than M4.5 selection → reject
  if (hintedRank === undefined || currentRank === undefined) return m45ProtocolId
  if (hintedRank > currentRank) return m45ProtocolId

  return hintedId
}

// ── Session Framing Text ──────────────────────────────────────────────────────

/**
 * Pre-session framing shown to user before the session begins.
 * Authority: M4.2 MVP §16 (Explainability Rule)
 * Must be calm, supportive, practical.
 */
export function buildSessionFraming(
  intake: HariSessionIntake,
  state: StateEstimate,
  _pkg: InterventionPackage
): string {
  if (state.flare_sensitivity_estimate === 'elevated') {
    return "Today looks more flare-sensitive, so we'll start gently and check in early."
  }
  if (state.guarding_load === 'elevated') {
    return "There appears to be some protective holding right now, so we'll keep effort low and move softly."
  }
  if (intake.session_intent === 'quick_reset') {
    return "We'll keep this brief and focused — just enough to interrupt the pattern."
  }
  if (intake.session_intent === 'cautious_test') {
    return "We'll start with a short gentle test sequence and check in before going further."
  }
  if (intake.session_intent === 'flare_sensitive_support') {
    return "Given the current sensitivity, we'll take a very soft approach and reassess early."
  }
  if (state.confidence_level === 'low') {
    return "We'll start with a gentle, conservative approach and see how the system responds."
  }
  return "We'll begin with a regulation sequence matched to today's pattern."
}
