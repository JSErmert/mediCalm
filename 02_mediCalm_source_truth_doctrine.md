# MediCalm Source Truth Doctrine
Version: v1
Status: Draft
Owner: Josh
Depends on: Product Vision

## Purpose

This document defines the canonical truth foundation for MediCalm.

It establishes:
- what counts as a source truth
- how truths are structured
- how truths are referenced by upper layers
- how source-grounded logic is separated from product inference

## Principle

MediCalm does not run on raw books or full publication text.

It runs on distilled, structured truths derived from trusted sources.

## Source Domains

### Therapeutic Exercise / PT Foundations
Used for:
- stabilization principles
- breath control
- movement retraining
- relaxation
- graded movement exposure

### Pain Science
Used for:
- sensitization
- threat modulation
- pain amplification concepts
- context-dependent symptom understanding

### PT Clinical Guidance
Used for:
- conservative movement guidance
- common condition framing
- escalation awareness
- symptom caution logic

## Truth Object Schema

```json
{
  "truth_id": "string",
  "statement": "string",
  "domain": "string",
  "type": "mechanism | symptom | intervention | safety",
  "source": "string",
  "confidence": "low | medium | high",
  "applicability": ["array of tags"],
  "notes": "optional explanation",
  "safety_relevance": "low | moderate | high"
}
```

## Truth Categories

### Mechanism Truths
Explain what may be happening functionally in the body.

### Symptom Truths
Explain how users may experience those mechanisms.

### Intervention Truths
Explain what kinds of actions can help regulate those mechanisms.

### Safety Truths
Explain when self-guided regulation should stop and medical evaluation should be recommended.

## Canonical Truth Set v1

### Mechanism Truths

```json
{
  "truth_id": "MECH_001",
  "statement": "Reduced posterior-lateral rib expansion can increase reliance on neck and accessory breathing muscles.",
  "domain": "breathing_mechanics",
  "type": "mechanism",
  "source": "therapeutic_exercise",
  "confidence": "high",
  "applicability": ["rib_tightness", "neck_tension", "postural_compression"],
  "safety_relevance": "low"
}
```

```json
{
  "truth_id": "MECH_002",
  "statement": "Persistent muscle guarding can develop as a protective response to irritation or perceived instability.",
  "domain": "motor_control",
  "type": "mechanism",
  "source": "therapeutic_exercise",
  "confidence": "high",
  "applicability": ["neck_guarding", "tightness", "chronic_pain"],
  "safety_relevance": "low"
}
```

```json
{
  "truth_id": "MECH_003",
  "statement": "Pain intensity and spread can be amplified by sensitization and perceived threat rather than tissue damage alone.",
  "domain": "pain_science",
  "type": "mechanism",
  "source": "pain_science",
  "confidence": "high",
  "applicability": ["burning", "flare", "spreading_pain"],
  "safety_relevance": "moderate"
}
```

```json
{
  "truth_id": "MECH_004",
  "statement": "Sustained postural compression can reduce movement variability and increase tension in surrounding structures.",
  "domain": "posture",
  "type": "mechanism",
  "source": "therapeutic_exercise",
  "confidence": "high",
  "applicability": ["sitting_trigger", "rib_restriction", "neck_tension"],
  "safety_relevance": "low"
}
```

### Symptom Truths

```json
{
  "truth_id": "SYM_001",
  "statement": "Burning or spreading sensations may reflect neural irritation or sensitization rather than direct injury.",
  "domain": "pain_science",
  "type": "symptom",
  "source": "pain_science",
  "confidence": "high",
  "applicability": ["burning", "radiating"],
  "safety_relevance": "moderate"
}
```

```json
{
  "truth_id": "SYM_002",
  "statement": "Symptoms that change with position or breathing are often influenced by mechanical and neuromuscular factors.",
  "domain": "clinical_pattern",
  "type": "symptom",
  "source": "pt_guidance",
  "confidence": "high",
  "applicability": ["position_dependent", "breath_sensitive"],
  "safety_relevance": "low"
}
```

### Intervention Truths

```json
{
  "truth_id": "INT_001",
  "statement": "Slow, controlled breathing with extended exhale can reduce muscle tension and nervous system activation.",
  "domain": "breathing",
  "type": "intervention",
  "source": "therapeutic_exercise",
  "confidence": "high",
  "applicability": ["anxiety", "tightness", "flare"],
  "safety_relevance": "low"
}
```

```json
{
  "truth_id": "INT_002",
  "statement": "Restoring rib cage expansion can reduce compensatory tension in the neck and upper body.",
  "domain": "breathing_mechanics",
  "type": "intervention",
  "source": "therapeutic_exercise",
  "confidence": "high",
  "applicability": ["rib_restriction", "neck_tension"],
  "safety_relevance": "low"
}
```

```json
{
  "truth_id": "INT_003",
  "statement": "Gentle, low-amplitude movement can help reduce guarding and improve motor control without increasing threat.",
  "domain": "motor_control",
  "type": "intervention",
  "source": "therapeutic_exercise",
  "confidence": "high",
  "applicability": ["neck_guarding", "fear_of_movement"],
  "safety_relevance": "low"
}
```

### Safety Truths

```json
{
  "truth_id": "SAFE_001",
  "statement": "Progressive weakness, loss of coordination, or worsening neurological symptoms require medical evaluation.",
  "domain": "safety",
  "type": "safety",
  "source": "pt_guidance",
  "confidence": "high",
  "applicability": ["neurological"],
  "safety_relevance": "high"
}
```

```json
{
  "truth_id": "SAFE_002",
  "statement": "Chest pain or severe shortness of breath should not be managed with self-guided protocols.",
  "domain": "safety",
  "type": "safety",
  "source": "clinical_general",
  "confidence": "high",
  "applicability": ["chest_pain"],
  "safety_relevance": "high"
}
```

## Provenance Rules

Every truth must support traceability.

Each truth should be classified internally as:
- `source_grounded`
- `product_inference`
- `design_decision`
- `validation_needed`

## Doctrine Rule

Layer 1 is the canonical evidence-informed foundation.

Nothing in upper layers should contradict it without explicit review.
