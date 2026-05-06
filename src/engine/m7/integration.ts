/**
 * M7 top-level orchestration — intake → resolved variant + legacy TimingProfile + pathway_ref.
 *
 * At M7.1, this runs in SHADOW MODE alongside the legacy session-selection path.
 * The returned M7SessionBuild is persisted to HistoryEntry's optional M7 fields
 * (intake_sensor_state + pathway_ref); it does NOT alter the RuntimeSession that
 * drives GuidedSessionScreen (which continues to use the legacy TimingProfile).
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md
 *            §3.10 I38-I39, §8 M7.1 shadow-mode contract
 */
import type { IntakeSensorState, PTVariant } from '../../types/m7'
import type { TimingProfile } from '../../types'
import { selectPathway } from './selection'
import { resolveVariant } from './variantResolution'
import { variantToTimingProfile } from './timingProfileAdapter'

export type M7SessionBuild = {
  variant: PTVariant
  timing: TimingProfile
  pathway_ref: {
    pathway_id: string
    pathway_version: string
    variant_id: string
    variant_version: string
  }
}

export function buildM7Session(intake_sensor_state: IntakeSensorState): M7SessionBuild {
  const sel = selectPathway(intake_sensor_state)
  const variant = resolveVariant(sel.pathway_id, {
    irritability: intake_sensor_state.irritability,
    flare_sensitivity: intake_sensor_state.flare_sensitivity,
    baseline_intensity_band: bandFor(intake_sensor_state.baseline_intensity),
  })
  const timing = variantToTimingProfile(variant)
  return {
    variant,
    timing,
    pathway_ref: {
      pathway_id: variant.pathway_id,
      pathway_version: variant.pathway_version,
      variant_id: variant.variant_id,
      variant_version: variant.variant_version,
    },
  }
}

function bandFor(intensity: number): 'low' | 'moderate' | 'high' {
  if (intensity <= 3) return 'low'
  if (intensity <= 6) return 'moderate'
  return 'high'
}
