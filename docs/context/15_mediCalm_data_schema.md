
# MediCalm Data Schema

Status: Draft  
Owner: Josh  
Purpose: Define the core data objects required for MediCalm runtime, UI, persistence, history, and bounded personalization.

## Schema Rules

- data structures should stay explicit and low-complexity
- safety-relevant state must be preserved clearly
- store canonical taxonomy values, not ad hoc user wording
- history is a care-interaction log, not a gamified activity feed
- personalization should remain bounded and explainable

## UserProfile

```json
{
  "user_id": "user_001",
  "created_at": "2026-03-23T21:00:00Z",
  "preferred_audio_enabled": true,
  "preferred_reduced_motion": false,
  "timezone": "America/Los_Angeles",
  "last_opened_at": "2026-03-23T22:00:00Z"
}
```

## PainInputState

```json
{
  "pain_level": 7,
  "location_tags": ["front_neck", "ribs"],
  "symptom_tags": ["burning", "tightness"],
  "trigger_tag": "sitting",
  "user_note": "felt compressed at desk"
}
```

## SafetyAssessment

```json
{
  "mode": "DIRECT_SESSION_MODE",
  "safety_tags": [],
  "stop_reason": null
}
```

## MechanismCandidate

```json
{
  "mechanism_id": "MECH_POSTURAL_COMPRESSION",
  "score": 13,
  "score_reason": ["symptom_match", "location_match", "trigger_match", "severity_high"]
}
```

## ProtocolDefinition

```json
{
  "protocol_id": "PROTO_RIB_EXPANSION_RESET",
  "protocol_name": "Rib Expansion Reset",
  "goal": "Reduce compression and restore rib motion before more specific movement.",
  "primary_mechanisms": ["MECH_RIB_RESTRICTION", "MECH_POSTURAL_COMPRESSION"],
  "display_mode": "breath_with_body_cue",
  "default_timing_profile": {
    "inhale_seconds": 4,
    "exhale_seconds": 7,
    "rounds": 8
  },
  "cue_sequence": [
    "Inhale four. Expand ribs.",
    "Exhale seven. Drop shoulders.",
    "Jaw loose. Neck soft."
  ],
  "microtext_options": [
    "Let the back ribs widen.",
    "Do not force the breath."
  ],
  "safe_use_cases": [
    "compression flare",
    "rib restriction pattern"
  ],
  "caution_flags": ["dizziness", "worsening_nerve_symptoms"],
  "stop_conditions": ["major_pain_spike", "severe_shortness_of_breath"],
  "follow_up_candidates": ["PROTO_GENTLE_CERVICAL_RECONNECTION"],
  "provenance_tags": ["product_inference", "design_decision"]
}
```

## RuntimeSession

```json
{
  "session_id": "sess_001",
  "created_at": "2026-03-23T22:14:00Z",
  "pain_input": {
    "pain_level": 7,
    "location_tags": ["front_neck", "ribs"],
    "symptom_tags": ["burning", "tightness"],
    "trigger_tag": "sitting",
    "user_note": ""
  },
  "safety_assessment": {
    "mode": "DIRECT_SESSION_MODE",
    "safety_tags": [],
    "stop_reason": null
  },
  "mechanism_candidates": [
    {
      "mechanism_id": "MECH_POSTURAL_COMPRESSION",
      "score": 13,
      "score_reason": ["symptom_match", "location_match", "trigger_match", "severity_high"]
    }
  ],
  "selected_protocol_id": "PROTO_RIB_EXPANSION_RESET",
  "selected_protocol_name": "Rib Expansion Reset",
  "display_mode": "breath_with_body_cue",
  "timing_profile": {
    "inhale_seconds": 4,
    "exhale_seconds": 7,
    "rounds": 8
  },
  "cue_sequence": [
    "Inhale four. Expand ribs.",
    "Exhale seven. Drop shoulders.",
    "Jaw loose. Neck soft."
  ],
  "estimated_length_seconds": 88,
  "status": "completed",
  "stop_conditions": ["major_pain_spike", "severe_shortness_of_breath"],
  "allowed_follow_up": ["PROTO_GENTLE_CERVICAL_RECONNECTION"],
  "provenance_tags": ["product_inference", "design_decision"]
}
```

## SessionFeedback

```json
{
  "session_id": "sess_001",
  "pain_before": 7,
  "pain_after": 4,
  "result": "better",
  "change_markers": ["less_burning", "easier_breathing", "more_control"],
  "note": "felt looser in neck after third breath"
}
```

## HistoryEntry

```json
{
  "session_id": "sess_001",
  "timestamp": "2026-03-23T22:14:00Z",
  "pain_before": 7,
  "pain_after": 4,
  "location_tags": ["front_neck", "ribs"],
  "symptom_tags": ["burning", "tightness"],
  "trigger_tag": "sitting",
  "selected_protocol_id": "PROTO_RIB_EXPANSION_RESET",
  "selected_protocol_name": "Rib Expansion Reset",
  "result": "better",
  "change_markers": ["less_burning", "easier_breathing"],
  "session_status": "completed",
  "session_duration_seconds": 88
}
```

## MessageDefinition

```json
{
  "message_id": "MSG_STOP_NOW",
  "category": "safety_stop",
  "primary_text": "Stop now.",
  "secondary_text": "Do not continue in the app.",
  "tertiary_text": "Seek urgent medical care.",
  "tone_tags": ["calm", "firm", "direct"]
}
```

## PersonalizationRecord

```json
{
  "state_signature": "burning+tightness+front_neck+ribs+sitting+high",
  "preferred_protocol_id": "PROTO_RIB_EXPANSION_RESET",
  "successful_follow_up_id": "PROTO_GENTLE_CERVICAL_RECONNECTION",
  "success_count": 3,
  "worse_count": 0,
  "last_used_at": "2026-03-23T22:14:00Z"
}
```

## AppSettings

```json
{
  "audio_enabled": true,
  "reduced_motion_enabled": false,
  "haptics_enabled": false,
  "desktop_mode_enabled": false
}
```

## Recommended Storage Groups

### Persistent
- UserProfile
- AppSettings
- HistoryEntry[]
- PersonalizationRecord[]

### Session-Scope
- PainInputState
- SafetyAssessment
- MechanismCandidate[]
- RuntimeSession
- SessionFeedback

### Static / Bundled
- ProtocolDefinition[]
- MessageDefinition[]
- taxonomy enums

## Claude Code Implementation Notes

- Use explicit types and enums where possible.
- Keep protocol definitions separate from runtime sessions.
- Keep history entries compact and review-friendly.
- Preserve interruption and worse outcomes clearly.
