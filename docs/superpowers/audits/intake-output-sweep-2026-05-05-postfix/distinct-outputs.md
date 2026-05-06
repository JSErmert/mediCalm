# Distinct Outputs — Intake → Output Sweep

**Generated:** 2026-05-05
**Total cases swept:** 253,440
**Distinct output fingerprints:** 12
**Sweep duration:** 14.7s

Each section below describes a single distinct output reachable from the engine.
The "cohort" is the set of intake combinations that produce this output.
"Pinned" dims are constant across the cohort (a real driver of this output).
"Free" dims vary fully (do NOT influence this output).
"Partial" dims take some values but not all (partial influence or interaction).

---

## Output 1 — protocol=PROTO_REDUCED_EFFORT · family=flare_safe_soft_exhale · inhale=3 · hold=0 · exhale=6 · duration=240

**Cohort size:** 80,616 intake combinations
**Share of total:** 31.81%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (5760), 1 (5760), 2 (5760), 3 (5760), 4 (5760), 5 (5760), 6 (5760), 7 (10074), 8 (10074), 9 (10074), 10 (10074)
- `irritability`: fast_onset_slow_resolution (42240), slow_onset_fast_resolution (19188), symmetric (19188)
- `flare_sensitivity`: high (63360), low (2760), moderate (6816), not_sure (7680)
- `current_context`: sitting (15816), standing (15816), driving (16272), lying_down (15816), after_strain (16896)
- `session_length_preference`: short (26872), standard (26872), long (26872)
- `session_intent`: quick_reset (19536), deeper_regulation (19536), flare_sensitive_support (20136), cautious_test (21408)

