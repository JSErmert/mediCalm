# Doc 19 + Taxonomy Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `19_mechanism_protocol_mapping.md` as the authoritative mapping layer registered in the doc hierarchy, and expand `src/types/taxonomy.ts` to include all missing tags identified in that document — making the type system session-engine ready before M2 begins.

**Architecture:** Three independent changes: (1) a new markdown doc that formally registers the mechanism-to-protocol mapping as part of the MediCalm authority stack; (2) additive tag additions to the canonical TypeScript taxonomy (no renames, no deletions — preserves all existing tests); (3) a type union expansion in `src/types/index.ts` to cover all display modes defined in doc 14. No behaviour changes to any existing screen or component.

**Tech Stack:** TypeScript, Vitest, @testing-library/react — same stack as M1.

---

## Authority Notes

- `00_mediCalm_document_hierarchy_map.md` already registers `19_mechanism_protocol_mapping.md` — the file just does not exist yet.
- `14_mediCalm_input_taxonomy.md` is the canonical tag authority. `src/types/taxonomy.ts` must match it. This plan adds only the tags that are in doc 14 but absent from taxonomy.ts; it does not rename existing tags (that would break existing tests — scope for a separate refactor).
- `coordination_change` and `weakness` are symptom tags in doc 14, but they are also stop-condition signals. They belong in `SYMPTOM_TAGS` for user selection; the M2 engine handles escalation routing. They must carry a code comment marking their safety routing significance.
- `ProtocolDefinition.display_mode` in `src/types/index.ts` currently covers only 2 of the 5 modes defined in doc 14. Expanding it is a direct consequence of taxonomy alignment, not scope creep.

---

## Files

| Action | File | Responsibility |
|---|---|---|
| **Create** | `19_mechanism_protocol_mapping.md` | Authoritative mechanism → protocol mapping doc (registered in hierarchy map) |
| **Modify** | `src/types/taxonomy.ts` | Add 7 symptom tags + 5 location tags; add safety annotation comments |
| **Modify** | `src/types/index.ts` | Expand `display_mode` union in `ProtocolDefinition` and `RuntimeSession` to all 5 modes |
| **Create** | `src/types/taxonomy.test.ts` | Unit tests: verify all new tags are present in their respective arrays |

No changes to any screen, component, context, or storage file. PainInputScreen renders from `LOCATION_TAGS` and `SYMPTOM_TAGS` directly — new tags appear automatically.

---

## Task 1: Create `19_mechanism_protocol_mapping.md`

**Files:**
- Create: `19_mechanism_protocol_mapping.md` (project root, alongside other numbered docs)

This document formally registers the mechanism-to-protocol mapping as a system authority. It derives from `M2_MECHANISM_PROTOCOL_MAPPING_REFERENCE.md` but is reformatted as a numbered MediCalm doc (version header, no "M2" branding, lives in the permanent authority stack).

- [ ] **Step 1: Create the document**

Create `19_mechanism_protocol_mapping.md` in the project root (same directory as `13_mediCalm_protocol_library.md`, `14_mediCalm_input_taxonomy.md`, etc.) with this content:

