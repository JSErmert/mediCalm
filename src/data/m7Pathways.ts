/**
 * M7 Pathway Library v0.2 — variants are single-phase `[breath]`.
 *
 * History:
 *   v0.1   — 12 pathways × 1 variant each, single-phase. No-regression baseline.
 *   v0.2   — initially shipped with `[intro_transition, breath, closing_transition]`
 *            phase shape; transitions DELETED post-smoke-test 2026-05-06 per
 *            operator UX call (intro added no value; closing kept the user stuck
 *            instead of exiting). Variants reverted to single-phase `[breath]`;
 *            `authored_duration_seconds` reverted to breath-only totals.
 *            Transition components, template registry, and PhaseRenderer dispatch
 *            capability are RETAINED but UNUSED at v0.2 — preserved for
 *            advisor-driven reintroduction at M7.3+ if clinically defensible.
 *
 * Authority: docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md
 *            docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §8 §9
 */
import type { PTPathway, PTVariant, GroundingSummary, BreathPhase } from '../types/m7'

const EMPTY_GROUNDING: GroundingSummary = {
  tier_A_citations: [],
  tier_B_reasoning_chains: [],
}

const NOW: string = '2026-05-05T00:00:00.000Z'
const VER: string = '0.2.0'

function pathway(
  pathway_id: string,
  display_name: string,
  selection_criteria: PTPathway['selection_criteria'],
  authored_duration_seconds: number,
  clinical_summary: string,
): PTPathway {
  return {
    pathway_id,
    pathway_version: VER,
    display_name,
    clinical_summary,
    selection_criteria,
    authored_duration_seconds,
    grounding: EMPTY_GROUNDING,
    authored_by: 'JSEer',
    authored_at: NOW,
    review_status: 'engineering_passed',
  }
}

function breathPhase(family: BreathPhase['breath_family'], num_cycles: number): BreathPhase {
  return { type: 'breath', breath_family: family, num_cycles, cue: { opening: '', closing: '' } }
}

function variant(
  pathway_id: string,
  family: BreathPhase['breath_family'],
  num_cycles: number,
): PTVariant {
  return {
    variant_id: `${pathway_id}_v1`,
    variant_version: VER,
    pathway_id,
    pathway_version: VER,
    conditioning: {
      irritability: 'symmetric',
      flare_sensitivity: 'moderate',
      baseline_intensity_band: 'moderate',
    },
    phases: [breathPhase(family, num_cycles)],
    authored_by: 'JSEer',
    authored_at: NOW,
    review_status: 'engineering_passed',
  }
}

// num_cycles = floor(duration_seconds / (inhale + exhale + hold))
// flare_safe_soft_exhale 3/6 = 9s → 240s/9 ≈ 26 cycles  (authored 240s = 26×9 = 234s; -2.5%)
// decompression_expand 4/6 = 10s → 240s/10 = 24 cycles   (authored 240s = 24×10 = 240s; exact)
// calm_downregulate 4/7 = 11s → 360s/11 ≈ 32 cycles; 480s/11 ≈ 43 cycles
//   (authored 360s = 32×11 = 352s; -2.2%)  (authored 480s = 43×11 = 473s; -1.5%)

export const M7_PATHWAYS: PTPathway[] = [
  pathway(
    'tightness_flare_safe_reduced_effort_short',
    'Tightness — Flare Safe (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: true } },
    240,
    'Reduced-effort short session for tightness with breath-downgraded sensitivity profile.',
  ),
  pathway(
    'anxious_calm_downregulate_reduced_effort_standard',
    'Anxious — Calm Downregulate (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['standard'] },
    360,
    'Standard-length downregulation for anxious branch.',
  ),
  pathway(
    'anxious_calm_downregulate_reduced_effort_long',
    'Anxious — Calm Downregulate (Long)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['long'] },
    480,
    'Long-length downregulation for anxious branch.',
  ),
  pathway(
    'tightness_decompression_reduced_effort_short',
    'Tightness — Decompression (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: false } },
    240,
    'Reduced-effort short decompression for tightness without flare-downgrade.',
  ),
  pathway(
    'tightness_decompression_calm_downregulate_short',
    'Tightness — Decompression via Calm Downregulate Protocol (Short)',
    { branch: ['tightness_or_pain'] },
    240,
    'Tightness routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_calm_downregulate_standard',
    'Anxious — Calm Downregulate Protocol (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['standard'] },
    360,
    'Anxious branch routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_calm_downregulate_long',
    'Anxious — Calm Downregulate Protocol (Long)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['long'] },
    480,
    'Long-length anxious branch via PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'tightness_flare_safe_calm_downregulate_short',
    'Tightness — Flare Safe via Calm Downregulate Protocol (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: true } },
    240,
    'Tightness-with-flare-downgrade routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_stabilize_balance_standard',
    'Anxious — Stabilize Balance (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_intent: ['deeper_regulation'], session_length_preference: ['standard'] },
    360,
    'Anxious branch with deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'tightness_decompression_stabilize_balance_short',
    'Tightness — Decompression via Stabilize Balance (Short)',
    { branch: ['tightness_or_pain'], session_intent: ['deeper_regulation'] },
    240,
    'Tightness with deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'tightness_flare_safe_stabilize_balance_short',
    'Tightness — Flare Safe via Stabilize Balance (Short)',
    { branch: ['tightness_or_pain'], session_intent: ['deeper_regulation'], derived_signals: { breathDowngraded: true } },
    240,
    'Tightness-with-flare-downgrade and deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'anxious_calm_downregulate_stabilize_balance_long',
    'Anxious — Stabilize Balance (Long)',
    { branch: ['anxious_or_overwhelmed'], session_intent: ['deeper_regulation'], session_length_preference: ['long'] },
    480,
    'Long-length anxious branch with deeper-regulation intent via PROTO_STABILIZE_BALANCE.',
  ),
]

export const M7_VARIANTS: PTVariant[] = [
  variant('tightness_flare_safe_reduced_effort_short', 'flare_safe_soft_exhale', 26),
  variant('anxious_calm_downregulate_reduced_effort_standard', 'calm_downregulate', 32),
  variant('anxious_calm_downregulate_reduced_effort_long', 'calm_downregulate', 43),
  variant('tightness_decompression_reduced_effort_short', 'decompression_expand', 24),
  variant('tightness_decompression_calm_downregulate_short', 'decompression_expand', 24),
  variant('anxious_calm_downregulate_calm_downregulate_standard', 'calm_downregulate', 32),
  variant('anxious_calm_downregulate_calm_downregulate_long', 'calm_downregulate', 43),
  variant('tightness_flare_safe_calm_downregulate_short', 'flare_safe_soft_exhale', 26),
  variant('anxious_calm_downregulate_stabilize_balance_standard', 'calm_downregulate', 32),
  variant('tightness_decompression_stabilize_balance_short', 'decompression_expand', 24),
  variant('tightness_flare_safe_stabilize_balance_short', 'flare_safe_soft_exhale', 26),
  variant('anxious_calm_downregulate_stabilize_balance_long', 'calm_downregulate', 43),
]
