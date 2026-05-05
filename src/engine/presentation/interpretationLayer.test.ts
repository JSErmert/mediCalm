/**
 * interpretationLayer — derivePositionHint tests (Scope A — 2026-05-05).
 * Authority: docs/superpowers/specs/2026-05-05-scope-a-pt-cues-design.md
 */
import { describe, it, expect } from 'vitest'
import { derivePositionHint } from './interpretationLayer'
import type { HariSessionIntake, IntakeBranch, LocationPattern } from '../../types/hari'

function intake(overrides: Partial<HariSessionIntake> = {}): HariSessionIntake {
  return {
    branch: 'tightness_or_pain',
    irritability: 'symmetric',
    baseline_intensity: 4,
    flare_sensitivity: 'moderate',
    location: [],
    current_context: 'sitting',
    session_length_preference: 'standard',
    session_intent: 'quick_reset',
    symptom_focus: 'spread_tension',
    ...overrides,
  }
}

describe('derivePositionHint (Scope A — 2026-05-05)', () => {
  describe('null / undefined intake', () => {
    it('returns undefined when intake is null', () => {
      expect(derivePositionHint(null)).toBeUndefined()
    })

    it('returns undefined when intake is undefined', () => {
      expect(derivePositionHint(undefined)).toBeUndefined()
    })
  })

  describe("branch === 'anxious_or_overwhelmed' — never a hint", () => {
    const branch: IntakeBranch = 'anxious_or_overwhelmed'
    const patterns: Array<LocationPattern | undefined> = [
      'single', 'connected', 'multifocal', 'widespread', 'diffuse_unspecified', undefined,
    ]
    for (const p of patterns) {
      it(`location_pattern=${p ?? 'undefined'} → undefined`, () => {
        expect(derivePositionHint(intake({ branch, location_pattern: p }))).toBeUndefined()
      })
    }
  })

  describe("branch === 'tightness_or_pain' — pattern-driven", () => {
    it("location_pattern='single' → lying-down hint", () => {
      const hint = derivePositionHint(intake({ location_pattern: 'single' }))
      expect(hint).toContain('lying down')
      expect(hint).toContain('localized')
    })

    it("location_pattern='connected' → lying-down hint", () => {
      const hint = derivePositionHint(intake({ location_pattern: 'connected' }))
      expect(hint).toContain('lying down')
      expect(hint).toContain('localized')
    })

    it("location_pattern='multifocal' → upright-spine hint", () => {
      const hint = derivePositionHint(intake({ location_pattern: 'multifocal' }))
      expect(hint).toContain('Sitting tall')
      expect(hint).toContain('spine long')
    })

    it("location_pattern='widespread' → upright-spine hint", () => {
      const hint = derivePositionHint(intake({ location_pattern: 'widespread' }))
      expect(hint).toContain('Sitting tall')
      expect(hint).toContain('spine long')
    })

    it("location_pattern='diffuse_unspecified' → undefined (fall back to support_mode)", () => {
      expect(derivePositionHint(intake({ location_pattern: 'diffuse_unspecified' }))).toBeUndefined()
    })

    it('location_pattern undefined → undefined (fall back to support_mode)', () => {
      expect(derivePositionHint(intake({ location_pattern: undefined }))).toBeUndefined()
    })
  })
})