```markdown
# MediCalm Mechanism + Protocol Mapping

Status: Draft
Owner: Josh
Version: v1
Authority: Registered in doc hierarchy (doc 00) under Mechanism and Protocol Concepts
Depends on: Source Truth Doctrine (doc 02), Knowledge + Protocol Doctrine (doc 03), Protocol Library (doc 13), Input Taxonomy (doc 14), Execution Spec (doc 04)

---

## Purpose

This document defines the authoritative mapping layer between user input patterns,
active mechanisms, and protocol candidates.

It is the primary reference for the M2 deterministic session engine when building:
- Mechanism Resolution Engine (doc 04 §3)
- Protocol Selection Engine (doc 04 §4)
- Sequencing guardrails
- Scoring weight tables

All mappings carry provenance labels per Source Truth Doctrine (doc 02).
No causal claims, no diagnostic framing. Patterns are generalized.

---

## Source Boundary Rule

This document uses clinical reference material as pattern reference only.
Patterns describe how symptoms tend to co-occur — not what is wrong with any individual.
MediCalm does not diagnose. All mappings inform comfort-guidance selection only.

---

## Pattern 1: Postural Compression + Bracing

**Generalized Description:**
Sustained sitting or vehicular postures create segmental compression in the thoracic and
lower cervical regions. Bracing behavior amplifies the compressive load and reduces
breathing variability. Symptoms increase with time in the triggering posture.
Position change and controlled exhalation provide partial or full relief.

**Active Mechanisms:**
| Mechanism | Role | Truth Basis |
|---|---|---|
| `MECH_POSTURAL_COMPRESSION` | Primary | MECH_004 |
| `MECH_RIB_RESTRICTION` | Secondary | MECH_001 |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Secondary | MECH_002 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `driving`
- `symptom_tags`: `tightness`, `pressure`, `burning`
- `location_tags`: `ribs`, `upper_back`, `back_neck`

**Protocol Candidates (ranked):**
1. `PROTO_SEATED_DECOMPRESSION_RESET` — primary; targets seated compression + bracing
2. `PROTO_RIB_EXPANSION_RESET` — secondary; addresses rib restriction once bracing releases

**Provenance:** `product_inference`, `design_decision`

---

## Pattern 2: Rib Restriction with Breathing Limitation

**Generalized Description:**
Restriction at the posterior rib region limits posterior-lateral expansion on inhalation.
Compensatory upper-chest breathing increases cervical and trap tension.
Relief is notable with guided rib expansion — confirming rib restriction as primary mechanism.

**Active Mechanisms:**
| Mechanism | Role | Truth Basis |
|---|---|---|
| `MECH_RIB_RESTRICTION` | Primary | MECH_001, INT_002 |
| `MECH_POSTURAL_COMPRESSION` | Co-active | MECH_004 |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Secondary | MECH_002, MECH_003 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `exercise`, `stress`, `overhead_movement`
- `symptom_tags`: `tightness`, `sharp_pain`, `pressure`, `aching`, `shallow_breathing`
- `location_tags`: `ribs`, `upper_back`

**Protocol Candidates (ranked):**
1. `PROTO_RIB_EXPANSION_RESET` — primary; always safe as entry when no safety blocks exist
2. `PROTO_SUPPORTED_FORWARD_LEAN_RESET` — useful when upright breathing effort is compromised

**Provenance:** `source_grounded` (INT_002 — Kisner/Colby/Borstad), `product_inference` for ordering

---

## Pattern 3: Cervical Guarding

**Generalized Description:**
Elevated cervical tone maintained as a protective response following sensitization or
sustained abnormal loading. Manifests as stiffness, reduced movement comfort, and increased
baseline tension. May persist via fear-avoidance beyond any acute event.
Frequently co-activates jaw and upper trap musculature.

**Active Mechanisms:**
| Mechanism | Role | Truth Basis |
|---|---|---|
| `MECH_CERVICAL_GUARDING` | Primary | MECH_002, INT_003 |
| `MECH_JAW_CERVICAL_CO_CONTRACTION` | Secondary | product_inference |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Secondary | MECH_003 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `stress`, `screen_use`, `driving`, `post_sleep`
- `symptom_tags`: `stiffness`, `tightness`, `aching`, `soreness`, `guarding`
- `location_tags`: `back_neck`, `front_neck`, `shoulders`

**Protocol Candidates (ranked):**
1. `PROTO_RIB_EXPANSION_RESET` — must precede cervical movement when rib restriction co-activates
2. `PROTO_GENTLE_CERVICAL_RECONNECTION` — targets cervical guarding after calming/decompression

**Critical Sequencing Rule:**
Rib restriction + cervical guarding → do NOT start with neck movement.
Rib expansion must succeed first. This is a blocking rule in the Protocol Selection Engine.

**Provenance:** `product_inference`, `validation_needed`

---

## Pattern 4: Mechanically Driven Nerve-Like Symptoms

**Generalized Description:**
Burning, tingling, radiating, or neuropathic-quality sensations that are position-triggered
or reproduced by bracing. May travel from thorax through cervical spine toward jaw or face.
These sensations do not necessarily indicate structural nerve damage — they may reflect
nervous system sensitization responding to mechanical inputs (Butler/Moseley framework).
Improves with controlled breathing, positional decompression, and reduced bracing.

**Active Mechanisms:**
| Mechanism | Role | Truth Basis |
|---|---|---|
| `MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION` | Primary | SYM_001, SYM_002 |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Co-active | MECH_003 |
| `MECH_POSTURAL_COMPRESSION` | Co-active | MECH_004 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `driving`, `post_sleep`, `stress`
- `symptom_tags`: `burning`, `tingling`, `numbness`, `nerve_like`, `radiating`
- `location_tags`: `ribs`, `upper_back`, `back_neck`, `front_neck`, `jaw`

**Protocol Candidates (ranked):**
1. `PROTO_BURNING_NERVE_CALM_RESET` — calm-first, breath-only; preferred when burning dominates
2. `PROTO_RIB_EXPANSION_RESET` — follow-up after acute burning settles

**Safety-Critical Distinction:**
- Burning with mechanical quality + positional relief → guided session appropriate
- Burning + `worsening_numbness` or `progressive_weakness` → SAFETY_STOP_MODE (absolute)

**Provenance:** `source_grounded` (SYM_001 — Butler/Moseley Explain Pain 2e), `product_inference` for protocol assignment

---

## Pattern 5: Jaw-Cervical Co-Contraction

**Generalized Description:**
Jaw clenching co-activates cervical and upper trap musculature through shared neuromuscular
pathways. In a guarding state, jaw and neck tension form a self-reinforcing loop.
May emerge as a downstream effect of postural compression, stress, or cervical sensitization.

**Active Mechanisms:**
| Mechanism | Role | Truth Basis |
|---|---|---|
| `MECH_JAW_CERVICAL_CO_CONTRACTION` | Primary | product_inference |
| `MECH_CERVICAL_GUARDING` | Co-active | MECH_002 |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Co-active | MECH_003 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `stress`, `driving`, `eating`
- `symptom_tags`: `tightness`, `aching`, `soreness`, `pressure`
- `location_tags`: `jaw`, `front_neck`, `back_neck`

**Protocol Candidates (ranked):**
1. `PROTO_JAW_UNCLENCH_RESET` — entry when jaw is the primary complaint
2. `PROTO_RIB_EXPANSION_RESET` — follow-up; addresses co-active cervical and rib components

**Blocked Sequence:**
Jaw tension flare → do NOT follow with forceful cervical protocol.

**Provenance:** `product_inference`, `design_decision`

---

## Pattern 6: Generalized Overprotection / Diffuse Flare

**Generalized Description:**
Multiple regions simultaneously symptomatic. Presentation is widespread rather than locally
isolated. Sensitization mechanism (MECH_003) is dominant. Entry must be calm-first,
non-movement. Movement protocols are contraindicated as starting points.

**Active Mechanisms:**
| Mechanism | Role | Truth Basis |
|---|---|---|
| `MECH_GENERAL_OVERPROTECTION_STATE` | Primary | MECH_003 |
| All others | Potentially co-active | — |

**Tag Mapping:**
- `trigger_tags`: `stress`, `post_sleep`, `sitting`, `driving`
- `symptom_tags`: `burning`, `tightness`, `pressure`, `aching`, `shallow_breathing`
- `location_tags`: multiple — any combination of `ribs`, `back_neck`, `front_neck`, `upper_back`, `jaw`

**Protocol Candidates (ranked):**
1. `PROTO_RIB_EXPANSION_RESET` — universal calm-first entry; targets overprotection broadly
2. `PROTO_BURNING_NERVE_CALM_RESET` — preferred when burning is dominant in the flare

**Severity Band Rule (doc 04):**
- `pain_level >= 7`: prefer breath-only or breath-with-body-cue; micro-movement only if doctrine supports
- `pain_level >= 9`: flare-calming/breath-first only; block follow-up movement

**Provenance:** `product_inference`

---

## Compression Cascade Pattern

Patterns 1–6 may co-present in a cascade sequence:

1. Postural compression develops (sitting, driving)
2. Rib restriction increases as compression limits expansion
3. Cervical musculature compensates for altered breathing distribution
4. Cervical guarding co-activates jaw tension
5. Sensitization amplifies outputs — burning, nerve-like, diffuse tightness
6. System enters General Overprotection State

**Cascade Tag Signature:**
`sitting` or `driving` + `tightness` + `burning` + (`ribs` or `upper_back`) + (`back_neck` or `jaw`)
→ cascade pattern; prioritize `PROTO_SEATED_DECOMPRESSION_RESET` or `PROTO_RIB_EXPANSION_RESET`
as entry regardless of which region is reported as most prominent.

---

## Mechanism Score Weight Table

For the Mechanism Resolution Engine (doc 04 §3). All weights are additive per the
weight template in doc 04.

| Input Tag | Mechanism Boosted | Weight Type |
|---|---|---|
| `trigger = sitting` | MECH_POSTURAL_COMPRESSION | trigger_match |
| `trigger = driving` | MECH_POSTURAL_COMPRESSION, MECH_GENERAL_OVERPROTECTION_STATE | trigger_match |
| `trigger = stress` | MECH_GENERAL_OVERPROTECTION_STATE, MECH_JAW_CERVICAL_CO_CONTRACTION | trigger_match |
| `location = ribs` | MECH_RIB_RESTRICTION, MECH_POSTURAL_COMPRESSION | location_match |
| `location = upper_back` | MECH_RIB_RESTRICTION, MECH_POSTURAL_COMPRESSION | location_match |
| `location = mid_back` | MECH_RIB_RESTRICTION | location_match |
| `location = back_neck` | MECH_CERVICAL_GUARDING | location_match |
| `location = front_neck` | MECH_CERVICAL_GUARDING, MECH_JAW_CERVICAL_CO_CONTRACTION | location_match |
| `location = jaw` | MECH_JAW_CERVICAL_CO_CONTRACTION | location_match |
| `location = ear` | MECH_JAW_CERVICAL_CO_CONTRACTION | location_match |
| `location = throat` | MECH_CERVICAL_GUARDING | location_match |
| `location = arm` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | location_match |
| `location = hand` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | location_match (also safety flag) |
| `symptom = burning` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION, MECH_GENERAL_OVERPROTECTION_STATE | symptom_match |
| `symptom = tingling` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | symptom_match |
| `symptom = nerve_like` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | symptom_match (strong) |
| `symptom = radiating` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | symptom_match (strong) |
| `symptom = tightness` | MECH_POSTURAL_COMPRESSION, MECH_RIB_RESTRICTION, MECH_CERVICAL_GUARDING | symptom_match |
| `symptom = stiffness` | MECH_CERVICAL_GUARDING | symptom_match |
| `symptom = pressure` | MECH_POSTURAL_COMPRESSION | symptom_match |
| `symptom = shallow_breathing` | MECH_RIB_RESTRICTION | symptom_match (strong signal) |
| `symptom = guarding` | MECH_CERVICAL_GUARDING, MECH_GENERAL_OVERPROTECTION_STATE | symptom_match |
| `symptom = instability` | MECH_GENERAL_OVERPROTECTION_STATE | symptom_match |
| `symptom = coordination_change` | MECH_GENERAL_OVERPROTECTION_STATE | safety routing (M2) |
| `symptom = weakness` | MECH_GENERAL_OVERPROTECTION_STATE | safety routing (M2) |

---

## Protocol Entry Decision Matrix

| Top Mechanism | Severity Band | Preferred Entry Protocol | Notes |
|---|---|---|---|
| MECH_POSTURAL_COMPRESSION | any | PROTO_SEATED_DECOMPRESSION_RESET | preferred for sitting/driving trigger |
| MECH_RIB_RESTRICTION | any | PROTO_RIB_EXPANSION_RESET | always safe entry |
| MECH_RIB_RESTRICTION + MECH_CERVICAL_GUARDING | any | PROTO_RIB_EXPANSION_RESET | block cervical start |
| MECH_CERVICAL_GUARDING alone | low/moderate | PROTO_GENTLE_CERVICAL_RECONNECTION | only when rib restriction not co-active |
| MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | any | PROTO_BURNING_NERVE_CALM_RESET | breath-only; no movement |
| MECH_JAW_CERVICAL_CO_CONTRACTION | any | PROTO_JAW_UNCLENCH_RESET | follow with rib expansion |
| MECH_GENERAL_OVERPROTECTION_STATE | high/very_high | PROTO_RIB_EXPANSION_RESET or PROTO_BURNING_NERVE_CALM_RESET | burning = nerve calm; tightness = rib expansion |
| MECH_POSTURAL_COMPRESSION + MECH_CERVICAL_GUARDING | high/very_high | PROTO_SEATED_DECOMPRESSION_RESET | decompression before precision |

---

## Sequencing Guardrails

Blocking rules for the Protocol Selection Engine (doc 04 §4):

| Condition | Rule |
|---|---|
| MECH_RIB_RESTRICTION co-active with MECH_CERVICAL_GUARDING | Block cervical movement as first protocol; require rib expansion entry |
| `burning` or `nerve_like` as primary symptom | Block movement protocols as entry; calm-first only |
| After PROTO_BURNING_NERVE_CALM_RESET | Do not follow with strong loading or movement protocol |
| After PROTO_JAW_UNCLENCH_RESET | Do not follow with forceful cervical protocol; prefer rib expansion |
| `pain_level >= 7` | Block precision/movement protocols as entry; prefer breath-with-body-cue or breath-only |
| `pain_level >= 9` | Flare-calming or breath-first only; block follow-up movement |
| Any immediate escalation tag present | SAFETY_STOP_MODE — engine does not run |

---

## Source Boundary Compliance

- No causal claims about specific injuries or diagnoses
- No prediction of individual outcomes
- No treatment prescription — guidance framing only
- Burning addressed as nervous system sensitization state, not nerve damage (SYM_001)
- All protocols remain calm-first and non-diagnostic
- Movement protocols blocked at high severity per doc 04 movement restriction rules
- Escalation tags (`worsening_numbness`, `progressive_weakness`, `new_weakness`,
  `coordination_change`, `hand_dysfunction`) route unconditionally to SAFETY_STOP_MODE
- Provenance labels maintained; none upgraded without explicit source citation
```

