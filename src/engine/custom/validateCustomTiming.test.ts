import { describe, it, expect } from 'vitest'
import {
  validateCustomTiming,
  INHALE_MIN_SECONDS,
  INHALE_MAX_SECONDS,
  HOLD_AFTER_INHALE_MIN_SECONDS,
  HOLD_AFTER_INHALE_MAX_SECONDS,
  EXHALE_MIN_SECONDS,
  EXHALE_MAX_SECONDS,
  HOLD_AFTER_EXHALE_MIN_SECONDS,
  HOLD_AFTER_EXHALE_MAX_SECONDS,
  CYCLES_MIN,
  CYCLES_MAX,
} from './validateCustomTiming'
import type { CustomTimingProfile } from '../../types/custom'

const VALID_BASE: CustomTimingProfile = {
  inhale_seconds: 4,
  hold_after_inhale_seconds: 0,
  exhale_seconds: 7,
  hold_after_exhale_seconds: 0,
  cycles: 6,
}

describe('validateCustomTiming — happy path', () => {
  it('accepts a valid profile and returns valid=true with no violations', () => {
    const result = validateCustomTiming(VALID_BASE)
    expect(result.valid).toBe(true)
    expect(result.violations).toHaveLength(0)
    expect(result.clamped).toEqual(VALID_BASE)
  })

  it('accepts zero holds (no-hold breathing)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_inhale_seconds: 0, hold_after_exhale_seconds: 0 })
    expect(result.valid).toBe(true)
    expect(result.clamped.hold_after_inhale_seconds).toBe(0)
    expect(result.clamped.hold_after_exhale_seconds).toBe(0)
  })

  it('accepts boundary-exact inhale min', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: INHALE_MIN_SECONDS })
    expect(result.valid).toBe(true)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MIN_SECONDS)
  })

  it('accepts boundary-exact inhale max', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: INHALE_MAX_SECONDS })
    expect(result.valid).toBe(true)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MAX_SECONDS)
  })

  it('accepts boundary-exact exhale min', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: EXHALE_MIN_SECONDS })
    expect(result.valid).toBe(true)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MIN_SECONDS)
  })

  it('accepts boundary-exact exhale max', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: EXHALE_MAX_SECONDS })
    expect(result.valid).toBe(true)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MAX_SECONDS)
  })

  it('accepts boundary-exact hold_after_inhale max (4-7-8 Weil hold)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_inhale_seconds: HOLD_AFTER_INHALE_MAX_SECONDS })
    expect(result.valid).toBe(true)
    expect(result.clamped.hold_after_inhale_seconds).toBe(HOLD_AFTER_INHALE_MAX_SECONDS)
  })

  it('accepts boundary-exact hold_after_exhale max', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_exhale_seconds: HOLD_AFTER_EXHALE_MAX_SECONDS })
    expect(result.valid).toBe(true)
    expect(result.clamped.hold_after_exhale_seconds).toBe(HOLD_AFTER_EXHALE_MAX_SECONDS)
  })

  it('accepts boundary-exact cycles min', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: CYCLES_MIN })
    expect(result.valid).toBe(true)
    expect(result.clamped.cycles).toBe(CYCLES_MIN)
  })

  it('accepts boundary-exact cycles max', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: CYCLES_MAX })
    expect(result.valid).toBe(true)
    expect(result.clamped.cycles).toBe(CYCLES_MAX)
  })
})

describe('validateCustomTiming — inhale_seconds boundary violations', () => {
  it('rejects inhale just below min (min - 0.1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: INHALE_MIN_SECONDS - 0.1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('inhale_seconds'))).toBe(true)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MIN_SECONDS)
  })

  it('rejects inhale just above max (max + 0.1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: INHALE_MAX_SECONDS + 0.1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('inhale_seconds'))).toBe(true)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MAX_SECONDS)
  })

  it('accepts inhale just inside min (min + 0.01)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: INHALE_MIN_SECONDS + 0.01 })
    expect(result.valid).toBe(true)
  })

  it('accepts inhale just inside max (max - 0.01)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: INHALE_MAX_SECONDS - 0.01 })
    expect(result.valid).toBe(true)
  })
})

describe('validateCustomTiming — hold_after_inhale_seconds boundary violations', () => {
  it('rejects inhale hold below min (negative)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_inhale_seconds: -0.5 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('hold_after_inhale_seconds'))).toBe(true)
    expect(result.clamped.hold_after_inhale_seconds).toBe(HOLD_AFTER_INHALE_MIN_SECONDS)
  })

  it('rejects inhale hold above max (max + 0.1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_inhale_seconds: HOLD_AFTER_INHALE_MAX_SECONDS + 0.1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('hold_after_inhale_seconds'))).toBe(true)
    expect(result.clamped.hold_after_inhale_seconds).toBe(HOLD_AFTER_INHALE_MAX_SECONDS)
  })

  it('accepts inhale hold just inside max (max - 0.01)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_inhale_seconds: HOLD_AFTER_INHALE_MAX_SECONDS - 0.01 })
    expect(result.valid).toBe(true)
  })
})

