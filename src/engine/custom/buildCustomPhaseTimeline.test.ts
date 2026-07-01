import { describe, it, expect } from 'vitest'
import { buildCustomPhaseTimeline } from './buildCustomPhaseTimeline'
import type { CustomTimingProfile } from '../../types/custom'

const BASE: CustomTimingProfile = {
  inhale_seconds: 4,
  hold_after_inhale_seconds: 0,
  exhale_seconds: 7,
  hold_after_exhale_seconds: 0,
  cycles: 6,
}

describe('buildCustomPhaseTimeline — phase order', () => {
  it('returns phases in fixed order: inhale → hold_in → exhale → hold_out', () => {
    const phases = buildCustomPhaseTimeline({
      ...BASE,
      hold_after_inhale_seconds: 3,
      hold_after_exhale_seconds: 2,
    })
    expect(phases.map(p => p.kind)).toEqual(['inhale', 'hold_in', 'exhale', 'hold_out'])
  })

  it('returns only inhale and exhale when both holds are 0', () => {
    const phases = buildCustomPhaseTimeline(BASE)
    expect(phases.map(p => p.kind)).toEqual(['inhale', 'exhale'])
  })

  it('includes hold_in but not hold_out when only hold_after_inhale is set', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_inhale_seconds: 4 })
    expect(phases.map(p => p.kind)).toEqual(['inhale', 'hold_in', 'exhale'])
  })

  it('includes hold_out but not hold_in when only hold_after_exhale is set', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_exhale_seconds: 2 })
    expect(phases.map(p => p.kind)).toEqual(['inhale', 'exhale', 'hold_out'])
  })
})

describe('buildCustomPhaseTimeline — 0-duration hold exclusion', () => {
  it('excludes hold_in when hold_after_inhale_seconds is 0', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_inhale_seconds: 0 })
    expect(phases.some(p => p.kind === 'hold_in')).toBe(false)
  })

  it('excludes hold_out when hold_after_exhale_seconds is 0', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_exhale_seconds: 0 })
    expect(phases.some(p => p.kind === 'hold_out')).toBe(false)
  })
})

describe('buildCustomPhaseTimeline — non-positive / NaN guard', () => {
  it('excludes hold_in when hold_after_inhale_seconds is negative', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_inhale_seconds: -1 })
    expect(phases.some(p => p.kind === 'hold_in')).toBe(false)
  })

  it('excludes hold_out when hold_after_exhale_seconds is negative', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_exhale_seconds: -3 })
    expect(phases.some(p => p.kind === 'hold_out')).toBe(false)
  })

  it('excludes hold_in when hold_after_inhale_seconds is NaN', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_inhale_seconds: NaN })
    expect(phases.some(p => p.kind === 'hold_in')).toBe(false)
  })

  it('excludes hold_out when hold_after_exhale_seconds is NaN', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, hold_after_exhale_seconds: NaN })
    expect(phases.some(p => p.kind === 'hold_out')).toBe(false)
  })

  it('excludes inhale when inhale_seconds is 0', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, inhale_seconds: 0 })
    expect(phases.some(p => p.kind === 'inhale')).toBe(false)
  })

  it('excludes exhale when exhale_seconds is NaN', () => {
    const phases = buildCustomPhaseTimeline({ ...BASE, exhale_seconds: NaN })
    expect(phases.some(p => p.kind === 'exhale')).toBe(false)
  })
})

describe('buildCustomPhaseTimeline — seconds values', () => {
  it('preserves the exact seconds value for each phase', () => {
    const phases = buildCustomPhaseTimeline({
      inhale_seconds: 5,
      hold_after_inhale_seconds: 3,
      exhale_seconds: 8,
      hold_after_exhale_seconds: 2,
      cycles: 4,
    })
    expect(phases[0]).toEqual({ kind: 'inhale', seconds: 5 })
    expect(phases[1]).toEqual({ kind: 'hold_in', seconds: 3 })
    expect(phases[2]).toEqual({ kind: 'exhale', seconds: 8 })
    expect(phases[3]).toEqual({ kind: 'hold_out', seconds: 2 })
  })
})

describe('buildCustomPhaseTimeline — no-hold profile is behavior-identical to base', () => {
  it('produces exactly 2 phases for a no-hold profile', () => {
    const phases = buildCustomPhaseTimeline(BASE)
    expect(phases).toHaveLength(2)
    expect(phases[0]).toEqual({ kind: 'inhale', seconds: 4 })
    expect(phases[1]).toEqual({ kind: 'exhale', seconds: 7 })
  })
})

describe('buildCustomPhaseTimeline — cycles field is not reflected in timeline length', () => {
  it('always returns one cycle regardless of profile.cycles value', () => {
    const p3 = buildCustomPhaseTimeline({ ...BASE, cycles: 3 })
    const p10 = buildCustomPhaseTimeline({ ...BASE, cycles: 10 })
    expect(p3).toHaveLength(2)
    expect(p10).toHaveLength(2)
  })
})
