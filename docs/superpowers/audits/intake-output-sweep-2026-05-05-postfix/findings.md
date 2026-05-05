# Findings — Intake → Output Sweep

**Generated:** 2026-05-05
**Total cases swept:** 253,440
**Distinct output fingerprints:** 12
**Sweep duration:** 10.5s

Authority: `docs/superpowers/specs/2026-05-05-intake-output-sweep-design.md`

---

## 1. Output cardinality

The engine produces **12 distinct breathing-technique outputs** across all 253,440 swept intake combinations. Each output is identified by the tuple `(protocol_id, breath_family, inhale_seconds, hold_seconds, exhale_seconds, duration_seconds)` — i.e. what the user actually experiences during the guided session.

### Cohort distribution

| Rank | Fingerprint | Cohort size | Share |
|---|---|---:|---:|
| 1 | `protocol=PROTO_REDUCED_EFFORT|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 80,616 | 31.81% |
| 2 | `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 72,868 | 28.75% |
| 3 | `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | 36,434 | 14.38% |
| 4 | `protocol=PROTO_REDUCED_EFFORT|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 28,686 | 11.32% |
| 5 | `protocol=PROTO_CALM_DOWNREGULATE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 10,752 | 4.24% |
| 6 | `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 10,688 | 4.22% |
| 7 | `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | 5,344 | 2.11% |
| 8 | `protocol=PROTO_CALM_DOWNREGULATE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 5,280 | 2.08% |
| 9 | `protocol=PROTO_STABILIZE_BALANCE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 924 | 0.36% |
| 10 | `protocol=PROTO_STABILIZE_BALANCE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 882 | 0.35% |
| 11 | `protocol=PROTO_STABILIZE_BALANCE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 504 | 0.20% |
| 12 | `protocol=PROTO_STABILIZE_BALANCE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | 462 | 0.18% |

## 2. Differentiation map — which intake dims actually drive output?

A dim is a **driver** for an output if it is *pinned* (single value) across that output's cohort. A dim is **inert** for an output if it varies freely (every value appears) — meaning that dim has no effect on which output is produced for that cohort.

Across all 12 outputs:

| Dim | Driver in N outputs | Inert in N outputs | Partial in N outputs |
|---|---:|---:|---:|
| `branch` | 12 | 0 | 0 |
| `baseline_intensity` | 0 | 7 | 5 |
| `irritability` | 0 | 3 | 9 |
| `flare_sensitivity` | 4 | 3 | 5 |
| `current_context` | 0 | 8 | 4 |
| `session_length_preference` | 3 | 6 | 3 |
| `symptom_focus` | 0 | 0 | 12 |
| `session_intent` | 4 | 8 | 0 |

**Read this as:** dims with high driver counts and low inert counts are the dimensions actually shaping the breathing technique. Dims with high inert counts are captured by the intake but ignored by the engine.

## 3. Location-vs-output disconnect (current state, pre-fix)

This sweep deliberately holds `intake.location = []` for every case because `synthesizePainInput` derives `location_tags` from `intake.symptom_focus` (a silent / adaptive field) and not from `intake.location`. The body-picker work shipped in commit `2607726` therefore captures anatomical detail into HARI history but does not change which breathing technique the engine selects.

Concretely: two cases identical on every other dim but differing only on `intake.location` produce identical output. The 8 dims swept here are the *only* dims that move the engine today; `location`, `location_muscles`, `location_pattern` are inert.

If `location` were wired through to derive `symptom_focus` (or a richer painInput synthesis), each `location_pattern` would map onto a different cohort here and the differentiation map would shift accordingly. That wire-through is a separate decision documented in the body-picker spec; the data above defines the baseline against which any such change can be measured.

## 4. Collisions — multiple clinically distinct cohorts producing the same output

Each entry in the table below is an output whose cohort spans a wide range of clinically relevant intake values (i.e. multiple values across high-signal dims like `flare_sensitivity`, `baseline_intensity`, `branch`). Larger cohort + more free dims = stronger collision signal = more clinical specificity is being lost at this output.

| Output | Cohort size | Free dims | Notes |
|---|---:|---|---|
| `protocol=PROTO_REDUCED_EFFORT|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 80,616 | `baseline_intensity`, `irritability`, `flare_sensitivity`, `current_context`, `session_length_preference`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 72,868 | `baseline_intensity`, `irritability`, `flare_sensitivity`, `current_context`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | 36,434 | `baseline_intensity`, `irritability`, `flare_sensitivity`, `current_context`, `session_intent` | wide cohort — review whether this is intended |
| `protocol=PROTO_REDUCED_EFFORT|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 28,686 | `current_context`, `session_length_preference`, `session_intent` |  |
| `protocol=PROTO_CALM_DOWNREGULATE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | 10,752 | `current_context`, `session_length_preference`, `session_intent` |  |
| `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | 10,688 | `baseline_intensity`, `current_context`, `session_intent` |  |
| `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | 5,344 | `baseline_intensity`, `current_context`, `session_intent` |  |
| `protocol=PROTO_CALM_DOWNREGULATE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | 5,280 | `current_context`, `session_length_preference`, `session_intent` |  |

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
| `protocol=PROTO_REDUCED_EFFORT|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | branch=anxious_or_overwhelmed | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_REDUCED_EFFORT|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | branch=anxious_or_overwhelmed & session_length_preference=long | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_REDUCED_EFFORT|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_CALM_DOWNREGULATE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | branch=anxious_or_overwhelmed | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_CALM_DOWNREGULATE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | branch=anxious_or_overwhelmed & session_length_preference=long | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_CALM_DOWNREGULATE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | branch=tightness_or_pain | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_STABILIZE_BALANCE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=360` | branch=anxious_or_overwhelmed & flare_sensitivity=low & session_intent=deeper_regulation | vagal tone / parasympathetic activation breathing literature |
| `protocol=PROTO_STABILIZE_BALANCE|family=decompression_expand|inhale=4|hold=0|exhale=6|duration=240` | branch=tightness_or_pain & flare_sensitivity=low & session_intent=deeper_regulation | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_STABILIZE_BALANCE|family=flare_safe_soft_exhale|inhale=3|hold=0|exhale=6|duration=240` | branch=tightness_or_pain & flare_sensitivity=low & session_intent=deeper_regulation | musculoskeletal pain + diaphragmatic breathing literature |
| `protocol=PROTO_STABILIZE_BALANCE|family=calm_downregulate|inhale=4|hold=0|exhale=7|duration=480` | branch=anxious_or_overwhelmed & flare_sensitivity=low & session_length_preference=long & session_intent=deeper_regulation | vagal tone / parasympathetic activation breathing literature |

The PMID validation step is deliberately deferred — see the design spec § "Out of scope for this round".