- [ ] **Step 2: Verify file exists in the right location**

```bash
ls 19_mechanism_protocol_mapping.md
```

Expected: file listed (no error).

- [ ] **Step 3: Commit**

```bash
git add 19_mechanism_protocol_mapping.md
git commit -m "docs: add 19_mechanism_protocol_mapping.md as authoritative mapping layer"
```

---

## Task 2: Add Missing Symptom Tags — TDD

**Files:**
- Create: `src/types/taxonomy.test.ts`
- Modify: `src/types/taxonomy.ts`

The following symptom tags are in `14_mediCalm_input_taxonomy.md` and referenced in `19_mechanism_protocol_mapping.md` but absent from `SYMPTOM_TAGS`:
- `nerve_like` — neuropathic/tingling quality; strong signal for MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION
- `radiating` — spreading sensation; strong signal for nerve irritation
- `guarding` — active muscle protection; signals MECH_CERVICAL_GUARDING and MECH_GENERAL_OVERPROTECTION_STATE
- `shallow_breathing` — breathing restriction; strong signal for MECH_RIB_RESTRICTION
- `instability` — sense of joint or positional instability; signals MECH_GENERAL_OVERPROTECTION_STATE
- `coordination_change` — altered motor coordination; symptom tag AND safety routing signal in M2
- `weakness` — loss of strength; symptom tag AND safety routing signal in M2

