# mediCalm AMO Governance v1.0

## Document Type
Internal design-orchestration governance

## Project
mediCalm

## System
AMO (adapted)

## Purpose
This document governs controlled exploration of alternative design or architecture paths during mediCalm development.

Unlike VisionAir, AMO in mediCalm is not a primary product runtime layer.
It is an internal governance tool for comparing candidate directions without creating chaos.

## Core Principle

> Exploration may branch during design, but the product must reconverge into calm simplicity.

---

## 1. What AMO Governs in mediCalm

AMO governs:

- internal branch exploration
- alternative milestone-path comparison
- candidate UX pattern comparison
- re-ranking of possible design choices
- reconvergence into one chosen path
- continuation of design thinking across pauses

It does not govern:
- end-user multibranch experience by default
- runtime feature sprawl
- open-ended product branching
- permanent parallel architectures

---

## 2. Approved Use Cases

AMO may be used for:

- comparing two or more possible implementation directions
- evaluating alternate guidance behaviors before locking one
- comparing entry models
- comparing refinement surfaces
- comparing organization plans before restructuring the repo
- holding suggested options temporarily before one is selected

Examples:
- light pre-start cue vs silent pre-start
- secondary refine button vs pre-session sheet
- strict vs softer cue density behavior
- repo organization options before file movement

---

## 3. Non-Approved Use Cases

AMO must not be used to justify:

- adding more user-facing options just because alternatives exist
- shipping parallel user flows when one should be canonical
- indefinite branching without resolution
- “smart” complexity that burdens a calm product
- turning design uncertainty into product clutter

---

## 4. Branch Rules

A branch may be opened only when:

- multiple plausible solutions exist
- the choice materially affects architecture or UX
- one direction is not yet clearly dominant
- comparison will likely produce better clarity

A branch should not be opened:
- for decoration
- to avoid making a decision
- when one path is already clearly strongest
- when the product experience would suffer from delay or drift

---

## 5. Branch Status Model

Internal branches may be labeled as:

- candidate
- suggested
- active for comparison
- secondary
- deprioritized
- reconverged
- rejected

These statuses exist to keep exploration legible.

---

## 6. Ranking Rules

Candidate branches should be ranked using mediCalm-specific criteria such as:

- calmness
- safety fit
- cognitive load
- structural fit
- feasibility compatibility
- implementation clarity
- maintainability
- future milestone compatibility

“Interesting” is not enough.
A path must justify itself.

---

## 7. Reconvergence Rule

AMO has succeeded only when branch exploration returns to a single stronger direction.

The expected pattern is:

- compare
- rank
- choose
- reconverge
- lock

If branching does not create clarity, it has become noise.

---

## 8. Continuation Discipline

If design work pauses mid-branch:

- preserve current branch status clearly
- preserve why each branch exists
- preserve what would decide the winner
- do not silently promote suggestions into chosen architecture

Resuming later must feel coherent.

---

## 9. Output Types

AMO governance may output:

- ranked option set
- recommended direction
- deferred branch
- reconverged decision
- branch comparison summary
- continuation note for later return

---

## 10. Failure Conditions

AMO governance has failed if mediCalm development begins to:

- keep too many live options open
- avoid decisions through endless comparison
- let branch logic leak into the product unnecessarily
- multiply UI choices when the system needs narrowing
- create confusion about what is canonical

---

## 11. Final Rule

For mediCalm, AMO is a temporary exploration tool.

The product should feel converged, not multithreaded.