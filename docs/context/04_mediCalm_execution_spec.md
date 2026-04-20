
# MediCalm Execution Spec
Version: v3
Status: Draft
Owner: Josh
Depends on: Product Vision, Source Truth Doctrine, Knowledge + Protocol Doctrine, Safety + Reassurance Spec

## Purpose

The Execution Layer is the runtime operating system of MediCalm.

It converts structured doctrine into a live, safe, low-overload session flow.

It is responsible for:
- state intake
- safety precheck
- mechanism scoring
- protocol selection
- session construction
- session interruption
- feedback capture
- follow-up gating
- session persistence
- bounded personalization

## Execution Standard

The execution layer must be:
- deterministic in v1
- low-risk first
- calm in presentation
- explicit in safety boundaries
- conservative when uncertain

The system should prefer:
1. safer protocols over more complex protocols
2. calming over precision when state is intense
3. decompression over targeted movement when compression-related mechanisms are strong
4. known helpful protocols over novel ones only when safety is equal

---

## Source-Boundary Rule

The execution layer must preserve provenance labels from upstream doctrine.

Each protocol, rule, or output behavior must be traceable as one of:
- `source_grounded`
- `product_inference`
- `design_decision`
- `validation_needed`

The runtime may use `product_inference` and `design_decision` items for product behavior, but it must not present them to users as publication-proven medical facts.

---

## Runtime Modules

1. State Intake Engine
2. Safety Precheck Engine
3. Mechanism Resolution Engine
4. Protocol Selection Engine
5. Session Orchestration Engine
6. Active Safety Interrupt Engine
7. Feedback Engine
8. Follow-Up Engine
9. Session Persistence Engine
10. Personalization Engine

---

## 1. State Intake Engine

### Required Inputs
- pain_level (0-10)
- symptom_tags
- location_tags

### Optional Inputs
- trigger_tag
- time_of_day
- recurrence_flag
- user_note
- previous_similar_state_id

### Canonical Input Rules
- at least one symptom tag is required
- at least one location tag is required
- synonyms must be normalized to canonical tags before scoring
- duplicate tags must be removed
- user note is never used as the sole safety detector in v1

### Example Runtime Input

```json
{
  "pain_level": 7,
  "symptom_tags": ["burning", "tightness"],
  "location_tags": ["neck", "ribs"],
  "trigger_tag": "sitting",
  "recurrence_flag": true
}
```

### Canonical Severity Bands

```json
{
  "low": [0, 3],
  "moderate": [4, 6],
  "high": [7, 8],
  "very_high": [9, 10]
}
```

Severity bands affect:
- whether the system chooses calming-first protocols
- whether movement protocols are restricted
- whether follow-up is offered

---

## 2. Safety Precheck Engine

Safety precheck runs before mechanism scoring.

### Immediate Escalation Tags
- chest_pain
- severe_shortness_of_breath
- progressive_weakness
- worsening_numbness
- severe_neurologic_change
- hand_dysfunction
- fainting
- major_balance_loss

### Precheck Rules
- if any immediate escalation tag is present, do not build a guided session
- instead route to `SAFETY_STOP_MODE`
- suppress personalization logic
- suppress follow-up options

### Example Safety Output

```json
{
  "mode": "SAFETY_STOP_MODE",
  "reason_tags": ["progressive_weakness", "worsening_numbness"],
  "display_message_id": "MSG_SEEK_CARE_NOW"
}
```

---

## 3. Mechanism Resolution Engine

This engine converts the normalized state into ranked mechanism candidates.

### Mechanism Registry Inputs
Mechanism resolution must only use:
- mechanism objects from Knowledge + Protocol Doctrine
- mapped symptom tags
- mapped location tags
- mapped trigger tags
- severity modifiers

### v1 Scoring Method
v1 should use deterministic weighted scoring, not machine learning.

### Mechanism Score Components
Each mechanism score is the sum of:
- symptom match weight
- location match weight
- trigger match weight
- severity modifier
- history modifier
- safety penalty, if applicable

### Suggested Weight Template

```json
{
  "symptom_match": 4,
  "location_match": 3,
  "trigger_match": 2,
  "severity_modifier_high": 2,
  "severity_modifier_very_high": 3,
  "history_modifier_repeat_success": 1,
  "safety_penalty": -99
}
```

### Example Scoring Logic
For each mechanism:
1. add weight for every matched symptom tag
2. add weight for every matched location tag
3. add weight for trigger match
4. add severity modifier where applicable
5. add small history bonus only if prior success exists and no higher-risk conflict is present
6. apply safety penalty if mechanism-specific exclusion exists

### Example Mechanism Output

