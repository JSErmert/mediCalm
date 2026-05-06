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
