
# MediCalm Master Architecture
Version: v3
Status: Draft
Owner: Josh
Depends on: Product Vision, Source Truth Doctrine, Knowledge + Protocol Doctrine, Execution Spec, Guided Session UI Spec, Safety + Reassurance Spec, References + Source Mapping Pack

## Purpose

This document defines the authoritative v1 system architecture for MediCalm.

It explains how the product is organized from:
- source truth
- doctrine
- runtime logic
- session UI
- safety control
- persistence
- personalization
- home/history loop

If another document is more conceptual, this file wins for how the full system is structurally assembled.

---

## Core Architectural Principle

MediCalm is a bounded symptom-support system.

It is not:
- a diagnostic engine
- a replacement for medical care
- a freeform AI health chatbot
- an unbounded recommendation system

It is:
- a medically grounded product system
- a low-overload guided session engine
- a safety-first runtime
- a structured history and reflection tool

---

## Architecture Stack

```text
Source Truth Layer
  -> Doctrine Layer
  -> Execution Layer
  -> Guided Session Experience Layer
  -> Feedback / Persistence Layer
  -> Bounded Personalization Layer
```

Each layer has a different role and authority level.

---

## 1. Source Truth Layer

### Purpose
Provide the validated reference spine and trust model for the entire product.

### Inputs
- Therapeutic exercise reference base
- Explain Pain reference base
- ChoosePT caution logic
- Source mapping labels

### Authority
This layer defines what can legitimately be treated as:
- `source_grounded`
- `product_inference`
- `design_decision`
- `validation_needed`

### Responsibilities
- preserve claims boundaries
- prevent hallucinated authority
- define what is medically anchored vs product-created
- support safe product framing

### Governing Docs
- Source Truth Doctrine
- References + Source Mapping Pack

---

## 2. Doctrine Layer

### Purpose
Translate the source truth layer into structured product logic.

### Subsystems
1. Product Vision Doctrine
2. Knowledge + Protocol Doctrine
3. Safety + Reassurance Doctrine
4. Visual Design Doctrine
5. Glossary / shared language

### Responsibilities
- define what MediCalm is
- define what classes of mechanisms/protocols exist
- define what language is acceptable
- define visual and interaction identity
- define safety posture
- define shared terminology

### Architectural Rule
Doctrine may shape the product strongly, but must remain traceable to the source-boundary framework.

---

## 3. Execution Layer

### Purpose
Convert user input into a bounded, deterministic session choice.

### Inputs
- pain level
- region(s)
- symptom type(s)
- optional trigger/context
- recent session history
- safety flags

### Runtime Responsibilities
1. normalize input
2. run safety precheck
3. score mechanism candidates
4. select one starting protocol
5. construct a session object
6. support active interruption handling
7. capture result
8. gate follow-up
9. save session data
10. apply bounded personalization

### Governing Doc
- Execution Spec

### Architectural Rule
The execution layer must be deterministic in v1.
It must never invent new protocols or bypass safety boundaries.

---

## 4. Guided Session Experience Layer

### Purpose
Render the chosen session as a calm, clear, low-overload experience.

### Core Elements
- pain input screen
- instant transition into guided state
- breathing orb
- countdown-first pacing
- 3-step emergence system
- completion screen
- return-home history visibility
- interruption presentation

### Responsibilities
- transform runtime session data into perception
- keep the user focused on one next action
- preserve cinematic continuity without losing clinical restraint
- reduce cognitive load while maintaining control clarity

### Governing Docs
- Guided Session UI Spec
- UX/UI Experience Report
- Visual Design Doctrine

### Architectural Rule
The UI layer controls presentation, not medical logic.
It renders the session chosen by execution.

---

## 5. Safety Control Layer

### Purpose
Override normal behavior when symptoms or outcomes indicate the user should stop or seek care.

### Safety Modes
1. `NORMAL_GUIDANCE_MODE`
2. `INTERRUPTED_CAUTION_MODE`
3. `SAFETY_STOP_MODE`

### Responsibilities
- gate sessions before start
- interrupt active sessions when needed
- block unsafe follow-up
- control escalation messaging
- prevent misleading reassurance
- preserve accuracy in history records

### Governing Doc
- Safety + Reassurance Spec

### Architectural Rule
Safety always outranks:
- personalization
- continuity
- aesthetics
- convenience
- follow-up opportunity

---

## 6. Feedback + Persistence Layer

### Purpose
Close the product loop after a session and make the experience reviewable over time.

### Inputs
- session result: better / same / worse / interrupted
- pain before / after
- change markers
- optional notes
- selected protocol
- duration
- symptom and location tags

