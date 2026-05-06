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
