import { describe, it, expect } from 'vitest'
import { M7_PATHWAYS, M7_VARIANTS } from './m7Pathways'
import { BREATH_FAMILIES } from '../engine/hari/breathFamily'

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

  it('every variant has at least one breath phase (I7 — preserved at v0.2)', () => {
    for (const v of M7_VARIANTS) {
      expect(v.phases.some(p => p.type === 'breath')).toBe(true)
    }
  })
})

describe('M7 pathway library v0.2 — variants gain explicit intro + closing', () => {
  it('every variant has exactly 3 phases: intro transition + breath + closing transition', () => {
    for (const v of M7_VARIANTS) {
      expect(v.phases.length).toBe(3)
      expect(v.phases[0].type).toBe('transition')
      expect(v.phases[1].type).toBe('breath')
      expect(v.phases[2].type).toBe('transition')
    }
  })

  it('phase[0] is an intro transition', () => {
    for (const v of M7_VARIANTS) {
      const p0 = v.phases[0]
      if (p0.type !== 'transition') throw new Error('expected transition')
      expect(p0.subtype).toBe('intro')
    }
  })

  it('phase[2] is a closing transition', () => {
    for (const v of M7_VARIANTS) {
      const p2 = v.phases[2]
      if (p2.type !== 'transition') throw new Error('expected transition')
      expect(p2.subtype).toBe('closing')
    }
  })

  it('every transition references a template with version 1.0.0', () => {
    for (const v of M7_VARIANTS) {
      for (const phase of v.phases) {
        if (phase.type === 'transition') {
          expect(phase.template_version).toBe('1.0.0')
        }
      }
    }
  })

  it('I9 mass balance — phase durations sum to authored_duration_seconds within ±5%', () => {
    for (const v of M7_VARIANTS) {
      const pathway = M7_PATHWAYS.find(p => p.pathway_id === v.pathway_id)!
      const sum = v.phases.reduce((acc, phase) => {
        if (phase.type === 'transition') return acc + phase.duration_seconds
        if (phase.type === 'breath') {
          const family = BREATH_FAMILIES[phase.breath_family]
          return acc + (family.inhaleSeconds + family.exhaleSeconds + (family.holdSeconds ?? 0)) * phase.num_cycles
        }
        return acc
      }, 0)
      const tolerance = pathway.authored_duration_seconds * 0.05
      expect(Math.abs(sum - pathway.authored_duration_seconds)).toBeLessThanOrEqual(tolerance)
    }
  })
})
