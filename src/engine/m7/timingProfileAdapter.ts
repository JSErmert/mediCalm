/**
 * M7 → legacy adapter: convert a single-breath-phase PTVariant to a TimingProfile.
 *
 * Used at M7.1 only — M7.2's heterogeneous render loop replaces this adapter with
 * direct phase iteration. M7.1 single-phase variants ride on the existing render loop
 * via this adapter to keep "no behavioral change" guarantee.
 */
import type { PTVariant } from '../../types/m7'
import type { TimingProfile } from '../../types'
import { BREATH_FAMILIES } from '../hari/breathFamily'

export function variantToTimingProfile(variant: PTVariant): TimingProfile {
  const first = variant.phases[0]
  if (first.type !== 'breath') {
    throw new Error(`M7.1 timingProfileAdapter: first phase must be 'breath', got '${first.type}'`)
  }
  const family = BREATH_FAMILIES[first.breath_family]
  return {
    inhale_seconds: family.inhaleSeconds,
    exhale_seconds: family.exhaleSeconds,
    rounds: first.num_cycles,
  }
}
