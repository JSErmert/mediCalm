# MediCalm Knowledge + Protocol Doctrine
Version: v2
Status: Draft
Owner: Josh
Depends on: Product Vision, Source Truth Doctrine

## Purpose

This document defines the structured reasoning layer that converts source truths into usable system logic.

It formalizes:
- mechanisms
- symptom patterns
- protocol components
- protocol definitions
- mapping rules
- sequencing rules
- safety mapping

## Principle

Interpret first, act second.

The system should not jump directly from symptoms to instructions. It should first interpret the most likely active mechanisms, then select structured protocol logic.

## Core Internal Entities

### Mechanism Objects
Structured functional states the app can reason about.

### Symptom Pattern Objects
User-facing experience clusters translated into mechanism candidates.

### Protocol Components
Atomic intervention units.

### Protocol Definitions
Ordered sequences of protocol components.

### Mapping Rules
Connections between symptom patterns, mechanisms, protocols, and safety constraints.

## Mechanism Registry v2

1. Rib Restriction
2. Cervical Guarding
3. Pain Sensitization
4. Postural Compression
5. Upper Chest / Neck-Driven Breathing
6. Lat-Dominant Over-Stabilization
7. Jaw-Cervical Co-Contraction
8. Mechanically Driven Nerve Irritation
9. General Flare / Overprotection State
10. Movement Avoidance / Fear Guarding

## Mechanism Object Schema

```json
{
  "mechanism_id": "string",
  "name": "string",
  "description": "string",
  "related_truth_ids": ["string"],
  "trigger_tags": ["string"],
  "symptom_tags": ["string"],
  "contraindication_tags": ["string"],
  "protocol_priority_tags": ["string"]
}
```

## Example Mechanism Object

```json
{
  "mechanism_id": "MECH_RIB_RESTRICTION",
  "name": "Rib Restriction",
  "description": "Reduced posterior-lateral rib expansion with compensatory upper-body tension.",
  "related_truth_ids": ["MECH_001", "INT_002"],
  "trigger_tags": ["sitting", "driving", "eating"],
  "symptom_tags": ["rib_tightness", "neck_tension", "shallow_breathing"],
  "contraindication_tags": [],
  "protocol_priority_tags": ["rib_expansion_first"]
}
```

## Symptom Pattern Schema

```json
{
  "pattern_id": "string",
  "user_phrases": ["string"],
  "symptom_tags": ["string"],
  "trigger_tags": ["string"],
  "location_tags": ["string"],
  "candidate_mechanism_ids": ["string"]
}
```

## Example Symptom Pattern

```json
{
  "pattern_id": "PATTERN_SITTING_BURNING_NECK_RIBS",
  "user_phrases": [
    "My neck and ribs burn when I sit",
    "Sitting compresses me"
  ],
  "symptom_tags": ["burning", "tightness"],
  "trigger_tags": ["sitting"],
  "location_tags": ["neck", "ribs"],
  "candidate_mechanism_ids": [
    "MECH_POSTURAL_COMPRESSION",
    "MECH_RIB_RESTRICTION",
    "MECH_CERVICAL_GUARDING"
  ]
}
```

## Protocol Component Schema

```json
{
  "component_id": "string",
  "name": "string",
  "type": "breathing | posture | movement | relaxation | grounding | tactile_cue",
  "instruction": "string",
  "duration_rule": "string",
  "cue_style": "gentle | neutral | explicit",
  "linked_truth_ids": ["string"],
  "contraindication_tags": ["string"]
}
```

## Example Protocol Component

```json
{
  "component_id": "COMP_SHOULDER_DROP_EXHALE",
  "name": "Shoulder Drop on Exhale",
  "type": "relaxation",
  "instruction": "As you exhale, let your shoulders soften downward.",
  "duration_rule": "during_exhale",
  "cue_style": "gentle",
  "linked_truth_ids": ["INT_001"],
  "contraindication_tags": []
}
```

## Protocol Definition Schema

```json
{
  "protocol_id": "string",
  "name": "string",
  "goal": "string",
  "target_mechanism_ids": ["string"],
  "component_sequence": ["string"],
  "timing_profile": {
    "inhale_seconds": 0,
    "exhale_seconds": 0,
    "rounds": 0
  },
  "stop_conditions": ["string"],
  "follow_up_protocol_ids": ["string"],
  "linked_truth_ids": ["string"]
}
```

## Example Protocol Definition

```json
{
  "protocol_id": "PROTO_POSTERIOR_RIB_RESET",
  "name": "Posterior Rib Reset",
  "goal": "Restore rib expansion and reduce upper-body compression.",
  "target_mechanism_ids": [
    "MECH_RIB_RESTRICTION",
    "MECH_POSTURAL_COMPRESSION"
  ],
  "component_sequence": [
    "COMP_SLIGHT_THORACIC_ROUNDING",
    "COMP_BACK_RIB_INHALE",
    "COMP_SHOULDER_DROP_EXHALE"
  ],
  "timing_profile": {
    "inhale_seconds": 4,
    "exhale_seconds": 7,
    "rounds": 8
  },
  "stop_conditions": [
    "dizziness",
    "major_pain_spike",
    "severe_shortness_of_breath"
  ],
  "follow_up_protocol_ids": [
    "PROTO_GENTLE_CERVICAL_RECONNECTION"
  ],
  "linked_truth_ids": ["MECH_001", "INT_001", "INT_002"]
}
```

## Protocol Library v2

- Posterior Rib Reset
- Shoulder Drop Breathing
- Anti-Compression Sitting Reset
- Supine Rib Expansion
- Gentle Cervical Reconnection
- Jaw Unclench Reset
- Burning / Nerve-Calm Reset
- Grounded Flare Protocol
- Reach-and-Expand
- Eating Reset

## Matching Logic

### Rule Type 1: Symptom Pattern → Mechanism Candidates
Example:
- burning + sitting + neck + ribs → postural compression, rib restriction, sensitization

### Rule Type 2: Mechanism → Protocol Priority
Example:
- rib restriction → rib-expansion-first protocols
- cervical guarding → calming first, micro-movement later

### Rule Type 3: Mechanism Combination Rules
Example:
- rib restriction + cervical guarding → do not start with neck movement unless rib expansion first succeeds

### Rule Type 4: Safety Exclusion Rules
Example:
- progressive neurologic tags present → movement protocols may be blocked

## Priority Order

1. Reduce global threat / flare
2. Reduce compression
3. Restore breathing distribution
4. Reintroduce local movement
5. Progress toward integration

## Sequencing Rules

### Allowed Sequences
- Posterior Rib Reset → Gentle Cervical Reconnection
- Grounded Flare Protocol → Shoulder Drop Breathing
- Supine Rib Expansion → Reach-and-Expand

### Blocked Sequences
- High-symptom flare → immediate aggressive movement
- Burning / Nerve-Calm Reset → strong neck-loading protocol
- Jaw tension flare → forceful TMJ stretch

## Safety Mapping

High-priority safety tags:
- chest_pain
- severe_shortness_of_breath
- progressive_weakness
- worsening_numbness
- severe_neurologic_change
- fainting
- major_balance_loss

## Output Contract to Execution Layer

Layer 2 should output:
- matched mechanism candidates
- protocol candidates ranked by priority
- protocol timing
- body cues
- stop conditions
- allowed follow-up options
- safety overrides
