/**
 * breathFamily — cue copy assertions (Scope A — 2026-05-05).
 * Authority: docs/superpowers/specs/2026-05-05-scope-a-pt-cues-design.md
 */
import { describe, it, expect } from 'vitest'
import { selectBreathFamily } from './breathFamily'
import type { NeedProfile, FeasibilityProfile } from '../../types/hari'

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

function feasibility(): FeasibilityProfile {
  return {
    minInhaleSeconds: 3,
    holdsPermitted: false,
    maxDurationSeconds: 600,
    feasibilityApplied: false,
    feasibilityNote: undefined,
  }
}

describe('calm_downregulate openingPrompt — Scope A diaphragmatic framing', () => {
  it("anxious-branch family cue uses PT-grounded 'diaphragmatic' + 'belly' language", () => {
    const family = selectBreathFamily(need({ primaryGoal: 'downregulate' }), feasibility())
    expect(family.name).toBe('calm_downregulate')
    expect(family.openingPrompt.toLowerCase()).toContain('diaphragmatic')
    expect(family.openingPrompt.toLowerCase()).toContain('belly')
  })
})
