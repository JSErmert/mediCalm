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
- `symptom_tags`: `tightness`, `sharp`, `pressure`, `aching`, `shallow_breathing`
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
