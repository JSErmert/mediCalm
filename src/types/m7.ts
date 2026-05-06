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
