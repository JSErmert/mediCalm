/**
 * M7 resolveVariant — variant resolution function (§3.8 VariantResolution).
 *
 * v0.1: each pathway has exactly one variant; resolution is a pathway_id lookup.
 * Conditioning + hints are accepted per the locked signature but do not differentiate
 * variants at v0.1. Variant differentiation (and one-way conservatism enforcement on
 * safety-relevant hints — I19) lands at M7.3+.
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.8 §5
 */
import type { VariantResolution } from '../../types/m7'
import { M7_VARIANTS } from '../../data/m7Pathways'
import { assertVariantInvariants } from './substrateInvariants'

const VARIANT_BY_PATHWAY: Map<string, ReturnType<VariantResolution>> = new Map(
  M7_VARIANTS.map(v => [v.pathway_id, v]),
)

export const resolveVariant: VariantResolution = (pathway_id, _conditioning, _hints) => {
  const v = VARIANT_BY_PATHWAY.get(pathway_id)
  if (!v) throw new Error(`M7 resolveVariant: unknown pathway_id ${pathway_id}`)
  // Substrate invariant check at resolution time (Q7 Concern 1 split — engineering side)
  assertVariantInvariants(v)
  return v
}
