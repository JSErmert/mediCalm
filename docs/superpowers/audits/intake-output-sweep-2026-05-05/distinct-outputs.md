# Distinct Outputs — Intake → Output Sweep

**Generated:** 2026-05-05
**Total cases swept:** 95,040
**Distinct output fingerprints:** 9
**Sweep duration:** 3.2s

Each section below describes a single distinct output reachable from the engine.
The "cohort" is the set of intake combinations that produce this output.
"Pinned" dims are constant across the cohort (a real driver of this output).
"Free" dims vary fully (do NOT influence this output).
"Partial" dims take some values but not all (partial influence or interaction).

---

## Output 1 — protocol=PROTO_REDUCED_EFFORT · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=360

**Cohort size:** 36,495 intake combinations
**Share of total:** 38.40%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (3249), 1 (3249), 2 (3249), 3 (3249), 4 (3249), 5 (3249), 6 (3249), 7 (3438), 8 (3438), 9 (3438), 10 (3438)
- `irritability`: fast_onset_slow_resolution (12165), slow_onset_fast_resolution (12165), symmetric (12165)
- `flare_sensitivity`: low (4257), moderate (9801), high (11880), not_sure (10557)
- `current_context`: sitting (6588), standing (6588), driving (8118), lying_down (6588), after_strain (8613)
- `session_length_preference`: short (12165), standard (12165), long (12165)
- `symptom_focus`: proactive (5661), neck_upper (5661), rib_side_back (6633), jaw_facial (7128), spread_tension (6732), mixed (4680)
- `session_intent`: cautious_test (11484), flare_sensitive_support (9711), quick_reset (7650), deeper_regulation (7650)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__fast_onset_slow_resolution__low__sitting__short__proactive__cautious_test`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "cautious_test",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "anxious",
  "breath": "4/7",
  "effort": "reduced",
  "bias": "calm_downregulate"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "moderate",
    "guarding_load": "moderate",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "moderate",
    "confidence_level": "moderate",
    "key_factors": [
      "sitting context"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "posture_to_state",
        "linked_elements": [
          "prolonged sitting",
          "compression-sensitive state"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "sitting context with elevated compression sensitivity"
        ],
        "session_bound": true
      },
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": "Current context may be interacting with the current protective state."
  },
  "intervention": {
    "intervention_class": "short_reassessment_first",
    "immediate_objective": "Test tolerability gently and check in before continuing.",
    "softness_level": "soft",
    "round_count_profile": "standard",
    "reassessment_timing": "standard",
    "active_constraints": [
      "keep overall effort low",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. Starting with a short test sequence allows early check-in before committing to longer pacing. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_REDUCED_EFFORT"
  },
  "session_framing": "We'll start with a short gentle test sequence and check in before going further."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "downregulate",
  "effortCapacity": "reduced",
  "safetyLevel": "moderate",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 360,
  "holdsPermitted": true,
  "minInhaleSeconds": 3,
  "feasibilityApplied": false
}
```

