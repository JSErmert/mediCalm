/**
 * M7 Pathway Library v0.2 — variants gain explicit intro + closing transitions.
 *
 * Authority: docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md
 *            docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §8
 *            docs/superpowers/plans/2026-05-05-m7-2-heterogeneous-rendering.md Task 7
 *
 * v0.1: 12 pathways × 1 variant each. No-regression baseline.
 * v0.2 (M7.2 Task 7): Each variant gains 3 phases [intro_transition, breath, closing_transition].
 *   authored_duration_seconds bumped +10 (intro 5s + closing 5s) on every pathway.
 *   Variant conditioning fields remain at v0.1 defaults; meaningful differentiation at M7.4.
 *   I9 mass balance verified within ±5% for all 12 variants.
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
    phases: [
      { type: 'transition' as const, subtype: 'intro' as const, template_id: 'standard_5_count', template_version: '1.0.0', duration_seconds: 5 as const },
      breathPhase(family, num_cycles),
      { type: 'transition' as const, subtype: 'closing' as const, template_id: 'standard_completion', template_version: '1.0.0', duration_seconds: 5 as const },
    ],
    authored_by: 'JSEer',
    authored_at: NOW,
    review_status: 'engineering_passed',
  }
}

// num_cycles = floor((duration_seconds - 10) / (inhale + exhale))  [v0.2: -10 for intro+closing transitions]
// flare_safe_soft_exhale 3/6 = 9s → 240s/9 ≈ 26 cycles  (authored 250s = 10s transitions + 26×9=234s)
// decompression_expand 4/6 = 10s → 240s/10 = 24 cycles   (authored 250s = 10s transitions + 24×10=240s)
// calm_downregulate 4/7 = 11s → 360s/11 ≈ 32 cycles; 480s/11 ≈ 43 cycles
//   (authored 370s = 10s transitions + 32×11=352s; authored 490s = 10s transitions + 43×11=473s)

export const M7_PATHWAYS: PTPathway[] = [
  pathway(
    'tightness_flare_safe_reduced_effort_short',
    'Tightness — Flare Safe (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: true } },
    250,
    'Reduced-effort short session for tightness with breath-downgraded sensitivity profile.',
  ),
  pathway(
    'anxious_calm_downregulate_reduced_effort_standard',
    'Anxious — Calm Downregulate (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['standard'] },
    370,
    'Standard-length downregulation for anxious branch.',
  ),
  pathway(
    'anxious_calm_downregulate_reduced_effort_long',
    'Anxious — Calm Downregulate (Long)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['long'] },
    490,
    'Long-length downregulation for anxious branch.',
  ),
  pathway(
    'tightness_decompression_reduced_effort_short',
    'Tightness — Decompression (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: false } },
    250,
    'Reduced-effort short decompression for tightness without flare-downgrade.',
  ),
  pathway(
    'tightness_decompression_calm_downregulate_short',
    'Tightness — Decompression via Calm Downregulate Protocol (Short)',
    { branch: ['tightness_or_pain'] },
    250,
    'Tightness routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_calm_downregulate_standard',
    'Anxious — Calm Downregulate Protocol (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['standard'] },
    370,
    'Anxious branch routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_calm_downregulate_long',
    'Anxious — Calm Downregulate Protocol (Long)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['long'] },
    490,
    'Long-length anxious branch via PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'tightness_flare_safe_calm_downregulate_short',
    'Tightness — Flare Safe via Calm Downregulate Protocol (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: true } },
    250,
    'Tightness-with-flare-downgrade routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_stabilize_balance_standard',
    'Anxious — Stabilize Balance (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_intent: ['deeper_regulation'], session_length_preference: ['standard'] },
    370,
    'Anxious branch with deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'tightness_decompression_stabilize_balance_short',
    'Tightness — Decompression via Stabilize Balance (Short)',
    { branch: ['tightness_or_pain'], session_intent: ['deeper_regulation'] },
    250,
    'Tightness with deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'tightness_flare_safe_stabilize_balance_short',
    'Tightness — Flare Safe via Stabilize Balance (Short)',
    { branch: ['tightness_or_pain'], session_intent: ['deeper_regulation'], derived_signals: { breathDowngraded: true } },
    250,
    'Tightness-with-flare-downgrade and deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'anxious_calm_downregulate_stabilize_balance_long',
    'Anxious — Stabilize Balance (Long)',
    { branch: ['anxious_or_overwhelmed'], session_intent: ['deeper_regulation'], session_length_preference: ['long'] },
    490,
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
