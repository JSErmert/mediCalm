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
