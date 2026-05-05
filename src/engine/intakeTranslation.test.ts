/**
 * PT Clinical Pass 2 — intakeTranslation tests.
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import { describe, it, expect } from 'vitest'
import {
  branchToEmotionalStates,
  irritabilityToFlareSensitivity,
  applyIrritabilityEscalation,
  deriveSymptomFocusFromLocation,
} from './intakeTranslation'
import type { IntakeBranch, IrritabilityPattern } from '../types/hari'

describe('branchToEmotionalStates', () => {
  it('maps tightness_or_pain to ["pain"]', () => {
    expect(branchToEmotionalStates('tightness_or_pain')).toEqual(['pain'])
  })

  it('maps anxious_or_overwhelmed to ["anxious"]', () => {
    expect(branchToEmotionalStates('anxious_or_overwhelmed')).toEqual(['anxious'])
  })

  it('returns single-state arrays for both branches', () => {
    const branches: IntakeBranch[] = ['tightness_or_pain', 'anxious_or_overwhelmed']
    for (const b of branches) {
      expect(branchToEmotionalStates(b)).toHaveLength(1)
    }
  })
})

describe('irritabilityToFlareSensitivity', () => {
  it('maps fast_onset_slow_resolution to high', () => {
    expect(irritabilityToFlareSensitivity('fast_onset_slow_resolution')).toBe('high')
  })

  it('maps slow_onset_fast_resolution to low', () => {
    expect(irritabilityToFlareSensitivity('slow_onset_fast_resolution')).toBe('low')
  })

  it('maps symmetric to moderate', () => {
    expect(irritabilityToFlareSensitivity('symmetric')).toBe('moderate')
  })

  it('covers all IrritabilityPattern variants', () => {
    const patterns: IrritabilityPattern[] = [
      'fast_onset_slow_resolution',
      'slow_onset_fast_resolution',
      'symmetric',
    ]
    for (const p of patterns) {
      const result = irritabilityToFlareSensitivity(p)
      expect(['low', 'moderate', 'high']).toContain(result)
    }
  })
})

describe('applyIrritabilityEscalation (2026-05-05 wire-through)', () => {
  it('escalates low → high when irritability is fast_onset_slow_resolution', () => {
    expect(applyIrritabilityEscalation('low', 'fast_onset_slow_resolution')).toBe('high')
  })

  it('escalates moderate → high when irritability is fast_onset_slow_resolution', () => {
    expect(applyIrritabilityEscalation('moderate', 'fast_onset_slow_resolution')).toBe('high')
  })

  it('escalates not_sure → high when irritability is fast_onset_slow_resolution', () => {
    expect(applyIrritabilityEscalation('not_sure', 'fast_onset_slow_resolution')).toBe('high')
  })

  it('is a no-op when user already picked high', () => {
    expect(applyIrritabilityEscalation('high', 'fast_onset_slow_resolution')).toBe('high')
  })

  it('never downgrades — slow_onset_fast_resolution leaves high alone', () => {
    expect(applyIrritabilityEscalation('high', 'slow_onset_fast_resolution')).toBe('high')
  })

  it('symmetric never modifies the user pick', () => {
    expect(applyIrritabilityEscalation('low', 'symmetric')).toBe('low')
    expect(applyIrritabilityEscalation('moderate', 'symmetric')).toBe('moderate')
    expect(applyIrritabilityEscalation('high', 'symmetric')).toBe('high')
    expect(applyIrritabilityEscalation('not_sure', 'symmetric')).toBe('not_sure')
  })

  it('slow_onset_fast_resolution never modifies the user pick', () => {
    expect(applyIrritabilityEscalation('low', 'slow_onset_fast_resolution')).toBe('low')
    expect(applyIrritabilityEscalation('moderate', 'slow_onset_fast_resolution')).toBe('moderate')
    expect(applyIrritabilityEscalation('not_sure', 'slow_onset_fast_resolution')).toBe('not_sure')
  })
})

describe('deriveSymptomFocusFromLocation (2026-05-05 wire-through)', () => {
  it('returns fallback when location_pattern is diffuse_unspecified', () => {
    expect(deriveSymptomFocusFromLocation([], 'diffuse_unspecified', 'spread_tension')).toBe('spread_tension')
    expect(deriveSymptomFocusFromLocation(['neck'], 'diffuse_unspecified', 'mixed')).toBe('mixed')
  })

  it('returns spread_tension when location_pattern is widespread, regardless of regions', () => {
    expect(deriveSymptomFocusFromLocation(['neck', 'lower_back', 'shoulder_left', 'ankle_foot_right'], 'widespread', 'proactive')).toBe('spread_tension')
  })

  it('returns fallback when location is empty', () => {
    expect(deriveSymptomFocusFromLocation([], undefined, 'proactive')).toBe('proactive')
  })

  it('buckets jaw_tmj_facial → jaw_facial', () => {
    expect(deriveSymptomFocusFromLocation(['jaw_tmj_facial'], 'single', 'spread_tension')).toBe('jaw_facial')
  })

  it('buckets neck/shoulder/upper_back/head_temples → neck_upper', () => {
    expect(deriveSymptomFocusFromLocation(['neck'], 'single', 'spread_tension')).toBe('neck_upper')
    expect(deriveSymptomFocusFromLocation(['shoulder_left'], 'single', 'spread_tension')).toBe('neck_upper')
    expect(deriveSymptomFocusFromLocation(['head_temples'], 'single', 'spread_tension')).toBe('neck_upper')
    expect(deriveSymptomFocusFromLocation(['upper_back'], 'single', 'spread_tension')).toBe('neck_upper')
  })

  it('buckets rib/mid_back/chest_sternum → rib_side_back', () => {
    expect(deriveSymptomFocusFromLocation(['rib_side'], 'single', 'spread_tension')).toBe('rib_side_back')
    expect(deriveSymptomFocusFromLocation(['mid_back'], 'single', 'spread_tension')).toBe('rib_side_back')
    expect(deriveSymptomFocusFromLocation(['chest_sternum'], 'single', 'spread_tension')).toBe('rib_side_back')
  })

  it('buckets lower-body and limbs → spread_tension (lossy by design)', () => {
    expect(deriveSymptomFocusFromLocation(['lower_back'], 'single', 'proactive')).toBe('spread_tension')
    expect(deriveSymptomFocusFromLocation(['hip_pelvis'], 'single', 'proactive')).toBe('spread_tension')
    expect(deriveSymptomFocusFromLocation(['knee_left'], 'single', 'proactive')).toBe('spread_tension')
    expect(deriveSymptomFocusFromLocation(['ankle_foot_right'], 'single', 'proactive')).toBe('spread_tension')
    expect(deriveSymptomFocusFromLocation(['wrist_hand_left'], 'single', 'proactive')).toBe('spread_tension')
  })

  it('returns the single bucket when all regions are in one bucket', () => {
    expect(deriveSymptomFocusFromLocation(['neck', 'shoulder_left', 'upper_back'], 'connected', 'spread_tension'))
      .toBe('neck_upper')
  })

  it('returns mixed when regions span multiple buckets', () => {
    expect(deriveSymptomFocusFromLocation(['neck', 'rib_side'], 'multifocal', 'spread_tension')).toBe('mixed')
    expect(deriveSymptomFocusFromLocation(['jaw_tmj_facial', 'lower_back'], 'multifocal', 'spread_tension')).toBe('mixed')
  })
})
