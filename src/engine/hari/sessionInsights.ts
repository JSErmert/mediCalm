/**
 * M5.4 — Session Insights
 * Authority: M5.4_Session_Insights_Surface_Contract.md
 *
 * Pure function: reads PatternSummary, produces a capped list of display-ready insights.
 *
 * Invariants:
 *   - Does NOT modify stored data or system behavior (M5.4 §13)
 *   - Does NOT access raw history — reads only PatternSummary (M5.4 §3)
 *   - Maximum 3 insights to prevent cognitive overload (M5.4 §11D)
 *   - 'insufficient' (null) patterns are never shown (M5.4 §4)
 *   - 'candidate' patterns are labeled low-confidence (M5.4 §4)
 *   - 'suspended' patterns are clearly indicated as paused (M5.4 §4)
 *   - All summaries are non-diagnostic and observational (M5.4 §6, §7)
 *   - Returns empty array on any failure (M5.4 §12 graceful degradation)
 *
 * Excluded dimensions:
 *   - protocol_benefit_tendency: plain_summary exposes internal protocol IDs
 *   - pacing_tendency: D1 debt caps to 'candidate', technical values not user-facing
 */

import type { PatternSummary, PatternState, SessionInsight } from '../../types/patterns'

// ── Configuration ─────────────────────────────────────────────────────────────

const MAX_INSIGHTS = 3

/**
 * Dimensions surfaced to the user, in relevance order.
 * Excluded: protocol_benefit_tendency (internal IDs), pacing_tendency (D1 debt).
 * Authority: M5.4 §5
 */
const DIMENSION_ORDER: Array<keyof PatternSummary['patterns']> = [
  'flare_sensitivity_tendency',  // highest relevance — safety-adjacent
  'symptom_focus_tendency',      // explains region focus
  'session_length_tendency',     // explains timing
  'session_intent_tendency',     // explains session type
  'outcome_trajectory',          // safety context — filtered to adverse/improving only
]

// ── State helpers ─────────────────────────────────────────────────────────────

function stateToConfidence(state: PatternState): 'low' | 'moderate' | 'high' {
  switch (state) {
    case 'high_confidence': return 'high'
    case 'active':          return 'moderate'
    case 'suspended':       return 'low'  // was active+ but now paused
    case 'candidate':       return 'low'
    default:                return 'low'
  }
}

/**
 * Priority for sorting: suspended first (safety-relevant), then by confidence.
 * Lower number = higher priority.
 */
function statePriority(state: PatternState): number {
  switch (state) {
    case 'suspended':       return 0
    case 'high_confidence': return 1
    case 'active':          return 2
    case 'candidate':       return 3
    default:                return 99
  }
}

// ── Main computation ──────────────────────────────────────────────────────────

/**
 * Derive up to 3 display-ready insights from a PatternSummary.
 *
 * @returns SessionInsight[] — empty when no eligible patterns exist.
 */
export function computeSessionInsights(summary: PatternSummary): SessionInsight[] {
  try {
    const candidates: SessionInsight[] = []

    for (const dim of DIMENSION_ORDER) {
      const pattern = summary.patterns[dim]

      // §4 — null = 'insufficient'; must not be shown
      if (pattern === null) continue

      // §4 — 'insufficient' guard (should not appear as a DetectedPattern, but guard anyway)
      if (pattern.state === 'insufficient') continue

      // Skip empty summaries (technical edge case)
      if (!pattern.plain_summary.trim()) continue

      // outcome_trajectory: only include adverse or improving — stable/variable are uninformative
      if (
        dim === 'outcome_trajectory' &&
        pattern.dominant_value !== 'adverse' &&
        pattern.dominant_value !== 'improving'
      ) {
        continue
      }

      candidates.push({
        dimension: pattern.dimension,
        state: pattern.state,
        summary: pattern.plain_summary,
        confidence: stateToConfidence(pattern.state),
        is_suspended: pattern.state === 'suspended',
      })
    }

    // Sort: suspended first (safety), then by confidence tier
    candidates.sort((a, b) => statePriority(a.state) - statePriority(b.state))

    return candidates.slice(0, MAX_INSIGHTS)
  } catch {
    // §12 — graceful degradation
    return []
  }
}
