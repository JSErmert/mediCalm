/**
 * PT Clinical Pass 2 — intakeTranslation tests.
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import { describe, it, expect } from 'vitest'
import {
  branchToEmotionalStates,
  irritabilityToFlareSensitivity,
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
