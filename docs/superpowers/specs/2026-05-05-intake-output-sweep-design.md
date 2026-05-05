# Intake → Output Sweep — Design

**Date:** 2026-05-05
**Author:** JSEer (with Claude Opus 4.7 1M)
**Status:** approved — implementing now

---

## Goal

Build a deterministic engine-level audit harness that enumerates every meaningful intake combination, runs it through the production HARI + M6.8 pipelines, and records the full decision chain — every intermediate state, the resolved intervention, and the final breathing prescription — so we can:

1. See which breathing techniques are actually reachable from the live engine
2. See the input cohort that produces each technique
3. Identify dimensions that *should* differentiate output but don't (lost signal)
4. Identify cases where *clinically distinct* user inputs collapse onto identical outputs
5. Hand the deduped output set to PMID validation in a follow-up pass

This is **not** a UI walk. The sweep calls engine modules directly, which is ~3 orders of magnitude faster and lets the report focus on clinical logic, not UI glue.

---

## Scope — what gets enumerated

Eight dimensions, fully exhaustive (no sampling — small enough to enumerate):

| Dim | Source | Values | Count |
|---|---|---|---|
| `branch` | user-picked | `tightness_or_pain`, `anxious_or_overwhelmed` | 2 |
| `baseline_intensity` | user-picked (slider) | 0..10 | 11 |
| `irritability` | user-picked | `fast_onset_slow_resolution`, `slow_onset_fast_resolution`, `symmetric` | 3 |
| `flare_sensitivity` | user-picked | `low`, `moderate`, `high`, `not_sure` | 4 |
| `current_context` | user-picked | `sitting`, `standing`, `driving`, `lying_down`, `after_strain` | 5 |
| `session_length_preference` | user-picked | `short`, `standard`, `long` | 3 |
| `symptom_focus` | silent / adaptive | 6 enum values | 6 |
| `session_intent` | silent / adaptive | 6 enum values | 6 |

**Total cases:** 2 × 11 × 3 × 4 × 5 × 3 × 6 × 6 = **142,560**

(Earlier estimate of 64,800 was severity-sampled at 5 boundary points; expanding to full 0–10 since cost is negligible.)

**What is NOT enumerated this round:** `intake.location`, `intake.location_muscles`, `intake.location_pattern`. These are confirmed not to influence engine output today — `synthesizePainInput` derives `location_tags` from `intake.symptom_focus`, not from `intake.location`. The sweep will document this disconnect rather than burn cycles re-proving it across thousands of redundant rows. A separate location-vs-output side-by-side at the top of the findings doc will demonstrate it definitively.

`intake.body_context` is held at `null` (fresh-user condition) for this baseline — same constraint the live app applies on first session.

---

## Pipelines exercised per case

For each enumerated intake the harness calls, in order, every engine module the production app calls in the CLEAR-safety path:

```
1. branchToEmotionalStates(branch)                            → states[]
2. interpretStates({ states, intensity, sensitivity })        → StateInterpretationResult  ← M6.4
3. resolveHariSession(intake, null)                           → HariSessionResolution
   ├── buildBodyContextSummary(null)                          → BodyContextSummary
   ├── estimateState(intake, summary)                         → StateEstimate              ← M4.3
   ├── buildLinkMap(intake, state, summary)                   → LinkMap                    ← M4.4
   └── selectIntervention(intake, state, linkMap, summary)    → InterventionPackage        ← M4.5
       └── mapped_protocol_id  ∈ {PROTO_REDUCED_EFFORT, PROTO_CALM_DOWNREGULATE, PROTO_STABILIZE_BALANCE}
4. buildHariSession(resolution, { outcome: 'CLEAR' })         → RuntimeSession
   ├── synthesizePainInput(intake)                            → PainInputState (location_tags + symptom_tags)
   └── timing_profile (M3 protocol-derived, before reassessmentLoop overlay)
5. buildDeliveryConfig(stateInterpretationResult)             → BreathPrescription          ← M6.5+M6.8
   ├── classifyNeedProfile(result)                            → NeedProfile
   ├── buildFeasibilityProfile(need)                          → FeasibilityProfile
   ├── selectBreathFamily(need, feasibility)                  → BreathFamily
   └── prescribeBreath(family, need, feasibility)             → BreathPrescription
```