### Partial dims (some values appear, others don't)
- `symptom_focus`: spread_tension (40896), jaw_facial (5208), neck_upper (14832), rib_side_back (10176), mixed (9504)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__fast_onset_slow_resolution__high__sitting__short__empty__quick_reset`

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
  "symptom_focus": "spread_tension"
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
      "spread tension pattern",
      "elevated compression sensitivity",
      "elevated guarding load"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern",
          "compression sensitivity"
        ],
        "link_strength": "elevated",
        "confidence_support": "high",
        "support_factors": [
          "distributed tension with elevated guarding",
          "compression sensitivity co-present with guarding"
        ],
        "session_bound": true
      },
      {
        "link_type": "compression_spread",
        "linked_elements": [
          "compression-sensitive state",
          "spread tension pattern",
          "flare sensitivity"
        ],
        "link_strength": "elevated",
        "confidence_support": "high",
        "support_factors": [
          "elevated compression sensitivity with spread symptom pattern",
          "flare sensitivity may contribute to spread pattern"
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
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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

## Output 2 — protocol=PROTO_REDUCED_EFFORT · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=360

**Cohort size:** 72,868 intake combinations
**Share of total:** 28.75%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (6572), 1 (6572), 2 (6572), 3 (6572), 4 (6572), 5 (6572), 6 (6572), 7 (6716), 8 (6716), 9 (6716), 10 (6716)
- `irritability`: fast_onset_slow_resolution (28160), slow_onset_fast_resolution (22354), symmetric (22354)
- `flare_sensitivity`: high (42240), low (5060), moderate (12496), not_sure (13072)
- `current_context`: sitting (13876), standing (13876), driving (15048), lying_down (13876), after_strain (16192)
- `session_intent`: quick_reset (16916), deeper_regulation (16916), flare_sensitive_support (18268), cautious_test (20768)

### Partial dims (some values appear, others don't)
- `session_length_preference`: short (36434), standard (36434)
- `symptom_focus`: spread_tension (38016), jaw_facial (4928), neck_upper (12828), rib_side_back (9416), mixed (7680)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__fast_onset_slow_resolution__high__sitting__short__empty__quick_reset`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "high",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "spread_tension"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "anxious",
  "breath": "3/5",
  "effort": "reduced",
  "bias": "calm_downregulate"
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
      "spread tension pattern",
      "elevated compression sensitivity",
      "elevated guarding load"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern",
          "compression sensitivity"
        ],
        "link_strength": "elevated",
        "confidence_support": "high",
        "support_factors": [
          "distributed tension with elevated guarding",
          "compression sensitivity co-present with guarding"
        ],
        "session_bound": true
      },
      {
        "link_type": "compression_spread",
        "linked_elements": [
          "compression-sensitive state",
          "spread tension pattern",
          "flare sensitivity"
        ],
        "link_strength": "elevated",
        "confidence_support": "high",
        "support_factors": [
          "elevated compression sensitivity with spread symptom pattern",
          "flare sensitivity may contribute to spread pattern"
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
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
    "guarding"
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
  "breathDowngraded": true,
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release."
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 3 — protocol=PROTO_REDUCED_EFFORT · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=480

**Cohort size:** 36,434 intake combinations
**Share of total:** 14.38%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`
- `session_length_preference`: `long`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (3286), 1 (3286), 2 (3286), 3 (3286), 4 (3286), 5 (3286), 6 (3286), 7 (3358), 8 (3358), 9 (3358), 10 (3358)
- `irritability`: fast_onset_slow_resolution (14080), slow_onset_fast_resolution (11177), symmetric (11177)
- `flare_sensitivity`: high (21120), low (2530), moderate (6248), not_sure (6536)
- `current_context`: sitting (6938), standing (6938), driving (7524), lying_down (6938), after_strain (8096)
- `session_intent`: quick_reset (8458), deeper_regulation (8458), flare_sensitive_support (9134), cautious_test (10384)

### Partial dims (some values appear, others don't)
- `symptom_focus`: spread_tension (19008), jaw_facial (2464), neck_upper (6414), rib_side_back (4708), mixed (3840)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__fast_onset_slow_resolution__high__sitting__long__empty__quick_reset`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "fast_onset_slow_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "high",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "long",
  "session_intent": "quick_reset",
  "symptom_focus": "spread_tension"
}
```

**StateInterpretationResult (M6.4)**
```json
{
  "overload": false,
  "primary": "anxious",
  "breath": "3/5",
  "effort": "reduced",
  "bias": "calm_downregulate"
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
    "session_tolerance": "moderate",
    "reassessment_urgency": "elevated",
    "intervention_softness_need": "elevated",
    "confidence_level": "high",
    "key_factors": [
      "high flare sensitivity reported",
      "sitting context",
      "spread tension pattern",
      "elevated compression sensitivity",
      "elevated guarding load"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern",
          "compression sensitivity"
        ],
        "link_strength": "elevated",
        "confidence_support": "high",
        "support_factors": [
          "distributed tension with elevated guarding",
          "compression sensitivity co-present with guarding"
        ],
        "session_bound": true
      },
      {
        "link_type": "compression_spread",
        "linked_elements": [
          "compression-sensitive state",
          "spread tension pattern",
          "flare sensitivity"
        ],
        "link_strength": "elevated",
        "confidence_support": "high",
        "support_factors": [
          "elevated compression sensitivity with spread symptom pattern",
          "flare sensitivity may contribute to spread pattern"
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
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
    "guarding"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "downregulate",
  "effortCapacity": "standard",
  "safetyLevel": "moderate",
  "activationPermitted": false,
  "breathDowngraded": true,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 480,
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "durationSeconds": 480,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 4 — protocol=PROTO_REDUCED_EFFORT · family=decompression_expand · inhale=4 · hold=0 · exhale=6 · duration=240

**Cohort size:** 28,686 intake combinations
**Share of total:** 11.32%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `current_context`: sitting (4998), standing (4998), driving (6300), lying_down (4998), after_strain (7392)
- `session_length_preference`: short (9562), standard (9562), long (9562)
- `session_intent`: cautious_test (9744), flare_sensitive_support (7266), quick_reset (5838), deeper_regulation (5838)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 0 (4098), 1 (4098), 2 (4098), 3 (4098), 4 (4098), 5 (4098), 6 (4098)
- `irritability`: slow_onset_fast_resolution (14343), symmetric (14343)
- `flare_sensitivity`: low (4830), moderate (11928), not_sure (11928)
- `symptom_focus`: spread_tension (16128), jaw_facial (2184), neck_upper (4410), rib_side_back (3948), mixed (2016)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__slow_onset_fast_resolution__low__sitting__short__empty__cautious_test`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "cautious_test",
  "symptom_focus": "spread_tension"
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
    "guarding_load": "elevated",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "moderate",
    "intervention_softness_need": "elevated",
    "confidence_level": "moderate",
    "key_factors": [
      "sitting context",
      "spread tension pattern",
      "elevated guarding load"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern"
        ],
        "link_strength": "elevated",
        "confidence_support": "moderate",
        "support_factors": [
          "distributed tension with elevated guarding"
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
        "confidence_support": "moderate",
        "support_factors": [
          "sitting context with elevated compression sensitivity"
        ],
        "session_bound": true
      }
    ],
    "appears_distributed": true,
    "framing_note": "Current pattern appears more distributed than isolated. Elevated guarding may be shaping multiple areas — softer whole-pattern regulation is appropriate. Current context may be interacting with the current protective state."
  },
  "intervention": {
    "intervention_class": "soft_decompression",
    "immediate_objective": "Reduce guarding and lower compressive effort gently.",
    "softness_level": "very_soft",
    "round_count_profile": "standard",
    "reassessment_timing": "early",
    "active_constraints": [
      "avoid long sequences without check-in",
      "avoid pushing a single local target",
      "keep overall effort low",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "There appears to be elevated protective guarding right now with a more distributed tension pattern. A soft decompression-focused approach is chosen to reduce effort and avoid pushing a compressed or braced system. Response will be reassessed before continuing.",
    "escalation_permitted": false,
    "mapped_protocol_id": "PROTO_REDUCED_EFFORT"
  },
  "session_framing": "There appears to be some protective holding right now, so we'll keep effort low and move softly."
}
```

**Pain input synthesis (M3 bridge)**
```json
{
  "pain_level": 0,
  "location_tags": [
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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

## Output 5 — protocol=PROTO_CALM_DOWNREGULATE · family=decompression_expand · inhale=4 · hold=0 · exhale=6 · duration=240

**Cohort size:** 10,752 intake combinations
**Share of total:** 4.24%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `current_context`: sitting (2772), standing (2772), driving (1764), lying_down (2772), after_strain (672)
- `session_length_preference`: short (3584), standard (3584), long (3584)
- `session_intent`: quick_reset (4242), deeper_regulation (3360), flare_sensitive_support (2814), cautious_test (336)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 0 (1536), 1 (1536), 2 (1536), 3 (1536), 4 (1536), 5 (1536), 6 (1536)
- `irritability`: slow_onset_fast_resolution (5376), symmetric (5376)
- `flare_sensitivity`: low (7728), moderate (1512), not_sure (1512)
- `symptom_focus`: spread_tension (4032), jaw_facial (336), neck_upper (2772), rib_side_back (840), mixed (2772)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__slow_onset_fast_resolution__low__sitting__short__empty__quick_reset`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "spread_tension"
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
    "guarding_load": "moderate",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "moderate",
    "confidence_level": "high",
    "key_factors": [
      "sitting context",
      "spread tension pattern"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "distributed tension with elevated guarding"
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
    "framing_note": "Current pattern appears more distributed than isolated. Elevated guarding may be shaping multiple areas — softer whole-pattern regulation is appropriate. Current context may be interacting with the current protective state."
  },
  "intervention": {
    "intervention_class": "reduced_effort_regulation",
    "immediate_objective": "Reduce distributed tension and calm the protective pattern broadly.",
    "softness_level": "soft",
    "round_count_profile": "short",
    "reassessment_timing": "standard",
    "active_constraints": [
      "avoid pushing a single local target",
      "keep overall effort low",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable with a more distributed tension pattern. A reduced-effort regulation approach supports calming the system without demanding more than it can comfortably give right now. Response will be reassessed before continuing.",
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
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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

## Output 6 — protocol=PROTO_CALM_DOWNREGULATE · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=360

**Cohort size:** 10,688 intake combinations
**Share of total:** 4.22%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (1024), 1 (1024), 2 (1024), 3 (1024), 4 (1024), 5 (1024), 6 (1024), 7 (880), 8 (880), 9 (880), 10 (880)
- `current_context`: sitting (2712), standing (2712), driving (1848), lying_down (2712), after_strain (704)
- `session_intent`: quick_reset (4204), deeper_regulation (3280), flare_sensitive_support (2852), cautious_test (352)

### Partial dims (some values appear, others don't)
- `irritability`: slow_onset_fast_resolution (5344), symmetric (5344)
- `flare_sensitivity`: low (8096), moderate (1584), not_sure (1008)
- `session_length_preference`: short (5344), standard (5344)
- `symptom_focus`: spread_tension (4224), jaw_facial (352), neck_upper (2616), rib_side_back (880), mixed (2616)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__slow_onset_fast_resolution__low__sitting__short__empty__quick_reset`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "spread_tension"
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
    "guarding_load": "moderate",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "moderate",
    "confidence_level": "high",
    "key_factors": [
      "sitting context",
      "spread tension pattern"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "distributed tension with elevated guarding"
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
    "framing_note": "Current pattern appears more distributed than isolated. Elevated guarding may be shaping multiple areas — softer whole-pattern regulation is appropriate. Current context may be interacting with the current protective state."
  },
  "intervention": {
    "intervention_class": "reduced_effort_regulation",
    "immediate_objective": "Reduce distributed tension and calm the protective pattern broadly.",
    "softness_level": "soft",
    "round_count_profile": "short",
    "reassessment_timing": "standard",
    "active_constraints": [
      "avoid pushing a single local target",
      "keep overall effort low",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable with a more distributed tension pattern. A reduced-effort regulation approach supports calming the system without demanding more than it can comfortably give right now. Response will be reassessed before continuing.",
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
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
    "guarding"
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release."
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 7 — protocol=PROTO_CALM_DOWNREGULATE · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=480

**Cohort size:** 5,344 intake combinations
**Share of total:** 2.11%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`
- `session_length_preference`: `long`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (512), 1 (512), 2 (512), 3 (512), 4 (512), 5 (512), 6 (512), 7 (440), 8 (440), 9 (440), 10 (440)
- `current_context`: sitting (1356), standing (1356), driving (924), lying_down (1356), after_strain (352)
- `session_intent`: quick_reset (2102), deeper_regulation (1640), flare_sensitive_support (1426), cautious_test (176)

### Partial dims (some values appear, others don't)
- `irritability`: slow_onset_fast_resolution (2672), symmetric (2672)
- `flare_sensitivity`: low (4048), moderate (792), not_sure (504)
- `symptom_focus`: spread_tension (2112), jaw_facial (176), neck_upper (1308), rib_side_back (440), mixed (1308)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__slow_onset_fast_resolution__low__sitting__long__empty__quick_reset`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "long",
  "session_intent": "quick_reset",
  "symptom_focus": "spread_tension"
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
    "guarding_load": "moderate",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "moderate",
    "confidence_level": "high",
    "key_factors": [
      "sitting context",
      "spread tension pattern"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "distributed tension with elevated guarding"
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
    "framing_note": "Current pattern appears more distributed than isolated. Elevated guarding may be shaping multiple areas — softer whole-pattern regulation is appropriate. Current context may be interacting with the current protective state."
  },
  "intervention": {
    "intervention_class": "reduced_effort_regulation",
    "immediate_objective": "Reduce distributed tension and calm the protective pattern broadly.",
    "softness_level": "soft",
    "round_count_profile": "short",
    "reassessment_timing": "standard",
    "active_constraints": [
      "avoid pushing a single local target",
      "keep overall effort low",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable with a more distributed tension pattern. A reduced-effort regulation approach supports calming the system without demanding more than it can comfortably give right now. Response will be reassessed before continuing.",
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
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
    "guarding"
  ],
  "current_position": "sitting",
  "trigger_tag": "sitting"
}
```

**Need profile (M6.8)**
```json
{
  "primaryGoal": "downregulate",
  "effortCapacity": "standard",
  "safetyLevel": "moderate",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 480,
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "durationSeconds": 480,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 8 — protocol=PROTO_CALM_DOWNREGULATE · family=flare_safe_soft_exhale · inhale=3 · hold=0 · exhale=6 · duration=240

**Cohort size:** 5,280 intake combinations
**Share of total:** 2.08%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`

### Inert dims (vary freely)
- `current_context`: sitting (1296), standing (1296), driving (1008), lying_down (1296), after_strain (384)
- `session_length_preference`: short (1760), standard (1760), long (1760)
- `session_intent`: quick_reset (2064), deeper_regulation (1560), flare_sensitive_support (1464), cautious_test (192)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 7 (1320), 8 (1320), 9 (1320), 10 (1320)
- `irritability`: slow_onset_fast_resolution (2640), symmetric (2640)
- `flare_sensitivity`: low (4416), moderate (864)
- `symptom_focus`: spread_tension (2304), jaw_facial (192), neck_upper (1152), rib_side_back (480), mixed (1152)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s7__slow_onset_fast_resolution__low__sitting__short__empty__quick_reset`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 7,
  "flare_sensitivity": "low",
  "location": [],
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "quick_reset",
  "symptom_focus": "spread_tension"
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
    "guarding_load": "moderate",
    "flare_sensitivity_estimate": "low",
    "session_tolerance": "moderate",
    "reassessment_urgency": "low",
    "intervention_softness_need": "moderate",
    "confidence_level": "high",
    "key_factors": [
      "sitting context",
      "spread tension pattern",
      "baseline intensity 7/10"
    ]
  },
  "link_map": {
    "links": [
      {
        "link_type": "guarding_distribution",
        "linked_elements": [
          "elevated guarding load",
          "spread tension pattern"
        ],
        "link_strength": "moderate",
        "confidence_support": "moderate",
        "support_factors": [
          "distributed tension with elevated guarding"
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
    "framing_note": "Current pattern appears more distributed than isolated. Elevated guarding may be shaping multiple areas — softer whole-pattern regulation is appropriate. Current context may be interacting with the current protective state."
  },
  "intervention": {
    "intervention_class": "reduced_effort_regulation",
    "immediate_objective": "Reduce distributed tension and calm the protective pattern broadly.",
    "softness_level": "soft",
    "round_count_profile": "short",
    "reassessment_timing": "standard",
    "active_constraints": [
      "avoid pushing a single local target",
      "keep overall effort low",
      "stop or simplify immediately if any symptoms worsen"
    ],
    "adaptation_reasoning": "The current pattern looks manageable with a more distributed tension pattern. A reduced-effort regulation approach supports calming the system without demanding more than it can comfortably give right now. Response will be reassessed before continuing.",
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
    "upper_back",
    "shoulders",
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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

## Output 9 — protocol=PROTO_STABILIZE_BALANCE · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=360

**Cohort size:** 924 intake combinations
**Share of total:** 0.36%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`
- `flare_sensitivity`: `low`
- `session_intent`: `deeper_regulation`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (84), 1 (84), 2 (84), 3 (84), 4 (84), 5 (84), 6 (84), 7 (84), 8 (84), 9 (84), 10 (84)

### Partial dims (some values appear, others don't)
- `irritability`: slow_onset_fast_resolution (462), symmetric (462)
- `current_context`: sitting (308), standing (308), lying_down (308)
- `session_length_preference`: short (462), standard (462)
- `symptom_focus`: neck_upper (396), rib_side_back (264), mixed (264)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__slow_onset_fast_resolution__low__sitting__short__neck_upper_only_neck__deeper_regulation`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [
    "neck"
  ],
  "location_pattern": "single",
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "deeper_regulation",
  "symptom_focus": "neck_upper"
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
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release."
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---

## Output 10 — protocol=PROTO_STABILIZE_BALANCE · family=decompression_expand · inhale=4 · hold=0 · exhale=6 · duration=240

**Cohort size:** 882 intake combinations
**Share of total:** 0.35%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`
- `flare_sensitivity`: `low`
- `session_intent`: `deeper_regulation`

### Inert dims (vary freely)
- `session_length_preference`: short (294), standard (294), long (294)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 0 (126), 1 (126), 2 (126), 3 (126), 4 (126), 5 (126), 6 (126)
- `irritability`: slow_onset_fast_resolution (441), symmetric (441)
- `current_context`: sitting (294), standing (294), lying_down (294)
- `symptom_focus`: neck_upper (378), rib_side_back (252), mixed (252)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s0__slow_onset_fast_resolution__low__sitting__short__neck_upper_only_neck__deeper_regulation`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [
    "neck"
  ],
  "location_pattern": "single",
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "deeper_regulation",
  "symptom_focus": "neck_upper"
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
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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

## Output 11 — protocol=PROTO_STABILIZE_BALANCE · family=flare_safe_soft_exhale · inhale=3 · hold=0 · exhale=6 · duration=240

**Cohort size:** 504 intake combinations
**Share of total:** 0.20%

### Driver dims (pinned across cohort)
- `branch`: `tightness_or_pain`
- `flare_sensitivity`: `low`
- `session_intent`: `deeper_regulation`

### Inert dims (vary freely)
- `session_length_preference`: short (168), standard (168), long (168)

### Partial dims (some values appear, others don't)
- `baseline_intensity`: 7 (126), 8 (126), 9 (126), 10 (126)
- `irritability`: slow_onset_fast_resolution (252), symmetric (252)
- `current_context`: sitting (168), standing (168), lying_down (168)
- `symptom_focus`: neck_upper (216), rib_side_back (144), mixed (144)

### Sample case — full reasoning chain

**case_id:** `tightness_or_pain__s7__slow_onset_fast_resolution__low__sitting__short__neck_upper_only_neck__deeper_regulation`

**Intake**
```json
{
  "branch": "tightness_or_pain",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 7,
  "flare_sensitivity": "low",
  "location": [
    "neck"
  ],
  "location_pattern": "single",
  "current_context": "sitting",
  "session_length_preference": "short",
  "session_intent": "deeper_regulation",
  "symptom_focus": "neck_upper"
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
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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

## Output 12 — protocol=PROTO_STABILIZE_BALANCE · family=calm_downregulate · inhale=4 · hold=0 · exhale=7 · duration=480

**Cohort size:** 462 intake combinations
**Share of total:** 0.18%

### Driver dims (pinned across cohort)
- `branch`: `anxious_or_overwhelmed`
- `flare_sensitivity`: `low`
- `session_length_preference`: `long`
- `session_intent`: `deeper_regulation`

### Inert dims (vary freely)
- `baseline_intensity`: 0 (42), 1 (42), 2 (42), 3 (42), 4 (42), 5 (42), 6 (42), 7 (42), 8 (42), 9 (42), 10 (42)

### Partial dims (some values appear, others don't)
- `irritability`: slow_onset_fast_resolution (231), symmetric (231)
- `current_context`: sitting (154), standing (154), lying_down (154)
- `symptom_focus`: neck_upper (198), rib_side_back (132), mixed (132)

### Sample case — full reasoning chain

**case_id:** `anxious_or_overwhelmed__s0__slow_onset_fast_resolution__low__sitting__long__neck_upper_only_neck__deeper_regulation`

**Intake**
```json
{
  "branch": "anxious_or_overwhelmed",
  "irritability": "slow_onset_fast_resolution",
  "baseline_intensity": 0,
  "flare_sensitivity": "low",
  "location": [
    "neck"
  ],
  "location_pattern": "single",
  "current_context": "sitting",
  "session_length_preference": "long",
  "session_intent": "deeper_regulation",
  "symptom_focus": "neck_upper"
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
    "session_tolerance": "elevated",
    "reassessment_urgency": "low",
    "intervention_softness_need": "low",
    "confidence_level": "high",
    "key_factors": [
      "sitting context"
    ]
  },
  "link_map": {
    "links": [],
    "appears_distributed": false,
    "framing_note": "Current pattern appears relatively localized and straightforward."
  },
  "intervention": {
    "intervention_class": "gentle_lateral_expansion",
    "immediate_objective": "Improve comfort with expansion and increase breathing ease.",
    "softness_level": "standard",
    "round_count_profile": "extended",
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
    "back_neck"
  ],
  "symptom_tags": [
    "tightness",
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
  "effortCapacity": "standard",
  "safetyLevel": "moderate",
  "activationPermitted": false,
  "breathDowngraded": false,
  "overload": false
}
```

**Feasibility profile (M6.8)**
```json
{
  "maxDurationSeconds": 480,
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
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release."
}
```

**Delivery config — actual breath timing the user receives (M6.5)**
```json
{
  "family": "calm_downregulate",
  "inhaleSeconds": 4,
  "holdSeconds": 0,
  "exhaleSeconds": 7,
  "durationSeconds": 480,
  "sessionName": "Calm Reset",
  "instructionTone": "calming / direct",
  "openingPrompt": "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release.",
  "overloadSafe": false,
  "feasibilityApplied": false
}
```

---
