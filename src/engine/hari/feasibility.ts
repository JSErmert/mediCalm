/**
 * HARI — Feasibility Adjustment Layer (M6.7)
 *
 * Applies practical feasibility rules to a raw SessionConfig, producing a
 * FeasibleSessionProfile that is safe and appropriate for the user's current state.
 *
 * Rules applied (in priority order):
 *   1. Overload      → simplify timing, remove holds, shorten duration
 *   2. High effort   → minimal (effort === 'minimal') → cap duration, remove holds
 *   3. Mixed/uncertain → (secondary state present) → neutral 4/6 breathing
 *   4. Invariants    → inhale >= 3 (non-minimal), exhale > inhale
 */

import type { SessionConfig, StateInterpretationResult, NeedProfile, FeasibilityProfile } from '../../types/hari'

/**
 * SessionConfig with feasibility tracking fields.
 * Extends SessionConfig — all existing properties preserved.
 */
export interface FeasibleSessionProfile extends SessionConfig {
  /** True when at least one feasibility rule modified the raw config. */
  feasibilityApplied: boolean
  /** Human-readable note describing which rule was applied, if any. */
  feasibilityNote?: string
}

// ── Duration caps ──────────────────────────────────────────────────────────────

const OVERLOAD_MAX_DURATION_S = 180    // 3 min — overload: keep it short
const MINIMAL_EFFORT_MAX_DURATION_S = 240 // 4 min — high sensitivity: reduce load

// ── Neutral breath timing (mixed/uncertain) ────────────────────────────────────
// Inhale=4, hold=0, exhale=6 — calm, ratio-correct, no counting pressure

const NEUTRAL_INHALE = 4
const NEUTRAL_HOLD = 0
const NEUTRAL_EXHALE = 6

/**
 * Apply feasibility rules to a raw SessionConfig.
 *
 * @param config   Raw config produced by buildSessionConfig (M6.5)
 * @param result   State interpretation result driving this session
 * @returns        FeasibleSessionProfile — adjusted config, ready for session runtime
 */
export function adjustForFeasibility(
  config: SessionConfig,
  result: StateInterpretationResult
): FeasibleSessionProfile {

  // ── Rule 1: Overload ──────────────────────────────────────────────────────
  // 5+ active states → simplify everything, no holds, softest pacing, short session
  if (result.overload) {
    const inhale = Math.min(config.inhaleSeconds, 3)
    const exhale = Math.max(inhale * 2, 6) // at least 2:1 ratio, minimum 6s
    return {
      ...config,
      inhaleSeconds: inhale,
      holdSeconds: 0,
      exhaleSeconds: exhale,
      durationSeconds: Math.min(config.durationSeconds, OVERLOAD_MAX_DURATION_S),
      feasibilityApplied: true,
      feasibilityNote: 'overload: simplified timing (inhale ≤ 3, no hold, exhale ≥ 6), capped at 3 min',
    }
  }

  // ── Rule 2: High sensitivity (effort === 'minimal') ───────────────────────
  // Minimal effort signals high flare sensitivity — reduce duration and remove holds
  if (result.effort === 'minimal') {
    return {
      ...config,
      holdSeconds: 0,
      durationSeconds: Math.min(config.durationSeconds, MINIMAL_EFFORT_MAX_DURATION_S),
      feasibilityApplied: true,
      feasibilityNote: 'minimal effort: hold removed, duration capped at 4 min',
    }
  }

  // ── Rule 3: Mixed/uncertain (secondary state present) ────────────────────
  // Two active states without a dominant pattern → neutral 4/6 breathing
  if (result.secondary !== undefined) {
    return {
      ...config,
      inhaleSeconds: NEUTRAL_INHALE,
      holdSeconds: NEUTRAL_HOLD,
      exhaleSeconds: NEUTRAL_EXHALE,
      feasibilityApplied: true,
      feasibilityNote: 'mixed states: neutral 4/6 breathing (no hold)',
    }
  }

  // ── Invariants — applied to all other cases ───────────────────────────────
  //   • inhale >= 3 for non-minimal effort (avoid rushed pacing)
  //   • exhale > inhale (ensures parasympathetic activation)
  const inhale = result.effort !== 'minimal'
    ? Math.max(3, config.inhaleSeconds)
    : config.inhaleSeconds
  const exhale = Math.max(inhale + 1, config.exhaleSeconds)
  const hold = config.holdSeconds

  if (inhale !== config.inhaleSeconds || exhale !== config.exhaleSeconds) {
    return {
      ...config,
      inhaleSeconds: inhale,
      holdSeconds: hold,
      exhaleSeconds: exhale,
      feasibilityApplied: true,
      feasibilityNote: 'invariant correction: inhale ≥ 3, exhale > inhale',
    }
  }

  // No adjustments needed
  return { ...config, feasibilityApplied: false }
}

// ── M6.8 — Feasibility Profile Builder ───────────────────────────────────────

/**
 * Derive a FeasibilityProfile from a NeedProfile.
 * Used by the M6.8 pipeline (needProfile → feasibilityProfile → breathFamily).
 */
export function buildFeasibilityProfile(need: NeedProfile): FeasibilityProfile {
  if (need.overload) {
    return {
      maxDurationSeconds: 180,
      holdsPermitted: false,
      minInhaleSeconds: 3,
      feasibilityApplied: true,
      feasibilityNote: 'overload: 3 min cap, no holds',
    }
  }

  if (need.effortCapacity === 'minimal') {
    return {
      maxDurationSeconds: 240,
      holdsPermitted: false,
      minInhaleSeconds: 3,
      feasibilityApplied: true,
      feasibilityNote: 'minimal effort: 4 min cap, no holds',
    }
  }

  if (need.secondaryGoal !== undefined) {
    return {
      maxDurationSeconds: 360,
      holdsPermitted: false,
      minInhaleSeconds: 3,
      feasibilityApplied: true,
      feasibilityNote: 'mixed states: stabilization, no holds',
    }
  }

  return {
    maxDurationSeconds: need.effortCapacity === 'reduced' ? 360 : 480,
    holdsPermitted: need.safetyLevel !== 'high',
    minInhaleSeconds: 3,
    feasibilityApplied: false,
  }
}
