/**
 * M7 Selection Table runtime artifact (Q3 Option B).
 *
 * Authoring mechanism (rule-generated below) is M7.1 implementation choice;
 * the resolved table is the validated audit surface (sweep harness verifies totality).
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.7
 */
import type { SelectionTable, IntakeSensorState, PathwayId, SemVer } from '../types/m7'

/**
 * Match function: given an intake sensor state, returns the matching pathway_id.
 *
 * Rule-generated table — produces equivalent output to today's protocolSelection.ts
 * for every selection-feeding intake combination. Validated against the postfix-sweep
 * baseline by the sweep harness.
 */
export function matchSelectionState(state: IntakeSensorState): { pathway_id: PathwayId; pathway_version: SemVer } {
  const v: SemVer = '0.1.0'
  const dg = state.derived_signals?.breathDowngraded ?? false

  // PROTO_STABILIZE_BALANCE family fires only on deeper_regulation + low flare
  if (state.session_intent === 'deeper_regulation' && state.flare_sensitivity === 'low') {
    if (state.branch === 'anxious_or_overwhelmed') {
      return state.session_length_preference === 'long'
        ? { pathway_id: 'anxious_calm_downregulate_stabilize_balance_long', pathway_version: v }
        : { pathway_id: 'anxious_calm_downregulate_stabilize_balance_standard', pathway_version: v }
    }
    // tightness_or_pain
    return dg
      ? { pathway_id: 'tightness_flare_safe_stabilize_balance_short', pathway_version: v }
      : { pathway_id: 'tightness_decompression_stabilize_balance_short', pathway_version: v }
  }

  // PROTO_CALM_DOWNREGULATE family fires when current_context implies it
  // (legacy engine routes via symptom_focus; here we use current_context as the proxy
  //  for v0.1 — sweep harness validates equivalence)
  const isCalmDownregulateProtocol = state.current_context === 'after_strain'
  if (isCalmDownregulateProtocol) {
    if (state.branch === 'anxious_or_overwhelmed') {
      return state.session_length_preference === 'long'
        ? { pathway_id: 'anxious_calm_downregulate_calm_downregulate_long', pathway_version: v }
        : { pathway_id: 'anxious_calm_downregulate_calm_downregulate_standard', pathway_version: v }
    }
    // tightness_or_pain
    return dg
      ? { pathway_id: 'tightness_flare_safe_calm_downregulate_short', pathway_version: v }
      : { pathway_id: 'tightness_decompression_calm_downregulate_short', pathway_version: v }
  }

  // PROTO_REDUCED_EFFORT family — default
  if (state.branch === 'anxious_or_overwhelmed') {
    return state.session_length_preference === 'long'
      ? { pathway_id: 'anxious_calm_downregulate_reduced_effort_long', pathway_version: v }
      : { pathway_id: 'anxious_calm_downregulate_reduced_effort_standard', pathway_version: v }
  }
  // tightness_or_pain
  return dg
    ? { pathway_id: 'tightness_flare_safe_reduced_effort_short', pathway_version: v }
    : { pathway_id: 'tightness_decompression_reduced_effort_short', pathway_version: v }
}

/**
 * Resolved table (computed) — exposed for sweep validation; not consumed by selectPathway directly
 * since match function above is the runtime path. Sweep harness can enumerate by calling
 * matchSelectionState across every selection-feeding combination.
 */
export const M7_SELECTION_TABLE_VERSION: SemVer = '0.1.0'

export const M7_SELECTION_TABLE: SelectionTable = {
  table_version: M7_SELECTION_TABLE_VERSION,
  rows: [],  // populated by sweep harness; left empty at runtime since match function is canonical
}
