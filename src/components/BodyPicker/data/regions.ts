import type { BodyLocation, BodyMuscle } from '../../../types/hari'
import { MUSCLE_PATHS } from './muscles'
import type { MusclePathDef } from './types'

/**
 * Maps every BodyMuscle to its parent BodyLocation region.
 * Auto-derived from MUSCLE_PATHS — kept as a Record for TypeScript
 * exhaustiveness checking when consumers add or rename muscles.
 *
 * Authority: docs/superpowers/specs/2026-05-04-body-picker-design.md §Data Model
 */
export const MUSCLE_TO_REGION: Record<BodyMuscle, BodyLocation> =
  Object.fromEntries(
    MUSCLE_PATHS.map(m => [m.id, m.region])
  ) as Record<BodyMuscle, BodyLocation>

// Compile-time exhaustiveness: if a BodyMuscle is added to the union but
// no muscle with that id exists in MUSCLE_PATHS, this fails to type-check.
// Prevents silent `undefined` lookups on MUSCLE_TO_REGION.
type _MissingMuscles = Exclude<BodyMuscle, keyof typeof MUSCLE_TO_REGION>
const _exhaustive: [_MissingMuscles] extends [never] ? true : never = true
void _exhaustive

/** Returns all muscle defs whose parent region is `region`. */
export function musclesForRegion(region: BodyLocation): MusclePathDef[] {
  return MUSCLE_PATHS.filter(m => m.region === region)
}

/**
 * Human-readable labels for every BodyLocation. Used in aria-label for
 * screen-reader pronunciation (avoids "shoulder underscore left") and as
 * chip text in the picker UI.
 */
export const REGION_LABEL: Record<BodyLocation, string> = {
  head_temples: 'Head / temples',
  jaw_tmj_facial: 'Jaw / TMJ / facial',
  neck: 'Neck',
  shoulder_left: 'Left shoulder',
  shoulder_right: 'Right shoulder',
  upper_back: 'Upper back',
  mid_back: 'Mid back',
  chest_sternum: 'Chest / sternum',
  rib_side: 'Rib / side',
  elbow_forearm_left: 'Left elbow / forearm',
  elbow_forearm_right: 'Right elbow / forearm',
  wrist_hand_left: 'Left wrist / hand',
  wrist_hand_right: 'Right wrist / hand',
  lower_back: 'Lower back',
  hip_pelvis: 'Hip / pelvis',
  glute: 'Glute',
  thigh_left: 'Left thigh',
  thigh_right: 'Right thigh',
  knee_left: 'Left knee',
  knee_right: 'Right knee',
  calf_shin_left: 'Left calf / shin',
  calf_shin_right: 'Right calf / shin',
  ankle_foot_left: 'Left ankle / foot',
  ankle_foot_right: 'Right ankle / foot',
  spread_multiple: 'Spread / multiple',
  whole_body: 'Whole body',
  not_sure: 'Not sure',
}
