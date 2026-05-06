import { describe, it, expect } from 'vitest'
import { M7_PATHWAYS, M7_VARIANTS } from './m7Pathways'

describe('M7 pathway library v0.1 — scaffold', () => {
  it('exports M7_PATHWAYS and M7_VARIANTS arrays', () => {
    expect(Array.isArray(M7_PATHWAYS)).toBe(true)
    expect(Array.isArray(M7_VARIANTS)).toBe(true)
  })

  it('every variant references an existing pathway (I5)', () => {
    const pathwayIds = new Set(M7_PATHWAYS.map(p => p.pathway_id))
    for (const v of M7_VARIANTS) {
      expect(pathwayIds.has(v.pathway_id)).toBe(true)
    }
  })

  it('every variant has at least one breath phase (I7)', () => {
    for (const v of M7_VARIANTS) {
      expect(v.phases.some(p => p.type === 'breath')).toBe(true)
    }
  })

  it('every pathway has authored_duration_seconds > 0 (I3)', () => {
    for (const p of M7_PATHWAYS) {
      expect(p.authored_duration_seconds).toBeGreaterThan(0)
    }
  })
})

describe('M7 pathway library v0.1 — 12-pathway migration completeness', () => {
  it('has exactly 12 pathways (one per postfix-sweep output)', () => {
    expect(M7_PATHWAYS.length).toBe(12)
  })

  it('has exactly 12 variants (one per pathway at v0.1)', () => {
    expect(M7_VARIANTS.length).toBe(12)
  })

  it('every pathway_id is unique', () => {
    const ids = M7_PATHWAYS.map(p => p.pathway_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every variant_id is unique', () => {
    const ids = M7_VARIANTS.map(v => v.variant_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all pathways and variants ship at engineering_passed review_status', () => {
    for (const p of M7_PATHWAYS) expect(p.review_status).toBe('engineering_passed')
    for (const v of M7_VARIANTS) expect(v.review_status).toBe('engineering_passed')
  })

  it('every variant has exactly one breath phase at v0.1 (single-phase migration)', () => {
    for (const v of M7_VARIANTS) {
      expect(v.phases.length).toBe(1)
      expect(v.phases[0].type).toBe('breath')
    }
  })
})
