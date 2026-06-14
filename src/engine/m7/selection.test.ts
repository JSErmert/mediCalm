import { describe, it, expect } from 'vitest'
import { selectPathway } from './selection'
import type { IntakeSensorState } from '../../types/m7'

function intake(overrides: Partial<IntakeSensorState> = {}): IntakeSensorState {
  return {
    branch: 'anxious_or_overwhelmed',
    current_context: 'sitting',
    session_intent: 'quick_reset',
    session_length_preference: 'standard',
    flare_sensitivity: 'moderate',
    baseline_intensity: 4,
    irritability: 'symmetric',
    ...overrides,
  }
}

describe('M7 selectPathway — selection function (§3.8)', () => {
  it('returns a pathway for anxious + standard length', () => {
    const result = selectPathway(intake({ branch: 'anxious_or_overwhelmed', session_length_preference: 'standard' }))
    expect(result.pathway_id).toContain('anxious')
    expect(result.pathway_id).toContain('standard')
  })

  it('returns a different pathway for long session length', () => {
    const standard = selectPathway(intake({ session_length_preference: 'standard' }))
    const long = selectPathway(intake({ session_length_preference: 'long' }))
    expect(standard.pathway_id).not.toBe(long.pathway_id)
  })

  it('routes deeper_regulation to stabilize_balance pathway family', () => {
    const result = selectPathway(intake({ session_intent: 'deeper_regulation', flare_sensitivity: 'low' }))
    expect(result.pathway_id).toContain('stabilize_balance')
  })

  it('routes tightness with breathDowngraded to flare_safe pathway', () => {
    const result = selectPathway(intake({
      branch: 'tightness_or_pain',
      derived_signals: { breathDowngraded: true },
    }))
    expect(result.pathway_id).toContain('flare_safe')
  })

  it('selection function is deterministic — same input → same output (I16)', () => {
    const a = selectPathway(intake())
    const b = selectPathway(intake())
    expect(a).toEqual(b)
  })
})
