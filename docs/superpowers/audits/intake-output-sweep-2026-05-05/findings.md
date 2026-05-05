# Findings — Intake → Output Sweep

**Generated:** 2026-05-05
**Total cases swept:** 95,040
**Distinct output fingerprints:** 9
**Sweep duration:** 3.2s

Authority: `docs/superpowers/specs/2026-05-05-intake-output-sweep-design.md`

---

## 1. Output cardinality

The engine produces **9 distinct breathing-technique outputs** across all 95,040 swept intake combinations. Each output is identified by the tuple `(protocol_id, breath_family, inhale_seconds, hold_seconds, exhale_seconds, duration_seconds)` — i.e. what the user actually experiences during the guided session.

### Cohort distribution

| Rank | Fingerprint | Cohort size | Share |
|---|---|---:|---:|
| 1 | `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 36,495 | 38.40% |
| 2 | `protocol=PROTO_REDUCED_EFFORT|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 21,312 | 22.42% |
| 3 | `protocol=PROTO_REDUCED_EFFORT|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 15,183 | 15.98% |
| 4 | `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 9,837 | 10.35% |
| 5 | `protocol=PROTO_CALM_DOWNREGULATE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 6,741 | 7.09% |
| 6 | `protocol=PROTO_CALM_DOWNREGULATE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 3,096 | 3.26% |
| 7 | `protocol=PROTO_STABILIZE_BALANCE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 1,188 | 1.25% |
| 8 | `protocol=PROTO_STABILIZE_BALANCE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 756 | 0.80% |
| 9 | `protocol=PROTO_STABILIZE_BALANCE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 432 | 0.45% |

## 2. Differentiation map — which intake dims actually drive output?

A dim is a **driver** for an output if it is *pinned* (single value) across that output's cohort. A dim is **inert** for an output if it varies freely (every value appears) — meaning that dim has no effect on which output is produced for that cohort.

Across all 9 outputs:

| Dim | Driver in N outputs | Inert in N outputs | Partial in N outputs |
|---|---:|---:|---:|
| `branch` | 9 | 0 | 0 |
| `baseline_intensity` | 0 | 4 | 5 |
| `irritability` | 0 | 9 | 0 |
| `flare_sensitivity` | 3 | 2 | 4 |
| `current_context` | 0 | 6 | 3 |
| `session_length_preference` | 0 | 9 | 0 |
| `symptom_focus` | 0 | 6 | 3 |
| `session_intent` | 3 | 6 | 0 |

**Read this as:** dims with high driver counts and low inert counts are the dimensions actually shaping the breathing technique. Dims with high inert counts are captured by the intake but ignored by the engine.

## 3. Location-vs-output disconnect (current state, pre-fix)

This sweep deliberately holds `intake.location = []` for every case because `synthesizePainInput` derives `location_tags` from `intake.symptom_focus` (a silent / adaptive field) and not from `intake.location`. The body-picker work shipped in commit `2607726` therefore captures anatomical detail into HARI history but does not change which breathing technique the engine selects.

Concretely: two cases identical on every other dim but differing only on `intake.location` produce identical output. The 8 dims swept here are the *only* dims that move the engine today; `location`, `location_muscles`, `location_pattern` are inert.

If `location` were wired through to derive `symptom_focus` (or a richer painInput synthesis), each `location_pattern` would map onto a different cohort here and the differentiation map would shift accordingly. That wire-through is a separate decision documented in the body-picker spec; the data above defines the baseline against which any such change can be measured.

## 4. Collisions — multiple clinically distinct cohorts producing the same output

Each entry in the table below is an output whose cohort spans a wide range of clinically relevant intake values (i.e. multiple values across high-signal dims like `flare_sensitivity`, `baseline_intensity`, `branch`). Larger cohort + more free dims = stronger collision signal = more clinical specificity is being lost at this output.

| Output | Cohort size | Free dims | Notes |
|---|---:|---|---|
| `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 36,495 | `baseline_intensity`, `irritability`, `flare_sensitivity`, `current_context`, `session_length_preference`, `symptom_focus`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_REDUCED_EFFORT|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 21,312 | `baseline_intensity`, `irritability`, `flare_sensitivity`, `current_context`, `session_length_preference`, `symptom_focus`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_REDUCED_EFFORT|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 15,183 | `irritability`, `current_context`, `session_length_preference`, `symptom_focus`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 9,837 | `baseline_intensity`, `irritability`, `current_context`, `session_length_preference`, `symptom_focus`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_CALM_DOWNREGULATE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 6,741 | `irritability`, `current_context`, `session_length_preference`, `symptom_focus`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_CALM_DOWNREGULATE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 3,096 | `irritability`, `current_context`, `session_length_preference`, `symptom_focus`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_STABILIZE_BALANCE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 1,188 | `baseline_intensity`, `irritability`, `session_length_preference` |  |

## 5. Reachability gaps

Protocols, breath families, and breath ratios that exist in the codebase but are never selected by any swept intake combination. Empty list means full reachability.

### Protocols reached
- `PROTO_CALM_DOWNREGULATE`
- `PROTO_REDUCED_EFFORT`
- `PROTO_STABILIZE_BALANCE`

### Breath families reached
- `calm_downregulate`
- `decompression_expand`
- `flare_safe_soft_exhale`

(Compare against the canonical lists in `src/data/protocols.ts` and `src/engine/hari/breathFamily.ts` — anything not appearing above is unreachable from the current intake surface.)

## 6. Ready-for-PMID-validation pairs

Each distinct output is paired with the clinical cohort it serves. To validate clinical defensibility, cross-reference each row against PubMed-cited PT / respiratory research:

| Output | Driver cohort | Suggested literature focus |
|---|---|---|
| `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | branch=anxious_or_overwhelmed | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_REDUCED_EFFORT|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_REDUCED_EFFORT|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | branch=anxious_or_overwhelmed | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_CALM_DOWNREGULATE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_CALM_DOWNREGULATE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_STABILIZE_BALANCE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | branch=anxious_or_overwhelmed & flare_sensitivity=low & session_intent=deeper_regulation | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_STABILIZE_BALANCE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | branch=tightness_or_pain & flare_sensitivity=low & session_intent=deeper_regulation | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_STABILIZE_BALANCE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | branch=tightness_or_pain & flare_sensitivity=low & session_intent=deeper_regulation | musculoskeletal pain + diaphragmatic breathing literature |

The PMID validation step is deliberately deferred — see the design spec § "Out of scope for this round".
