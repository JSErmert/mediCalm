# M7 — PT Pathway Foundation Design

**Date:** 2026-05-05
**Author:** JSEer (with Claude Opus 4.7 1M)
**Status:** approved — design phase complete; M7.1 implementation planning next
**Branch:** `m7-pt-pathway-foundation` (cut from `main` at f5f1a02)
**Authority:**
- `docs/superpowers/specs/2026-05-05-scope-a-pt-cues-design.md` (Tier A/B grounding contract foundation)
- `docs/superpowers/specs/2026-05-05-intake-wire-through-design.md` (selection-feeding partition baseline)
- `docs/superpowers/specs/2026-05-05-intake-output-sweep-design.md` + postfix audit (12-output regression baseline)
- `docs/superpowers/specs/2026-05-04-location-pattern-inference-design.md` (location_pattern derivation)
- M6.9 User Refinement Layer spec (locked for implementation after M7.3)

---

## 1. Goal

Convert mediCalm from a breath-technique selector (one ratio per session) to a clinical session orchestrator (curated catalog of pre-written, pre-reviewed multi-phase sessions).

Today's engine selects ONE breath family per session (single ratio, single duration). M7 introduces:

- **PTPathway** — clinical-concept-level entity in a curated library, mapping intake states to a clinical sequencing intent (e.g. *thoracic-restrictive with anxious overlay*).
- **PTVariant** — the resolved artifact every downstream surface projects from; carries the actual ordered phase sequence.
- **Heterogeneous phases** — `breath`, `position_hold`, `transition` (with subtypes `intro` / `between` / `closing`).
- **Calm narrated transitions** — 5-second lightweight typography between major phases.
- **5-count intro** — universal session opening.
- **Curated catalog discipline** — ~120 pre-authored variants reviewed by a PT advisor before lock.

This is a category change, not a feature upgrade: from "wellness app with breath techniques" to "clinically-grounded PT session delivery system." The grounding contract, audit trail, and authoring discipline are what make it a credible clinical tool.

---

## 2. Architecture overview

### 2.1 Layered model

| Layer | Owns | Mutates |
|---|---|---|
| Substrate (Class 1 / Class 2) | Types, selection function, variant resolution function, pathway library, template registry, safety gates, frozen artifacts | Engineering — versioned schema migration only |
| Personalization (Class 3) | M6.9 — `truth_state.state_coherence`, `aggregate_truth_state`, `selection_refinements` | M6.9 only; never reaches into Class 1/2 |
| Observability (Class 4 — reserved) | Future LMGS at M7.5+/M8 | LMGS only; never reaches into Class 1/2/3 |
| User-mutable (Class 5) | `BodyContext`, `AppSettings`, `truth_state.user_validation` | User actions only |

Symmetric layered separation: each layer writes to its own surface, reads upstream layers, never reaches sideways or downward.

**M6.9 zero direct library access.** M6.9 has zero direct read access to the pathway library or template registry. It consumes pathway/variant/template identifiers only via `HistoryEntry.pathway_ref` (and the analogous fields on related artifacts). No API exists for M6.9 to query the libraries directly. This keeps M6.9 in *outcome space* (which variants worked for which inputs, with what completion patterns) rather than *content space* (what makes a variant clinically defensible). Content-space reasoning is pathway-author territory, not personalization territory; the read-discipline boundary preserves the separation.

### 2.2 Sibling-projection discipline

The engine produces a fully-resolved `PTVariant` artifact ONCE at selection time — frozen, identity-versioned, serializable. All downstream surfaces (M7.2 in-session render, M6.9 insights, future operator-architect observability, future LMGS overlay) project from the same artifact. No surface re-runs pathway selection or phase logic.

### 2.3 Truth-state vs sensor-state separation

User-reported state at intake (`flare_sensitivity`, `baseline_intensity`, `irritability`) is *sensor* data — biased toward distress, mood-coloring, "I feel worse right now than I actually am" effect. Outcome data (session completion, return rate, post-session signals) is closer to *truth*.

`HistoryEntry` carries both vectors. M6.9 reads truth; never collapses the two. Variant *selection* runs on sensor_state at intake; M6.9 *refinement* runs on accumulated truth_state.

### 2.4 Selection vs variant partition

Intake dims partition into:

- **Selection-feeding** (drive WHICH pathway): `branch`, `location` / `location_pattern`, `session_length_preference`, `current_context`, `session_intent`, derived signals (`breathDowngraded`).
- **Variant-feeding** (drive content WITHIN pathway): `irritability`, `flare_sensitivity`, `baseline_intensity_band`.

Selection is total over the selection-feeding set; variant choice is total over the variant-feeding set. This partition is the load-bearing structural decision that bounds the v1 library to ~120 sessions (versus ~360+ if length were variant-feeding).

### 2.5 Curated catalog over rule-improvisation

Pathways and variants are **pre-written, pre-reviewed, and shipped as a fixed catalog** — not generated from rules at runtime. This is the load-bearing audit-trail discipline for a pre-Beta safety-critical product:

