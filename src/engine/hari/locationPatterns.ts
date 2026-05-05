/**
 * Location pattern inference — derives a clinical pain-distribution descriptor
 * from the user's selected anatomical regions.
 *
 * Replaces self-report fallback buttons (Spread / Whole body / Not sure) with
 * a derived classifier that reflects standard PT thinking about kinetic chains
 * and pain distribution. The result feeds `intake.location_pattern` for HARI
 * history and future pattern recognition; the engine itself does not yet use
 * this field for mechanism selection.
 *
 * Authority: docs/superpowers/specs/2026-05-04-location-pattern-inference-design.md
 */

import type { BodyLocation, LocationPattern } from '../../types/hari'

export interface AnatomicalChain {
  id: string
  /** Human-readable name; not currently surfaced to users but logged for debugging. */
  name: string
  regions: BodyLocation[]
}

/**
 * Standard PT kinetic-chain and fascial-line groupings.
 * Chains intentionally overlap (e.g. shoulder_left appears in both Cervical
 * and Upper limb (L)) — a user's selection may fit one, both, or neither.
 */
export const ANATOMICAL_CHAINS: AnatomicalChain[] = [
  {
    id: 'cervical_upper_crossed',
    name: 'Cervical / upper crossed',
    regions: ['head_temples', 'jaw_tmj_facial', 'neck', 'upper_back', 'shoulder_left', 'shoulder_right'],
  },
  {
    id: 'thoracic_rib',
    name: 'Thoracic / rib',
    regions: ['mid_back', 'rib_side', 'chest_sternum'],
  },
  {
    id: 'lumbo_pelvic',
    name: 'Lumbo-pelvic',
    regions: ['lower_back', 'hip_pelvis', 'glute'],
  },
  {
    id: 'posterior_chain_left',
    name: 'Posterior chain (L)',
    regions: ['lower_back', 'hip_pelvis', 'glute', 'thigh_left', 'knee_left', 'calf_shin_left', 'ankle_foot_left'],
  },
  {
    id: 'posterior_chain_right',
    name: 'Posterior chain (R)',
    regions: ['lower_back', 'hip_pelvis', 'glute', 'thigh_right', 'knee_right', 'calf_shin_right', 'ankle_foot_right'],
  },
  {
    id: 'upper_limb_left',
    name: 'Upper limb (L)',
    regions: ['shoulder_left', 'elbow_forearm_left', 'wrist_hand_left'],
  },
  {
    id: 'upper_limb_right',
    name: 'Upper limb (R)',
    regions: ['shoulder_right', 'elbow_forearm_right', 'wrist_hand_right'],
  },
]

/**
 * Returns the inferred LocationPattern for the given selected regions.
 *
 * - 0 or 1 regions → 'single'
 * - All regions fit inside at least one chain → 'connected'
 * - 4+ regions touching 3+ chains → 'widespread'
 * - Otherwise → 'multifocal'
 *
 * The `'diffuse_unspecified'` value is set explicitly by the UI escape hatch,
 * not produced here.
 */
export function inferLocationPattern(regions: BodyLocation[]): LocationPattern {
  const n = regions.length
  if (n <= 1) return 'single'

  const fittingChains = ANATOMICAL_CHAINS.filter((c) =>
    regions.every((r) => c.regions.includes(r))
  )
  if (fittingChains.length > 0) return 'connected'

  if (n >= 4) {
    const chainsTouched = ANATOMICAL_CHAINS.filter((c) =>
      regions.some((r) => c.regions.includes(r))
    ).length
    if (chainsTouched >= 3) return 'widespread'
  }

  return 'multifocal'
}