Note: `tingling` remains in SYMPTOM_TAGS — it is a valid user-facing term. Doc 14 maps `tingling → nerve_like` for free-text normalization, but as a UI tag it stays. `nerve_like` is added alongside it.

- [ ] **Step 1: Write the failing tests**

Create `src/types/taxonomy.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { SYMPTOM_TAGS, LOCATION_TAGS } from './taxonomy'

describe('SYMPTOM_TAGS', () => {
  it('includes nerve_like', () => {
    expect(SYMPTOM_TAGS).toContain('nerve_like')
  })

  it('includes radiating', () => {
    expect(SYMPTOM_TAGS).toContain('radiating')
  })

  it('includes guarding', () => {
    expect(SYMPTOM_TAGS).toContain('guarding')
  })

  it('includes shallow_breathing', () => {
    expect(SYMPTOM_TAGS).toContain('shallow_breathing')
  })

  it('includes instability', () => {
    expect(SYMPTOM_TAGS).toContain('instability')
  })

  it('includes coordination_change', () => {
    expect(SYMPTOM_TAGS).toContain('coordination_change')
  })

  it('includes weakness', () => {
    expect(SYMPTOM_TAGS).toContain('weakness')
  })

  it('retains all original tags', () => {
    const original = [
      'burning', 'tightness', 'pressure', 'sharp', 'throbbing',
      'soreness', 'aching', 'stiffness', 'numbness', 'tingling',
    ]
    for (const tag of original) {
      expect(SYMPTOM_TAGS).toContain(tag)
    }
  })
})

describe('LOCATION_TAGS', () => {
  it('includes ear', () => {
    expect(LOCATION_TAGS).toContain('ear')
  })

  it('includes throat', () => {
    expect(LOCATION_TAGS).toContain('throat')
  })

  it('includes mid_back', () => {
    expect(LOCATION_TAGS).toContain('mid_back')
  })

  it('includes arm', () => {
    expect(LOCATION_TAGS).toContain('arm')
  })

  it('includes hand', () => {
    expect(LOCATION_TAGS).toContain('hand')
  })

  it('retains all original location tags', () => {
    const original = [
      'front_neck', 'back_neck', 'jaw', 'ribs', 'upper_back',
      'shoulders', 'chest', 'lower_back', 'hips', 'head',
    ]
    for (const tag of original) {
      expect(LOCATION_TAGS).toContain(tag)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/types/taxonomy.test.ts
```