- "I can hand a clinical advisor the complete list of every session this product can produce" is a property M7.0 commits to preserving.
- The TYPE is C-agnostic (curated-catalog C1 internally; C2 template-and-slot-fill evolution preserved as a future option without rewriting types, selection function, render loop, or HistoryEntry).
- Authoring discipline: JSEer authors from PMID-grounded templates against the two-tier grounding contract; PT advisor reviews at M7.4 gate; 5-stage review process.

### 2.6 Two-tier grounding contract

- **Tier A (physiological claims)** REQUIRE direct primary-research citation (PMIDs — Shaffer & Meehan 2020 PMID 33117119, Laborde 2021 DOI 10.3390/su13147775, Meehan & Shaffer 2024 PMID 38507210, etc.). Each Tier A citation carries the PMID + source link + exact figure verbatim with units; never paraphrased numerics.
- **Tier B (clinical-reasoning claims)** REQUIRE a documented reasoning chain that terminates in Tier A primary research.

Grounding labels flow through projections; every consumer surface (render, history, M6.9, future LMGS) sees the labels alongside the content.

**Tier A authoring workflow.** Variant authoring consumes the structured PMID-grounding corpus at `the-muscle-pt/records/research/captured/` and `the-muscle-pt/records/research/mapped/` as the canonical Tier A source. The corpus is produced by THE MUSCLE PT's Research Mode — a 10-step closed loop with 3 operator gates per record producing a verified PMID + exact figure + L1 source capture, L2 insight extraction, and L3 system mapping. Where existing records cover a variant's claims, JSEer copies the PMID and references the L3 system mapping into `variant.grounding`. Where gaps exist (claims with no existing record), JSEer invokes Research Mode in a fresh THE MUSCLE PT chat session and walks the closed loop to produce a new record before the variant ships. New records land in THE MUSCLE PT corpus and become available to mediCalm by reference. Cross-portfolio integration is **instrumental tool use** (consume verified PMID outputs), not pattern transfer (mediCalm does not inherit THE MUSCLE PT's architecture). PMIDs are PubMed-verifiable independent of THE MUSCLE PT's stage. Integration mode is manual at M7.0/M7.1; mediCalm-side mirror reservable at M7.4+ if scope divergence surfaces.

**Ungrounded-claim disclosure.** When a variant's grounding chain has an unresolved gap during authoring (e.g., a Tier A claim with no PMID candidate yet, or a Tier B chain whose terminating citations don't yet resolve), the variant carries `review_status: 'draft'` and the gap is logged in the authoring trace. The variant cannot ship to production until grounding is complete; authoring discipline disclosure prevents silent gaps from surviving review. This is the analogous discipline to THE MUSCLE PT's HL-09 disclosure pattern, applied to mediCalm's authoring lifecycle.

### 2.7 Feasibility shaping discipline

Session-level total duration is **pre-resolved by pathway selection**, not by resolution-time rescaling. The chain is:

1. User expresses `session_length_preference`.
2. Selection table picks a `PTPathway` whose authored phase-budget matches that preference.
3. Resolution-time feasibility shapes per-phase content **within** the pre-budgeted total.

Resolution-time does NOT do session-level rescaling. If a chosen pathway can't fit its target preference for a given intake, that's a pathway-authoring or selection-table coverage error caught at M7.4 advisor review — not a runtime scaling decision. The pathway authoring contract becomes a clear constraint: authored phase durations must sum to a value feasible for every intake state mapping to this pathway in the selection table. This separation prevents a class of resolution-time bugs (e.g., proportional scaling shrinking a position_hold below its minimum effective duration just to make session length fit). I9 enforces the mass-balance side; this section makes the no-rescaling discipline explicit at the architectural level.

---

## 3. Type signatures

### 3.1 Identity primitives

```typescript
type PathwayId = string             // e.g., 'thoracic_restrictive_with_anxious_overlay'
type VariantId = string             // e.g., 'th-rest-anx-irrit-fast-flare-mod-int-low'
type TemplateId = string            // e.g., 'standard_5_count'
type SemVer = string                // e.g., '1.0.0'
type PMID = string                  // PubMed ID
type ISODate = string               // ISO 8601
```

### 3.2 Phase types (heterogeneous; Q2.A locked)

```typescript
type BreathPhase = {
  type: 'breath'
  breath_family: BreathFamilyName        // pure-from-family; no parameter override at M7.0
  num_cycles: number
  cue: { opening: string; mid?: string; closing: string }
  position_cue?: string
}

type PositionHoldPhase = {
  type: 'position_hold'
  position: PositionName
  duration_seconds: number
  breath_pattern: 'unstructured' | 'soft_natural'  // structured embedded patterns deferred to M7.5+
  cue: { opening: string; mid?: string; closing: string }
  entry_instruction: string
  exit_instruction: string
}

type TransitionPhase = {
  type: 'transition'
  subtype: 'intro' | 'between' | 'closing'
  template_id: TemplateId
  template_version: SemVer               // pinned in artifact
  subtitle?: string
  duration_seconds: 5                    // locked design intent
}

type Phase = BreathPhase | PositionHoldPhase | TransitionPhase
```

