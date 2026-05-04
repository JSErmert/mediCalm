/**
 * M5.2 — Adaptive Intake Defaults tests
 * Authority: M5.2_Adaptive_Intake_Defaults_Contract.md
 *
 * Covers:
 *   - graceful degradation (null patterns, empty summary)
 *   - eligibility gate (only 'active' | 'high_confidence' patterns apply)
 *   - per-field independence (each field from its own pattern dimension)
 *   - flare sensitivity safety floor (M5.2 §8.1, §12)
 *   - absent field = no suggestion (undefined, not null)
 *   - no modification of input summary
 */

import { describe, it, expect } from 'vitest'
import { computeAdaptiveIntakeDefaults } from './adaptiveIntakeDefaults'
import type { PatternSummary, DetectedPattern } from '../../types/patterns'
import type {
  SymptomFocus,
  FlareSensitivity,
  SessionIntent,
  SessionLengthPreference,
} from '../../types/hari'

// ── Fixture builders ──────────────────────────────────────────────────────────

function makePattern<T>(
  dominant_value: T,
  state: 'candidate' | 'active' | 'high_confidence' | 'suspended',
  overrides: Partial<DetectedPattern<T>> = {}
): DetectedPattern<T> {
  return {
    dimension: 'symptom_focus_tendency',
    state,
    dominant_value,
    raw_concordant_count: 3,
    net_weighted_concordance_score: 2.0,
    has_recent_contradiction: false,
    plain_summary: 'Test pattern',
    ...overrides,
  }
}

function makeEmptySummary(): PatternSummary {
  return {
    schema_version: 1,
    computed_at: new Date().toISOString(),
    source_session_count: 0,
    source_session_ids: [],
    patterns: {
      symptom_focus_tendency: null,
      flare_sensitivity_tendency: null,
      session_intent_tendency: null,
      session_length_tendency: null,
      protocol_benefit_tendency: null,
      pacing_tendency: null,
      outcome_trajectory: null,
    },
  }
}

function makeSummaryWith(overrides: Partial<PatternSummary['patterns']>): PatternSummary {
  return {
    ...makeEmptySummary(),
    source_session_count: 3,
    patterns: { ...makeEmptySummary().patterns, ...overrides },
  }
}

// ── Graceful degradation ──────────────────────────────────────────────────────