```json
{
  "mechanism_candidates": [
    {
      "mechanism_id": "MECH_POSTURAL_COMPRESSION",
      "score": 13,
      "score_reason": ["symptom_match", "location_match", "trigger_match", "severity_high"]
    },
    {
      "mechanism_id": "MECH_RIB_RESTRICTION",
      "score": 12,
      "score_reason": ["symptom_match", "location_match", "trigger_match"]
    },
    {
      "mechanism_id": "MECH_CERVICAL_GUARDING",
      "score": 8,
      "score_reason": ["symptom_match", "location_match"]
    }
  ]
}
```

### Tie-Break Rules
If two mechanism scores are equal:
1. prefer the mechanism with lower downstream risk
2. prefer the mechanism linked to calming / decompression before local precision
3. prefer the mechanism with more direct trigger alignment
4. if still tied, preserve doctrine order from Knowledge + Protocol Doctrine

---

## 4. Protocol Selection Engine

This engine converts ranked mechanisms into one protocol choice.

### Selection Principles
1. Calm global flare before local movement
2. Reduce compression before adding precision
3. Restore breathing distribution before targeted reconnection
4. Prefer low-risk, high-likelihood-of-relief options first
5. When uncertain, choose the safer protocol

### Selection Inputs
- ranked mechanisms
- safety exclusions
- severity band
- known helpful session history
- sequence compatibility
- contraindication tags

### v1 Selection Rule
v1 selects exactly one starting protocol.

It does not generate new protocols dynamically.

### Protocol Ranking Order
1. eligible protocols matching the highest-ranked mechanism
2. protocols matching the top mechanism combination rule
3. lower-risk protocol among equally matched options
4. previously helpful protocol only if still compatible with current safety and severity rules

### Movement Restriction Rules
If `pain_level >= 7`:
- do not start with aggressive or precision-heavy movement
- prefer breath-only or breath-with-body-cue modes
- allow micro-movement only if doctrine marks it compatible and no safety blocks are present

If `pain_level >= 9`:
- prefer flare-calming / breath-first protocols
- block follow-up movement by default in v1

### Multi-Region Prioritization Rules
When multiple locations are present:
1. first honor any safety-related region logic
2. then prioritize the region most associated with top-ranked mechanisms
3. if neck/jaw is present with rib/compression patterns, prefer rib/decompression-first when doctrine supports that sequence
4. do not split the user into two simultaneous protocols in v1

### Example Protocol Selection Output

```json
{
  "selected_protocol_id": "PROTO_POSTERIOR_RIB_RESET",
  "selection_reason": [
    "highest_safe_match",
    "compression_before_precision",
    "severity_high_calming_first"
  ],
  "blocked_protocol_ids": [
    "PROTO_GENTLE_CERVICAL_RECONNECTION"
  ]
}
```

---

## 5. Session Orchestration Engine

This engine converts the chosen protocol into a UI-ready session object.

### Session Construction Rules
- preserve exact timing profile from protocol definition
- keep cues short and UI-safe
- include stop conditions
- include feedback model
- include provenance labels for internal traceability
- include session persistence fields

### Session Object

```json
{
  "session_id": "sess_001",
  "protocol_id": "PROTO_POSTERIOR_RIB_RESET",
  "protocol_name": "Posterior Rib Reset",
  "goal": "Restore rib expansion and reduce upper-body compression.",
  "display_mode": "breath_with_body_cue",
  "timing_profile": {
    "inhale_seconds": 4,
    "exhale_seconds": 7,
    "rounds": 8
  },
  "cue_sequence": [
    "Expand ribs.",
    "Drop shoulders.",
    "Jaw loose."
  ],
  "estimated_length_seconds": 88,
  "stop_conditions": [
    "dizziness",
    "major_pain_spike",
    "severe_shortness_of_breath"
  ],
  "feedback_prompt": "Did this help?",
  "provenance_tags": [
    "product_inference",
    "design_decision"
  ],
  "allowed_follow_up": [
    "PROTO_GENTLE_CERVICAL_RECONNECTION"
  ],
  "history_writeback": true
}
```

### UI Contract Rules
The execution layer must output enough data for the UI to render:
- opening setup cue
- active phase cues
- breath countdown values
- session length
- completion behavior
- feedback behavior

---

## 6. Active Safety Interrupt Engine

Safety checks must run during active session playback.

### Session Stop Triggers
- dizziness
- major_pain_spike
- panic_escalation
- worsening_nerve_symptoms
- severe_shortness_of_breath
- new_weakness
- loss_of_control

### Interruption Rules
- immediately stop active progression
- freeze session advancement
- suppress follow-up
- route to safety messaging
- mark session as interrupted