describe('validateCustomTiming — exhale_seconds boundary violations', () => {
  it('rejects exhale just below min (min - 0.1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: EXHALE_MIN_SECONDS - 0.1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('exhale_seconds'))).toBe(true)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MIN_SECONDS)
  })

  it('rejects exhale just above max (max + 0.1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: EXHALE_MAX_SECONDS + 0.1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('exhale_seconds'))).toBe(true)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MAX_SECONDS)
  })

  it('accepts exhale just inside min (min + 0.01)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: EXHALE_MIN_SECONDS + 0.01 })
    expect(result.valid).toBe(true)
  })

  it('accepts exhale just inside max (max - 0.01)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: EXHALE_MAX_SECONDS - 0.01 })
    expect(result.valid).toBe(true)
  })
})

describe('validateCustomTiming — hold_after_exhale_seconds boundary violations', () => {
  it('rejects exhale hold below min (negative)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_exhale_seconds: -1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('hold_after_exhale_seconds'))).toBe(true)
    expect(result.clamped.hold_after_exhale_seconds).toBe(HOLD_AFTER_EXHALE_MIN_SECONDS)
  })

  it('rejects exhale hold above max (max + 0.1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_exhale_seconds: HOLD_AFTER_EXHALE_MAX_SECONDS + 0.1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('hold_after_exhale_seconds'))).toBe(true)
    expect(result.clamped.hold_after_exhale_seconds).toBe(HOLD_AFTER_EXHALE_MAX_SECONDS)
  })

  it('accepts exhale hold just inside max (max - 0.01)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_exhale_seconds: HOLD_AFTER_EXHALE_MAX_SECONDS - 0.01 })
    expect(result.valid).toBe(true)
  })
})

describe('validateCustomTiming — cycles boundary violations', () => {
  it('rejects cycles below min (0)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: 0 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('cycles'))).toBe(true)
    expect(result.clamped.cycles).toBe(CYCLES_MIN)
  })

  it('rejects cycles above max (max + 1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: CYCLES_MAX + 1 })
    expect(result.valid).toBe(false)
    expect(result.violations.some(v => v.includes('cycles'))).toBe(true)
    expect(result.clamped.cycles).toBe(CYCLES_MAX)
  })

  it('accepts cycles just inside min (min + 1 = 2)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: CYCLES_MIN + 1 })
    expect(result.valid).toBe(true)
  })

  it('accepts cycles just inside max (max - 1)', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: CYCLES_MAX - 1 })
    expect(result.valid).toBe(true)
  })
})

describe('validateCustomTiming — NaN and non-finite guards', () => {
  it('clamps NaN inhale to INHALE_MIN and reports violation', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: NaN })
    expect(result.valid).toBe(false)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MIN_SECONDS)
  })

  it('clamps NaN exhale to EXHALE_MIN and reports violation', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: NaN })
    expect(result.valid).toBe(false)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MIN_SECONDS)
  })

  it('clamps NaN cycles to CYCLES_MIN and reports violation', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: NaN })
    expect(result.valid).toBe(false)
    expect(result.clamped.cycles).toBe(CYCLES_MIN)
  })

  it('clamps Infinity inhale to INHALE_MAX and reports violation', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: Infinity })
    expect(result.valid).toBe(false)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MAX_SECONDS)
  })

  it('clamps -Infinity exhale to EXHALE_MIN and reports violation', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: -Infinity })
    expect(result.valid).toBe(false)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MIN_SECONDS)
  })

  it('clamps NaN hold_after_inhale to 0 and reports violation — treated as out-of-range', () => {
    const result = validateCustomTiming({ ...VALID_BASE, hold_after_inhale_seconds: NaN })
    expect(result.clamped.hold_after_inhale_seconds).toBe(HOLD_AFTER_INHALE_MIN_SECONDS)
  })
})

describe('validateCustomTiming — negative value guards', () => {
  it('clamps negative inhale to INHALE_MIN', () => {
    const result = validateCustomTiming({ ...VALID_BASE, inhale_seconds: -5 })
    expect(result.valid).toBe(false)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MIN_SECONDS)
  })

  it('clamps negative exhale to EXHALE_MIN', () => {
    const result = validateCustomTiming({ ...VALID_BASE, exhale_seconds: -1 })
    expect(result.valid).toBe(false)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MIN_SECONDS)
  })

  it('clamps negative cycles to CYCLES_MIN', () => {
    const result = validateCustomTiming({ ...VALID_BASE, cycles: -10 })
    expect(result.valid).toBe(false)
    expect(result.clamped.cycles).toBe(CYCLES_MIN)
  })
})

