/**
 * HARI → Session Bridge
 * Authority: M4.5.1 — Intervention → Session Bridge
 *
 * Converts an InterventionPackage + HariSessionResolution into a RuntimeSession
 * that the M3 GuidedSession runtime can consume unchanged.
 *
 * M4 decides WHAT to do.
 * M3 executes HOW it feels.
 *
 * This module is the only place where M4 decision data is translated to M3 format.
 * Safety rule (MANDATORY): only call this function when the safety gate returned CLEAR.
 *
 * Does NOT:
 *   - modify GuidedSessionScreen
 *   - bypass or replace the protocol system
 *   - create a new session format
 *   - merge M4 logic into M3 runtime
 */
import type {
  HariSessionIntake,
  InterventionPackage,
  HariSessionResolution,
  SafetyGateResult,
  HariSessionMetadata,
} from '../../types/hari'
import type { PainInputState, RuntimeSession, SafetyAssessment } from '../../types'
import { PROTOCOLS } from '../../data/protocols'
import { buildSession } from '../sessionBuilder'
import { makeRoundPlan, getMaxRounds, selectRoundBreathCount } from './reassessmentLoop'

// ── Synthesis Maps (HARI intake → M3 PainInputState) ─────────────────────────
//
// These are lookup tables, not medical mappings. Frozen to prevent mutation.

const FOCUS_TO_LOCATIONS: Record<HariSessionIntake['symptom_focus'], string[]> = {
  proactive:      [],
  neck_upper:     ['back_neck'],
  rib_side_back:  ['ribs', 'mid_back'],
  jaw_facial:     ['jaw'],
  spread_tension: ['upper_back', 'shoulders', 'back_neck'],
  mixed:          ['upper_back'],
}

const FOCUS_TO_SYMPTOMS: Record<HariSessionIntake['symptom_focus'], string[]> = {
  proactive:      ['stiffness'],
  neck_upper:     ['tightness', 'stiffness'],
  rib_side_back:  ['tightness', 'pressure'],
  jaw_facial:     ['tightness', 'guarding'],
  spread_tension: ['tightness', 'guarding'],
  mixed:          ['tightness'],
}

const CONTEXT_TO_POSITION: Record<
  HariSessionIntake['current_context'],
  'sitting' | 'standing' | 'lying_down' | undefined
> = {
  sitting:      'sitting',
  standing:     'standing',
  driving:      'sitting',
  lying_down:   'lying_down',
  after_strain: undefined,
}

const CONTEXT_TO_TRIGGER: Record<
  HariSessionIntake['current_context'],
  string | undefined
> = {
  sitting:      'sitting',
  standing:     undefined,
  driving:      'driving',
  lying_down:   undefined,
  after_strain: 'physical_effort',
}

// ── Step 1 — Protocol Mapping ─────────────────────────────────────────────────

/**
 * Returns the protocol ID from an InterventionPackage.
 * The mapping is computed by the M4.5 intervention selector;
 * this function makes it explicit and auditable.
 */
export function mapInterventionToProtocol(intervention: InterventionPackage): string {
  return intervention.mapped_protocol_id
}

// ── PainInput Synthesis ───────────────────────────────────────────────────────

/**
 * Synthesize a PainInputState for M3 session builder compatibility.
 * This is a backward-compatibility bridge only.
 * The HARI engine itself operates on HariSessionIntake, not PainInputState.
 */
export function synthesizePainInput(intake: HariSessionIntake): PainInputState {
  const locationTags = [...FOCUS_TO_LOCATIONS[intake.symptom_focus]]
  // Copy array before mutation — FOCUS_TO_SYMPTOMS entries are shared constants
  const symptomTags = [...FOCUS_TO_SYMPTOMS[intake.symptom_focus]]

  if (intake.flare_sensitivity === 'high' && !symptomTags.includes('guarding')) {
    symptomTags.push('guarding')
  }

  return {
    pain_level: intake.baseline_intensity,
    location_tags: locationTags.length > 0 ? locationTags : ['upper_back'],
    symptom_tags: symptomTags,
    current_position: CONTEXT_TO_POSITION[intake.current_context],
    trigger_tag: CONTEXT_TO_TRIGGER[intake.current_context],
  }
}

// ── Step 2 — Build Session ────────────────────────────────────────────────────

/**
 * Build a RuntimeSession from a HARI resolution.
 * Reuses existing M3 session builder — does not create a new session format.
 *
 * SAFETY RULE: Only call when the safety gate result is CLEAR.
 * Authority: M4.5.1 §Safety Rule (MANDATORY)
 */
export function buildHariSession(
  resolution: Extract<HariSessionResolution, { kind: 'hari_session' }>,
  safetyGateResult: SafetyGateResult
): RuntimeSession {
  const { intake, intervention, state_estimate, link_map, session_framing } = resolution

  // Step 1 — map intervention → protocol ID
  const protocolId = mapInterventionToProtocol(intervention)

  // Look up the protocol definition; fall back to safe default
  const protocol =
    PROTOCOLS.find((p) => p.protocol_id === protocolId) ??
    PROTOCOLS.find((p) => p.protocol_id === 'PROTO_CALM_DOWNREGULATE')!

  // Synthesize M3-compatible pain input for session builder and history
  const painInput = synthesizePainInput(intake)

  const safetyAssessment: SafetyAssessment = {
    mode: 'DIRECT_SESSION_MODE',
    safety_tags: [],
    stop_reason: null,
  }

  // Step 2 — build M3 session using existing builder
  const session = buildSession(protocol, painInput, safetyAssessment)

  // Step 3 — compute M4.6 round plan and session ceiling
  const round_plan = makeRoundPlan(1, state_estimate, intervention)
  const max_rounds = getMaxRounds(round_plan.breath_count)

  // Step 4 — override timing_profile.rounds with M4.6 breath count per round
  // M3 executes breath cycles; M4.6 determines how many per round before reassessment.
  const m46TimingProfile = {
    ...session.timing_profile,
    rounds: selectRoundBreathCount(state_estimate),
  }

  // Step 5 — attach HARI metadata for tracking (does not affect M3 runtime behavior)
  const hari_metadata: HariSessionMetadata = {
    intake,
    safety_gate_result: safetyGateResult,
    state_estimate,
    link_map,
    intervention,
    session_framing,
    round_plan,
    max_rounds,
  }

  return { ...session, timing_profile: m46TimingProfile, hari_metadata }
}