### Responsibilities
- record every completed or interrupted session
- show the latest result on home
- allow session review
- preserve whether a session helped or worsened symptoms
- support later bounded personalization

### Primary User-Facing Surface
- Home / History screen

### Governing Docs
- Execution Spec
- Guided Session UI Spec

### Architectural Rule
History is a record of care interaction, not a gamified performance system.

---

## 7. Bounded Personalization Layer

### Purpose
Allow the app to become more useful over time without becoming opaque or medically overreaching.

### Allowed in v1
- recognize repeated state signatures
- lightly prefer previously helpful protocols
- remember low-risk helpful pairings
- deprioritize repeatedly worsening sessions

### Not Allowed in v1
- black-box learning
- autonomous protocol generation
- safety overrides
- medical claims about personalization effectiveness

### Inputs
- prior session signatures
- prior reported outcomes
- protocol compatibility
- doctrine safety boundaries

### Governing Doc
- Execution Spec

### Architectural Rule
Personalization is a small modifier, not the engine of truth.

---

## 8. Home / History Layer

### Purpose
Provide continuity after sessions and help users reference prior support.

### Home Responsibilities
- show recent session entries
- show pain before -> after
- show area / type / result
- allow session review
- preserve interrupted / worse labeling accurately
- support calm re-entry into the system

### UX Identity
Home should feel like:
- a calm record of care
- a living history of support
- not a dashboard of achievement

### Governing Docs
- Guided Session UI Spec
- UX/UI Experience Report

---

## 9. Data Flow Overview

```text
User Input
  -> Input Normalization
  -> Safety Precheck
      -> if unsafe: Safety Stop UI
      -> if safe: Mechanism Scoring
  -> Protocol Selection
  -> Session Object Build
  -> Guided Session Playback
      -> if interrupted: Caution or Stop UI
      -> if completed: Completion Check-Out
  -> Feedback Capture
  -> Follow-Up Gate
  -> Session Save
  -> Home / History Update
  -> Optional Personalization Writeback
```

---

## 10. Authority Hierarchy

When documents overlap, use this precedence order:

### Product Identity
1. Product Vision
2. Master Architecture
3. UX/UI Experience Report

### Source Truth / Claims
1. References + Source Mapping Pack
2. Source Truth Doctrine
3. Safety + Reassurance Spec

### Runtime Logic
1. Execution Spec
2. Knowledge + Protocol Doctrine
3. Master Architecture

### Guided Session Presentation
1. Guided Session UI Spec
2. UX/UI Experience Report
3. Visual Design Doctrine

### Safety Messaging
1. Safety + Reassurance Spec
2. Source Mapping / Truth Docs
3. Guided Session UI Spec

This prevents Claude Code from guessing between poetic and operational documents.

---

## 11. System Boundaries

### MediCalm Does
- accept structured pain input
- select a bounded low-risk session
- guide the user through a short, calm intervention
- capture result
- preserve history
- escalate when symptoms suggest stopping or seeking care

### MediCalm Does Not
- diagnose medical conditions
- replace emergency or urgent evaluation
- guarantee relief
- generate freeform treatment plans
- present all product logic as publication-proven medicine

---

## 12. Claude Code Build Model

Claude Code should treat MediCalm as a product with five coordinated subsystems:

1. Source-bound doctrine system
2. Deterministic runtime engine
3. Guided session interface
4. Safety override system
5. Persistence + history loop

Claude should not collapse these into one vague app layer.

### Build Recommendation
Implement in the following order:
1. home + pain input
2. runtime selection engine
3. guided session playback
4. completion + history save
5. safety interruption flow
6. bounded personalization

---

## 13. v1 Screen Inventory

Minimum v1 screens / states:
1. Home
2. Pain Input
3. Guided Session
4. Completion Check-Out
5. Safety Stop
6. Session Review
7. Settings / Audio Toggle

### State Rule
These should feel like one continuous environment, not isolated app pages.

---

## 14. Non-Goals

This architecture is not designed for:
- open-ended chat diagnosis
- clinician dashboard complexity
- large symptom encyclopedia navigation
- highly dynamic AI-generated protocol invention
- medically authoritative triage beyond bounded escalation rules

---

## 15. Implementation Note for Claude Code

Claude Code should treat this document as the authoritative v1 map of how MediCalm is assembled.

If another document is narrower, use that document for subsystem detail.
If another document is broader or more poetic, this file wins for:
- layer relationships
- authority hierarchy
- subsystem boundaries
- data flow
- safety precedence
- home/history role
- build order