### Example Interruption Output

```json
{
  "session_id": "sess_001",
  "status": "interrupted",
  "interrupt_reason": "worsening_nerve_symptoms",
  "next_mode": "SAFETY_STOP_MODE"
}
```

---

## 7. Feedback Engine

Feedback is required at session end unless session was interrupted into safety stop.

### Required Response
- better
- same
- worse

### Optional Change Markers
- less_tight
- less_burning
- easier_breathing
- more_control
- less_jaw_tension
- less_pressure
- no_change

### Feedback Object

```json
{
  "session_id": "sess_001",
  "result": "better",
  "change_markers": ["less_burning", "easier_breathing", "more_control"],
  "pain_before": 7,
  "pain_after": 4
}
```

### Feedback Rules
- `worse` disables normal follow-up
- `same` allows limited follow-up only if doctrine marks it low-risk
- `better` allows compatible follow-up only if no safety flags were present

---

## 8. Follow-Up Engine

v1 follow-up is optional and bounded.

### Follow-Up Allowed When
- result = better
- no safety flags triggered
- first protocol was completed
- selected protocol contains compatible follow-up options
- user still wants help

### Follow-Up Blocked When
- result = worse
- pain level remains very high after session
- new safety markers are present
- first protocol was interrupted
- doctrine blocks the sequence

### Follow-Up Priority
1. doctrine-allowed follow-up linked from the selected protocol
2. low-risk decompression-compatible follow-up
3. no follow-up

v1 should never auto-chain more than one follow-up session.

---

## 9. Session Persistence Engine

Every completed session should create a history entry for the home screen.

### Stored Fields
- session_id
- timestamp
- pain_before
- pain_after
- symptom_tags
- location_tags
- trigger_tag
- selected_protocol_id
- selected_protocol_name
- result
- change_markers
- completed_vs_interrupted
- session_duration_seconds

### Example History Entry

```json
{
  "session_id": "sess_001",
  "timestamp": "2026-03-23T22:14:00Z",
  "pain_before": 7,
  "pain_after": 4,
  "symptom_tags": ["burning", "tightness"],
  "location_tags": ["neck", "ribs"],
  "trigger_tag": "sitting",
  "selected_protocol_id": "PROTO_POSTERIOR_RIB_RESET",
  "selected_protocol_name": "Posterior Rib Reset",
  "result": "better",
  "change_markers": ["less_burning", "easier_breathing"],
  "completed_vs_interrupted": "completed",
  "session_duration_seconds": 88
}
```

---

## 10. Personalization Engine

v1 personalization must be conservative and bounded.

### Allowed in v1
- recognize repeated state signatures
- lightly boost previously helpful protocols
- remember recent successful protocol-follow-up pairings

### Not Allowed in v1
- autonomous protocol invention
- opaque machine-learned decisions
- overriding safety logic
- claiming medical validation for learning behavior

### Example Learned Pattern

```json
{
  "state_signature": "burning+tightness+neck+ribs+sitting",
  "preferred_protocol": "PROTO_POSTERIOR_RIB_RESET",
  "score": 3,
  "successful_follow_up": "PROTO_GENTLE_CERVICAL_RECONNECTION"
}
```

### Personalization Guardrails
- safety always overrides personalization
- doctrine compatibility overrides history preference
- repeated `worse` results reduce protocol priority
- provenance labels remain unchanged by learning

---

## Runtime Modes

1. `DIRECT_SESSION_MODE`
2. `GUIDED_FOLLOW_UP_MODE`
3. `SAFETY_STOP_MODE`

---

## Runtime Output Contract

Required fields:
- session_id
- protocol_id
- protocol_name
- goal
- display_mode
- timing_profile
- cue_sequence
- estimated_length_seconds
- stop_conditions
- feedback_prompt
- allowed_follow_up
- provenance_tags
- history_writeback

---

## Example Runtime Flow

```text
User Input
  -> Safety Precheck
  -> Mechanism Scoring
  -> Protocol Selection
  -> Session Build
  -> Active Session
  -> Feedback
  -> Follow-Up Gate
  -> History Save
```

---

## v1 Non-Goals

The execution layer should not:
- diagnose conditions
- claim medical certainty
- generate unsupervised new protocols
- imply publication-level validation for product sequencing
- replace medical evaluation when escalation tags are present

---

## Implementation Note for Claude Code

Claude Code should treat this document as the authoritative runtime behavior spec for v1.

If another document is more poetic or higher-level, this file wins for:
- scoring logic
- tie-breaking
- runtime state handling
- follow-up gating
- persistence behavior
