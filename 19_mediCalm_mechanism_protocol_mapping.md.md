# MediCalm M2: Mechanism + Protocol Mapping Reference

Status: Draft
Owner: Josh
Version: v1
Purpose: Generalized pattern extraction mapped to the MediCalm mechanism and protocol system. Input for M2 engine implementation.

---

## Framing and Source Boundaries

This document extracts recurring mechanical patterns from reference material and maps them to the existing MediCalm mechanism registry and protocol library.

**Patterns are generalized.** No individual case is referenced, attributed, or treated as diagnostic authority. Patterns represent clinically plausible input clusters — they describe how symptoms tend to co-occur, not what is wrong with any person.

**MediCalm does not diagnose.** These mappings inform comfort-guidance selection only. All behavior remains within source-boundary doctrine (doc 02) and safety rules (doc 06).

Every mapping in this document carries explicit provenance labels per the four-label system: `source_grounded`, `product_inference`, `design_decision`, `validation_needed`.

---

## Pattern 1: Postural Compression + Bracing

**Generalized Description:**
Sustained sitting or vehicular postures create segmental compression in the thoracic and lower cervical regions. Bracing behavior — active muscle contraction in response to perceived instability or anticipated movement — amplifies the compressive load and reduces breathing variability. Symptoms tend to increase with time in the triggering posture and include tightness, pressure, and burning with mechanical quality. Position change and controlled exhalation provide partial or full relief, confirming a mechanical rather than spontaneous driver.

**Active Mechanism IDs:**
| Mechanism | Role | Basis |
|---|---|---|
| `MECH_POSTURAL_COMPRESSION` | Primary | MECH_004 — sustained posture reduces movement variability and increases surrounding tension |
| `MECH_RIB_RESTRICTION` | Secondary — compression limits rib mobility | MECH_001 — reduced posterior-lateral expansion increases accessory breathing |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Secondary — bracing activates global guarding | MECH_002 — guarding as protective response to perceived instability |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `driving`
- `symptom_tags`: `tightness`, `pressure`, `burning`
- `location_tags`: `ribs`, `upper_back`, `back_neck`

**Protocol Candidates (ranked):**
1. `PROTO_SEATED_DECOMPRESSION_RESET` — directly targets seated compression + bracing without forcing posture correction; preferred for driving-triggered or prolonged-sitting flares
2. `PROTO_RIB_EXPANSION_RESET` — secondary entry; addresses rib restriction after bracing begins to release; also valid as sole entry if rib pattern dominates over global compression

**Scoring Implications for M2 Engine:**
When `trigger_tag = driving` or `sitting` AND `location_tags` includes `ribs` or `upper_back`: boost `MECH_POSTURAL_COMPRESSION` by trigger_match weight. If `symptom_tags` includes `tightness` + `pressure`: boost `MECH_RIB_RESTRICTION` by symptom_match weight.

**Provenance:** `product_inference` — consistent with MECH_004 (Kisner et al. postural load principles), `design_decision` for protocol ranking

---

## Pattern 2: Rib Restriction with Breathing Limitation

**Generalized Description:**
Restriction at the costovertebral and posterior rib region limits posterior-lateral expansion during inhalation. The resulting compensatory pattern shifts effort to upper chest and accessory neck muscles, increasing cervical and trap tension. Pain may be present with breathing, with certain movement planes, or at rest with a deep-ache quality. Guided rib expansion exercises produce notable relief, validating rib restriction as the primary active mechanism. This pattern frequently co-occurs with postural compression but can be present without sitting as a trigger.

**Active Mechanism IDs:**
| Mechanism | Role | Basis |
|---|---|---|
| `MECH_RIB_RESTRICTION` | Primary | MECH_001 — reduced posterior-lateral expansion and accessory breathing compensations |
| `MECH_POSTURAL_COMPRESSION` | Co-active — compression narrows rib space | MECH_004 |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Secondary — pain with breathing can generate fear of breathing | MECH_002, MECH_003 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `exercise`, `stress`, `overhead_movement`
- `symptom_tags`: `tightness`, `sharp`, `pressure`, `aching`, `shallow_breathing`
- `location_tags`: `ribs`, `upper_back`

**Protocol Candidates (ranked):**
1. `PROTO_RIB_EXPANSION_RESET` — primary target mechanism; preferred calm-first entry when rib restriction dominates; always safe as entry when no safety blocks exist
2. `PROTO_SUPPORTED_FORWARD_LEAN_RESET` — creates posterior rib space by shifting support to back body; useful when upright breathing effort is compromised