### 3.3 Grounding

```typescript
type TierACitation = {
  pmid: PMID
  source_link: string                    // PubMed URL or equivalent verifiable link
  exact_figure: string                   // verbatim, e.g., "RFB increased HF-HRV by 23%; resonance frequency 6 breaths/min ± 0.5"
  figure_units: string                   // captured separately for validation/audit
}

type ReasoningChain = {
  claim: string
  reasoning: string
  terminating_citations: PMID[]          // chain must terminate in Tier A; references TierACitation.pmid in own grounding or referenced corpus
}

type GroundingSummary = {
  tier_A_citations: TierACitation[]      // PMID + exact figure verbatim with units; never paraphrased numerics
  tier_B_reasoning_chains: ReasoningChain[]
}
```

The `TierACitation` shape mirrors THE MUSCLE PT's verifiability discipline (PMID + exact figure verbatim, never paraphrased) so that records produced by Research Mode in that corpus translate cleanly into mediCalm's grounding artifacts.

### 3.4 Selection criteria

```typescript
type PathwaySelectionCriteria = {
  branch: IntakeBranch[]                 // matched values
  location_pattern?: LocationPattern[]
  session_length_preference?: SessionLengthPreference[]
  current_context?: CurrentContext[]
  session_intent?: SessionIntent[]
  derived_signals?: { breathDowngraded?: boolean }
}
```

`PathwaySelectionCriteria` appears in two roles:

- On `PTPathway` — per-pathway documentation/advisor-review surface attached to the pathway artifact.
- Inside `SelectionTableRow.selection_state` — runtime lookup artifact the selection function consumes.

The two are derivable from each other; the sweep harness validates consistency at build time. Whether the selection table is hand-authored row-by-row or rule-generated from per-pathway criteria is a Q3-locked **authoring-mechanism** choice, deferred to M7.1 implementation. The **runtime artifact** (the resolved table) is fixed regardless.

### 3.5 PTPathway — clinical-concept entity

```typescript
type PTPathway = {
  pathway_id: PathwayId
  pathway_version: SemVer

  display_name: string
  clinical_summary: string               // for advisor review + audit

  selection_criteria: PathwaySelectionCriteria
  authored_duration_seconds: number      // pre-budgeted total

  grounding: GroundingSummary

  authored_by: string
  authored_at: ISODate
  reviewed_by?: string
  reviewed_at?: ISODate
  review_status: 'draft' | 'engineering_passed' | 'pt_advisor_passed' | 'locked'
}
```

### 3.6 PTVariant — the resolved artifact

```typescript
type PTVariant = {
  variant_id: VariantId
  variant_version: SemVer

  pathway_id: PathwayId                  // pinned reference to parent
  pathway_version: SemVer

  conditioning: {
    irritability: IrritabilityPattern
    flare_sensitivity: FlareSensitivity
    baseline_intensity_band: 'low' | 'moderate' | 'high'
  }

  phases: Phase[]                        // includes explicit intro + closing per Q5.B

  grounding?: GroundingSummary           // variant-specific where it differs from pathway-level

  authored_by: string
  authored_at: ISODate
  reviewed_by?: string
  reviewed_at?: ISODate
  review_status: 'draft' | 'engineering_passed' | 'pt_advisor_passed' | 'locked'
}

type ResolvedPathway = PTVariant         // alias — the durable cross-surface artifact
```

### 3.7 Selection table

```typescript
type SelectionTableRow = {
  selection_state: PathwaySelectionCriteria
  pathway_id: PathwayId
  pathway_version: SemVer
}

type SelectionTable = {
  table_version: SemVer
  rows: SelectionTableRow[]              // total over selection-feeding dim space
}
```

### 3.8 Function signatures

```typescript
type PathwaySelection = (
  intake_sensor_state: IntakeSensorState
) => { pathway_id: PathwayId; pathway_version: SemVer }

type VariantResolution = (
  pathway_id: PathwayId,
  conditioning: PTVariant['conditioning'],
  hints?: SelectionRefinements['variant_feeding_hints']
) => PTVariant
```

### 3.9 M6.9 artifacts (Class 3)

Per §2.1's M6.9 zero direct library access rule: M6.9 reads identifiers from `HistoryEntry.pathway_ref` only; no API exists to query the pathway library or template registry directly. The artifacts below are M6.9's write surface — none of them carries content references that would require library inspection to interpret.

```typescript
type SelectionRefinements = {
  generated_at: ISODate
  generation_version: SemVer
  variant_feeding_hints?: {
    irritability_truth_estimate?: IrritabilityPattern
    flare_sensitivity_truth_estimate?: FlareSensitivity
    baseline_intensity_pattern?: 'over_reports' | 'under_reports' | 'accurate'
  }
  confidence_threshold_met: boolean
}

type AggregateTruthState = {
  generation_version: SemVer             // identity-versioned
  generated_at: ISODate
  // M6.9-specific fields TBD at M7.3
}
```

### 3.10 HistoryEntry M7 additions

