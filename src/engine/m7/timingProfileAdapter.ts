/**
 * M7 → legacy adapter: convert a PTVariant to a TimingProfile by finding the
 * first breath phase in the variant's phases array.
 *
 * Used at M7.1 / M7.2 transitional period. M7.2's heterogeneous render loop
 * (PhaseRenderer) iterates phases directly; this adapter exists so legacy
 * single-TimingProfile consumers (sweep harness, any non-PhaseRenderer site)
 * can still pull the breath ratios + cycle count.
 *
 * Variant phase order is no longer assumed (v0.2 places intro at index 0,
 * breath at index 1, closing at index 2). The adapter searches by type.
 */
import type { PTVariant, BreathPhase } from '../../types/m7'
import type { TimingProfile } from '../../types'
import { BREATH_FAMILIES } from '../hari/breathFamily'

export function variantToTimingProfile(variant: PTVariant): TimingProfile {
  const breathPhase = variant.phases.find((p): p is BreathPhase => p.type === 'breath')
  if (!breathPhase) {
    throw new Error(`M7 timingProfileAdapter: variant ${variant.variant_id} has no breath phase`)
  }
  const family = BREATH_FAMILIES[breathPhase.breath_family]
  return {
    inhale_seconds: family.inhaleSeconds,
    exhale_seconds: family.exhaleSeconds,
    rounds: breathPhase.num_cycles,
  }
}