**Scoring Implications for M2 Engine:**
`location_tags` includes `ribs` OR `upper_back` → boost `MECH_RIB_RESTRICTION`. `symptom_tags` includes `shallow_breathing` → strong boost to `MECH_RIB_RESTRICTION`; also flag for breathing-distribution restoration priority (per doc 03 Priority Order rule 3).

**Provenance:** `source_grounded` — INT_002 (Kisner/Colby/Borstad — rib expansion reduces compensatory neck tension); `product_inference` for protocol ordering

---

## Pattern 3: Cervical Guarding

**Generalized Description:**
Following a sensitizing cervical event or sustained abnormal loading, the cervical musculature maintains elevated tone as a protective response. This manifests as stiffness, reduced movement comfort, and increased baseline tension. Guarding may persist beyond the resolution of any acute event, maintained by fear-avoidance and altered motor programs. It frequently co-activates jaw and upper trap musculature. Reintroducing movement must be gentle, non-threatening, and always preceded by decompression and breathing normalization per the mechanism sequencing rules in doc 03.

**Active Mechanism IDs:**
| Mechanism | Role | Basis |
|---|---|---|
| `MECH_CERVICAL_GUARDING` | Primary | MECH_002 — persistent guarding as protective response; INT_003 — gentle movement reduces guarding |
| `MECH_JAW_CERVICAL_CO_CONTRACTION` | Secondary — cervical guarding drives jaw bracing | product_inference |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Secondary — broader sensitization amplifies regional guarding | MECH_003 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `stress`, `screen_use`, `driving`, `post_sleep`
- `symptom_tags`: `stiffness`, `tightness`, `aching`, `soreness`, `guarding`
- `location_tags`: `back_neck`, `front_neck`, `shoulders`

**Protocol Candidates (ranked):**
1. `PROTO_RIB_EXPANSION_RESET` — must come first when rib restriction co-activates (doc 03 sequencing rule: rib restriction + cervical guarding → rib expansion before neck movement)
2. `PROTO_GENTLE_CERVICAL_RECONNECTION` — specifically targets cervical guarding with low-threat micro-movement; safe only after calming/decompression step

**Critical Sequencing Rule (from doc 03):**
Rib restriction + cervical guarding → do NOT start with neck movement unless rib expansion succeeds first. M2 engine must implement this as a sequencing block.

**Scoring Implications for M2 Engine:**
`location_tags` includes `back_neck` or `front_neck` → boost `MECH_CERVICAL_GUARDING`. `symptom_tags` includes `stiffness` → additional boost. If `MECH_RIB_RESTRICTION` also scores above threshold: block `PROTO_GENTLE_CERVICAL_RECONNECTION` as first selection; prefer `PROTO_RIB_EXPANSION_RESET` as entry with cervical as follow-up.

**Provenance:** `product_inference`, `validation_needed` — consistent with INT_003 and MECH_002 but sequencing logic is system design

---

## Pattern 4: Mechanically Driven Nerve-Like Symptoms

**Generalized Description:**
Burning, tingling, radiating, or neuropathic-quality sensations that are position-triggered, posture-dependent, or reproduced by bracing and compression. These sensations may travel from one region to adjacent regions — thorax upward through cervical spine, potentially toward jaw or face. They do not necessarily indicate structural nerve damage. Per Butler/Moseley, sensitization of the nervous system can produce neuropathic-quality outputs in response to mechanical inputs and perceived threat. Symptom quality improves with controlled breathing, positional decompression, and reduction in overall bracing — consistent with a threat-modulation mechanism rather than direct tissue injury.

**Active Mechanism IDs:**
| Mechanism | Role | Basis |
|---|---|---|
| `MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION` | Primary | SYM_001 — burning/spreading may reflect sensitization rather than direct injury; SYM_002 — position/breathing sensitivity indicates mechanical factors |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Co-active — sensitization amplifies outputs; system is in threat-upregulated state | MECH_003 |
| `MECH_POSTURAL_COMPRESSION` | Co-active — compression is often the mechanical trigger | MECH_004 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `driving`, `post_sleep`, `stress`
- `symptom_tags`: `burning`, `tingling`, `numbness`, `nerve_like`, `radiating`
- `location_tags`: `ribs`, `upper_back`, `back_neck`, `front_neck`, `jaw`

**Protocol Candidates (ranked):**
1. `PROTO_BURNING_NERVE_CALM_RESET` — calm-first, breath-only mode; no movement; targets overprotection and sensitization; explicitly preferred when burning or nerve-like quality is dominant
2. `PROTO_RIB_EXPANSION_RESET` — may follow after acute burning settles; restores breathing distribution and reduces mechanical compression maintaining sensitization