Step 5 is the **actual** breath timing the user experiences during the guided session (GuidedSessionScreen.tsx:39–42 confirms `buildDeliveryConfig` overrides the M3 timing_profile when stateInterpretationResult is present, which is always for HARI flow).

---

## Capture format

### `raw.jsonl`

One JSON object per line, ~142,560 rows:

```json
{
  "case_id": "tightness_or_pain__baseline_5__fast_onset_slow_resolution__moderate__sitting__standard__neck_upper__quick_reset",
  "intake": {
    "branch": "tightness_or_pain",
    "baseline_intensity": 5,
    "irritability": "fast_onset_slow_resolution",
    "flare_sensitivity": "moderate",
    "current_context": "sitting",
    "session_length_preference": "standard",
    "symptom_focus": "neck_upper",
    "session_intent": "quick_reset",
    "location": [],
    "location_muscles": null,
    "location_pattern": null
  },
  "states": ["..."],
  "interpretation": { /* StateInterpretationResult */ },
  "hari": {
    "state_estimate": { /* StateEstimate */ },
    "link_map": { /* LinkMap */ },
    "intervention": { /* InterventionPackage incl. mapped_protocol_id */ },
    "session_framing": { /* SessionFraming */ }
  },
  "runtime_session": {
    "protocol_id": "PROTO_CALM_DOWNREGULATE",
    "pain_input": { /* PainInputState */ },
    "timing_profile_pre_m6": { "inhale_seconds": 4, "exhale_seconds": 6, "rounds": 8 }
  },
  "delivery_config": { /* BreathPrescription — the breath timing actually used at runtime */ },
  "need_profile": { /* NeedProfile */ },
  "feasibility_profile": { /* FeasibilityProfile */ },
  "breath_family": "...",
  "output_fingerprint": "PROTO_CALM_DOWNREGULATE|inhale=4|hold=0|exhale=6|rounds=8|family=parasympathetic_lengthen"
}
```

### `distinct-outputs.md`

For each unique `output_fingerprint`:
- The fingerprint
- The full breath prescription (inhale/hold/exhale/rounds/duration)
- The mapped protocol id and intervention class
- The cohort size (how many input combinations reach this output)
- A sample reasoning chain (one full case showing every intermediate)
- A pivot summary across the cohort (which dim values are fixed vs varying)

### `findings.md`

The clinical-defensibility readout:
- **Output cardinality** — how many distinct breathing techniques are reachable
- **Differentiation map** — which intake dimensions actually move the needle vs. dimensions that have zero effect
- **Location disconnect demonstration** — side-by-side cases proving `intake.location` is unused
- **Collisions** — clinically distinct cohorts producing identical output (signal lost)
- **Reachability gaps** — protocols/breath families never selected by any input combination
- **Ready-for-PMID-validation pairs** — each distinct output paired with its cohort, ready for literature cross-reference

---

## Build plan

**Tooling:** plain Node + TypeScript via `tsx`. No new dependencies.

**Layout:**
- `scripts/intakeOutputSweep.ts` — the sweep runner
- `scripts/intakeOutputSweep.report.ts` — the markdown report generators
- `package.json`: add `"sweep": "tsx scripts/intakeOutputSweep.ts"`

**Output dir:** `docs/superpowers/audits/intake-output-sweep-2026-05-05/` — created at runtime, contains the three artifacts above.

**Validation step:** before the full enumeration, run a 100-case spot-check that compares one intake combination against the live app to confirm the harness produces identical engine outputs. (No mocks, no UI — just engine module calls.)

**Cost:** ~142k cases × ~1 ms per case = **~2.5 min serial**. No parallelism needed.

---

## Out of scope for this round

- Wire-through of `intake.location` → `intake.symptom_focus` (separate decision after the user reads the baseline findings)
- PMID validation of each distinct output (separate pass once the technique catalogue is known)
- UI traceability spec (deferred — engine sweep answers the load-bearing question)
- Re-sweep after any wire-through (will be a separate audit, dated)
