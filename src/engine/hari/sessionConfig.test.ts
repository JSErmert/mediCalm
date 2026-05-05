/**
 * sessionConfig — applyLengthPreference tests (2026-05-05 wire-through).
 * Authority: docs/superpowers/specs/2026-05-05-intake-wire-through-design.md
 */
import { describe, it, expect } from 'vitest'
import { applyLengthPreference } from './sessionConfig'
import type { NeedProfile } from '../../types/hari'

function need(overrides: Partial<NeedProfile> = {}): NeedProfile {
  return {
    primaryGoal: 'downregulate',
    secondaryGoal: undefined,
    effortCapacity: 'reduced',
    safetyLevel: 'moderate',
    activationPermitted: false,
    breathDowngraded: false,
    overload: false,
    ...overrides,
  }
}

describe('applyLengthPreference (2026-05-05 wire-through)', () => {
  describe('safety guards — no change in unsafe states', () => {
    it('overload → no change regardless of preference', () => {
      const n = need({ overload: true, effortCapacity: 'minimal' })
      expect(applyLengthPreference(n, 'long').effortCapacity).toBe('minimal')
      expect(applyLengthPreference(n, 'short').effortCapacity).toBe('minimal')
    })

    it("safetyLevel='high' → no change (high flare/intensity holds the cap)", () => {
      const n = need({ safetyLevel: 'high', effortCapacity: 'reduced' })
      expect(applyLengthPreference(n, 'long').effortCapacity).toBe('reduced')
      expect(applyLengthPreference(n, 'short').effortCapacity).toBe('reduced')
    })

    it("effortCapacity='minimal' → no change (safety floor)", () => {
      const n = need({ effortCapacity: 'minimal' })
      expect(applyLengthPreference(n, 'long').effortCapacity).toBe('minimal')
      expect(applyLengthPreference(n, 'short').effortCapacity).toBe('minimal')
    })
  })

  describe("'standard' preference — no change", () => {
    it('preserves reduced effort', () => {
      expect(applyLengthPreference(need({ effortCapacity: 'reduced' }), 'standard').effortCapacity).toBe('reduced')
    })

    it('preserves standard effort', () => {
      expect(applyLengthPreference(need({ effortCapacity: 'standard' }), 'standard').effortCapacity).toBe('standard')
    })
  })

  describe("'long' preference — bumps effortCapacity up by one", () => {
    it("'reduced' → 'standard' (unlocks 480s / 8min for low-flare cohorts)", () => {
      expect(applyLengthPreference(need({ effortCapacity: 'reduced' }), 'long').effortCapacity).toBe('standard')
    })

    it("'standard' → 'standard' (already at top of ladder)", () => {
      expect(applyLengthPreference(need({ effortCapacity: 'standard' }), 'long').effortCapacity).toBe('standard')
    })

    it('does not unlock when safetyLevel is high', () => {
      const n = need({ effortCapacity: 'reduced', safetyLevel: 'high' })
      expect(applyLengthPreference(n, 'long').effortCapacity).toBe('reduced')
    })
  })

  describe("'short' preference — bumps effortCapacity down by one (within safety bounds)", () => {
    it("'standard' → 'reduced'", () => {
      expect(applyLengthPreference(need({ effortCapacity: 'standard' }), 'short').effortCapacity).toBe('reduced')
    })

    it("'reduced' → 'reduced' (floor at reduced — never push to minimal)", () => {
      expect(applyLengthPreference(need({ effortCapacity: 'reduced' }), 'short').effortCapacity).toBe('reduced')
    })
  })

  describe('preserves all other NeedProfile fields', () => {
    it('only effortCapacity changes', () => {
      const n = need({
        primaryGoal: 'expand',
        secondaryGoal: 'restore',
        effortCapacity: 'reduced',
        safetyLevel: 'moderate',
        activationPermitted: true,
        breathDowngraded: false,
        overload: false,
      })
      const result = applyLengthPreference(n, 'long')
      expect(result.primaryGoal).toBe('expand')
      expect(result.secondaryGoal).toBe('restore')
      expect(result.safetyLevel).toBe('moderate')
      expect(result.activationPermitted).toBe(true)
      expect(result.breathDowngraded).toBe(false)
      expect(result.overload).toBe(false)
      expect(result.effortCapacity).toBe('standard') // the only change
    })
  })
})