**Safety-Critical Distinction:**
Burning with mechanical quality and positional relief = `MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION` → guided session appropriate.
Burning with `worsening_numbness`, `progressive_weakness`, `new_weakness`, or `coordination_change` = SAFETY_STOP_MODE regardless of mechanical context. Tags `worsening_numbness` and `progressive_weakness` are absolute safety escalation triggers (doc 04 Safety Precheck Engine).

**Scoring Implications for M2 Engine:**
`symptom_tags` includes `burning` → boost `MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION` and `MECH_GENERAL_OVERPROTECTION_STATE`. If `burning` + `radiating` → strong boost to nerve irritation mechanism; prefer `PROTO_BURNING_NERVE_CALM_RESET` as entry. If `worsening_numbness` or `progressive_weakness` present → SAFETY_STOP_MODE (precheck blocks engine entirely).

**Provenance:** `source_grounded` — SYM_001 (Butler/Moseley Explain Pain 2e on sensitization and spreading sensations); `product_inference` for protocol assignment

---

## Pattern 5: Jaw-Cervical Co-Contraction

**Generalized Description:**
Jaw clenching co-activates cervical and upper trap musculature through shared neuromuscular pathways. In an overprotection or guarding state, jaw and neck tension form a self-reinforcing loop — each sustaining the other. This pattern may emerge as a downstream effect of postural compression, as a stress response, or as a compensatory behavior following cervical sensitization. Addressing jaw release can reduce overall cervical load and interrupt the loop. Jaw symptoms may include a sense of instability, altered coordination of jaw movement, and positionally influenced changes.

**Active Mechanism IDs:**
| Mechanism | Role | Basis |
|---|---|---|
| `MECH_JAW_CERVICAL_CO_CONTRACTION` | Primary | product_inference — jaw and cervical guarding co-activation |
| `MECH_CERVICAL_GUARDING` | Co-active — jaw guarding rarely presents in isolation | MECH_002 |
| `MECH_GENERAL_OVERPROTECTION_STATE` | Co-active — global sensitization sustains both | MECH_003 |

**Tag Mapping:**
- `trigger_tags`: `sitting`, `stress`, `driving`, `eating`
- `symptom_tags`: `tightness`, `aching`, `soreness`, `pressure`
- `location_tags`: `jaw`, `front_neck`, `back_neck`

**Protocol Candidates (ranked):**
1. `PROTO_JAW_UNCLENCH_RESET` — directly targets jaw guarding; entry point when jaw is the primary complaint
2. `PROTO_RIB_EXPANSION_RESET` — preferred follow-up per doc 13; addresses co-active cervical and rib components downstream

**Blocked Sequence (from doc 03):**
Jaw tension flare → do NOT follow with forceful TMJ stretch. `PROTO_GENTLE_CERVICAL_RECONNECTION` should not immediately follow jaw reset without decompression intermediary.

**Scoring Implications for M2 Engine:**
`location_tags` includes `jaw` → boost `MECH_JAW_CERVICAL_CO_CONTRACTION`. If `jaw` + `front_neck` or `back_neck` together → strong co-contraction signal. Prefer `PROTO_JAW_UNCLENCH_RESET` as entry when jaw is in top location set.

**Provenance:** `product_inference`, `design_decision` — co-contraction concept is plausible from motor control literature but sequencing is product logic

---

## Pattern 6: Generalized Overprotection / Diffuse Flare

**Generalized Description:**
When multiple regions are simultaneously symptomatic and the presentation is widespread or diffuse rather than locally isolated, the system is in a generalized overprotection state. Symptoms may include burning, tightness, and pressure across several regions without a single clear mechanical source. The amplification mechanism (MECH_003) is dominant — the nervous system is producing broadly distributed outputs in response to cumulative threat. Entry must be calm-first and non-movement. Any movement protocol is contraindicated as a starting point.

**Active Mechanism IDs:**
| Mechanism | Role | Basis |
|---|---|---|
| `MECH_GENERAL_OVERPROTECTION_STATE` | Primary | MECH_003 — sensitization amplifies pain intensity and spread |
| All others | Potentially co-active | Mechanism co-activation is common in high-severity states |

**Tag Mapping:**
- `trigger_tags`: `stress`, `post_sleep`, `sitting`, `driving`
- `symptom_tags`: `burning`, `tightness`, `pressure`, `aching`, `shallow_breathing`
- `location_tags`: multiple — any combination of `ribs`, `back_neck`, `front_neck`, `upper_back`, `jaw`