**Breath family (M6.8)**
```json
{
  "name": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Follow the breath. Each cycle helps your nervous system settle."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "durationSeconds": 360,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Follow the breath. Each cycle helps your nervous system settle.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 2 — protocol=PROTO_REDUCED_EFFORT · family=flare_safe_soft_exhale · inhale=3 · hold=0 · exhale=6 · duration=240

**Cohort size:** 21,312 intake combinations
**Share of total:** 22.42%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (1080), 1 (1080), 2 (1080), 3 (1080), 4 (1080), 5 (1080), 6 (1080), 7 (3438), 8 (3438), 9 (3438), 10 (3438)
- `irritability`: fast_onset_slow_resolution (7104), slow_onset_fast_resolution (7104), symmetric (7104)
- `flare_sensitivity`: high (11880), low (1548), moderate (3564), not_sure (4320)
- `current_context`: sitting (4068), standing (4068), driving (4464), lying_down (4068), after_strain (4644)
- `session_length_preference`: short (7104), standard (7104), long (7104)
- `symptom_focus`: proactive (3456), neck_upper (3456), rib_side_back (3672), jaw_facial (3852), spread_tension (3708), mixed (3168)
- `session_intent`: quick_reset (4878), deeper_regulation (4878), flare_sensitive_support (5490), cautious_test (6066)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__fast_onset_slow_resolution__high__sitting__short__proactive__quick_reset`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "high",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "pain",
  "breath": "2/4",
  "effort": "minimal",
  "bias": "protect_decompress"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "elevated",
    "expansion_capacity": "low",
    "guarding_load": "elevated",
    "flare_sensitivity_estimate": "elevated",
    "session_tolerance": "low",
    "reassessment_urgency": "elevated",
    "intervention_softness_need": "elevated",
    "confidence_level": "high",
    "key_factors": [
      "high flare sensitivity reported",
      "sitting context",
      "elevated compression sensitivity",
      "elevated guarding load",
      "high flare sensitivity estimate"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "compression sensitivity"
        ],
        "link_strength": "elevated",
        "confidence_support": "moderate",
        "support_factors": [
          "compression sensitivity co-present with guarding"
        ],
        "session_bound": true
      },
      {
        "link_type": "posture_to_state",
        "linked_elements": [
          "prolonged sitting",
          "compression-sensitive state"
        ],
        "link_strength": "moderate",
        "confidence_support": "high",
        "support_factors": [
          "sitting context with elevated compression sensitivity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": true,
    "framing_note": "Current pattern appears more distributed than isolated. Elevated guarding may be shaping multiple areas — softer whole-pattern regulation is appropriate. Current context may be interacting with the current protective state. Earlier check-in is suggested."
  },
  "intervention": {
    "intervention_class": "short_reassessment_first",
    "immediate_objective": "Test tolerability gently and check in before continuing.",
    "softness_level": "very_soft",
    "round_count_profile": "minimal",
    "reassessment_timing": "immediate",
    "active_constraints": [
      "avoid forceful or high-effort breathing",
      "avoid long sequences without check-in",
      "avoid pushing a single local target",
      "keep overall effort low",
      "minimal exploratory progression",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "Today's session appears more flare-sensitive with a more distributed tension pattern. Starting with a short test sequence allows early check-in before committing to longer pacing. Response will be reassessed before continuing.",
    "escalation_permitted": false,
    "mapped_protocol_id": "PROTO_REDUCED_EFFORT"
  },
  "session_framing": "Today looks more flare-sensitive, so we'll start gently and check in early."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness",
    "guarding"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "decompress",
  "effortCapacity": "minimal",
  "safetyLevel": "high",
  "activationPermitted": false,
  "breathDowngraded": true,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 240,
  "holdsPermitted": false,
  "minInhaleSeconds": 3,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

**Breath family (M6.8)**
```json
{
  "name": "flare_safe_soft_exhale",
  "inhaleSeconds": 3,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "sessionName": "Gentle Breath",
  "instructionTone": "protective / gentle",
  "openingPrompt": "Let's keep this light. No effort needed — just let your body settle."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "flare_safe_soft_exhale",
  "inhaleSeconds": 3,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "durationSeconds": 240,
  "sessionName": "Gentle Breath",
  "instructionTone": "protective / gentle",
  "openingPrompt": "Let's keep this light. No effort needed — just let your body settle.",
  "overloadSafe": false,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

---

## Output 3 — protocol=PROTO_REDUCED_EFFORT · family=decompression_expand · inhale=4 · hold=0 · exhale=6 · duration=240

**Cohort size:** 15,183 intake combinations
**Share of total:** 15.98%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `irritability`: fast_onset_slow_resolution (5061), slow_onset_fast_resolution (5061), symmetric (5061)
- `current_context`: sitting (2520), standing (2520), driving (3654), lying_down (2520), after_strain (3969)
- `session_length_preference`: short (5061), standard (5061), long (5061)
- `symptom_focus`: proactive (2205), neck_upper (2205), rib_side_back (2961), jaw_facial (3276), spread_tension (3024), mixed (1512)
- `session_intent`: cautious_test (5418), flare_sensitive_support (4221), quick_reset (2772), deeper_regulation (2772)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 0 (2169), 1 (2169), 2 (2169), 3 (2169), 4 (2169), 5 (2169), 6 (2169)
- `flare_sensitivity`: low (2709), moderate (6237), not_sure (6237)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__fast_onset_slow_resolution__low__sitting__short__proactive__cautious_test`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "cautious_test",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "pain",
  "breath": "3/5",
  "effort": "minimal",
  "bias": "protect_decompress"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "moderate",
    "guarding_load": "moderate",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "moderate",
    "confidence_level": "moderate",
    "key_factors": [
      "sitting context"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "posture_to_state",
        "linked_elements": [
          "prolonged sitting",
          "compression-sensitive state"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "sitting context with elevated compression sensitivity"
        ],
        "session_bound": true
      },
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": "Current context may be interacting with the current protective state."
  },
  "intervention": {
    "intervention_class": "short_reassessment_first",
    "immediate_objective": "Test tolerability gently and check in before continuing.",
    "softness_level": "soft",
    "round_count_profile": "standard",
    "reassessment_timing": "standard",
    "active_constraints": [
      "keep overall effort low",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. Starting with a short test sequence allows early check-in before committing to longer pacing. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_REDUCED_EFFORT"
  },
  "session_framing": "We'll start with a short gentle test sequence and check in before going further."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "decompress",
  "effortCapacity": "minimal",
  "safetyLevel": "high",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 240,
  "holdsPermitted": false,
  "minInhaleSeconds": 3,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

**Breath family (M6.8)**
```json
{
  "name": "decompression_expand",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "sessionName": "Open Breath",
  "instructionTone": "decompressive / spacious",
  "openingPrompt": "Let's give your body a little more room. Soft and unhurried."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "decompression_expand",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "durationSeconds": 240,
  "sessionName": "Open Breath",
  "instructionTone": "decompressive / spacious",
  "openingPrompt": "Let's give your body a little more room. Soft and unhurried.",
  "overloadSafe": false,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

---

## Output 4 — protocol=PROTO_CALM_DOWNREGULATE · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=360

**Cohort size:** 9,837 intake combinations
**Share of total:** 10.35%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (963), 1 (963), 2 (963), 3 (963), 4 (963), 5 (963), 6 (963), 7 (774), 8 (774), 9 (774), 10 (774)
- `irritability`: fast_onset_slow_resolution (3279), slow_onset_fast_resolution (3279), symmetric (3279)
- `current_context`: sitting (2520), standing (2520), driving (1386), lying_down (2520), after_strain (891)
- `session_length_preference`: short (3279), standard (3279), long (3279)
- `symptom_focus`: proactive (1962), neck_upper (1962), rib_side_back (990), jaw_facial (792), spread_tension (1188), mixed (2943)
- `session_intent`: quick_reset (4230), flare_sensitive_support (2169), deeper_regulation (3042), cautious_test (396)

### Partial dims (some values appear, others don't)
- `flare_sensitivity`: low (6435), moderate (2079), not_sure (1323)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__fast_onset_slow_resolution__low__sitting__short__proactive__quick_reset`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "anxious",
  "breath": "4/7",
  "effort": "reduced",
  "bias": "calm_downregulate"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "elevated",
    "guarding_load": "low",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "low",
    "confidence_level": "high",
    "key_factors": [
      "sitting context"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": ""
  },
  "intervention": {
    "intervention_class": "short_micro_reset",
    "immediate_objective": "Interrupt the current pattern and create a brief regulated pause.",
    "softness_level": "standard",
    "round_count_profile": "short",
    "reassessment_timing": "standard",
    "active_constraints": [
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. A brief micro-reset will interrupt the current pattern quickly and without overextending. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_CALM_DOWNREGULATE"
  },
  "session_framing": "We'll keep this brief and focused — just enough to interrupt the pattern."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "downregulate",
  "effortCapacity": "reduced",
  "safetyLevel": "moderate",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 360,
  "holdsPermitted": true,
  "minInhaleSeconds": 3,
  "feasibilityApplied": false
}
```

**Breath family (M6.8)**
```json
{
  "name": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Follow the breath. Each cycle helps your nervous system settle."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "durationSeconds": 360,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Follow the breath. Each cycle helps your nervous system settle.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 5 — protocol=PROTO_CALM_DOWNREGULATE · family=decompression_expand · inhale=4 · hold=0 · exhale=6 · duration=240

**Cohort size:** 6,741 intake combinations
**Share of total:** 7.09%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `irritability`: fast_onset_slow_resolution (2247), slow_onset_fast_resolution (2247), symmetric (2247)
- `current_context`: sitting (1764), standing (1764), driving (882), lying_down (1764), after_strain (567)
- `session_length_preference`: short (2247), standard (2247), long (2247)
- `symptom_focus`: proactive (1386), neck_upper (1386), rib_side_back (630), jaw_facial (504), spread_tension (756), mixed (2079)
- `session_intent`: quick_reset (2898), flare_sensitive_support (1449), deeper_regulation (2142), cautious_test (252)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 0 (963), 1 (963), 2 (963), 3 (963), 4 (963), 5 (963), 6 (963)
- `flare_sensitivity`: low (4095), moderate (1323), not_sure (1323)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__fast_onset_slow_resolution__low__sitting__short__proactive__quick_reset`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "pain",
  "breath": "3/5",
  "effort": "minimal",
  "bias": "protect_decompress"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "elevated",
    "guarding_load": "low",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "low",
    "confidence_level": "high",
    "key_factors": [
      "sitting context"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": ""
  },
  "intervention": {
    "intervention_class": "short_micro_reset",
    "immediate_objective": "Interrupt the current pattern and create a brief regulated pause.",
    "softness_level": "standard",
    "round_count_profile": "short",
    "reassessment_timing": "standard",
    "active_constraints": [
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. A brief micro-reset will interrupt the current pattern quickly and without overextending. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_CALM_DOWNREGULATE"
  },
  "session_framing": "We'll keep this brief and focused — just enough to interrupt the pattern."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "decompress",
  "effortCapacity": "minimal",
  "safetyLevel": "high",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 240,
  "holdsPermitted": false,
  "minInhaleSeconds": 3,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

**Breath family (M6.8)**
```json
{
  "name": "decompression_expand",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "sessionName": "Open Breath",
  "instructionTone": "decompressive / spacious",
  "openingPrompt": "Let's give your body a little more room. Soft and unhurried."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "decompression_expand",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "durationSeconds": 240,
  "sessionName": "Open Breath",
  "instructionTone": "decompressive / spacious",
  "openingPrompt": "Let's give your body a little more room. Soft and unhurried.",
  "overloadSafe": false,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

---

## Output 6 — protocol=PROTO_CALM_DOWNREGULATE · family=flare_safe_soft_exhale · inhale=3 · hold=0 · exhale=6 · duration=240

**Cohort size:** 3,096 intake combinations
**Share of total:** 3.26%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `irritability`: fast_onset_slow_resolution (1032), slow_onset_fast_resolution (1032), symmetric (1032)
- `current_context`: sitting (756), standing (756), driving (504), lying_down (756), after_strain (324)
- `session_length_preference`: short (1032), standard (1032), long (1032)
- `symptom_focus`: proactive (576), neck_upper (576), rib_side_back (360), jaw_facial (288), spread_tension (432), mixed (864)
- `session_intent`: quick_reset (1332), flare_sensitive_support (720), deeper_regulation (900), cautious_test (144)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 7 (774), 8 (774), 9 (774), 10 (774)
- `flare_sensitivity`: low (2340), moderate (756)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s7__fast_onset_slow_resolution__low__sitting__short__proactive__quick_reset`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 7,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "pain",
  "breath": "2/4",
  "effort": "minimal",
  "bias": "protect_decompress"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "elevated",
    "guarding_load": "low",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "low",
    "confidence_level": "high",
    "key_factors": [
      "sitting context",
      "baseline intensity 7/10"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": ""
  },
  "intervention": {
    "intervention_class": "short_micro_reset",
    "immediate_objective": "Interrupt the current pattern and create a brief regulated pause.",
    "softness_level": "standard",
    "round_count_profile": "short",
    "reassessment_timing": "standard",
    "active_constraints": [
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. A brief micro-reset will interrupt the current pattern quickly and without overextending. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_CALM_DOWNREGULATE"
  },
  "session_framing": "We'll keep this brief and focused — just enough to interrupt the pattern."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 7,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "decompress",
  "effortCapacity": "minimal",
  "safetyLevel": "high",
  "activationPermitted": false,
  "breathDowngraded": true,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 240,
  "holdsPermitted": false,
  "minInhaleSeconds": 3,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

**Breath family (M6.8)**
```json
{
  "name": "flare_safe_soft_exhale",
  "inhaleSeconds": 3,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "sessionName": "Gentle Breath",
  "instructionTone": "protective / gentle",
  "openingPrompt": "Let's keep this light. No effort needed — just let your body settle."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "flare_safe_soft_exhale",
  "inhaleSeconds": 3,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "durationSeconds": 240,
  "sessionName": "Gentle Breath",
  "instructionTone": "protective / gentle",
  "openingPrompt": "Let's keep this light. No effort needed — just let your body settle.",
  "overloadSafe": false,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

---

## Output 7 — protocol=PROTO_STABILIZE_BALANCE · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=360

**Cohort size:** 1,188 intake combinations
**Share of total:** 1.25%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`
- `flare_sensitivity`: `low`
- `session_intent`: `deeper_regulation`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (108), 1 (108), 2 (108), 3 (108), 4 (108), 5 (108), 6 (108), 7 (108), 8 (108), 9 (108), 10 (108)
- `irritability`: fast_onset_slow_resolution (396), slow_onset_fast_resolution (396), symmetric (396)
- `session_length_preference`: short (396), standard (396), long (396)

### Partial dims (some values appear, others don't)
- `current_context`: sitting (396), standing (396), lying_down (396)
- `symptom_focus`: proactive (297), neck_upper (297), rib_side_back (297), mixed (297)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__fast_onset_slow_resolution__low__sitting__short__proactive__deeper_regulation`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "deeper_regulation",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "anxious",
  "breath": "4/7",
  "effort": "reduced",
  "bias": "calm_downregulate"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "elevated",
    "guarding_load": "low",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "low",
    "confidence_level": "high",
    "key_factors": [
      "sitting context"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": ""
  },
  "intervention": {
    "intervention_class": "gentle_lateral_expansion",
    "immediate_objective": "Improve comfort with expansion and increase breathing ease.",
    "softness_level": "standard",
    "round_count_profile": "standard",
    "reassessment_timing": "standard",
    "active_constraints": [
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. A gentle expansion approach is appropriate given lower sensitivity and proactive intent. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_STABILIZE_BALANCE"
  },
  "session_framing": "We'll begin with a regulation sequence matched to today's pattern."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "downregulate",
  "effortCapacity": "reduced",
  "safetyLevel": "moderate",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 360,
  "holdsPermitted": true,
  "minInhaleSeconds": 3,
  "feasibilityApplied": false
}
```

**Breath family (M6.8)**
```json
{
  "name": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Follow the breath. Each cycle helps your nervous system settle."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "durationSeconds": 360,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Follow the breath. Each cycle helps your nervous system settle.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 8 — protocol=PROTO_STABILIZE_BALANCE · family=decompression_expand · inhale=4 · hold=0 · exhale=6 · duration=240

**Cohort size:** 756 intake combinations
**Share of total:** 0.80%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`
- `flare_sensitivity`: `low`
- `session_intent`: `deeper_regulation`

### Inert dims (vary freely)
- `irritability`: fast_onset_slow_resolution (252), slow_onset_fast_resolution (252), symmetric (252)
- `session_length_preference`: short (252), standard (252), long (252)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 0 (108), 1 (108), 2 (108), 3 (108), 4 (108), 5 (108), 6 (108)
- `current_context`: sitting (252), standing (252), lying_down (252)
- `symptom_focus`: proactive (189), neck_upper (189), rib_side_back (189), mixed (189)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__fast_onset_slow_resolution__low__sitting__short__proactive__deeper_regulation`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "deeper_regulation",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "pain",
  "breath": "3/5",
  "effort": "minimal",
  "bias": "protect_decompress"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "elevated",
    "guarding_load": "low",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "low",
    "confidence_level": "high",
    "key_factors": [
      "sitting context"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": ""
  },
  "intervention": {
    "intervention_class": "gentle_lateral_expansion",
    "immediate_objective": "Improve comfort with expansion and increase breathing ease.",
    "softness_level": "standard",
    "round_count_profile": "standard",
    "reassessment_timing": "standard",
    "active_constraints": [
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. A gentle expansion approach is appropriate given lower sensitivity and proactive intent. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_STABILIZE_BALANCE"
  },
  "session_framing": "We'll begin with a regulation sequence matched to today's pattern."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "decompress",
  "effortCapacity": "minimal",
  "safetyLevel": "high",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 240,
  "holdsPermitted": false,
  "minInhaleSeconds": 3,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

**Breath family (M6.8)**
```json
{
  "name": "decompression_expand",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "sessionName": "Open Breath",
  "instructionTone": "decompressive / spacious",
  "openingPrompt": "Let's give your body a little more room. Soft and unhurried."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "decompression_expand",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "durationSeconds": 240,
  "sessionName": "Open Breath",
  "instructionTone": "decompressive / spacious",
  "openingPrompt": "Let's give your body a little more room. Soft and unhurried.",
  "overloadSafe": false,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

---

## Output 9 — protocol=PROTO_STABILIZE_BALANCE · family=flare_safe_soft_exhale · inhale=3 · hold=0 · exhale=6 · duration=240

**Cohort size:** 432 intake combinations
**Share of total:** 0.45%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`
- `flare_sensitivity`: `low`
- `session_intent`: `deeper_regulation`

### Inert dims (vary freely)
- `irritability`: fast_onset_slow_resolution (144), slow_onset_fast_resolution (144), symmetric (144)
- `session_length_preference`: short (144), standard (144), long (144)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 7 (108), 8 (108), 9 (108), 10 (108)
- `current_context`: sitting (144), standing (144), lying_down (144)
- `symptom_focus`: proactive (108), neck_upper (108), rib_side_back (108), mixed (108)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s7__fast_onset_slow_resolution__low__sitting__short__proactive__deeper_regulation`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 7,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "deeper_regulation",
  "symptom_focus": "proactive"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "pain",
  "breath": "2/4",
  "effort": "minimal",
  "bias": "protect_decompress"
}
```

**HARI resolution (M4.3 / M4.4 / M4.5)**
```json
{
  "state_estimate": {
    "compression_sensitivity": "low",
    "expansion_capacity": "elevated",
    "guarding_load": "low",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "low",
    "confidence_level": "high",
    "key_factors": [
      "sitting context",
      "baseline intensity 7/10"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "preference_tolerance",
        "linked_elements": [
          "today's shorter-session preference",
          "limited session tolerance"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "preference and current tolerance aligned toward brevity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": false,
    "framing_note": ""
  },
  "intervention": {
    "intervention_class": "gentle_lateral_expansion",
    "immediate_objective": "Improve comfort with expansion and increase breathing ease.",
    "softness_level": "standard",
    "round_count_profile": "standard",
    "reassessment_timing": "standard",
    "active_constraints": [
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable. A gentle expansion approach is appropriate given lower sensitivity and proactive intent. Response will be reassessed before continuing.",
    "escalation_permitted": true,
    "mapped_protocol_id": "PROTO_STABILIZE_BALANCE"
  },
  "session_framing": "We'll begin with a regulation sequence matched to today's pattern."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 7,
  "location_tags": [
    "upper_back"
  ],
  "symptom_tags": [
    "stiffness"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "decompress",
  "effortCapacity": "minimal",
  "safetyLevel": "high",
  "activationPermitted": false,
  "breathDowngraded": true,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 240,
  "holdsPermitted": false,
  "minInhaleSeconds": 3,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

**Breath family (M6.8)**
```json
{
  "name": "flare_safe_soft_exhale",
  "inhaleSeconds": 3,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "sessionName": "Gentle Breath",
  "instructionTone": "protective / gentle",
  "openingPrompt": "Let's keep this light. No effort needed — just let your body settle."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "flare_safe_soft_exhale",
  "inhaleSeconds": 3,
  "holdSeconds": 0,
  "exhaleSeconds": 6,
  "durationSeconds": 240,
  "sessionName": "Gentle Breath",
  "instructionTone": "protective / gentle",
  "openingPrompt": "Let's keep this light. No effort needed — just let your body settle.",
  "overloadSafe": false,
  "feasibilityApplied": true,
  "feasibilityNote": "minimal effort: 4 min cap, no holds"
}
```

---
