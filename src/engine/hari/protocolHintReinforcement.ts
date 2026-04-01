/**
 * M5.3 — Protocol Hint Reinforcement
 * Authority: M5.3_Protocol_Hint_Reinforcement_Contract.md
 *
 * Pure function: reads PatternSummary, emits bounded protocol and pacing hints.
 *
 * Invariants:
 *   - Does NOT modify stored data or session state (M5.3 §12)
 *   - Does NOT access raw history — reads only PatternSummary (M5.3 §3)
 *   - Eligible dimensions: protocol_benefit_tendency, pacing_tendency,
 *     flare_sensitivity_tendency (constraint only) (M5.3 §4)
 *   - Requires 'active' or 'high_confidence' state; candidate patterns excluded (M5.3 §5)
 *   - hint_strength: 'active' → 'soft', 'high_confidence' → 'moderate' (M5.3 §7.1)
 *   - Safety suppression cancels reinforcement entirely (M5.3 §7.3)
 *   - pacing_advisory must never be 'extended' (M5.3 §8)
 *   - Returns hint_strength 'none' on any failure (M5.3 §11 graceful degradation)
 */

import type { PatternSummary, PatternState, ProtocolHintReinforcement } from '../../types/patterns'
import type { RoundCountProfile } from '../../types/hari'

// ── Eligibility guard ─────────────────────────────────────────────────────────

function isEligible(state: PatternState): state is 'active' | 'high_confidence' {
  return state === 'active' || state === 'high_confidence'
}

// ── Helper constructors ───────────────────────────────────────────────────────

function noHint(): ProtocolHintReinforcement {
  return { hint_strength: 'none', suppressed_by_safety: false }
}

function suppressed(reason: string): ProtocolHintReinforcement {
  return {
    hint_strength: 'none',
    suppressed_by_safety: true,
    plain_summary: reason,
  }
}

// ── Main computation ──────────────────────────────────────────────────────────

/**
 * Compute a bounded protocol hint from a PatternSummary.
 *
 * Eligible dimensions consumed (M5.3 §4):
 *   protocol_benefit_tendency — primary hint source
 *   pacing_tendency           — pacing advisory (D1 debt: always candidate, so always absent)
 *   flare_sensitivity_tendency — constraint only; may cap hint_strength or suppress
 *
 * @returns ProtocolHintReinforcement — hint_strength 'none' when no eligible pattern exists.
 */
export function computeProtocolHintReinforcement(
  summary: PatternSummary
): ProtocolHintReinforcement {
  try {
    const pbt = summary.patterns.protocol_benefit_tendency
    const pt  = summary.patterns.pacing_tendency
    const fst = summary.patterns.flare_sensitivity_tendency
    const ot  = summary.patterns.outcome_trajectory

    // §11 — no protocol pattern → no hint
    if (pbt === null) return noHint()

    // §7.3 case 1 — Protocol pattern suspended (safety or recent contradiction)
    if (pbt.state === 'suspended') {
      return suppressed(
        'A past preference exists, but current session safety takes priority.'
      )
    }

    // §5 — Candidate patterns may not influence protocol hints
    if (!isEligible(pbt.state)) return noHint()

    // §7.3 case 2 — Adverse outcome trajectory (global worsening trend)
    // Suppresses even when protocol_benefit_tendency is otherwise eligible.
    if (ot !== null && ot.dominant_value === 'adverse') {
      return suppressed(
        'A past preference exists, but current session safety takes priority.'
      )
    }

    // §7.3 case 3 — Flare safety contradiction (recent high-flare session)
    // has_recent_contradiction at flare level = safety-level event in M5.1.
    if (fst !== null && (fst.state === 'suspended' || fst.has_recent_contradiction)) {
      return suppressed(
        'A past preference exists, but current session safety takes priority.'
      )
    }

    // §7.1 — Determine raw hint strength from protocol pattern state
    const rawStrength: 'soft' | 'moderate' =
      pbt.state === 'high_confidence' ? 'moderate' : 'soft'

    // §4.3 — Flare constraint: if high flare tendency is active, cap hint at 'soft'
    // This dimension may reduce confidence — never increase aggressiveness.
    const hint_strength: 'soft' | 'moderate' =
      fst !== null && isEligible(fst.state) && fst.dominant_value === 'high'
        ? 'soft'
        : rawStrength

    // §4.2 — Pacing advisory from pacing_tendency
    // Note: D1 debt caps pacing_tendency at 'candidate' — this will always be
    // absent in practice until D1 is resolved.
    let pacing_advisory: RoundCountProfile | undefined
    if (pt !== null && isEligible(pt.state) && !pt.has_recent_contradiction) {
      const advised = pt.dominant_value
      // §8 — pacing advisory must NOT be 'extended' (beyond safe M4.6 limits)
      if (advised !== 'extended') {
        pacing_advisory = advised
      }
    }

    return {
      hinted_protocol_id: pbt.dominant_value,
      hint_strength,
      pacing_advisory,
      source_pattern_dimension: 'protocol_benefit_tendency',
      source_pattern_state: pbt.state,
      suppressed_by_safety: false,
      plain_summary:
        'A protocol similar to this has helped in several recent validated sessions, so it is being suggested again.',
    }
  } catch {
    // §11 — graceful degradation
    return noHint()
  }
}