**Protocol Candidates (ranked):**
1. `PROTO_RIB_EXPANSION_RESET` — universal calm-first entry; targets overprotection broadly; always safe as entry in absence of safety blocks; note: listed as a `primary_mechanism` target in doc 13
2. `PROTO_BURNING_NERVE_CALM_RESET` — preferred over rib expansion when burning is the dominant quality in the diffuse flare

**Severity Band Rule (doc 04):**
`pain_level >= 7`: prefer breath-only or breath-with-body-cue modes; allow micro-movement only if doctrine marks it compatible.
`pain_level >= 9`: prefer flare-calming/breath-first protocols; block follow-up movement by default.

**Provenance:** `product_inference` — MECH_003 grounded in Butler/Moseley; protocol assignment is design decision

---

## Compression Cascade Sequence Pattern

**Generalized Description:**
These patterns do not always present in isolation. A clinically significant cluster shows a progressive compression cascade:

1. Postural or bracing compression develops (sitting, driving)
2. Rib restriction increases as a consequence of compression limiting expansion
3. Cervical musculature compensates for restricted breathing distribution
4. Cervical guarding activates jaw co-contraction
5. Sensitization amplifies outputs — burning, nerve-like sensations, diffuse tightness
6. The whole-system state meets criteria for General Overprotection

This cascade has implications for protocol sequencing. The engine should recognize when multiple co-active mechanisms form this pattern and apply the decompression-first priority (doc 03 Priority Order, doc 04 Selection Principles rule 3).

**Cascade Tag Signature:**
`sitting` or `driving` + `tightness` + `burning` + `ribs` or `upper_back` + `back_neck` or `jaw` → high probability cascade pattern; prioritize `PROTO_SEATED_DECOMPRESSION_RESET` or `PROTO_RIB_EXPANSION_RESET` as entry regardless of which region is reported as most prominent.

---

## Mechanism Score Weight Table for M2 Engine

This table consolidates the scoring signal patterns for the Mechanism Resolution Engine (doc 04 §3).

| Input Tag | Mechanism Boosted | Weight Type |
|---|---|---|
| `trigger = sitting` | MECH_POSTURAL_COMPRESSION | trigger_match |
| `trigger = driving` | MECH_POSTURAL_COMPRESSION, MECH_GENERAL_OVERPROTECTION_STATE | trigger_match |
| `trigger = stress` | MECH_GENERAL_OVERPROTECTION_STATE, MECH_JAW_CERVICAL_CO_CONTRACTION | trigger_match |
| `location = ribs` | MECH_RIB_RESTRICTION, MECH_POSTURAL_COMPRESSION | location_match |
| `location = upper_back` | MECH_RIB_RESTRICTION, MECH_POSTURAL_COMPRESSION | location_match |
| `location = back_neck` | MECH_CERVICAL_GUARDING | location_match |
| `location = front_neck` | MECH_CERVICAL_GUARDING, MECH_JAW_CERVICAL_CO_CONTRACTION | location_match |
| `location = jaw` | MECH_JAW_CERVICAL_CO_CONTRACTION | location_match |
| `symptom = burning` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION, MECH_GENERAL_OVERPROTECTION_STATE | symptom_match |
| `symptom = tingling` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | symptom_match |
| `symptom = radiating` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | symptom_match |
| `symptom = nerve_like` | MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | symptom_match |
| `symptom = tightness` | MECH_POSTURAL_COMPRESSION, MECH_RIB_RESTRICTION, MECH_CERVICAL_GUARDING | symptom_match |
| `symptom = stiffness` | MECH_CERVICAL_GUARDING | symptom_match |
| `symptom = pressure` | MECH_POSTURAL_COMPRESSION | symptom_match |
| `symptom = shallow_breathing` | MECH_RIB_RESTRICTION | symptom_match (strong signal) |
| `symptom = guarding` | MECH_CERVICAL_GUARDING, MECH_GENERAL_OVERPROTECTION_STATE | symptom_match |

---

## Protocol Entry Decision Matrix

Quick-reference for M2 protocol selection logic.

