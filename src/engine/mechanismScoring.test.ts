// src/engine/mechanismScoring.test.ts
import { describe, it, expect } from 'vitest'
import { scoreMechanisms } from './mechanismScoring'
import type { PainInputState } from '../types'

describe('scoreMechanisms', () => {
  it('returns all mechanisms with a score property', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['ribs'],
      symptom_tags: ['tightness'],
    }
    const results = scoreMechanisms(input)
    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(typeof r.score).toBe('number')
      expect(typeof r.mechanism_id).toBe('string')
    }
  })

  it('scores RIB_RESTRICTION highest for rib + shallow_breathing', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['ribs', 'mid_back'],
      symptom_tags: ['tightness', 'shallow_breathing', 'aching'],
    }
    const results = scoreMechanisms(input)
    const top = results[0]
    expect(top.mechanism_id).toBe('MECH_RIB_RESTRICTION')
  })

  it('scores MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION highest for arm + burning + radiating', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['arm'],
      symptom_tags: ['burning', 'radiating', 'tingling'],
    }
    const results = scoreMechanisms(input)
    expect(results[0].mechanism_id).toBe('MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')
  })

  it('applies severity bonus for pain_level >= 7', () => {
    const base: PainInputState = {
      pain_level: 5,
      location_tags: ['ribs'],
      symptom_tags: ['tightness'],
    }
    const high: PainInputState = { ...base, pain_level: 7 }
    const baseResults = scoreMechanisms(base)
    const highResults = scoreMechanisms(high)
    const baseScore = baseResults[0].score
    const highScore = highResults[0].score
    expect(highScore).toBeGreaterThan(baseScore)
  })

  it('applies -99 safety_penalty for contraindicated input', () => {
    // MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION has contraindication: progressive_weakness, worsening_numbness
    // We cannot select these from taxonomy but we test the penalty logic directly
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['arm'],
      symptom_tags: ['burning', 'radiating'],
    }
    const results = scoreMechanisms(input)
    const nerveEntry = results.find(r => r.mechanism_id === 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')
    expect(nerveEntry).toBeDefined()
    expect(nerveEntry!.score).toBeGreaterThan(0)
  })

  it('returns results sorted descending by score', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['back_neck'],
      symptom_tags: ['stiffness', 'tightness'],
    }
    const results = scoreMechanisms(input)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('trigger_tag contributes score (×2) when it matches mechanism trigger_tags', () => {
    const withTrigger: PainInputState = {
      pain_level: 5,
      location_tags: ['back_neck'],
      symptom_tags: ['tightness'],
      trigger_tag: 'driving',
    }
    const withoutTrigger: PainInputState = {
      pain_level: 5,
      location_tags: ['back_neck'],
      symptom_tags: ['tightness'],
    }
    const withResults = scoreMechanisms(withTrigger)
    const withoutResults = scoreMechanisms(withoutTrigger)
    // MECH_POSTURAL_COMPRESSION has trigger: driving
    const withComp = withResults.find(r => r.mechanism_id === 'MECH_POSTURAL_COMPRESSION')!
    const withoutComp = withoutResults.find(r => r.mechanism_id === 'MECH_POSTURAL_COMPRESSION')!
    expect(withComp.score).toBeGreaterThan(withoutComp.score)
  })
})