Expected: 12 FAIL — `nerve_like`, `radiating`, `guarding`, `shallow_breathing`, `instability`, `coordination_change`, `weakness` not in SYMPTOM_TAGS; `ear`, `throat`, `mid_back`, `arm`, `hand` not in LOCATION_TAGS. The 2 "retains original" tests should PASS.

- [ ] **Step 3: Add missing symptom tags to taxonomy.ts**

In `src/types/taxonomy.ts`, update the `SYMPTOM_TAGS` array. Replace:

```typescript
export const SYMPTOM_TAGS = [
  'burning',
  'tightness',
  'pressure',
  'sharp',
  'throbbing',
  'soreness',
  'aching',
  'stiffness',
  'numbness',
  'tingling',
] as const
```

With:

```typescript
export const SYMPTOM_TAGS = [
  // ── Sensory quality ──────────────────────────────────────────────────────────
  'burning',
  'tingling',
  'numbness',
  'nerve_like',      // neuropathic / electrical quality; strong → MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION
  'radiating',       // spreading / traveling sensation; strong → MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION
  'sharp',
  'throbbing',
  // ── Musculoskeletal quality ───────────────────────────────────────────────────
  'tightness',
  'pressure',
  'soreness',
  'aching',
  'stiffness',
  // ── Functional / state quality ───────────────────────────────────────────────
  'shallow_breathing',    // breathing restriction; strong → MECH_RIB_RESTRICTION
  'guarding',             // active muscle protection; → MECH_CERVICAL_GUARDING, MECH_GENERAL_OVERPROTECTION_STATE
  'instability',          // sense of positional instability; → MECH_GENERAL_OVERPROTECTION_STATE
  // ── Safety-adjacent — present as symptom tags; M2 engine handles escalation routing ──
  'coordination_change',  // altered motor coordination; may route to SAFETY_STOP_MODE in M2
  'weakness',             // loss of strength; may route to SAFETY_STOP_MODE in M2
] as const
```

