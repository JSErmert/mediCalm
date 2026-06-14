/**
 * M7 selectPathway — pathway selection function (§3.8 PathwaySelection).
 *
 * Consumes ONLY intake_sensor_state per I17 / I36 partition discipline.
 * Deterministic and pure given the same intake (I16).
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §2.4
 */
import type { PathwaySelection } from '../../types/m7'
import { matchSelectionState } from '../../data/m7SelectionTable'

export const selectPathway: PathwaySelection = (intake_sensor_state) => {
  return matchSelectionState(intake_sensor_state)
}
