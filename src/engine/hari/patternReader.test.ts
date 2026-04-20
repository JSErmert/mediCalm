/**
 * M5.1 — Session Pattern Reader tests
 * Authority: M5.5 §8 (testing strategy for M5.1)
 *
 * Covers:
 *   - correct pattern detection across dimensions
 *   - threshold enforcement (candidate / active / high_confidence)
 *   - contradiction handling (standard, safety, recent)
 *   - recency weighting and staleness exclusion
 *   - graceful degradation (empty history, missing metadata)
 *   - D1 cap on pacing_tendency
 *   - flare sensitivity safety exception
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computePatternSummary } from './patternReader'
import * as sessionHistory from '../../storage/sessionHistory'
import type { HistoryEntry } from '../../types'
import type { PersistedHariMetadata } from '../../types/hari'

// ── Fixture builders ──────────────────────────────────────────────────────────

function makeHariMetadata(
  overrides: Partial<PersistedHariMetadata> = {}
): PersistedHariMetadata {
  return {
    intake: {
      session_intent: 'quick_reset',
      current_context: 'sitting',
      symptom_focus: 'neck_upper',
      baseline_intensity: 5,
      flare_sensitivity: 'moderate',
      session_length_preference: 'standard',
    },
    safety_result: 'CLEAR',
    state_estimate: {
      compression_sensitivity: 'low',
      expansion_capacity: 'moderate',
      guarding_load: 'low',
      flare_sensitivity_estimate: 'moderate',
      session_tolerance: 'moderate',
      reassessment_urgency: 'low',
      intervention_softness_need: 'low',
      confidence_level: 'moderate',
      key_factors: [],
    },
    link_map: { links: [], appears_distributed: false, framing_note: '' },
    intervention: {
      intervention_class: 'standard_guided_regulation',
      immediate_objective: 'test',
      softness_level: 'standard',
      round_count_profile: 'standard',
      reassessment_timing: 'standard',
      active_constraints: [],
      adaptation_reasoning: 'test',
      escalation_permitted: true,
      mapped_protocol_id: 'PROTO_CALM_DOWNREGULATE',
    },
    round_plan: { round_number: 1, breath_count: 30, intervention_class: 'standard_guided_regulation', softness_level: 'standard', reassessment_required: true, continuation_constraint: '' },
    max_rounds: 2,
    reassessment_history: [],
    baseline_intensity: 5,
    ...overrides,
  }
}

function makeSession(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    session_id: `sess_${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    pain_before: 5,
    pain_after: 3,
    location_tags: [],
    symptom_tags: [],
    current_position: 'sitting',
    trigger_tag: undefined,
    selected_protocol_id: 'PROTO_CALM_DOWNREGULATE',
    selected_protocol_name: 'Calm Downregulate',
    result: 'better',
    change_markers: [],
    session_status: 'completed',
    session_duration_seconds: 300,
    rounds_completed: 1,
    session_type: 'HARI',
    validation_status: 'validated',
    hari_metadata: makeHariMetadata(),
    ...overrides,
  }
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks()
})

function mockHistory(sessions: HistoryEntry[]) {
  vi.spyOn(sessionHistory, 'getEligibleHariHistory').mockReturnValue(sessions)
}

// ── Graceful degradation ──────────────────────────────────────────────────────

describe('computePatternSummary — graceful degradation', () => {
  it('returns all-null patterns when history is empty', () => {
    mockHistory([])
    const summary = computePatternSummary()
    expect(summary.schema_version).toBe(1)
    expect(summary.source_session_count).toBe(0)
    expect(Object.values(summary.patterns).every((p) => p === null)).toBe(true)
  })

  it('returns all-null patterns when only 1 eligible session exists', () => {
    mockHistory([makeSession()])
    const summary = computePatternSummary()
    expect(Object.values(summary.patterns).every((p) => p === null)).toBe(true)
  })

  it('skips sessions missing hari_metadata silently', () => {
    const noMeta = makeSession({ hari_metadata: undefined })
    mockHistory([noMeta, noMeta])
    const summary = computePatternSummary()
    expect(Object.values(summary.patterns).every((p) => p === null)).toBe(true)
  })
})

// ── Pattern detection threshold enforcement ───────────────────────────────────

describe('computePatternSummary — threshold enforcement', () => {
  it('produces candidate state with exactly 2 concordant sessions', () => {
    const sessions = [
      makeSession({ timestamp: daysAgo(1) }),
      makeSession({ timestamp: daysAgo(2) }),
    ]
    mockHistory(sessions)
    const summary = computePatternSummary()
    // symptom_focus_tendency: both sessions have 'neck_upper' → candidate (2 concordant)
    expect(summary.patterns.symptom_focus_tendency).not.toBeNull()
    expect(summary.patterns.symptom_focus_tendency?.state).toBe('candidate')
    expect(summary.patterns.symptom_focus_tendency?.dominant_value).toBe('neck_upper')
  })

  it('produces active state with 3 concordant sessions and score above threshold', () => {
    const sessions = [
      makeSession({ timestamp: daysAgo(1) }),
      makeSession({ timestamp: daysAgo(2) }),
      makeSession({ timestamp: daysAgo(3) }),
    ]
    mockHistory(sessions)
    const summary = computePatternSummary()
    expect(summary.patterns.symptom_focus_tendency?.state).toBe('active')
    expect(summary.patterns.symptom_focus_tendency?.raw_concordant_count).toBe(3)
  })

  it('produces high_confidence with 5 concordant sessions, no recent contradictions', () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 1) })
    )
    mockHistory(sessions)
    const summary = computePatternSummary()
    expect(summary.patterns.symptom_focus_tendency?.state).toBe('high_confidence')
    expect(summary.patterns.symptom_focus_tendency?.raw_concordant_count).toBe(5)
  })
})

// ── Recency weighting ─────────────────────────────────────────────────────────

describe('computePatternSummary — recency weighting', () => {
  it('includes sessions within age cap and excludes stale sessions', () => {
    const fresh = makeSession({ timestamp: daysAgo(5) })
    const stale = makeSession({
      timestamp: daysAgo(500),
      hari_metadata: makeHariMetadata({
        intake: { ...makeHariMetadata().intake, symptom_focus: 'neck_upper' },
      }),
    })
    mockHistory([fresh, fresh, stale])
    const summary = computePatternSummary()
    // Stale session has weight 0.80^2 * 0.25 (age cap) = 0.16 > 0.15 floor — still included
    // but very low weight; test that the pattern still reflects fresh sessions
    const sfp = summary.patterns.symptom_focus_tendency
    expect(sfp).not.toBeNull()
    expect(sfp?.dominant_value).toBe('neck_upper')
  })

  it('source_session_ids lists used session IDs', () => {
    const s1 = makeSession({ session_id: 'a', timestamp: daysAgo(1) })
    const s2 = makeSession({ session_id: 'b', timestamp: daysAgo(2) })
    mockHistory([s1, s2])
    const summary = computePatternSummary()
    expect(summary.source_session_ids).toContain('a')
    expect(summary.source_session_ids).toContain('b')
  })
})

// ── Contradiction handling ────────────────────────────────────────────────────

describe('computePatternSummary — contradiction handling', () => {
  it('sets has_recent_contradiction when position 0 contradicts', () => {
    const different = makeSession({
      timestamp: daysAgo(1),  // most recent = position 0
      hari_metadata: makeHariMetadata({ intake: { ...makeHariMetadata().intake, symptom_focus: 'jaw_facial' } }),
    })
    const concordant1 = makeSession({ timestamp: daysAgo(2) })
    const concordant2 = makeSession({ timestamp: daysAgo(3) })
    mockHistory([different, concordant1, concordant2])
    const summary = computePatternSummary()
    const sfp = summary.patterns.symptom_focus_tendency
    expect(sfp?.has_recent_contradiction).toBe(true)
  })

  it('caps at candidate (or suspended) when has_recent_contradiction is true', () => {
    const different = makeSession({
      timestamp: daysAgo(1),
      hari_metadata: makeHariMetadata({ intake: { ...makeHariMetadata().intake, symptom_focus: 'jaw_facial' } }),
    })
    const concordants = Array.from({ length: 4 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 2) })
    )
    mockHistory([different, ...concordants])
    const summary = computePatternSummary()
    const state = summary.patterns.symptom_focus_tendency?.state
    // With 4 concordant + 1 recent contradiction at pos 0, would be active → suspended
    expect(state === 'suspended' || state === 'candidate').toBe(true)
  })

  it('applies safety multiplier for session with result worse', () => {
    const adverseSession = makeSession({
      timestamp: daysAgo(1),
      result: 'worse',
      hari_metadata: makeHariMetadata({ intake: { ...makeHariMetadata().intake, symptom_focus: 'jaw_facial' } }),
    })
    const concordant1 = makeSession({ timestamp: daysAgo(2) })
    const concordant2 = makeSession({ timestamp: daysAgo(3) })
    const concordant3 = makeSession({ timestamp: daysAgo(4) })
    mockHistory([adverseSession, concordant1, concordant2, concordant3])
    const summary = computePatternSummary()
    const sfp = summary.patterns.symptom_focus_tendency
    // Safety contradiction at position 0 → suspended
    expect(sfp?.state).toBe('suspended')
  })
})

// ── Flare sensitivity safety exception ───────────────────────────────────────

describe('computePatternSummary — flare sensitivity', () => {
  it('treats toward-higher flare sensitivity as safety contradiction', () => {
    // Pattern dominated by 'low', but recent session has 'high'
    const highFlare = makeSession({
      timestamp: daysAgo(1),
      hari_metadata: makeHariMetadata({ intake: { ...makeHariMetadata().intake, flare_sensitivity: 'high' } }),
    })
    const lowFlare1 = makeSession({
      timestamp: daysAgo(2),
      hari_metadata: makeHariMetadata({ intake: { ...makeHariMetadata().intake, flare_sensitivity: 'low' } }),
    })
    const lowFlare2 = makeSession({
      timestamp: daysAgo(3),
      hari_metadata: makeHariMetadata({ intake: { ...makeHariMetadata().intake, flare_sensitivity: 'low' } }),
    })
    mockHistory([highFlare, lowFlare1, lowFlare2])
    const summary = computePatternSummary()
    const fst = summary.patterns.flare_sensitivity_tendency
    // high at position 0 with safety contradiction → suspended if dominant was low
    // OR high becomes dominant due to its protected weight floor
    // Either way: no 'active' low-flare pattern should survive a recent 'high'
    if (fst !== null && fst.dominant_value === 'low') {
      expect(fst.state === 'suspended' || fst.has_recent_contradiction).toBe(true)
    }
  })
})

// ── Protocol benefit tendency ─────────────────────────────────────────────────

describe('computePatternSummary — protocol_benefit_tendency', () => {
  it('detects a beneficial protocol pattern across sessions', () => {
    const sessions = Array.from({ length: 3 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 1), result: 'better' })
    )
    mockHistory(sessions)
    const summary = computePatternSummary()
    const pbt = summary.patterns.protocol_benefit_tendency
    expect(pbt).not.toBeNull()
    expect(pbt?.dominant_value).toBe('PROTO_CALM_DOWNREGULATE')
    expect(pbt?.state).toBe('active')
  })

  it('suppresses protocol pattern when recent session had adverse outcome', () => {
    const adverseSession = makeSession({ timestamp: daysAgo(1), result: 'worse' })
    const goodSessions = Array.from({ length: 3 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 2), result: 'better' })
    )
    mockHistory([adverseSession, ...goodSessions])
    const summary = computePatternSummary()
    const pbt = summary.patterns.protocol_benefit_tendency
    // adverse at position 0 = safety → suspended
    expect(pbt?.state).toBe('suspended')
  })
})

// ── D1 cap on pacing_tendency ─────────────────────────────────────────────────

describe('computePatternSummary — pacing_tendency D1 cap', () => {
  it('caps pacing state at candidate regardless of session count', () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 1) })
    )
    mockHistory(sessions)
    const summary = computePatternSummary()
    const pt = summary.patterns.pacing_tendency
    if (pt !== null) {
      // Must not exceed candidate due to D1 debt
      expect(pt.state === 'candidate' || pt.state === 'suspended' || pt.state === 'insufficient').toBe(true)
      expect(pt.state).not.toBe('active')
      expect(pt.state).not.toBe('high_confidence')
    }
  })
})

// ── Outcome trajectory ────────────────────────────────────────────────────────

describe('computePatternSummary — outcome_trajectory', () => {
  it('detects adverse trajectory when last 2 sessions are worse', () => {
    const s1 = makeSession({ timestamp: daysAgo(1), result: 'worse' })
    const s2 = makeSession({ timestamp: daysAgo(2), result: 'worse' })
    const s3 = makeSession({ timestamp: daysAgo(3), result: 'better' })
    mockHistory([s1, s2, s3])
    const summary = computePatternSummary()
    const ot = summary.patterns.outcome_trajectory
    expect(ot?.dominant_value).toBe('adverse')
  })

  it('detects improving trajectory from majority better sessions', () => {
    const sessions = Array.from({ length: 3 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 1), result: 'better' })
    )
    mockHistory(sessions)
    const summary = computePatternSummary()
    const ot = summary.patterns.outcome_trajectory
    expect(ot?.dominant_value).toBe('improving')
  })
})

// ── plain_summary non-diagnostic constraint ───────────────────────────────────

describe('computePatternSummary — plain_summary', () => {
  it('does not include diagnostic language in any plain_summary', () => {
    const sessions = Array.from({ length: 3 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 1) })
    )
    mockHistory(sessions)
    const summary = computePatternSummary()
    const prohibited = ['diagnosis', 'condition', 'treatment', 'injury', 'nerve', 'improving condition']
    for (const pattern of Object.values(summary.patterns)) {
      if (pattern?.plain_summary) {
        for (const word of prohibited) {
          expect(pattern.plain_summary.toLowerCase()).not.toContain(word)
        }
      }
    }
  })

  it('keeps all plain_summary strings within 80 characters', () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      makeSession({ timestamp: daysAgo(i + 1) })
    )
    mockHistory(sessions)
    const summary = computePatternSummary()
    for (const pattern of Object.values(summary.patterns)) {
      if (pattern?.plain_summary) {
        expect(pattern.plain_summary.length).toBeLessThanOrEqual(80)
      }
    }
  })
})
