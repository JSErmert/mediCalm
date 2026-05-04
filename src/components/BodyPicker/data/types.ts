import type { BodyLocation, BodyMuscle } from '../../../types/hari'

export interface MusclePathDef {
  id: BodyMuscle
  name: string
  view: 'front' | 'back'
  region: BodyLocation
  /** Verbatim SVG path d-attribute from upstream source */
  path: string
}
