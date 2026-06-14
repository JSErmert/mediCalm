# M7.1 Migration Partition Analysis

**Date:** 2026-05-05
**Source:** `docs/superpowers/audits/intake-output-sweep-2026-05-05-postfix/findings.md` (12 distinct outputs)
**Authority:** M7.0 design doc §10 Q4 (collapse outputs differing only on variant-feeding dims)

## Methodology

Per Q4.1 lock: each of today's 12 outputs is analyzed against the locked partition.
Outputs differing only on variant-feeding dims (irritability × flare_sensitivity ×
baseline_intensity_band) collapse to one pathway with multiple variants.
Outputs differing on selection-feeding dims stay as separate pathways.

## The 12 outputs (postfix)

| # | Fingerprint | Cohort |
|---|---|---|
| 1 | PROTO_REDUCED_EFFORT \| flare_safe_soft_exhale \| 3/0/6/240 | tightness, breathDowngraded |
| 2 | PROTO_REDUCED_EFFORT \| calm_downregulate \| 4/0/7/360 | anxious, standard length |
| 3 | PROTO_REDUCED_EFFORT \| calm_downregulate \| 4/0/7/480 | anxious, long length |
| 4 | PROTO_REDUCED_EFFORT \| decompression_expand \| 4/0/6/240 | tightness, not-downgraded |
| 5 | PROTO_CALM_DOWNREGULATE \| decompression_expand \| 4/0/6/240 | tightness, alt protocol path |
| 6 | PROTO_CALM_DOWNREGULATE \| calm_downregulate \| 4/0/7/360 | anxious, alt protocol path |
| 7 | PROTO_CALM_DOWNREGULATE \| calm_downregulate \| 4/0/7/480 | anxious long, alt protocol path |
| 8 | PROTO_CALM_DOWNREGULATE \| flare_safe_soft_exhale \| 3/0/6/240 | tightness DG, alt protocol path |
| 9 | PROTO_STABILIZE_BALANCE \| calm_downregulate \| 4/0/7/360 | anxious × low flare × deeper_regulation |
| 10 | PROTO_STABILIZE_BALANCE \| decompression_expand \| 4/0/6/240 | tightness × low flare × deeper_regulation |
| 11 | PROTO_STABILIZE_BALANCE \| flare_safe_soft_exhale \| 3/0/6/240 | tightness DG × low flare × deeper_regulation |
| 12 | PROTO_STABILIZE_BALANCE \| calm_downregulate \| 4/0/7/480 | anxious long × low flare × deeper_regulation |

## Partition application

**Selection-feeding dims** drive pathway selection; differences here mean separate pathways:
- branch (always)
- session_length_preference (standard vs long)
- session_intent (deeper_regulation routes to PROTO_STABILIZE_BALANCE family)
- breathDowngraded (derived from intensity ≥ 7 OR flare = high)
- protocol-distinguishing dim (PROTO_REDUCED_EFFORT vs PROTO_CALM_DOWNREGULATE — per existing engine, this is symptom_focus-driven, with symptom_focus now derived from location_pattern; modeled as selection-feeding via location_pattern)

**Variant-feeding dims** (irritability × flare_sensitivity × baseline_intensity_band)
collapse outputs to a single pathway with multiple variants when they're the only
differentiator. In today's 12 outputs, no two outputs differ ONLY on variant-feeding
dims — every pair differs on at least one selection-feeding dim.

## Resulting pathway count for v0.1

12 pathways at M7.1 (no collapse), each with 1 variant covering the migrated cohort.

**Why no collapse for v0.1:** today's engine doesn't differentiate on variant-feeding
dims for most cohorts (irritability is partial 9/12, flare_sensitivity is driver 4/12
+ partial 5/12, baseline_intensity is partial 5/12 + inert 7/12). The variants in
v0.1 are single-variant-per-pathway, with conditioning fields populated to "any"-style
defaults where the dim was inert in legacy.

**Variant machinery exercised at M7.1:** to satisfy I8 (variant resolution totality),
each pathway must have variants covering every (irritability × flare × intensity_band)
combination — 36 combinations max per pathway. For v0.1, all 36 combinations resolve
to the same single variant per pathway (a "default" variant). The variant resolution
function performs lookup; the totality is trivially satisfied.

**M7.4 expansion** introduces clinically meaningful variant differentiation;
pathways gain 6–15 actual variants each as authoring proceeds. v0.1 is the
no-regression baseline; v1.0 (M7.4) is the differentiated catalog.

## Mapping table — 12 pathways v0.1

| Pathway ID | Cohort | TimingProfile target |
|---|---|---|
| `tightness_flare_safe_reduced_effort_short` | output #1 | flare_safe_soft_exhale 3/0/6/240 |
| `anxious_calm_downregulate_reduced_effort_standard` | output #2 | calm_downregulate 4/0/7/360 |
| `anxious_calm_downregulate_reduced_effort_long` | output #3 | calm_downregulate 4/0/7/480 |
| `tightness_decompression_reduced_effort_short` | output #4 | decompression_expand 4/0/6/240 |
| `tightness_decompression_calm_downregulate_short` | output #5 | decompression_expand 4/0/6/240 |
| `anxious_calm_downregulate_calm_downregulate_standard` | output #6 | calm_downregulate 4/0/7/360 |
| `anxious_calm_downregulate_calm_downregulate_long` | output #7 | calm_downregulate 4/0/7/480 |
| `tightness_flare_safe_calm_downregulate_short` | output #8 | flare_safe_soft_exhale 3/0/6/240 |
| `anxious_calm_downregulate_stabilize_balance_standard` | output #9 | calm_downregulate 4/0/7/360 |
| `tightness_decompression_stabilize_balance_short` | output #10 | decompression_expand 4/0/6/240 |
| `tightness_flare_safe_stabilize_balance_short` | output #11 | flare_safe_soft_exhale 3/0/6/240 |
| `anxious_calm_downregulate_stabilize_balance_long` | output #12 | calm_downregulate 4/0/7/480 |

Each pathway has exactly 1 variant at v0.1; variant_id mirrors pathway_id with `_v1` suffix.