describe('validateCustomTiming — missing/null/undefined input guards', () => {
  it('returns a safe clamped profile for null input', () => {
    const result = validateCustomTiming(null)
    expect(result.valid).toBe(false)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MIN_SECONDS)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MIN_SECONDS)
    expect(result.clamped.cycles).toBe(CYCLES_MIN)
  })

  it('returns a safe clamped profile for undefined input', () => {
    const result = validateCustomTiming(undefined)
    expect(result.valid).toBe(false)
    expect(result.clamped.cycles).toBe(CYCLES_MIN)
  })

  it('returns a safe clamped profile for empty object input', () => {
    const result = validateCustomTiming({})
    expect(result.valid).toBe(false)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MIN_SECONDS)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MIN_SECONDS)
  })

  it('accepts a partial profile and safely fills missing fields', () => {
    const result = validateCustomTiming({ inhale_seconds: 4, exhale_seconds: 7, cycles: 6 })
    expect(result.clamped.hold_after_inhale_seconds).toBe(HOLD_AFTER_INHALE_MIN_SECONDS)
    expect(result.clamped.hold_after_exhale_seconds).toBe(HOLD_AFTER_EXHALE_MIN_SECONDS)
  })
})

describe('validateCustomTiming — multi-violation accumulation', () => {
  it('accumulates multiple violations independently', () => {
    const result = validateCustomTiming({
      inhale_seconds: 0,
      hold_after_inhale_seconds: -1,
      exhale_seconds: 100,
      hold_after_exhale_seconds: -5,
      cycles: 0,
    })
    expect(result.valid).toBe(false)
    expect(result.violations.length).toBeGreaterThanOrEqual(4)
    expect(result.clamped.inhale_seconds).toBe(INHALE_MIN_SECONDS)
    expect(result.clamped.hold_after_inhale_seconds).toBe(HOLD_AFTER_INHALE_MIN_SECONDS)
    expect(result.clamped.exhale_seconds).toBe(EXHALE_MAX_SECONDS)
    expect(result.clamped.hold_after_exhale_seconds).toBe(HOLD_AFTER_EXHALE_MIN_SECONDS)
    expect(result.clamped.cycles).toBe(CYCLES_MIN)
  })

  it('no out-of-bounds value survives in clamped output', () => {
    const extreme = validateCustomTiming({
      inhale_seconds: 999,
      hold_after_inhale_seconds: 999,
      exhale_seconds: -999,
      hold_after_exhale_seconds: -999,
      cycles: 999,
    })
    expect(extreme.clamped.inhale_seconds).toBeLessThanOrEqual(INHALE_MAX_SECONDS)
    expect(extreme.clamped.hold_after_inhale_seconds).toBeLessThanOrEqual(HOLD_AFTER_INHALE_MAX_SECONDS)
    expect(extreme.clamped.exhale_seconds).toBeGreaterThanOrEqual(EXHALE_MIN_SECONDS)
    expect(extreme.clamped.hold_after_exhale_seconds).toBeGreaterThanOrEqual(HOLD_AFTER_EXHALE_MIN_SECONDS)
    expect(extreme.clamped.cycles).toBeLessThanOrEqual(CYCLES_MAX)
  })
})

describe('validateCustomTiming — clamped output always satisfies bounds', () => {
  const cases: Array<Partial<CustomTimingProfile>> = [
    { inhale_seconds: INHALE_MIN_SECONDS, exhale_seconds: EXHALE_MIN_SECONDS, cycles: CYCLES_MIN, hold_after_inhale_seconds: 0, hold_after_exhale_seconds: 0 },
    { inhale_seconds: INHALE_MAX_SECONDS, exhale_seconds: EXHALE_MAX_SECONDS, cycles: CYCLES_MAX, hold_after_inhale_seconds: HOLD_AFTER_INHALE_MAX_SECONDS, hold_after_exhale_seconds: HOLD_AFTER_EXHALE_MAX_SECONDS },
    { inhale_seconds: 1, exhale_seconds: 0.5, cycles: -3, hold_after_inhale_seconds: 99, hold_after_exhale_seconds: NaN },
    {},
  ]

  for (const c of cases) {
    it(`always produces in-bounds clamped for input ${JSON.stringify(c)}`, () => {
      const r = validateCustomTiming(c)
      expect(r.clamped.inhale_seconds).toBeGreaterThanOrEqual(INHALE_MIN_SECONDS)
      expect(r.clamped.inhale_seconds).toBeLessThanOrEqual(INHALE_MAX_SECONDS)
      expect(r.clamped.hold_after_inhale_seconds).toBeGreaterThanOrEqual(HOLD_AFTER_INHALE_MIN_SECONDS)
      expect(r.clamped.hold_after_inhale_seconds).toBeLessThanOrEqual(HOLD_AFTER_INHALE_MAX_SECONDS)
      expect(r.clamped.exhale_seconds).toBeGreaterThanOrEqual(EXHALE_MIN_SECONDS)
      expect(r.clamped.exhale_seconds).toBeLessThanOrEqual(EXHALE_MAX_SECONDS)
      expect(r.clamped.hold_after_exhale_seconds).toBeGreaterThanOrEqual(HOLD_AFTER_EXHALE_MIN_SECONDS)
      expect(r.clamped.hold_after_exhale_seconds).toBeLessThanOrEqual(HOLD_AFTER_EXHALE_MAX_SECONDS)
      expect(r.clamped.cycles).toBeGreaterThanOrEqual(CYCLES_MIN)
      expect(r.clamped.cycles).toBeLessThanOrEqual(CYCLES_MAX)
    })
  }
})
