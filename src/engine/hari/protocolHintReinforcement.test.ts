/**
 * M5.3 — Protocol Hint Reinforcement tests
 * Authority: M5.3_Protocol_Hint_Reinforcement_Contract.md
 *
 * Covers:
 *   - graceful degradation (null patterns, no eligible protocol pattern)
 *   - eligibility gate (only 'active' | 'high_confidence' patterns apply)
 *   - hint strength mapping (active → soft, high_confidence → moderate)
 *   - safety suppression (suspended pattern, adverse trajectory, flare contradiction)
 *   - flare constraint reduction (high flare caps hint_strength at 'soft')
 *   - pacing advisory (absent due to D1 cap; test structure for when D1 resolves)
 *   - pacing 'extended' blocked
 *   - no modification of input summary
 */

import { describe, it, expect } from 'vitest'
import { computeProtocolHintReinforcement } from './protocolHintReinforcement'
import type { PatternSummary, DetectedPattern, PatternDimension } from '../../types/patterns'
import type { FlareSensitivity, RoundCountProfile } from '../../types/hari'
import type { OutcomeTrajectory } from '../../types/patterns'

// ── Fixture builders ──────────────────────────────────────────────────────────

function makePattern<T>(
  dominant_value: T,
  state: 'candidate' | 'active' | 'high_confidence' | 'suspended',
  dimension: PatternDimension,
  overrides: Partial<DetectedPattern<T>> = {}
): DetectedPattern<T> {
  return {
    dimension,
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

describe('computeProtocolHintReinforcement — graceful degradation', () => {
  it('returns hint_strength none when all patterns are null', () => {
    const result = computeProtocolHintReinforcement(makeEmptySummary())
    expect(result.hint_strength).toBe('none')
    expect(result.suppressed_by_safety).toBe(false)
    expect(result.hinted_protocol_id).toBeUndefined()
  })

  it('returns hint_strength none when protocol_benefit_tendency is candidate', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'candidate', 'protocol_benefit_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('none')
    expect(result.suppressed_by_safety).toBe(false)
  })
})

// ── Eligibility and hint strength ─────────────────────────────────────────────

describe('computeProtocolHintReinforcement — eligibility and strength (M5.3 §5, §7.1)', () => {
  it('returns soft hint when protocol pattern is active', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('soft')
    expect(result.hinted_protocol_id).toBe('PROTO_CALM_DOWNREGULATE')
    expect(result.suppressed_by_safety).toBe(false)
    expect(result.source_pattern_state).toBe('active')
    expect(result.source_pattern_dimension).toBe('protocol_benefit_tendency')
  })

  it('returns moderate hint when protocol pattern is high_confidence', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'high_confidence', 'protocol_benefit_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('moderate')
    expect(result.hinted_protocol_id).toBe('PROTO_CALM_DOWNREGULATE')
    expect(result.source_pattern_state).toBe('high_confidence')
  })

  it('carries plain_summary when hint is active', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_REDUCED_EFFORT', 'active', 'protocol_benefit_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.plain_summary).toBeDefined()
    expect(result.plain_summary!.length).toBeGreaterThan(10)
  })
})

// ── Safety suppression ────────────────────────────────────────────────────────

