// src/engine/safetyPrecheck.test.ts
import { describe, it, expect } from 'vitest'
import { runSafetyPrecheck } from './safetyPrecheck'
import type { PainInputState } from '../types'

const base: PainInputState = {
  pain_level: 5,
  location_tags: ['back_neck'],
  symptom_tags: ['tightness'],
}

describe('runSafetyPrecheck', () => {
  it('returns DIRECT_SESSION_MODE for clean input', () => {
    const result = runSafetyPrecheck(base)
    expect(result.mode).toBe('DIRECT_SESSION_MODE')
    expect(result.safety_tags).toHaveLength(0)
    expect(result.stop_reason).toBeNull()
  })

  it('returns SAFETY_STOP_MODE when coordination_change is in symptom_tags', () => {
    const input = { ...base, symptom_tags: ['coordination_change'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
    expect(result.safety_tags).toContain('coordination_change')
    expect(result.stop_reason).not.toBeNull()
  })

  it('returns SAFETY_STOP_MODE when weakness is in symptom_tags', () => {
    const input = { ...base, symptom_tags: ['weakness'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
  })

  it('returns SAFETY_STOP_MODE when hand location + numbness present', () => {
    const input = { ...base, location_tags: ['hand'], symptom_tags: ['numbness'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
    expect(result.safety_tags).toContain('hand_dysfunction_proxy')
  })

  it('returns SAFETY_STOP_MODE when hand location + tingling present', () => {
    const input = { ...base, location_tags: ['hand'], symptom_tags: ['tingling'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
  })

  it('returns DIRECT_SESSION_MODE when hand present but no nerve-type symptom', () => {
    const input = { ...base, location_tags: ['hand'], symptom_tags: ['tightness'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('DIRECT_SESSION_MODE')
  })

  it('includes stop_reason string for all stop modes', () => {
    const input = { ...base, symptom_tags: ['coordination_change'] }
    const result = runSafetyPrecheck(input)
    expect(typeof result.stop_reason).toBe('string')
    expect(result.stop_reason!.length).toBeGreaterThan(0)
  })
})
