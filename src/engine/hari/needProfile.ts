/**
 * HARI — Need Profile Classification (M6.8 / M6.8.1)
 *
 * Converts a StateInterpretationResult into a NeedProfile.
 * Decouples emotional/physical state from direct breath ratio assignment.
 *
 * Rules:
 * - overwhelmed         → downregulate (NOT decompress)
 * - pain                → decompress always (never shallow or rushed)
 * - overload            → downregulate, safety high, no activation
 * - mixed/uncertain     → secondary goal recorded; breathFamily resolves to neutral_reset
 * - sad/exhausted       → activationPermitted when all gating conditions pass
 *
 * Activation gating (ALL must be true):
 *   - effort is not minimal
 *   - not overload
 *   - no secondary state
 *   - primary is sad or exhausted
 *   - breath was not safety-downgraded (proxy for sensitivity not high)
 *
 * Authority: M6.8.1 — Need + Breath Family Alignment
 */

import type {
  StateInterpretationResult,
  HariEmotionalState,
  NeedProfile,
  RegulatoryGoal,
  BreathPattern,
} from '../../types/hari'

// ── State → Goal Mapping ──────────────────────────────────────────────────────

const GOAL_MAP: Record<HariEmotionalState, RegulatoryGoal> = {
  overwhelmed: 'downregulate',  // M6.8.1: overwhelmed → downregulate, not decompress
  pain:        'decompress',    // pain must always decompress — never rushed
  exhausted:   'restore',
  anxious:     'downregulate',
  tight:       'expand',
  angry:       'ground',
  sad:         'restore',       // may upgrade to activate when all gating conditions pass
}

// ── Default Breath Per State (for downgrade detection) ────────────────────────
// Matches STATE_DEFAULTS in stateInterpretation.ts

const DEFAULT_BREATH: Record<HariEmotionalState, BreathPattern> = {
  overwhelmed: '2/4',
  exhausted:   '2/4',
  pain:        '3/5',
  anxious:     '4/7',
  tight:       '3/5',
  angry:       '3/5',
  sad:         '3/5',
}

// ── Main Function ─────────────────────────────────────────────────────────────

/**
 * Classify the regulatory need from a state interpretation result.
 */
export function classifyNeedProfile(result: StateInterpretationResult): NeedProfile {
  const { primary, secondary, effort, overload, breath } = result

  if (overload) {
    return {
      primaryGoal: 'downregulate',
      secondaryGoal: undefined,
      effortCapacity: 'minimal',
      safetyLevel: 'high',
      activationPermitted: false,
      breathDowngraded: true,
      overload: true,
    }
  }

  const primaryGoal = GOAL_MAP[primary]
  const secondaryGoal = secondary !== undefined ? GOAL_MAP[secondary] : undefined

  // Breath downgrade proxy: true when intensity >= 7 or sensitivity was high
  const breathDowngraded = breath !== DEFAULT_BREATH[primary]

  // Activation gating — all conditions must pass
  const activationPermitted =
    effort !== 'minimal' &&
    secondary === undefined &&
    (primary === 'sad' || primary === 'exhausted') &&
    !breathDowngraded

  const safetyLevel =
    effort === 'minimal' ? 'high' :
    effort === 'reduced' ? 'moderate' :
    'standard'

  return {
    primaryGoal,
    secondaryGoal,
    effortCapacity: effort,
    safetyLevel,
    activationPermitted,
    breathDowngraded,
    overload: false,
  }
}
