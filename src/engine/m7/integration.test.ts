import { describe, it, expect } from 'vitest'
import { buildM7Session } from './integration'
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

describe('M7 buildM7Session — end-to-end orchestration (intake → variant + timing)', () => {
  it('returns a resolved variant + matching TimingProfile + pathway_ref', () => {
    const result = buildM7Session(intake())
    expect(result.variant.pathway_id).toContain('anxious')
    expect(result.timing.inhale_seconds).toBeGreaterThan(0)
    expect(result.timing.rounds).toBeGreaterThan(0)
    expect(result.pathway_ref.variant_id).toBe(result.variant.variant_id)
  })

  it('full pipeline is deterministic — same intake → same output', () => {
    const a = buildM7Session(intake())
    const b = buildM7Session(intake())
    expect(a).toEqual(b)
  })
})