```typescript
type IntakeSensorState = {
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

type EffectiveIntakeState = Partial<IntakeSensorState>  // only fields where M6.9 refinements applied

type PhaseLogEntry = {
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

type TruthState = {
  completion_status?: 'complete' | 'aborted' | 'safety_stopped'        // M7.1 mechanically derived
  completion_percentage?: number                                       // M7.1 from phase_log
  pain_delta?: number                                                  // M7.1 from existing pain_before/pain_after
  state_coherence?: 'coherent' | 'mismatched' | 'unclear' | 'pending'  // M6.9 from M7.3+
  user_validation?: 'validated' | 'invalidated' | 'pending'            // M4.1 promoted
}

type HistoryEntryM7Additions = {
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
```

All M7 fields optional (`?`) so legacy records remain valid. `patternReader` and other consumers treat absence as "legacy session, M7-naïve."

---

## 4. Mutation classes (Q11 boundary enumeration)

### Class 1 — Contract-locked (no mutation from any layer)

- Intake safety gate (`safetyPrecheck`, HARI `safetyGate`)
- Resolution-time substrate invariant check (engineering-side)
- Resolution-time clinical safety check (clinical-side; reviewed at M7.4 but not runtime-mutable)
- Runtime safety monitoring (existing surfaces + phase-boundary checks)
- Selection function structural contract (pure function over sensor_state)
- Variant resolution function structural contract
- Frozen-artifact invariant
- Phase boundary transaction commit invariant
- HistoryEntry sensor-side fields: `intake_sensor_state`, `pathway_ref`, `phase_log` (complete entries), `effective_intake_state`, `refinement_context`
- HistoryEntry truth_state M7.1-mechanical fields: `completion_status`, `completion_percentage`, `pain_delta`
- One-way conservatism rule

### Class 2 — Identity-versioned content (immutable post-publish)

- Pathway library entries
- Variant library entries
- Template registry entries
- Selection table

### Class 3 — M6.9-mutable surfaces

- `HistoryEntry.truth_state.state_coherence` (per-session enrichment)
- `aggregate_truth_state` per-user artifact (identity-versioned)
- `selection_refinements` per-user artifact (identity-versioned)

### Class 4 — Future-LMGS-mutable surfaces (reserved at M7.5+/M8)

- Shape TBD; M7.0 reserves the conceptual surface only.
- Constraint: LMGS reads everything M6.9 reads plus M6.9's outputs; LMGS writes only to its own (Class 4) artifacts; LMGS does NOT mutate Class 1, Class 2, OR Class 3.

### Class 5 — User-mutable surfaces

- `BodyContext` (existing M4.1 layer)
- `AppSettings` (existing user preferences)
- `HistoryEntry.truth_state.user_validation` (M4.1 promoted)

### Boundary contract in one sentence

> Class 1 surfaces never mutate at runtime; Class 2 surfaces never mutate post-publish; Class 3 and Class 5 mutations are bounded to their named artifacts and cannot reach into Class 1 or Class 2; Class 4 is reserved for M7.5+/M8 with the same Class-1/Class-2/Class-3 inviolability.

### Phase log mutation discipline (Class 1 exception, narrowly defined)

`phase_log` entries are write-once for **complete** entries (entries with `completed_at` set). **Incomplete** entries (no `completed_at`) may be mutated exactly once by the orphan-sweep mechanism to set their closure fields. Once closed, the entry becomes Class 1 immutable. No other mutations permitted from any layer.

---

## 5. Substrate invariants (Q10)

### Pathway invariants
- **I1** — Every `PTPathway.selection_criteria` is non-empty.
- **I2** — Every `PTPathway` has ≥1 associated `PTVariant` in the registry.
- **I3** — `PTPathway.authored_duration_seconds > 0`.
- **I4** — `authored_duration_seconds` falls within the feasibility band for every selection state mapping to this pathway.

### Variant invariants
- **I5** — Every `PTVariant` references an existing `(pathway_id, pathway_version)` pair in the registry.
- **I6** — `phases.length >= 1`.
- **I7** — At least one phase has `type === 'breath'`.
- **I8** — Variant resolution totality: for every `PTPathway`, the authored variants totally cover the variant-feeding dim space — every `(irritability × flare_sensitivity × baseline_intensity_band)` combination resolves to exactly one variant.
- **I9** — Mass balance: `Σ phase.duration_seconds` equals `PTPathway.authored_duration_seconds` within tolerance (±5% at M7.0; revisited at M7.4).

### Phase invariants
- **I10** — Phase order is fixed at variant authoring; immutable post-publish.
- **I11** — `BreathPhase.breath_family` resolves to a known family in the breath family registry.
- **I12** — `PositionHoldPhase.position` resolves to a known position in the position registry.
- **I13** — `TransitionPhase.(template_id, template_version)` resolves to a known template version in the template registry.
- **I14** — `TransitionPhase.duration_seconds === 5`.

