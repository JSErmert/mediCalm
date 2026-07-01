import type { CustomTimingProfile } from '../../types/custom'

export type CustomPhaseKind = 'inhale' | 'hold_in' | 'exhale' | 'hold_out'

export interface CustomPhase {
  kind: CustomPhaseKind
  seconds: number
}

function isPositiveFinite(n: unknown): n is number {
  return typeof n === 'number' && isFinite(n) && n > 0
}

/**
 * Returns the ordered phase array for ONE cycle of a custom breathing pattern.
 * Phase order is always: inhale → hold_in → exhale → hold_out.
 * A phase whose duration is ≤ 0, NaN, or absent is excluded entirely — no gap.
 */
export function buildCustomPhaseTimeline(profile: CustomTimingProfile): CustomPhase[] {
  const phases: CustomPhase[] = []

  if (isPositiveFinite(profile.inhale_seconds)) {
    phases.push({ kind: 'inhale', seconds: profile.inhale_seconds })
  }
  if (isPositiveFinite(profile.hold_after_inhale_seconds)) {
    phases.push({ kind: 'hold_in', seconds: profile.hold_after_inhale_seconds })
  }
  if (isPositiveFinite(profile.exhale_seconds)) {
    phases.push({ kind: 'exhale', seconds: profile.exhale_seconds })
  }
  if (isPositiveFinite(profile.hold_after_exhale_seconds)) {
    phases.push({ kind: 'hold_out', seconds: profile.hold_after_exhale_seconds })
  }

  return phases
}
