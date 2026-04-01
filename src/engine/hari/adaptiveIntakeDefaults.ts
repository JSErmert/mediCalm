/**
 * M5.2 — Adaptive Intake Defaults
 * Authority: M5.2_Adaptive_Intake_Defaults_Contract.md
 *
 * Pure function: reads PatternSummary, produces pre-population suggestions only.
 *
 * Invariants:
 *   - Does NOT modify stored data (M5.2 §13)
 *   - Does NOT access raw history directly — caller derives recentFlareSensitivity (M5.2 §3)
 *   - Suggests only when pattern state is 'active' or 'high_confidence' (M5.2 §4)
 *   - Never suggests flare_sensitivity lower than recentFlareSensitivity (M5.2 §8.1, §12)
 *   - Returns empty object on any failure (M5.2 §11 graceful degradation)
 *
 * Allowed fields: session_intent, symptom_focus, flare_sensitivity,
 *                 session_length_preference (M5.2 §5)
 * Disallowed: safety gate, intervention class, protocol mapping,
 *             body context, persistence logic (M5.2 §6)
 */

import type { PatternSummary, AdaptiveIntakeDefaults } from '../../types/patterns'
import type { FlareSensitivity } from '../../types/hari'

// ── Flare sensitivity ordinal rank ────────────────────────────────────────────

const FLARE_RANK: Readonly<Record<FlareSensitivity, number>> = {
  low: 0,
  moderate: 1,
  high: 2,
  not_sure: -1, // excluded from floor logic
}

// ── Eligibility guard ─────────────────────────────────────────────────────────

/**
 * M5.2 §4 — a pattern may influence intake only if state is 'active' or
 * 'high_confidence'. 'suspended', 'candidate', and 'insufficient' are
 * excluded. Because the patternReader state machine already downgrades
 * states on contradiction/suspension, an 'active' or 'high_confidence'
 * pattern is by construction free of active safety contradictions.
 */
function isEligible(state: string): state is 'active' | 'high_confidence' {
  return state === 'active' || state === 'high_confidence'
}

// ── Main computation ──────────────────────────────────────────────────────────

/**
 * Compute adaptive intake defaults from a PatternSummary.
 *
 * @param summary           PatternSummary from M5.1 (may be empty/null patterns)
 * @param recentFlareSensitivity  Most recent validated flare_sensitivity observation.
 *                                Caller derives from getEligibleHariHistory()[0].
 *                                Used to enforce the flare safety floor (M5.2 §8.1).
 * @returns AdaptiveIntakeDefaults — empty object when no eligible patterns exist.
 */
export function computeAdaptiveIntakeDefaults(
  summary: PatternSummary,
  recentFlareSensitivity?: FlareSensitivity
): AdaptiveIntakeDefaults {
  try {
    const defaults: AdaptiveIntakeDefaults = {}

    // §5.1 — Session Intent
    const sit = summary.patterns.session_intent_tendency
    if (sit !== null && isEligible(sit.state)) {
      defaults.session_intent = { value: sit.dominant_value, pattern_state: sit.state }
    }

    // §5.2 — Symptom Focus
    const sft = summary.patterns.symptom_focus_tendency
    if (sft !== null && isEligible(sft.state)) {
      defaults.symptom_focus = { value: sft.dominant_value, pattern_state: sft.state }
    }

    // §5.3 — Flare Sensitivity (safety-constrained)
    const fst = summary.patterns.flare_sensitivity_tendency
    if (fst !== null && isEligible(fst.state)) {
      let suggestedFlare = fst.dominant_value

      // §8.1, §12 — never suggest lower than the most recent validated observation
      // 'not_sure' carries no ordinal rank and is excluded from this floor logic
      if (
        recentFlareSensitivity !== undefined &&
        recentFlareSensitivity !== 'not_sure' &&
        suggestedFlare !== 'not_sure'
      ) {
        const recentRank = FLARE_RANK[recentFlareSensitivity]
        const suggestedRank = FLARE_RANK[suggestedFlare]
        if (suggestedRank < recentRank) {
          suggestedFlare = recentFlareSensitivity
        }
      }

      defaults.flare_sensitivity = { value: suggestedFlare, pattern_state: fst.state }
    }

    // §5.4 — Session Length Preference
    const slt = summary.patterns.session_length_tendency
    if (slt !== null && isEligible(slt.state)) {
      defaults.session_length_preference = { value: slt.dominant_value, pattern_state: slt.state }
    }

    return defaults
  } catch {
    // §11 — Graceful degradation: any failure returns no suggestions
    return {}
  }
}