### Selection invariants
- **I15** — Selection table totality: every (selection-feeding dim) combination maps to exactly one `(pathway_id, pathway_version)`.
- **I16** — Selection function is deterministic and pure given the same intake.
- **I17** — Selection function consumes only `intake_sensor_state` (not `effective_intake_state` or refinement hints).

### Variant resolution invariants
- **I18** — Variant resolution function is deterministic given `(pathway_id, conditioning, refinement_hints?)`.
- **I19** — Refinement hints, when consulted, may only move toward more conservative on safety-relevant dims (`flare_sensitivity`, `baseline_intensity_band`); never less conservative.
- **I20** — Resolution always produces exactly one `PTVariant`.

### Frozen-artifact invariants
- **I21** — Once a `PTVariant` is selected for a session, the resolved artifact is immutable for the session's duration.
- **I22** — All references inside the artifact resolve at selection time and remain valid for the session.
- **I23** — `(pathway_id, pathway_version)` and `(variant_id, variant_version)` triples are immutable post-publish.

### Phase log invariants
- **I24** — Every phase entry creates a `PhaseLogEntry` with `started_at` populated.
- **I25** — Every complete phase has `completed_at` and `drop_off_reason` populated.
- **I26** — Orphan sweep guarantees no `PhaseLogEntry` remains incomplete after subsequent app-load or next-session-start.

### Safety invariants
- **I27** — Class 1 surfaces never mutate at runtime.
- **I28** — Class 2 surfaces never mutate post-publish; new versions added, old retained.
- **I29** — M6.9 refinements on safety-relevant dims are one-way conservative.

### Recovery invariants
- **I30** — Abort during a phase: session-end cleanup writes `drop_off_reason: 'user_aborted'` (if user explicitly stopped) or `'system_error'` (if abnormal termination), with `drop_off_reason_source: 'explicit'` or `'inferred_from_session_end'` respectively.
- **I31** — Safety-stop during phase: `PhaseLogEntry.drop_off_reason === 'safety_stopped'`, `drop_off_reason_source === 'explicit'`.
- **I32** — App crash bypassing session-end cleanup: orphan sweep at next app-load or next-session-start backfills with `drop_off_reason: 'system_error'`, `drop_off_reason_source: 'inferred_from_orphan_sweep'`.

### Grounding invariants
- **I33** — Every `PTPathway` and `PTVariant` has a non-null `grounding` field (variant `grounding` may be absent if it inherits cleanly from pathway-level).
- **I34** — Every Tier B reasoning chain's `terminating_citations` resolves to PMIDs present in the artifact's own `tier_A_citations` OR in a referenced source corpus declared at the registry level.
- **I35** — Every PMID in `tier_A_citations` is verifiable (PubMed ID format valid; reachable for citation-check at validation time).

### Partition / structural invariants
- **I36** — The selection function's input signature consumes ONLY selection-feeding dims. Variant-feeding dims affect ONLY the variant resolution function downstream of pathway selection.
- **I37** — All M7 schema additions to `HistoryEntry` are optional fields. Legacy `HistoryEntry` records (pre-M7.1) without M7 fields remain readable and processable by all M7+ consumers without error.
- **I38** — Every M7.1+ `HistoryEntry` for a session that reached pathway selection has `intake_sensor_state` populated.
- **I39** — Every M7.1+ `HistoryEntry` for a session that completed pathway selection has `pathway_ref` populated.
- **I40** — Every M7.1+ `HistoryEntry` for a session that began phase rendering has `phase_log` with ≥1 entry.

---

## 6. Validation suite

Four named test surfaces, CI-gated, each with concrete fail criteria.

### 6.1 Envelope sweep
- **What:** generates every (selection-feeding dim) combination; runs selection + variant resolution on each.
- **Asserts:** total coverage (every input produces exactly one resolved `PTVariant`), determinism (same input → same output across runs), no nulls, no orphans.
- **Regression check:** outputs compared to previous version's sweep; diffs reported as candidate regressions.
- **Runs:** every CI build; pre-release sign-off.

### 6.2 Mass balance
- **What:** for every `PTVariant` in the registry, sums `phase.duration_seconds`; compares to parent `PTPathway.authored_duration_seconds`.
- **Asserts:** sum within ±5% of authored duration (I9).
- **Runs:** every CI build; fails build on violation.

### 6.3 Recovery dynamics
- **What:** simulated runs of every variant with synthetic interruptions at every phase boundary (abort, safety-stop, system_error injection).
- **Asserts:** `PhaseLogEntry` created/closed correctly per I24-I26; `truth_state` populated correctly per Q6.1 timing annotations; orphan sweep recovers all simulated crashes.
- **Runs:** every CI build.

### 6.4 Safety regression
- **What:** for every (selection state × refinement context) combination, asserts:
  - (a) Resolved variant passes the resolution-time clinical safety check.
  - (b) One-way conservatism rule (I19 / I29) fires correctly when M6.9 hints would otherwise loosen safety on `flare_sensitivity` or `baseline_intensity_band`.
  - (c) Safety-stop routing fires on every safety-relevant trigger and writes correctly to `phase_log` per I31.
- **Runs:** every CI build; fails build on any violation.

