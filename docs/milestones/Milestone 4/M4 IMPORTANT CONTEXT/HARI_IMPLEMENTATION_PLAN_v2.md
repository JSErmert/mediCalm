# M4 — Final Consolidated HARI Prompt for Claude Code

## Purpose

Implement the first production-grade version of **HARI — History-Adaptive Regulation Intelligence** inside mediCalm.

HARI must make mediCalm:
- history-aware
- current-session-first
- conservative
- explainable
- adaptive
- low-risk

HARI is:
- a regulation system
- a state-estimation system
- a conservative adaptive selector

HARI is NOT:
- a diagnosis engine
- an anatomy certainty engine
- a pathology interpreter
- a structural explanation engine

All reasoning must be:
- probabilistic
- conservative
- reversible
- non-diagnostic

---

## Required First Step — Pre-Implementation Analysis

Before implementation:

Analyze architecture and return ONLY:
1. Hard Blockers
2. Medium Ambiguities
3. Optional Refinement Questions
4. No-Action Items
5. Recommended Clarification Order

Do NOT redesign or expand scope.

---

## Active Build Scope

### Implement now:
- M4.0
- M4.1
- M4.3
- M4.5

### MVP only:
- M4.2 (intake)
- M4.4 (link mapping)

### Do NOT implement yet:
- Full M4.2
- Full M4.4

---

## Core Rules

### Truth separation (MANDATORY)
- Body Context
- Active Session State
- Session Records
- Derived Pattern Intelligence

No silent mixing.

---

### Current session wins
- current inputs override history
- worsening overrides past success

---

### Uncertainty behavior
- reduce complexity
- reduce intensity
- shorten loops
- simplify explanations

---

### Safety rules
- softer > harder
- shorter > longer under uncertainty
- reversible > aggressive
- allow pause/stop

---

## Body Context

- user-owned
- persistent
- structured
- editable
- optional

---

## Session Integrity

### Validation gate
Previous session must be:
- kept OR
- invalidated

before new session starts

---

### Deletion horizon
- allow current session deletion
- allow 1-back failsafe
- block deeper deletion

---

### Reversion model
- revert to prior valid state
- do NOT recalculate everything

---

## MVP Intake (M4.2)

Only collect:
- Session Intent
- Context/Posture
- Symptom Focus
- Flare Sensitivity
- Session Length Preference

Must be:
- fast
- minimal
- non-clinical

---

## State Estimation (M4.3)

Must be:
- rule-based
- explainable
- banded outputs

Outputs:
- Compression_Sensitivity
- Expansion_Capacity
- Guarding_Load
- Flare_Sensitivity
- Session_Tolerance
- Reassessment_Urgency
- Intervention_Softness
- Confidence_Level

---

## Link Mapping (M4.4 MVP)

Only:
- Regional Interaction
- Context/State
- Response Pattern

Rules:
- 0–2 links typical
- no chains
- no causal claims

---

## Intervention Selector (M4.5)

Must:
- choose safest next step
- define pacing + reassessment
- support stop/simplify
- output structured package

---

## Build Order

1. M4.0
2. M4.1
3. validation + deletion logic
4. M4.2 MVP
5. M4.3
6. M4.4 MVP
7. M4.5
8. integrate with M3 runtime

---

## Final Directive

Do analysis first.

Then implement:
- M4.0
- M4.1
- M4.2 MVP
- M4.3
- M4.4 MVP
- M4.5

Do NOT:
- expand scope
- invent medical claims
- overcomplicate

Goal:
Build a safe, adaptive regulation system on top of mediCalm.