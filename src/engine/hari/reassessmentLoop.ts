/**
 * M4.6 — Reassessment Loop Engine
 * Authority: M4.6_Reassessment_Loop_Contract.md
 *
 * Governs:
 *   - Round length selection (10 / 20 / 30 breath cycles)
 *   - Maximum rounds per session
 *   - Round plan construction
 *   - Post-round continuation decisions
 *
 * Rules:
 *   - Larger, meaningful rounds before reassessment (§3–§6)
 *   - Worse → mandatory stop, never intensify (§13, §27-C)
 *   - Bounded sessions — no endless loops (§16, §24)
 *   - Lower confidence → more conservative decisions (§23)
 *   - Longer rounds are not more forceful — they give effect time to appear (§8)
 */
import type {
  StateEstimate,
  InterventionPackage,
  ReassessmentResponse,
  ContinuationAction,
  RoundPlan,
  ContinuationDecision,
} from '../../types/hari'

// ── Round Breath Count Selection (M4.6 §5, §7) ───────────────────────────────

/**
 * Select the number of breath cycles per round based on current state.
 *
 * First-pass defaults (§5):
 *   high flare / high uncertainty / fragile state → 10 breaths
 *   moderate / standard testing state             → 20 breaths
 *   stable / deeper regulation state              → 30 breaths
 *
 * Selection is driven by Flare_Sensitivity_Estimate, Session_Tolerance,
 * Reassessment_Urgency, and Intervention_Softness_Need.
 */
export function selectRoundBreathCount(stateEstimate: StateEstimate): number {
  const {
    flare_sensitivity_estimate,
    session_tolerance,
    reassessment_urgency,
    intervention_softness_need,
  } = stateEstimate

  // High-fragility state → shortest round (enough to test, not enough to overload)
  if (
    flare_sensitivity_estimate === 'elevated' ||
    reassessment_urgency === 'elevated' ||
    session_tolerance === 'low' ||
    intervention_softness_need === 'elevated'
  ) {
    return 10
  }

  // Stable / deeper regulation state → longer round
  if (
    session_tolerance === 'elevated' &&
    flare_sensitivity_estimate === 'low' &&
    reassessment_urgency === 'low'
  ) {
    return 30
  }

  // Default: moderate / mixed state
  return 20
}

// ── Maximum Rounds (M4.6 §16–§17) ────────────────────────────────────────────

/**
 * Determine the maximum number of rounds allowed for this session.
 *
 * First-pass ceilings (§17):
 *   30-breath rounds (stable) → max 2 rounds
 *   10 or 20-breath rounds    → max 3 rounds
 *
 * Sessions must remain bounded. Not all rounds need to be used.
 */
export function getMaxRounds(breathCount: number): number {
  return breathCount >= 30 ? 2 : 3
}

// ── Round Plan Construction (M4.6 §21) ───────────────────────────────────────

/**
 * Build a structured round plan for the given round number.
 * Used at session-build time (round 1) and can be consulted for subsequent rounds.
 */
export function makeRoundPlan(
  roundNumber: number,
  stateEstimate: StateEstimate,
  intervention: InterventionPackage
): RoundPlan {
  const breathCount = selectRoundBreathCount(stateEstimate)
  const maxRounds = getMaxRounds(breathCount)

  return {
    round_number: roundNumber,
    breath_count: breathCount,
    intervention_class: intervention.intervention_class,
    softness_level: intervention.softness_level,
    reassessment_required: roundNumber < maxRounds,
    continuation_constraint: intervention.escalation_permitted
      ? 'no escalation until reassessment'
      : 'no escalation permitted this session',
  }
}

// ── Continuation Decision (M4.6 §11–§15) ─────────────────────────────────────

/**
 * Decide what happens after a completed round based on the user's response.
 *
 * Mandatory rules:
 *   - worse → stop (§13 — MANDATORY, no exceptions)
 *   - max rounds reached → stop (§16)
 *   - better → continue conservatively (§11)
 *   - mixed / unclear → simpler, softer (§14)
 *   - same → continue if not at soft floor (§12)
 */
export function decideContinuation(
  response: ReassessmentResponse,
  roundNumber: number,
  maxRounds: number,
  intervention: InterventionPackage
): ContinuationDecision {
  // ── Mandatory safety rule: worse → stop immediately (M4.6 §13) ──────────────
  if (response === 'worse') {
    return {
      round_number: roundNumber,
      response_label: response,
      response_confidence: 'high',
      recommended_action: 'stop',
      notes: 'Worsening reported — session ended per mandatory safety rule.',
    }
  }

  // ── Session ceiling: max rounds reached → stop (M4.6 §16) ───────────────────
  if (roundNumber >= maxRounds) {
    return {
      round_number: roundNumber,
      response_label: response,
      response_confidence: 'high',
      recommended_action: 'stop',
      notes: 'Maximum round limit reached — session complete.',
    }
  }

  // ── Better → continue same conservatively (M4.6 §11) ────────────────────────
  // Improvement is not permission for immediate escalation.
  if (response === 'better') {
    return {
      round_number: roundNumber,
      response_label: response,
      response_confidence: 'high',
      recommended_action: 'continue_same',
    }
  }

  // ── Mixed or unclear → simpler next steps, softer framing (M4.6 §14) ────────
  if (response === 'mixed' || response === 'unclear') {
    const action: ContinuationAction =
      intervention.softness_level === 'very_soft' ? 'shorten_next' : 'continue_softer'
    return {
      round_number: roundNumber,
      response_label: response,
      response_confidence: 'low',
      recommended_action: action,
      notes: 'Ambiguous response — shorter assumption horizon, softer next step.',
    }
  }

  // ── Same → continue if not at soft floor (M4.6 §12) ─────────────────────────
  const action: ContinuationAction =
    intervention.softness_level === 'very_soft' ? 'shorten_next' : 'continue_same'
  return {
    round_number: roundNumber,
    response_label: response,
    response_confidence: 'moderate',
    recommended_action: action,
  }
}
