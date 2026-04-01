/**
 * HARI Engine — Entry Point
 * History-Adaptive Regulation Intelligence
 *
 * Build order (HARI_IMPLEMENTATION_PLAN_v2):
 *   M4.0 systemDefinition — philosophy lock (../hari/systemDefinition)
 *   M4.1 bodyContext      — persistent context (../hari/bodyContext)
 *   C4   safetyGate       — eligibility gate (../hari/safetyGate)
 *   M4.3 stateEstimation  — banded state outputs (../hari/stateEstimation)
 *   M4.4 linkMapping      — functional link map (../hari/linkMapping)
 *   M4.5 interventionSelector — intervention package (../hari/interventionSelector)
 *   Integration with M3 runtime via resolveHariSession()
 *
 * Flow:
 *   HariSessionIntake + BodyContext
 *   → (C4 safety gate)
 *   → M4.3 estimateState()
 *   → M4.4 buildLinkMap()
 *   → M4.5 selectIntervention()
 *   → HariSessionResolution
 *
 * The resolution maps to an existing protocol via mapped_protocol_id,
 * which is then used to build a RuntimeSession via the existing M3 engine.
 */
import type {
  HariSessionIntake,
  BodyContext,
  HariSessionResolution,
  SafetyGateResult,
} from '../../types/hari'
import { buildBodyContextSummary } from './bodyContextSummary'
import { classifySafetyFlags, safetyGateClear, type SafetyFlagClass } from './safetyGate'
import { estimateState } from './stateEstimation'
import { buildLinkMap } from './linkMapping'
import { selectIntervention, buildSessionFraming } from './interventionSelector'
import { getOrComputePatternSummary } from './patternReader'
import { computeProtocolHintReinforcement } from './protocolHintReinforcement'

export type { SafetyFlagClass }

// ── Main HARI Resolution ──────────────────────────────────────────────────────

/**
 * Process a completed HARI intake through the full engine pipeline.
 * Called after the C4 safety gate returns CLEAR.
 *
 * Does NOT call the safety gate — the safety gate runs in the UI layer
 * (HariSafetyGateScreen) before this function is called.
 */
export function resolveHariSession(
  intake: HariSessionIntake,
  bodyContext: BodyContext | null
): Extract<HariSessionResolution, { kind: 'hari_session' }> {
  const summary = buildBodyContextSummary(bodyContext)
  const state = estimateState(intake, summary)
  const linkMap = buildLinkMap(intake, state, summary)

  // M5.3 — compute protocol hint from pattern history (advisory only)
  // Hint is passed to selectIntervention where it may influence mapped_protocol_id
  // if and only if it is safe, non-suppressed, and not more aggressive than M4.5 selection.
  const patternSummary = getOrComputePatternSummary()
  const protocolHint = computeProtocolHintReinforcement(patternSummary)

  const intervention = selectIntervention(intake, state, linkMap, summary, protocolHint)
  const sessionFraming = buildSessionFraming(intake, state, intervention)

  return {
    kind: 'hari_session',
    intake,
    state_estimate: state,
    link_map: linkMap,
    intervention,
    session_framing: sessionFraming,
  }
}

/**
 * Safety gate resolution — called with user's safety flag selections.
 * Returns the gate result for UI routing.
 */
export function runSafetyGate(
  flags: SafetyFlagClass[]
): SafetyGateResult {
  if (flags.length === 0) return safetyGateClear()
  return classifySafetyFlags(flags)
}

// Re-export key types and utilities for use in screens
export { buildBodyContextSummary } from './bodyContextSummary'
export { SAFETY_FLAG_LABELS, STEP_1_SYMPTOMS } from './safetyGate'
// Re-export bridge functions — session creation lives in sessionBridge
export { synthesizePainInput, mapInterventionToProtocol, buildHariSession } from './sessionBridge'