---

## 7. Canonical scenarios

Nine named end-to-end scenarios constitute the regression contract. Milestone activation noted per scenario.

1. **Normal completion — anxious branch, standard length.** Intake `branch=anxious_or_overwhelmed, session_length_preference=standard`; expected variant of pathway `anxious_calm_downregulate_standard`; phase_log shows intro → breath → closing complete; `truth_state.completion_status='complete'`. Active M7.1+ (without intro/closing pre-M7.2).
2. **Normal completion — tightness branch, downgraded.** Intake with `flare_sensitivity=high`; routes through `breathDowngraded` selection signal; expected variant of `flare_safe_decompression`; phase_log clean. Active M7.1+.
3. **User aborts mid-breath-phase.** Session starts; user presses stop during breath phase; expected `drop_off_reason='user_aborted'`, `drop_off_reason_source='explicit'`; `truth_state.completion_status='aborted'`, `completion_percentage > 0`. Active M7.1+.
4. **Safety stopped during transition.** Runtime safety monitor fires during a `between` transition; expected `drop_off_reason='safety_stopped'`; session routes to safety_stop screen; HistoryEntry records partial state. Active M7.2+.
5. **App crash during position_hold.** Position_hold phase active; app crash simulated; on next app-load, orphan sweep finds incomplete entry; closes with `drop_off_reason='system_error'`, `drop_off_reason_source='inferred_from_orphan_sweep'`. Active M7.3+.
6. **Variant choice with M6.9 refinement applied.** User has accumulated history; `selection_refinements.confidence_threshold_met=true`; variant resolution consults hints, picks a different variant than raw sensor_state would suggest; HistoryEntry records both `intake_sensor_state` AND `effective_intake_state` AND `refinement_context.hints_consulted`. Active M7.3+.
7. **Tightness branch normal completion.** Intake `branch=tightness_or_pain, location=thoracic-restrictive pattern, session_length_preference=standard`; expected variant of pathway `thoracic_restrictive_with_anxious_overlay` (or analogous); phase_log shows intro → breath → closing; `truth_state.completion_status='complete', completion_percentage=1.0`. Active M7.1+.
8. **One-way conservatism firing.** User has accumulated history; `selection_refinements.variant_feeding_hints` includes `flare_sensitivity_truth_estimate: 'low'` while user's intake reports `flare_sensitivity: 'high'`; `confidence_threshold_met=true`. Expected: variant resolution applies the hint for non-safety dims but BLOCKS the loosening on `flare_sensitivity` (`effective_intake_state.flare_sensitivity` remains `'high'`); `HistoryEntry.refinement_context.hints_consulted` records the hint was offered but conservatism rule was enforced. Active M7.3+.
9. **User skips phase mid-session.** Session in progress; user invokes skip control during a position_hold phase; render advances to next phase; phase_log entry for skipped phase closes with `drop_off_reason: 'user_skipped'`, `drop_off_reason_source: 'explicit'`; `truth_state.completion_status='complete'` (skipping is not abort); `completion_percentage` reflects the skipped phase as completed-via-skip rather than completed-via-render. Active M7.3+.

---

## 8. Sub-milestone deliverables

### M7.1 — Substrate plumbing (no behavioral change)

**Ships:**
- All M7 type definitions in code (types from §3).
- Selection function and variant resolution function routing through new types.
- Selection table runtime artifact (authoring mechanism — row-by-row vs rule-generated — chosen at M7.1 implementation).
- Pathway library v0.1: today's 12 outputs migrated through partition analysis to ~8-10 pathways with 1-N variants each, exercising both halves of the substrate. Migrated set ships at `review_status: 'engineering_passed'`.
- HistoryEntry schema extensions (M7 fields optional; legacy preserved).
- Phase log writing for breath phase type (only active phase type at M7.1; position_hold + transitions wait for M7.2/M7.3).
- Orphan sweep mechanism (app-load + next-session-start, idempotent).
- truth_state mechanical fields populated; `state_coherence` remains `'pending'`.
- M6.9 artifact stubs: types defined; not yet generated.
- Tier A grounding workflow operational: variant authoring references THE MUSCLE PT corpus (`the-muscle-pt/records/research/captured/` + `mapped/`) where existing records cover the variant's claims; gaps trigger Research Mode invocation in a fresh THE MUSCLE PT chat (10-step closed loop with 3 operator gates, ~30-60 min per record at Pre-Alpha timing). Three baseline records (Shaffer & Meehan 2020 PMID 33117119, Laborde 2021 DOI 10.3390/su13147775, Meehan & Shaffer 2024 PMID 38507210) lock the breath-physiology Tier A floor; subsequent gaps resolved as authoring proceeds.

