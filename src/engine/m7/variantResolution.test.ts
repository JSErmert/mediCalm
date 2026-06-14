import { describe, it, expect } from 'vitest'
import { resolveVariant } from './variantResolution'

describe('M7 resolveVariant — §3.8 VariantResolution + I8/I18/I19/I20', () => {
  it('returns a variant for a known pathway with any conditioning (I8 totality)', () => {
    const v = resolveVariant(
      'anxious_calm_downregulate_reduced_effort_standard',
      { irritability: 'fast_onset_slow_resolution', flare_sensitivity: 'high', baseline_intensity_band: 'high' },
    )
    expect(v.pathway_id).toBe('anxious_calm_downregulate_reduced_effort_standard')
    expect(v.phases.length).toBeGreaterThanOrEqual(1)
  })

  it('is deterministic — same inputs → same variant (I18)', () => {
    const a = resolveVariant('anxious_calm_downregulate_reduced_effort_standard', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })
    const b = resolveVariant('anxious_calm_downregulate_reduced_effort_standard', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })
    expect(a).toEqual(b)
  })

  it('throws for an unknown pathway_id', () => {
    expect(() => resolveVariant('does_not_exist', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })).toThrow()
  })

  it('hints have no effect at v0.1 — single variant per pathway', () => {
    const without = resolveVariant('anxious_calm_downregulate_reduced_effort_standard', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })
    const withHint = resolveVariant(
      'anxious_calm_downregulate_reduced_effort_standard',
      { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
      { flare_sensitivity_truth_estimate: 'high' },
    )
    expect(without).toEqual(withHint)
  })
})