| Top Mechanism | Severity Band | Preferred Entry Protocol | Notes |
|---|---|---|---|
| MECH_POSTURAL_COMPRESSION | any | PROTO_SEATED_DECOMPRESSION_RESET | preferred for sitting/driving trigger |
| MECH_RIB_RESTRICTION | any | PROTO_RIB_EXPANSION_RESET | always safe entry |
| MECH_RIB_RESTRICTION + MECH_CERVICAL_GUARDING | any | PROTO_RIB_EXPANSION_RESET | do NOT start with cervical; follow-up only |
| MECH_CERVICAL_GUARDING alone | low/moderate | PROTO_GENTLE_CERVICAL_RECONNECTION | only when rib restriction is not co-active |
| MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION | any | PROTO_BURNING_NERVE_CALM_RESET | breath-only; no movement |
| MECH_JAW_CERVICAL_CO_CONTRACTION | any | PROTO_JAW_UNCLENCH_RESET | follow with PROTO_RIB_EXPANSION_RESET |
| MECH_GENERAL_OVERPROTECTION_STATE | high/very_high | PROTO_RIB_EXPANSION_RESET or PROTO_BURNING_NERVE_CALM_RESET | burning = nerve calm; tightness = rib expansion |
| MECH_POSTURAL_COMPRESSION + MECH_CERVICAL_GUARDING | high/very_high | PROTO_SEATED_DECOMPRESSION_RESET | decompression before precision |

---

## Taxonomy Gap: Tags Required for M2

The following tags appear in `14_mediCalm_input_taxonomy.md` (canonical) but are absent from the current `src/types/taxonomy.ts` implementation. They are directly relevant to the patterns above and must be added when the M2 engine is built.

**Symptom tags missing from `SYMPTOM_TAGS`:**

| Tag | Pattern Relevance |
|---|---|
| `nerve_like` | Critical for Pattern 4 disambiguation — distinguishes neuropathic-quality symptoms from musculoskeletal |
| `radiating` | Spreading symptom pattern; strong signal for MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION |
| `guarding` | Matches MECH_CERVICAL_GUARDING and MECH_GENERAL_OVERPROTECTION_STATE directly |
| `shallow_breathing` | Strong signal for MECH_RIB_RESTRICTION; breathing distribution priority flag |
| `coordination_change` | Escalation signal — may trigger SAFETY_STOP_MODE; must be added with safety routing |
| `weakness` | Escalation signal — stop condition for multiple protocols |
| `instability` | Relevant to overprotection state perception |

**Location tags missing from `LOCATION_TAGS`:**

| Tag | Pattern Relevance |
|---|---|
| `mid_back` | Thoracic/costovertebral region; relevant to rib restriction pattern |
| `arm` | Radiating symptom territory; may indicate nerve irritation spread |
| `hand` | Distal radiating; should also route to safety precheck for `hand_dysfunction` |
| `ear` | Jaw-cervical co-contraction territory |
| `throat` | Front neck adjacent; guarding/cervical pattern |

**Note on `coordination_change` and `weakness`:** these tags must be treated as safety escalation inputs, not only as symptom selectors. Their presence should trigger safety precheck routing regardless of mechanism scoring.

---

## Sequencing Guardrails Summary

From doc 03 matching rules + pattern analysis above. These must be implemented as explicit blocking rules in the Protocol Selection Engine (doc 04 §4).

| Condition | Rule |
|---|---|
| MECH_RIB_RESTRICTION co-active with MECH_CERVICAL_GUARDING | Block cervical movement as first protocol; require rib expansion entry |
| `burning` or `nerve_like` as primary symptom | Block movement protocols as entry; calm-first only |
| PROTO_BURNING_NERVE_CALM_RESET completed | Do not follow with strong loading or movement protocol |
| PROTO_JAW_UNCLENCH_RESET completed | Do not follow with forceful cervical protocol; prefer rib expansion follow-up |
| `pain_level >= 7` | Block precision/movement protocols as entry; prefer breath-with-body-cue or breath-only |
| `pain_level >= 9` | Flare-calming or breath-first only; block follow-up movement |
| Any immediate escalation tag present | SAFETY_STOP_MODE — engine does not run; no protocol selected |

---

## Source Boundary Compliance Checklist

- No causal claims about specific injuries or diagnoses
- No prediction of individual outcomes
- No treatment prescription — guidance framing only
- Burning addressed as nervous system sensitization state, not nerve damage (SYM_001)
- All protocols remain calm-first and non-diagnostic
- Movement protocols blocked at high severity per doc 04 movement restriction rules
- Escalation tags (`worsening_numbness`, `progressive_weakness`, `new_weakness`, `coordination_change`, `hand_dysfunction`) route unconditionally to SAFETY_STOP_MODE
- Provenance labels maintained on all mappings; none upgraded from `product_inference` to `source_grounded` without explicit source citation
- Pattern descriptions do not name conditions, diagnoses, or anatomical pathology