**Acceptance criteria:**
- Sweep diff against pre-M7.1 postfix sweep = zero (every selection state produces today's exact family/timing/duration).
- All M7 fields optional on HistoryEntry; legacy reads continue working.
- Substrate invariant check passes on every resolved variant.
- `review_status` is tracking-only (no runtime gate enforcement yet).

**Behavioral guarantee:** users see no change. Same intro length, same single-phase sessions, same cue copy.

### M7.2 — Heterogeneous phase rendering (UX upgrade)

**Ships:**
- Render loop handles breath + transition phase types (position_hold deferred to M7.3).
- Transition phase rendering with subtype-specific behavior (intro 5-count countdown, between narration, closing completion).
- Template registry initial population with versioning discipline.
- Lightweight typography styling per locked design intent.
- Pathway library v0.2: every variant gains explicit intro + closing transitions; breath phase content unchanged.
- Updated canonical scenarios test pass (multi-phase rendering scenarios green).
- Authored `PTPathway.authored_duration_seconds` adjusted to accommodate intro+closing (sessions effectively gain ~10 seconds at M7.2; intentional UX change).

**Acceptance criteria:**
- All M7.1 variants extended to include intro + closing transitions.
- Transition phase rendering passes recovery dynamics tests.
- Template registry has version-pinned references in every variant artifact.
- 5-count intro and 5s transitions visible to users for all sessions.

**Behavioral change:** session experience starts with 5-count intro, ends with closing narration, with smooth narrated transitions. Breath content within phases unchanged from M7.1.

### M7.3 — Mid-session controls + position_hold + M6.9 substrate

**Ships:**
- Position_hold phase type rendering.
- Mid-session user controls: pause, resume, skip phase. `user_skipped` drop_off_reason populated.
- M6.9 substrate landed: `selection_refinements` and `aggregate_truth_state` artifacts generated and written.
- M6.9 reads accumulated history; populates `state_coherence` per session at session-end.
- Selection function consults `selection_refinements.variant_feeding_hints` if `confidence_threshold_met`.
- Pathway library v0.3: variants may include position_hold phases for appropriate clinical contexts.
- One-way conservatism rule enforced at variant resolution (I19 / I29).

**Acceptance criteria:**
- Mid-session pause/resume/skip route through phase_log mechanism cleanly.
- M6.9 generation runs deterministically given same accumulated history.
- Refinement hints, when applied, never violate one-way conservatism (verified by Safety regression test).
- All HistoryEntry sessions from M7.3 onward carry `refinement_context` (even if `confidence_threshold_met = false`).

**Behavioral change:** users can pause/resume/skip; some sessions include position_hold phases; M6.9 begins influencing variant choice (within-pathway only).

### M7.4 — Pathway library expansion + PT advisor review lock

**Ships:**
- Pathway library v1.0: bucket-handle expansion family, coherent 5/5 family, integration phase templates.
- New pathways authored at M7.4 to use the expanded family/template set. Combined with the M7.1 migrated set (now reviewed), reaches the ~120-variant target.
- PT advisor review gate: all pathways and variants pass `review_status ∈ {'pt_advisor_passed', 'locked'}`.
- `review_status` flips from tracking-only to runtime render gate at M7.4: production rendering requires `review_status ∈ {'pt_advisor_passed', 'locked'}`.
- Validation suite final pass (all four named tests green).
- All canonical scenarios green.
- Public release lock.

**Acceptance criteria:**
- Every `PTPathway` and `PTVariant` in registry has `reviewed_by` and `reviewed_at` populated.
- No variant in production registry has `review_status = 'draft'` or `'engineering_passed'`.
- Validation suite green on every metric.

**Behavioral change:** library content richer; clinical defensibility validated by external review.

---

## 9. Out of scope (deferred to M7.5+ or beyond)

- **Bidirectional refinements on safety-relevant dims** (M6.9 may eventually loosen safety with strong confidence thresholds, post M8 with accumulated evidence).
- **Structured embedded breath patterns inside `position_hold` phases** (current options limited to `'unstructured' | 'soft_natural'`; embedded patterns deferred pending clinical evidence v1 needs them).
- **Parameter overrides on breath families** (variants get distinct breath behavior by selecting different families, not by overriding parameters; override surface deferred to M7.5+ with explicit grounding-chain extensions per override).
- **Movement / stretch phase types as new top-level types** (extensible at any future milestone without disturbing intro/closing/breath/position_hold).
- **Action-layer / "Your Next Move"** post-session forward action (future concern, M7.4 or M8; architectural surface reserved).
- **Clinical-realism roadmap document** (separate organizational artifact; optional future creation; M7.0 doesn't build).
- **Three-layer model formalization** (Knowledge / Orchestration / Strategic Control discipline maintained at M7.0 but not formally documented as a separate concern).
- **C2 template-and-slot-fill evolution** (TYPE designed to permit it; only locked C1 internally for M7.1; future evolution doesn't require rewriting types, selection function, render loop, or HistoryEntry).
- **Optional 3/5 step-down ratio** for users who can't sustain 9-second cycles (deferred pending PMID review of step-down evidence).
- **`PROTO_STABILIZE_BALANCE` 5/5 coherent practice reachability fix** as a standalone effort (absorbed into the M7.4 pathway library expansion).

---

## 10. Authority and references

### Locked decisions

The 12 design questions and their resolutions:

1. **Q1 — PTPathway type:** `PTVariant` is the resolved artifact every consumer projects from; `PTPathway` is the clinical-concept-level entity in the library. Both identity-versioned, immutable post-publish (§3.5, §3.6).
2. **Q2 — Phase types:** three types (`breath`, `position_hold`, `transition`) with `transition.subtype: 'intro' | 'between' | 'closing'`. Pure-from-family on breath; `'unstructured' | 'soft_natural'` on position_hold (§3.2).
3. **Q3 — Selection function:** Option B selection table as runtime artifact; authoring mechanism (row-by-row vs rule-generated) deferred to M7.1 implementation; sweep harness validates totality (§3.4, §3.7, §3.8).
4. **Q4 — Migration:** Q4.1 single-phase migration of today's 12 outputs at M7.1; multi-phase rendering at M7.2; partition analysis determines final pathway count (likely 8-10 pathways with 1-3 variants each).
5. **Q5 — Non-breath element placement:** Q5.B explicit intro/closing in phases array with template references (`template_id` + `template_version` pinned); template registry separate from pathway library (§3.2 transition, §3.5).
6. **Q6 — HistoryEntry schema:** Q6.1 reference-based with pinned versions; truth_state vs sensor_state separation; orphan sweep on app-load + next-session-start; closed `drop_off_reason` enum; M7.1-vs-M6.9 timing annotations (§3.10, I37-I40).
7. **Q7 — Safety / feasibility / ghost-state:** layered safety (intake gate + substrate invariant check + clinical safety check + runtime monitoring); per-phase feasibility at resolution; phase boundaries are transaction commit points; ghost-state backfill via session-end cleanup + orphan sweep (§5 I27-I32).
8. **Q8 — M6.9 integration surface:** zero direct library access (read everything M7 produces, never query libraries); writes to three artifacts; variant-only mutation; one-way conservatism on safety-relevant refinements; `refinement_context` in HistoryEntry (§3.9, §3.10, I19, I29).
9. **Q9 — Sub-milestone deliverables:** M7.1 substrate / M7.2 heterogeneous rendering / M7.3 controls + position_hold + M6.9 / M7.4 library expansion + PT advisor review lock (§8).
10. **Q10 — Substrate invariants:** 40 invariants enumerated (§5).
11. **Q11 — Safety-lock boundary:** five mutation classes; symmetric layered separation (§4).
12. **Q12 — Pathway grounding contract:** Tier A primary research / Tier B reasoning chain terminating in Tier A; uniform across pathways and templates (§2.6, §3.3, I33-I35).

### Parallel workstream

PT advisor sourcing opened 2026-05-05 — see `docs/advisor/2026-05-05-pt-advisor-scope.md`. Sub-1 of authoring discipline (A: solo author, advisor reviews at M7.4 gate) is the M7.0 contract; upgrade path to B (co-authoring) preserved if advisor relationship matures during M7.1–M7.3 (re-evaluate at M7.2 checkpoint).

### Branch state

- `main` (saved checkpoint, on origin): f5f1a02 — body-picker + intake wire-through + Scope A.
- `m7-pt-pathway-foundation` (current working branch): cut from `main`; M7.0 design doc commit will be the first commit on this branch.

### PMID grounding sources (Tier A baseline)

- Shaffer F, Meehan ZM. *A Practical Guide to Resonance Frequency Assessment for Heart Rate Variability Biofeedback*. Frontiers in Neuroscience. 2020 (PMID 33117119).
- Laborde S, et al. *Effects of Voluntary Slow Breathing on Heart Rate and Heart Rate Variability: A Systematic Review and a Meta-Analysis*. Sustainability 13(14):7775, 2021 (DOI 10.3390/su13147775).
- Meehan ZM, Shaffer F. *Resonance Frequency Breathing Reduces State Anxiety*. Applied Psychophysiology and Biofeedback. 2024 (PMID 38507210).

Additional citations land per-pathway and per-variant at M7.4 authoring.

### Cross-portfolio Tier A corpus

Authoritative source for Tier A grounding records: `the-muscle-pt/records/research/captured/` (L1 source capture) + `the-muscle-pt/records/research/mapped/` (L2 insight extraction + L3 system mapping). Records are produced by THE MUSCLE PT's Research Mode — a 10-step closed loop with 3 operator gates per record, producing PMID + exact figure verbatim with units. mediCalm consumes verified records by reference; Research Mode invocations happen in fresh THE MUSCLE PT chat sessions (separate working directory, separate context), not within mediCalm conversations. This is instrumental tool use across the portfolio, not pattern transfer.

---

## 11. Next moves

1. Spec self-review (placeholder scan / internal consistency / scope check / ambiguity check).
2. Commit M7.0 design doc on `m7-pt-pathway-foundation` branch.
3. PT advisor sourcing parallel workstream (per `docs/advisor/2026-05-05-pt-advisor-scope.md`) — JSEer-owned, agent-supportable on request.
4. M7.1 implementation plan via the writing-plans skill, breaking the M7.1 deliverables (§8) into TDD tasks.
5. M7.1 implementation begins.