- [ ] **Step 4: Add missing location tags to taxonomy.ts**

In `src/types/taxonomy.ts`, update the `LOCATION_TAGS` array. Replace:

```typescript
export const LOCATION_TAGS = [
  'front_neck',
  'back_neck',
  'jaw',
  'ribs',
  'upper_back',
  'shoulders',
  'chest',
  'lower_back',
  'hips',
  'head',
] as const
```

With:

```typescript
export const LOCATION_TAGS = [
  // ── Head + jaw region ────────────────────────────────────────────────────────
  'head',
  'jaw',
  'ear',             // jaw-cervical co-contraction territory; → MECH_JAW_CERVICAL_CO_CONTRACTION
  // ── Neck region ──────────────────────────────────────────────────────────────
  'front_neck',
  'back_neck',
  'throat',          // anterior cervical; → MECH_CERVICAL_GUARDING
  // ── Shoulder + upper body ────────────────────────────────────────────────────
  'shoulders',
  'chest',
  'upper_back',
  'ribs',
  'mid_back',        // thoracic/costovertebral region; → MECH_RIB_RESTRICTION
  // ── Lower body ───────────────────────────────────────────────────────────────
  'lower_back',
  'hips',
  // ── Extremities — also safety-routing candidates for radiating/nerve patterns ─
  'arm',             // radiating territory; → MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION
  'hand',            // distal radiating; also triggers hand_dysfunction safety precheck in M2
] as const
```

- [ ] **Step 5: Run symptom and location tag tests — verify they all pass**