describe('computeProtocolHintReinforcement — safety suppression (M5.3 §7.3)', () => {
  it('suppresses when protocol_benefit_tendency is suspended', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'suspended', 'protocol_benefit_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('none')
    expect(result.suppressed_by_safety).toBe(true)
  })

  it('suppresses when outcome_trajectory is adverse', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      outcome_trajectory: makePattern<OutcomeTrajectory>('adverse', 'active', 'outcome_trajectory'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('none')
    expect(result.suppressed_by_safety).toBe(true)
  })

  it('suppresses when outcome_trajectory is adverse even with candidate state', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      outcome_trajectory: makePattern<OutcomeTrajectory>('adverse', 'candidate', 'outcome_trajectory'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('none')
    expect(result.suppressed_by_safety).toBe(true)
  })

  it('suppresses when flare_sensitivity_tendency is suspended', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'suspended', 'flare_sensitivity_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('none')
    expect(result.suppressed_by_safety).toBe(true)
  })

  it('suppresses when flare_sensitivity_tendency has recent contradiction', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('low', 'active', 'flare_sensitivity_tendency', {
        has_recent_contradiction: true,
      }),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('none')
    expect(result.suppressed_by_safety).toBe(true)
  })

  it('does not suppress when outcome_trajectory is improving', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      outcome_trajectory: makePattern<OutcomeTrajectory>('improving', 'active', 'outcome_trajectory'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).not.toBe('none')
    expect(result.suppressed_by_safety).toBe(false)
  })
})

// ── Flare constraint reduction (M5.3 §4.3) ───────────────────────────────────

describe('computeProtocolHintReinforcement — flare constraint (M5.3 §4.3)', () => {
  it('caps hint_strength at soft when high flare tendency is active', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'high_confidence', 'protocol_benefit_tendency'),
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('high', 'active', 'flare_sensitivity_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    // Would be 'moderate' from high_confidence, but flare constraint caps at 'soft'
    expect(result.hint_strength).toBe('soft')
    expect(result.suppressed_by_safety).toBe(false)
  })

  it('does not cap hint when flare tendency is moderate', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'high_confidence', 'protocol_benefit_tendency'),
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('moderate', 'active', 'flare_sensitivity_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.hint_strength).toBe('moderate')
  })

  it('does not cap hint when flare tendency is candidate (not eligible)', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'high_confidence', 'protocol_benefit_tendency'),
      flare_sensitivity_tendency: makePattern<FlareSensitivity>('high', 'candidate', 'flare_sensitivity_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    // 'candidate' flare is not eligible for the constraint — no cap applied
    expect(result.hint_strength).toBe('moderate')
  })
})

// ── Pacing advisory ───────────────────────────────────────────────────────────

describe('computeProtocolHintReinforcement — pacing advisory (M5.3 §8)', () => {
  it('pacing_advisory is absent when pacing_tendency is null', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.pacing_advisory).toBeUndefined()
  })

  it('pacing_advisory is absent when pacing_tendency is candidate (D1 cap)', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      pacing_tendency: makePattern<RoundCountProfile>('standard', 'candidate', 'pacing_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    // D1 cap: pacing_tendency is always candidate → never eligible → absent
    expect(result.pacing_advisory).toBeUndefined()
  })

  it('pacing_advisory is absent when advisory would be extended (blocked by §8)', () => {
    // Simulates a future state after D1 resolution where pacing is active
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      pacing_tendency: makePattern<RoundCountProfile>('extended', 'active', 'pacing_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    // 'extended' is forbidden by M5.3 §8
    expect(result.pacing_advisory).toBeUndefined()
  })

  it('pacing_advisory is set when eligible and not extended (post-D1 scenario)', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
      pacing_tendency: makePattern<RoundCountProfile>('short', 'active', 'pacing_tendency'),
    })
    const result = computeProtocolHintReinforcement(summary)
    expect(result.pacing_advisory).toBe('short')
  })
})

// ── Immutability ──────────────────────────────────────────────────────────────

describe('computeProtocolHintReinforcement — immutability', () => {
  it('does not modify the input PatternSummary', () => {
    const summary = makeSummaryWith({
      protocol_benefit_tendency: makePattern('PROTO_CALM_DOWNREGULATE', 'active', 'protocol_benefit_tendency'),
    })
    const dominantBefore = summary.patterns.protocol_benefit_tendency?.dominant_value
    computeProtocolHintReinforcement(summary)
    expect(summary.patterns.protocol_benefit_tendency?.dominant_value).toBe(dominantBefore)
  })
})
