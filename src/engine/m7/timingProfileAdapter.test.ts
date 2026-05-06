import { describe, it, expect } from 'vitest'
import { variantToTimingProfile } from './timingProfileAdapter'
import type { PTVariant } from '../../types/m7'

function variant(family: 'flare_safe_soft_exhale' | 'calm_downregulate' | 'decompression_expand', cycles: number): PTVariant {
  return {
    variant_id: 'v', variant_version: '0.1.0',
    pathway_id: 'p', pathway_version: '0.1.0',
    conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
    phases: [{ type: 'breath', breath_family: family, num_cycles: cycles, cue: { opening: '', closing: '' } }],
    authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
    review_status: 'engineering_passed',
  }
}

describe('M7 timingProfileAdapter — PTVariant → legacy TimingProfile', () => {
  it('flare_safe_soft_exhale maps to 3/0/6 timing', () => {
    const t = variantToTimingProfile(variant('flare_safe_soft_exhale', 26))
    expect(t.inhale_seconds).toBe(3)
    expect(t.exhale_seconds).toBe(6)
    expect(t.rounds).toBe(26)
  })

  it('calm_downregulate maps to 4/0/7 timing', () => {
    const t = variantToTimingProfile(variant('calm_downregulate', 32))
    expect(t.inhale_seconds).toBe(4)
    expect(t.exhale_seconds).toBe(7)
    expect(t.rounds).toBe(32)
  })

  it('decompression_expand maps to 4/0/6 timing', () => {
    const t = variantToTimingProfile(variant('decompression_expand', 24))
    expect(t.inhale_seconds).toBe(4)
    expect(t.exhale_seconds).toBe(6)
    expect(t.rounds).toBe(24)
  })

  it('throws when first phase is not a breath phase', () => {
    const v = variant('calm_downregulate', 1)
    v.phases = [{ type: 'transition', subtype: 'intro', template_id: 't', template_version: '1.0.0', duration_seconds: 5 }]
    expect(() => variantToTimingProfile(v)).toThrow()
  })
})
