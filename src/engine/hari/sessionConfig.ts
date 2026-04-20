/**
 * HARI — Session Configuration Layer (M6.5 + M6.7 + M6.8)
 *
 * M6 pipeline (pure — what to prescribe):
 *   StateInterpretationResult
 *     → NeedProfile        (classifyNeedProfile — needProfile.ts)
 *     → FeasibilityProfile (buildFeasibilityProfile — feasibility.ts)
 *     → BreathFamily       (selectBreathFamily — breathFamily.ts)
 *     → BreathPrescription (prescribeBreath — breathFamily.ts)
 *
 * M7 delivery pipeline (buildDeliveryConfig):
 *   BreathPrescription → adapted BreathPrescription (applyHARIAdaptation — adaptation.ts)
 *
 * Sessions are time-based only. No breath count. No round targets.
 * Adaptation is deterministic and explainable — never opaque.
 */

import type { StateInterpretationResult, BreathPrescription } from '../../types/hari'
import { classifyNeedProfile } from './needProfile'
import { buildFeasibilityProfile } from './feasibility'
import { selectBreathFamily, prescribeBreath } from './breathFamily'
import { loadHARIContext } from './context'
import { applyHARIAdaptation } from './adaptation'

/**
 * M6.5 — Pure session configuration.
 * Converts a StateInterpretationResult into a raw BreathPrescription.
 * No adaptation. Layer boundary: M6 only.
 */
export function buildSessionConfig(result: StateInterpretationResult): BreathPrescription {
  const need = classifyNeedProfile(result)
  const feasibility = buildFeasibilityProfile(need)
  const family = selectBreathFamily(need, feasibility)
  return prescribeBreath(family, need, feasibility)
}

/**
 * M6 + M7.1 — Delivery configuration.
 * Builds the raw prescription (M6) then applies controlled adaptation (M7.1).
 * Use this at the session delivery boundary — not inside the M6 engine.
 *
 * loadHARIContext is non-fatal — returns {lastEntry: null, isRecent: false} on failure.
 * applyHARIAdaptation returns the prescription unchanged when conditions are not met.
 */
export function buildDeliveryConfig(result: StateInterpretationResult): BreathPrescription {
  const need = classifyNeedProfile(result)
  const feasibility = buildFeasibilityProfile(need)
  const family = selectBreathFamily(need, feasibility)
  const raw = prescribeBreath(family, need, feasibility)
  const context = loadHARIContext()
  return applyHARIAdaptation(raw, context, need)
}

export type { BreathPrescription }
