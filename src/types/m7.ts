// src/types/m7.ts
/**
 * M7 — PT Pathway Foundation types.
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3
 */

// ── Identity primitives (§3.1) ────────────────────────────────────────────────
export type PathwayId = string
export type VariantId = string
export type TemplateId = string
export type SemVer = string
export type PMID = string
export type ISODate = string
export type PositionName = string

import type { BreathFamilyName } from './hari'

// ── Phase types (§3.2 — Q2.A locked) ─────────────────────────────────────────

export type BreathPhase = {
  type: 'breath'
  /** Pure-from-family — no parameter override at M7.0 (§2.6 grounding contract). */
  breath_family: BreathFamilyName
  num_cycles: number
  cue: { opening: string; mid?: string; closing: string }
  position_cue?: string
}

export type PositionHoldPhase = {
  type: 'position_hold'
  position: PositionName
  duration_seconds: number
  /** Structured embedded patterns deferred to M7.5+ (§9 out-of-scope). */
  breath_pattern: 'unstructured' | 'soft_natural'
  cue: { opening: string; mid?: string; closing: string }
  entry_instruction: string
  exit_instruction: string
}

export type TransitionPhase = {
  type: 'transition'
  subtype: 'intro' | 'between' | 'closing'
  template_id: TemplateId
  /** Pinned in artifact — historical sessions remain reproducible bit-for-bit (§10 Q5 R1). */
  template_version: SemVer
  subtitle?: string
  /** Locked at exactly 5 — invariant I14. */
  duration_seconds: 5
}

export type Phase = BreathPhase | PositionHoldPhase | TransitionPhase

// ── Grounding (§3.3 — Tier A/B contract) ─────────────────────────────────────

export type TierACitation = {
  pmid: PMID
  source_link: string
  /** Verbatim figure with units; never paraphrased numerics (§2.6). */
  exact_figure: string
  figure_units: string
}

export type ReasoningChain = {
  claim: string
  reasoning: string
  /** Chain MUST terminate in Tier A — references PMIDs in own grounding or referenced corpus. */
  terminating_citations: PMID[]
}

export type GroundingSummary = {
  tier_A_citations: TierACitation[]
  tier_B_reasoning_chains: ReasoningChain[]
}

import type {
  IntakeBranch,
  LocationPattern,
  SessionLengthPreference,
  CurrentContext,
  SessionIntent,
  IrritabilityPattern,
  FlareSensitivity,
  BodyLocation,
} from './hari'

// ── Selection criteria (§3.4) ────────────────────────────────────────────────

export type PathwaySelectionCriteria = {
  branch: IntakeBranch[]
  location_pattern?: LocationPattern[]
  session_length_preference?: SessionLengthPreference[]
  current_context?: CurrentContext[]
  session_intent?: SessionIntent[]
  derived_signals?: { breathDowngraded?: boolean }
}

// ── PTPathway — clinical-concept entity (§3.5) ───────────────────────────────

export type ReviewStatus = 'draft' | 'engineering_passed' | 'pt_advisor_passed' | 'locked'

export type PTPathway = {
  pathway_id: PathwayId
  pathway_version: SemVer
  display_name: string
  clinical_summary: string
  selection_criteria: PathwaySelectionCriteria
  authored_duration_seconds: number
  grounding: GroundingSummary
  authored_by: string
  authored_at: ISODate
  reviewed_by?: string
  reviewed_at?: ISODate
  review_status: ReviewStatus
}

// ── PTVariant — resolved artifact (§3.6) ─────────────────────────────────────

export type VariantConditioning = {
  irritability: IrritabilityPattern
  flare_sensitivity: FlareSensitivity
  baseline_intensity_band: 'low' | 'moderate' | 'high'
}

export type PTVariant = {
  variant_id: VariantId
  variant_version: SemVer
  /** Pinned reference to parent (immutable post-publish per I23). */
  pathway_id: PathwayId
  pathway_version: SemVer
  conditioning: VariantConditioning
  /** Phase order immutable (I10); ≥1 breath phase (I7). */
  phases: Phase[]
  /** Variant-specific grounding where it differs from pathway-level (else inherits). */
  grounding?: GroundingSummary
  authored_by: string
  authored_at: ISODate
  reviewed_by?: string
  reviewed_at?: ISODate
  review_status: ReviewStatus
}

