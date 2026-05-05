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

import type {
  StateInterpretationResult,
  BreathPrescription,
  NeedProfile,
  EffortLevel,
  SessionLengthPreference,
} from '../../types/hari'
import { classifyNeedProfile } from './needProfile'
import { buildFeasibilityProfile } from './feasibility'
import { selectBreathFamily, prescribeBreath } from './breathFamily'
import { loadHARIContext } from './context'
import { applyHARIAdaptation } from './adaptation'

// ── Session length preference wire-through (2026-05-05) ──────────────────────
//
// Authority: docs/superpowers/specs/2026-05-05-intake-wire-through-design.md
//
// Adjusts effortCapacity within safety bounds based on the user's explicit
// session_length_preference pick. Never overrides safety:
//   - overload → no change
//   - safetyLevel === 'high' → no change (high flare/intensity, hold the cap)
//   - 'minimal' effort → no change in either direction (safety floor)
//
// Bumps applied otherwise:
//   - 'short'    → step effortCapacity DOWN by one ('standard' → 'reduced')
//   - 'standard' → no change
//   - 'long'     → step effortCapacity UP by one ('reduced' → 'standard')

const EFFORT_LADDER: EffortLevel[] = ['minimal', 'reduced', 'standard']

export function applyLengthPreference(
  need: NeedProfile,
  preference: SessionLengthPreference
): NeedProfile {
  // Safety guards — no change in any unsafe state.
  if (need.overload) return need
  if (need.safetyLevel === 'high') return need
  if (need.effortCapacity === 'minimal') return need

  if (preference === 'standard') return need

  const idx = EFFORT_LADDER.indexOf(need.effortCapacity)
  let nextIdx = idx
  if (preference === 'short') nextIdx = Math.max(idx - 1, 1)        // floor at 'reduced' (don't push to 'minimal')
  else if (preference === 'long') nextIdx = Math.min(idx + 1, EFFORT_LADDER.length - 1)

  if (nextIdx === idx) return need
  return { ...need, effortCapacity: EFFORT_LADDER[nextIdx] }
}

/**
 * M6.5 — Pure session configuration.
 * Converts a StateInterpretationResult into a raw BreathPrescription.
 * No adaptation. Layer boundary: M6 only.
 *
 * `lengthPreference` defaults to 'standard' for backward compatibility with
 * callers that don't have a SessionLengthPreference handy. Live intake passes
 * the user's explicit pick through.
 */
export function buildSessionConfig(
  result: StateInterpretationResult,
  lengthPreference: SessionLengthPreference = 'standard'
): BreathPrescription {
  const baseNeed = classifyNeedProfile(result)
  const need = applyLengthPreference(baseNeed, lengthPreference)
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
export function buildDeliveryConfig(
  result: StateInterpretationResult,
  lengthPreference: SessionLengthPreference = 'standard'
): BreathPrescription {
  const baseNeed = classifyNeedProfile(result)
  const need = applyLengthPreference(baseNeed, lengthPreference)
  const feasibility = buildFeasibilityProfile(need)
  const family = selectBreathFamily(need, feasibility)
  const raw = prescribeBreath(family, need, feasibility)
  const context = loadHARIContext()
  return applyHARIAdaptation(raw, context, need)
}

export type { BreathPrescription }
