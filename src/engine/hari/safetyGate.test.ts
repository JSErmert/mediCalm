// src/engine/hari/safetyGate.test.ts
import { describe, it, expect } from 'vitest'
import {
  classifySafetyFlags,
  safetyGateClear,
  SAFETY_FLAG_LABELS,
  STEP_1_NEURO_SYMPTOMS,
  STEP_1_CARDIO_SYMPTOMS,
  type SafetyFlagClass,
} from './safetyGate'

describe('safetyGate — classification', () => {
  it('returns CLEAR with no flags', () => {
    expect(safetyGateClear()).toEqual({ outcome: 'CLEAR' })
    expect(classifySafetyFlags([])).toEqual({ outcome: 'CLEAR' })
  })

  it('classifies all neuro red flags as STOP', () => {
    const neuroFlags: SafetyFlagClass[] = [
      'new_worsening_weakness',
      'coordination_change',
      'numbness_extremities_or_saddle',
      'dizziness_balance_loss',
      'double_vision',
      'speech_difficulty',
      'swallowing_difficulty',
      'drop_attacks',
      'symptoms_severe_or_concerning',
    ]
    for (const f of neuroFlags) {
      expect(classifySafetyFlags([f]).outcome).toBe('STOP')
    }
  })

  it('classifies all cardio red flags as STOP', () => {
    const cardioFlags: SafetyFlagClass[] = [
      'chest_pain_or_pressure',
      'radiating_pain_jaw_arm',
      'interscapular_pain',
      'dyspnea_at_rest',
      'irregular_heartbeat',
    ]
    for (const f of cardioFlags) {
      expect(classifySafetyFlags([f]).outcome).toBe('STOP')
    }
  })

  it('classifies not_sure as HOLD', () => {
    expect(classifySafetyFlags(['not_sure']).outcome).toBe('HOLD')
  })
})

describe('safetyGate — tiered stop messages', () => {
  it('cardio flag returns 911 message', () => {
    const result = classifySafetyFlags(['chest_pain_or_pressure'])
    expect(result.message).toBe(
      'These symptoms may indicate a serious cardiac event. Call 911 or your local emergency services immediately.'
    )
  })

  it('cardio takes priority over neuro when both present', () => {
    const result = classifySafetyFlags(['coordination_change', 'chest_pain_or_pressure'])
    expect(result.message).toContain('Call 911')
  })

  it('neuro red flag returns provider message', () => {
    const result = classifySafetyFlags(['drop_attacks'])
    expect(result.message).toBe(
      'These symptoms may indicate a serious neurological condition. Please discontinue use and contact a healthcare provider before proceeding.'
    )
  })
})

describe('safetyGate — labels with plain-language parentheticals', () => {
  it('drop_attacks label includes parenthetical', () => {
    expect(SAFETY_FLAG_LABELS['drop_attacks']).toBe(
      'Sudden drop attacks (unexpectedly falling without warning)'
    )
  })

  it('numbness_extremities_or_saddle names body regions', () => {
    expect(SAFETY_FLAG_LABELS['numbness_extremities_or_saddle']).toBe(
      'Numbness or tingling in hands, arms, legs, or groin and inner thigh'
    )
  })

  it('radiating_pain_jaw_arm names body regions', () => {
    expect(SAFETY_FLAG_LABELS['radiating_pain_jaw_arm']).toBe(
      'Pain radiating to your jaw, neck, left shoulder, or left arm'
    )
  })
})

describe('safetyGate — Step 1 grouped symptom lists', () => {
  it('exposes neuro symptoms list', () => {
    expect(STEP_1_NEURO_SYMPTOMS.length).toBeGreaterThanOrEqual(6)
    expect(STEP_1_NEURO_SYMPTOMS).toContain(
      'Sudden drop attacks (unexpectedly falling without warning)'
    )
  })

  it('exposes cardio symptoms list', () => {
    expect(STEP_1_CARDIO_SYMPTOMS.length).toBe(5)
    expect(STEP_1_CARDIO_SYMPTOMS[0]).toBe('Chest pain or chest pressure')
  })
})