/** Alias — the durable cross-surface artifact every downstream surface projects from (Q1 lock). */
export type ResolvedPathway = PTVariant

// ── Selection table (§3.7) ───────────────────────────────────────────────────

export type SelectionTableRow = {
  selection_state: PathwaySelectionCriteria
  pathway_id: PathwayId
  pathway_version: SemVer
}

export type SelectionTable = {
  table_version: SemVer
  /** Totality required by I15; sweep harness validates. */
  rows: SelectionTableRow[]
}

// ── HistoryEntry M7 additions (§3.10) — IntakeSensorState first (used by §3.8) ─

export type IntakeSensorState = {
  branch: IntakeBranch
  location?: BodyLocation[]
  location_pattern?: LocationPattern
  current_context: CurrentContext
  session_intent: SessionIntent
  session_length_preference: SessionLengthPreference
  flare_sensitivity: FlareSensitivity
  baseline_intensity: number
  irritability: IrritabilityPattern
  derived_signals?: { breathDowngraded?: boolean }
}

/** Only fields where M6.9 refinements applied (§3.10 — Partial of sensor state). */
export type EffectiveIntakeState = Partial<IntakeSensorState>

// ── Function signatures (§3.8) ───────────────────────────────────────────────

/** Pure function over sensor_state only — I16, I17, I36 (no variant-feeding dims). */
export type PathwaySelection = (
  intake_sensor_state: IntakeSensorState,
) => { pathway_id: PathwayId; pathway_version: SemVer }

// ── M6.9 artifact stubs (§3.9 — types defined; not yet generated at M7.1) ────

export type SelectionRefinements = {
  generated_at: ISODate
  generation_version: SemVer
  variant_feeding_hints?: {
    irritability_truth_estimate?: IrritabilityPattern
    flare_sensitivity_truth_estimate?: FlareSensitivity
    baseline_intensity_pattern?: 'over_reports' | 'under_reports' | 'accurate'
  }
  confidence_threshold_met: boolean
}

export type AggregateTruthState = {
  generation_version: SemVer
  generated_at: ISODate
  // Field detail TBD at M7.3 (M6.9 territory).
}

/** Deterministic given (pathway_id, conditioning, hints?); I18–I20. */
export type VariantResolution = (
  pathway_id: PathwayId,
  conditioning: VariantConditioning,
  hints?: SelectionRefinements['variant_feeding_hints'],
) => PTVariant

// ── HistoryEntry M7 additions continued (§3.10) ──────────────────────────────

export type PhaseLogEntry = {
  phase_index: number
  phase_type: 'breath' | 'position_hold' | 'transition'
  phase_subtype?: 'intro' | 'between' | 'closing'
  started_at: ISODate
  completed_at?: ISODate
  duration_actual_seconds?: number
  drop_off_reason?:
    | 'completed' | 'user_aborted' | 'user_skipped'
    | 'safety_stopped' | 'system_error'
  drop_off_reason_source?: 'explicit' | 'inferred_from_session_end' | 'inferred_from_orphan_sweep'
}

export type TruthState = {
  /** M7.1 mechanically derived (§3.10). */
  completion_status?: 'complete' | 'aborted' | 'safety_stopped'
  /** M7.1 from phase_log. */
  completion_percentage?: number
  /** M7.1 from existing pain_before/pain_after. */
  pain_delta?: number
  /** M6.9 from M7.3+ (§3.9 Class 3 mutable surface). */
  state_coherence?: 'coherent' | 'mismatched' | 'unclear' | 'pending'
  /** M4.1 promoted (§4 Class 5 user-mutable). */
  user_validation?: 'validated' | 'invalidated' | 'pending'
}

/** All fields optional — legacy HistoryEntry records remain valid per I37. */
export type HistoryEntryM7Additions = {
  intake_sensor_state?: IntakeSensorState
  effective_intake_state?: EffectiveIntakeState

  pathway_ref?: {
    pathway_id: PathwayId
    pathway_version: SemVer
    variant_id: VariantId
    variant_version: SemVer
  }

  phase_log?: PhaseLogEntry[]
  truth_state?: TruthState
  refinement_context?: {
    generation_version: SemVer
    hints_consulted: string[]
    confidence_threshold_met: boolean
  }
}
