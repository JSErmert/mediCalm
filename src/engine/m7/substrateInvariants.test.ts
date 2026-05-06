import { describe, it, expect } from 'vitest'
import { assertVariantInvariants } from './substrateInvariants'
import type { PTVariant } from '../../types/m7'

function valid(): PTVariant {
  return {
    variant_id: 'v', variant_version: '0.1.0',
    pathway_id: 'p', pathway_version: '0.1.0',
    conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
    phases: [{ type: 'breath', breath_family: 'calm_downregulate', num_cycles: 4, cue: { opening: '', closing: '' } }],
    authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
    review_status: 'engineering_passed',
  }
}

describe('M7 substrate invariants — runtime check', () => {
  it('passes a valid variant', () => {
    expect(() => assertVariantInvariants(valid())).not.toThrow()
  })

  it('fails I6 — phases.length === 0', () => {
    const v = valid(); v.phases = []
    expect(() => assertVariantInvariants(v)).toThrow(/I6/)
  })

  it('fails I7 — no breath phase', () => {
    const v = valid(); v.phases = [{ type: 'transition', subtype: 'between', template_id: 't', template_version: '1.0.0', duration_seconds: 5 }]
    expect(() => assertVariantInvariants(v)).toThrow(/I7/)
  })

  it('fails I14 — transition duration ≠ 5', () => {
    const v = valid(); v.phases.push({ type: 'transition', subtype: 'between', template_id: 't', template_version: '1.0.0', duration_seconds: 3 as unknown as 5 })
    expect(() => assertVariantInvariants(v)).toThrow(/I14/)
  })
})