```bash
npx vitest run src/types/taxonomy.test.ts
```

Expected: all 14 tests PASS.

- [ ] **Step 6: Run the full test suite to verify no regressions**

```bash
npx vitest run
```

Expected: all existing tests still pass. New tags are additive — no existing tag names change.

- [ ] **Step 7: Commit**

```bash
git add src/types/taxonomy.ts src/types/taxonomy.test.ts
git commit -m "feat: add missing symptom and location tags per doc 14 and mapping reference"
```

---

## Task 3: Expand display_mode Union in src/types/index.ts

**Files:**
- Modify: `src/types/index.ts:150-163` (ProtocolDefinition) and `:67-83` (RuntimeSession)

Doc 14 defines 5 display modes. `ProtocolDefinition.display_mode` and `RuntimeSession.display_mode` currently cover only 2. Expanding them now prevents type errors when the M2 engine populates the protocol data objects.

Display modes per `14_mediCalm_input_taxonomy.md`:
- `breath_only`
- `breath_with_body_cue`
- `breath_with_posture_cue`
- `breath_with_micro_movement`
- `position_with_breath`

- [ ] **Step 1: Write the failing test**

Add to `src/types/taxonomy.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

// All 5 display modes from doc 14 must be representable as string literals.
// This is a compile-time type test — we verify via the union type being exhaustible.
// Runtime: just confirm the string values are what we expect.
describe('display mode values', () => {
  it('lists all 5 doc-14 display modes', () => {
    const modes = [
      'breath_only',
      'breath_with_body_cue',
      'breath_with_posture_cue',
      'breath_with_micro_movement',
      'position_with_breath',
    ]
    // All 5 are non-empty strings
    expect(modes).toHaveLength(5)
    for (const m of modes) {
      expect(typeof m).toBe('string')
      expect(m.length).toBeGreaterThan(0)
    }
  })
})
```

Note: This test is intentionally minimal — the type change is compile-time. The test is a placeholder that passes immediately. The real verification is that the TypeScript compiler accepts all 5 values after the change. If needed, run `npx tsc --noEmit` as the actual validation.

- [ ] **Step 2: Update ProtocolDefinition.display_mode in src/types/index.ts**

Locate this block (around line 149–163):

```typescript
export interface ProtocolDefinition {
  protocol_id: string
  protocol_name: string
  goal: string
  primary_mechanisms: string[]
  display_mode: 'breath_with_body_cue' | 'breath_only'
  default_timing_profile: TimingProfile
  ...
}
```

Replace only the `display_mode` line:

```typescript
  display_mode: 'breath_only' | 'breath_with_body_cue' | 'breath_with_posture_cue' | 'breath_with_micro_movement' | 'position_with_breath'
```

- [ ] **Step 3: Update RuntimeSession.display_mode in src/types/index.ts**

Locate this block (around line 67–83):

```typescript
export interface RuntimeSession {
  ...
  display_mode: 'breath_with_body_cue' | 'breath_only'
  ...
}
```

Replace only the `display_mode` line:

```typescript
  display_mode: 'breath_only' | 'breath_with_body_cue' | 'breath_with_posture_cue' | 'breath_with_micro_movement' | 'position_with_breath'
```

- [ ] **Step 4: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/types/taxonomy.test.ts
git commit -m "feat: expand display_mode union to cover all 5 modes per doc 14"
```

---

## Verification Checklist

Before declaring this plan complete, confirm:

- [ ] `19_mechanism_protocol_mapping.md` exists at project root (same level as other numbered docs)
- [ ] `00_mediCalm_document_hierarchy_map.md` already references it at position 20 — no edit needed
- [ ] `SYMPTOM_TAGS` contains: `nerve_like`, `radiating`, `guarding`, `shallow_breathing`, `instability`, `coordination_change`, `weakness`
- [ ] `LOCATION_TAGS` contains: `ear`, `throat`, `mid_back`, `arm`, `hand`
- [ ] `coordination_change` and `weakness` have code comments noting their safety routing significance
- [ ] `ProtocolDefinition.display_mode` covers all 5 modes from doc 14
- [ ] `RuntimeSession.display_mode` covers all 5 modes from doc 14
- [ ] `npx vitest run` → all tests pass (zero regressions)
- [ ] `npx tsc --noEmit` → zero TypeScript errors