describe('computeAdaptiveIntakeDefaults — graceful degradation', () => {
  it('returns empty object when all patterns are null', () => {
    const result = computeAdaptiveIntakeDefaults(makeEmptySummary())
    expect(result).toEqual({})
  })

  it('returns empty object when patterns are candidate state only', () => {
    const summary = makeSummaryWith({
      session_intent_tendency: makePattern<SessionIntent>('quick_reset', 'candidate', {
        dimension: 'session_intent_tendency',
      }),
      symptom_focus_tendency: makePattern<SymptomFocus>('neck_upper', 'candidate', {
        dimension: 'symptom_focus_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.session_intent).toBeUndefined()
    expect(result.symptom_focus).toBeUndefined()
  })

  it('returns empty object when pattern is suspended', () => {
    const summary = makeSummaryWith({
      symptom_focus_tendency: makePattern<SymptomFocus>('neck_upper', 'suspended', {
        dimension: 'symptom_focus_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.symptom_focus).toBeUndefined()
  })
})

// ── Eligibility gate ──────────────────────────────────────────────────────────

describe('computeAdaptiveIntakeDefaults — eligibility gate (M5.2 §4)', () => {
  it('applies suggestion when pattern state is active', () => {
    const summary = makeSummaryWith({
      symptom_focus_tendency: makePattern<SymptomFocus>('neck_upper', 'active', {
        dimension: 'symptom_focus_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.symptom_focus).toEqual({ value: 'neck_upper', pattern_state: 'active' })
  })

  it('applies suggestion when pattern state is high_confidence', () => {
    const summary = makeSummaryWith({
      session_intent_tendency: makePattern<SessionIntent>('quick_reset', 'high_confidence', {
        dimension: 'session_intent_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.session_intent).toEqual({ value: 'quick_reset', pattern_state: 'high_confidence' })
  })

  it('does not apply suggestion when pattern state is candidate', () => {
    const summary = makeSummaryWith({
      session_length_tendency: makePattern<SessionLengthPreference>('short', 'candidate', {
        dimension: 'session_length_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.session_length_preference).toBeUndefined()
  })
})

// ── Per-field independence ────────────────────────────────────────────────────

describe('computeAdaptiveIntakeDefaults — per-field independence', () => {
  it('applies only the fields with eligible patterns', () => {
    const summary = makeSummaryWith({
      session_intent_tendency: makePattern<SessionIntent>('deeper_regulation', 'active', {
        dimension: 'session_intent_tendency',
      }),
      // symptom_focus: null — no suggestion
      // flare_sensitivity: null — no suggestion
      session_length_tendency: makePattern<SessionLengthPreference>('standard', 'high_confidence', {
        dimension: 'session_length_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.session_intent).toEqual({ value: 'deeper_regulation', pattern_state: 'active' })
    expect(result.symptom_focus).toBeUndefined()
    expect(result.flare_sensitivity).toBeUndefined()
    expect(result.session_length_preference).toEqual({ value: 'standard', pattern_state: 'high_confidence' })
  })

  it('carries the correct pattern_state per field independently', () => {
    const summary = makeSummaryWith({
      session_intent_tendency: makePattern<SessionIntent>('quick_reset', 'active', {
        dimension: 'session_intent_tendency',
      }),
      session_length_tendency: makePattern<SessionLengthPreference>('longer', 'high_confidence', {
        dimension: 'session_length_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.session_intent?.pattern_state).toBe('active')
    expect(result.session_length_preference?.pattern_state).toBe('high_confidence')
  })
})

// ── Flare sensitivity safety floor ───────────────────────────────────────────

describe('computeAdaptiveIntakeDefaults — flare sensitivity safety floor (M5.2 §8.1, §12)', () => {
  it('suggests the pattern dominant when no recent flare is provided', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary)
    expect(result.flare_sensitivity?.value).toBe('low')
  })

  it('floors suggestion to recentFlareSensitivity when pattern is lower', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary, 'high')
    // Pattern suggests 'low', recent is 'high' — must floor to 'high'
    expect(result.flare_sensitivity?.value).toBe('high')
    // pattern_state must remain from the source pattern, not changed
    expect(result.flare_sensitivity?.pattern_state).toBe('active')
  })

  it('floors low to moderate when recent is moderate', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary, 'moderate')
    expect(result.flare_sensitivity?.value).toBe('moderate')
  })

  it('preserves suggestion when it already matches or exceeds recent', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('high', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary, 'moderate')
    // 'high' >= 'moderate' — no floor needed
    expect(result.flare_sensitivity?.value).toBe('high')
  })

  it('preserves suggestion when recent is moderate and pattern is moderate', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('moderate', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary, 'moderate')
    expect(result.flare_sensitivity?.value).toBe('moderate')
  })

  it('ignores not_sure as a recent flare value (no floor applied)', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary, 'not_sure')
    // 'not_sure' has no meaningful rank — floor must not apply
    expect(result.flare_sensitivity?.value).toBe('low')
  })

  it('ignores flare safety floor when suggested value is not_sure', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('not_sure', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const result = computeAdaptiveIntakeDefaults(summary, 'high')
    // Pattern dominant is 'not_sure' — not comparable, no floor applied
    expect(result.flare_sensitivity?.value).toBe('not_sure')
  })
})

// ── No modification of input summary ─────────────────────────────────────────

describe('computeAdaptiveIntakeDefaults — immutability', () => {
  it('does not modify the input PatternSummary', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'active', {
        dimension: 'flare_sensitivity_tendency',
      }),
    })
    const patternBefore = summary.patterns.flare_sensitivity_tendency?.dominant_value
    computeAdaptiveIntakeDefaults(summary, 'high')
    expect(summary.patterns.flare_sensitivity_tendency?.dominant_value).toBe(patternBefore)
  })
})
