/**
 * M5.4 — Session Insights tests
 * Authority: M5.4_Session_Insights_Surface_Contract.md
 *
 * Covers:
 *   - graceful degradation (null patterns, empty summary)
 *   - all eligible states produce insights (candidate, active, high_confidence, suspended)
 *   - 'insufficient' (null) patterns are excluded
 *   - maximum 3 insights (cognitive overload prevention, M5.4 §11D)
 *   - sorting priority: suspended first, then by confidence
 *   - outcome_trajectory: adverse/improving included, stable/variable excluded
 *   - excluded dimensions: protocol_benefit_tendency, pacing_tendency
 *   - confidence mapping per state
 *   - is_suspended flag for suspended patterns
 *   - no modification of input summary
 */

import { describe, it, expect } from 'vitest'
import { computeSessionInsights } from './sessionInsights'
import type { PatternSummary, DetectedPattern, PatternDimension } from '../../types/patterns'
import type { FlareSensitivity, SessionIntent, SessionLengthPreference, RoundCountProfile } from '../../types/hari'
import type { OutcomeTrajectory } from '../../types/patterns'

// ── Fixture builders ──────────────────────────────────────────────────────────

function makePattern<T>(
  dominant_value: T,
  state: 'candidate' | 'active' | 'high_confidence' | 'suspended',
  dimension: PatternDimension,
  plain_summary = 'Test pattern summary'
): DetectedPattern<T> {
  return {
    dimension,
    state,
    dominant_value,
    raw_concordant_count: 3,
    net_weighted_concordance_score: 2.0,
    has_recent_contradiction: false,
    plain_summary,
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

describe('computeSessionInsights — graceful degradation', () => {
  it('returns empty array when all patterns are null', () => {
    const result = computeSessionInsights(makeEmptySummary())
    expect(result).toEqual([])
  })
})

// ── State eligibility ─────────────────────────────────────────────────────────

describe('computeSessionInsights — state eligibility (M5.4 §4)', () => {
  it('includes candidate patterns with confidence low', () => {
    const summary = makeSummaryWith({
      symptom_focus_tendency: makePattern('neck_upper', 'candidate', 'symptom_focus_tendency', 'Neck / upper region selected often'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(1)
    expect(result[0].confidence).toBe('low')
    expect(result[0].is_suspended).toBe(false)
  })

  it('includes active patterns with confidence moderate', () => {
    const summary = makeSummaryWith({
      symptom_focus_tendency: makePattern('neck_upper', 'active', 'symptom_focus_tendency', 'Neck / upper region selected often'),
    })
    const result = computeSessionInsights(summary)
    expect(result[0].confidence).toBe('moderate')
  })

  it('includes high_confidence patterns with confidence high', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('moderate', 'high_confidence', 'flare_sensitivity_tendency', 'Flare sensitivity frequently reported as moderate'),
    })
    const result = computeSessionInsights(summary)
    expect(result[0].confidence).toBe('high')
  })

  it('includes suspended patterns with is_suspended true and confidence low', () => {
    const summary = makeSummaryWith({
      symptom_focus_tendency: makePattern('neck_upper', 'suspended', 'symptom_focus_tendency', 'Recent change detected — pattern paused'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(1)
    expect(result[0].is_suspended).toBe(true)
    expect(result[0].confidence).toBe('low')
  })

  it('excludes null patterns (insufficient)', () => {
    const summary = makeSummaryWith({
      symptom_focus_tendency: null,
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'active', 'flare_sensitivity_tendency', 'Flare sensitivity frequently reported as low'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(1)
    expect(result[0].dimension).toBe('flare_sensitivity_tendency')
  })
})

// ── Maximum 3 insights cap ────────────────────────────────────────────────────

describe('computeSessionInsights — maximum 3 insights (M5.4 §11D)', () => {
  it('returns at most 3 insights even when more patterns are eligible', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('moderate', 'active', 'flare_sensitivity_tendency', 'Summary 1'),
      symptom_focus_tendency: makePattern('neck_upper', 'active', 'symptom_focus_tendency', 'Summary 2'),
      session_length_tendency: makePattern<SessionLengthPreference>('short', 'active', 'session_length_tendency', 'Summary 3'),
      session_intent_tendency: makePattern<SessionIntent>('quick_reset', 'active', 'session_intent_tendency', 'Summary 4'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(3)
  })
})

// ── Sort priority ─────────────────────────────────────────────────────────────

describe('computeSessionInsights — sort priority', () => {
  it('places suspended patterns first regardless of dimension order', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('high', 'high_confidence', 'flare_sensitivity_tendency', 'High confidence insight'),
      symptom_focus_tendency: makePattern('neck_upper', 'suspended', 'symptom_focus_tendency', 'Suspended pattern'),
    })
    const result = computeSessionInsights(summary)
    expect(result[0].is_suspended).toBe(true)
    expect(result[0].dimension).toBe('symptom_focus_tendency')
  })

  it('places high_confidence before active', () => {
    const summary = makeSummaryWith({
      session_length_tendency: makePattern<SessionLengthPreference>('short', 'active', 'session_length_tendency', 'Active insight'),
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('moderate', 'high_confidence', 'flare_sensitivity_tendency', 'High confidence insight'),
    })
    const result = computeSessionInsights(summary)
    expect(result[0].confidence).toBe('high')
    expect(result[1].confidence).toBe('moderate')
  })
})

// ── outcome_trajectory filtering ─────────────────────────────────────────────

describe('computeSessionInsights — outcome_trajectory filtering (M5.4 §5.3)', () => {
  it('includes adverse trajectory', () => {
    const summary = makeSummaryWith({
      outcome_trajectory: makePattern<OutcomeTrajectory>('adverse', 'candidate', 'outcome_trajectory', 'Recent sessions reported as worse or interrupted'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(1)
    expect(result[0].dimension).toBe('outcome_trajectory')
  })

  it('includes improving trajectory', () => {
    const summary = makeSummaryWith({
      outcome_trajectory: makePattern<OutcomeTrajectory>('improving', 'active', 'outcome_trajectory', 'Most sessions reported as improved'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(1)
    expect(result[0].dimension).toBe('outcome_trajectory')
  })

  it('excludes stable trajectory', () => {
    const summary = makeSummaryWith({
      outcome_trajectory: makePattern<OutcomeTrajectory>('stable', 'active', 'outcome_trajectory', 'Sessions tend to feel stable'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(0)
  })

  it('excludes variable trajectory', () => {
    const summary = makeSummaryWith({
      outcome_trajectory: makePattern<OutcomeTrajectory>('variable', 'active', 'outcome_trajectory', 'Session outcomes have been mixed'),
    })
    const result = computeSessionInsights(summary)
    expect(result).toHaveLength(0)
  })
})

// ── Excluded dimensions ───────────────────────────────────────────────────────

describe('computeSessionInsights — excluded dimensions', () => {
  it('does not include protocol_benefit_tendency (internal protocol IDs)', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency', 'Protocol has helped'),
    })
    const result = computeSessionInsights(summary)
    expect(result.find((i) => i.dimension === 'protocol_benefit_tendency')).toBeUndefined()
  })

  it('does not include pacing_tendency (D1 debt)', () => {
    const summary = makeSummaryWith({
      pacing_tendency: makePattern<RoundCountProfile>('short', 'candidate', 'pacing_tendency', 'Tends toward brief sessions'),
    })
    const result = computeSessionInsights(summary)
    expect(result.find((i) => i.dimension === 'pacing_tendency')).toBeUndefined()
  })
})

// ── Insight content ───────────────────────────────────────────────────────────

describe('computeSessionInsights — insight content', () => {
  it('uses plain_summary from the DetectedPattern', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('high', 'active', 'flare_sensitivity_tendency', 'Flare sensitivity frequently reported as high'),
    })
    const result = computeSessionInsights(summary)
    expect(result[0].summary).toBe('Flare sensitivity frequently reported as high')
  })

  it('carries the correct dimension and state', () => {
    const summary = makeSummaryWith({
      session_length_tendency: makePattern<SessionLengthPreference>('short', 'active', 'session_length_tendency', 'Shorter sessions preferred most often'),
    })
    const result = computeSessionInsights(summary)
    expect(result[0].dimension).toBe('session_length_tendency')
    expect(result[0].state).toBe('active')
  })
})

// ── Immutability ──────────────────────────────────────────────────────────────

describe('computeSessionInsights — immutability', () => {
  it('does not modify the input PatternSummary', () => {
    const summary = makeSummaryWith({
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('high', 'active', 'flare_sensitivity_tendency', 'Test'),
    })
    const stateBefore = summary.patterns.flare_sensitivity_tendency?.state
    computeSessionInsights(summary)
    expect(summary.patterns.flare_sensitivity_tendency?.state).toBe(stateBefore)
  })
})
