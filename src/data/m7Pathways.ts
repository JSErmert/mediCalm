/**
 * M7 Pathway Library v0.1 — migration of today's 12 postfix outputs.
 *
 * Authority: docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md
 *            docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §8
 *
 * v0.1: 12 pathways × 1 variant each. No-regression baseline. v1.0 (M7.4) introduces
 * differentiated multi-variant authoring.
 */
import type { PTPathway, PTVariant, GroundingSummary } from '../types/m7'

const EMPTY_GROUNDING: GroundingSummary = {
  tier_A_citations: [],
  tier_B_reasoning_chains: [],
}

export const M7_PATHWAYS: PTPathway[] = []
export const M7_VARIANTS: PTVariant[] = []

void EMPTY_GROUNDING
