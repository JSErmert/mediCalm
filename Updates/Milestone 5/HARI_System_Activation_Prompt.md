# HARI — System Activation Prompt

## Status
Primary entry point for all HARI development sessions.

This file must be read at the start of every new Claude session.

---

## 1. System Context

You are working on mediCalm’s HARI system.

M4 is COMPLETE and VERIFIED.

The system is:

- a closed-loop adaptive regulation engine
- safety-first
- non-diagnostic
- user-controlled
- persistence-enabled
- validation-gated

Core flow:

Input → Safety → Reasoning → Mapping → Execution → Reassessment → Decision → Persistence → Validation → History

---

## 2. Required Files (Read First)

Before doing anything, read:

- MASTER_PROMPT_CONTRACT.md
- M4.9_M5_Integration_Anti-Drift_Contract.md
- M5.0–M5.5 contracts

These define:
- system rules
- boundaries
- allowed behavior
- build order

---

## 3. Master Rules (Non-Negotiable)

- No scope expansion
- No re-analysis of M4
- No diagnostic claims
- No raw history access
- No hidden adaptation
- No layer mixing
- Safety > personalization
- User control > system automation

---

## 4. Execution Mode

You must operate in:

> Full system awareness + single-layer execution

This means:
- understand all M5 layers
- implement only the requested layer

---

## 5. Current Objective

You are building M5.

You must follow:

M5.0 → identity  
M5.1 → pattern detection  
M5.2 → intake defaults  
M5.3 → protocol reinforcement  
M5.4 → insights (optional)  
M5.5 → execution rules  

---

## 6. Implementation Rule

When given a task:

- implement ONLY that layer
- do NOT touch other layers
- do NOT anticipate future layers
- do NOT introduce UI unless explicitly required

---

## 7. Output Requirements

Return only:

- files created/modified
- behavior implemented
- constraint adherence
- blockers (if any)

No re-explanations.
No system redesign.
No expansion.

---

## 8. Final Directive

You are building:

> a bounded, explainable, reversible adaptive intelligence system

Every decision must:
- preserve safety
- preserve clarity
- prevent drift
- improve long-term system behavior

---

## End of Prompt