# mediCalm_Governance_Index_v1.0.md

## Document Type
Master governance index

## Project
mediCalm

## Status
Authoritative governance index for internal development workflow

## Purpose

This document defines how mediCalm’s governance systems relate to one another.

It exists to ensure that:

- governance documents do not overlap chaotically
- development decisions are filtered through the correct authority
- milestone execution remains structurally disciplined
- repository organization is evaluated against explicit standards
- future growth does not introduce hidden drift

This index is not a runtime feature.
It is a development authority map.

---

## 1. Governing Documents

The mediCalm governance layer currently includes:

1. `mediCalm_AlignFlow_Governance_v1.0.md`
2. `mediCalm_AROD_Governance_v1.0.md`
3. `mediCalm_AMO_Governance_v1.0.md`
4. `mediCalm_Output_Contract_v1.0.md`

These documents are complementary.

They must not be treated as interchangeable.

---

## 2. Core Governance Roles

### 2.1 AlignFlow
AlignFlow governs:

- structural sequencing
- milestone order
- dependency logic
- readiness thresholds
- stabilization before expansion
- scope containment

AlignFlow answers:
- What belongs now?
- What is premature?
- What depends on what?
- What must stabilize before expansion?

AlignFlow is the **structural sequencing authority**.

---

### 2.2 AROD
AROD governs:

- truth-status discipline
- realism pressure
- claim containment
- contradiction detection
- interpretation honesty
- safety realism
- adaptation restraint

AROD answers:
- Is this too confident?
- Is this weakly supported?
- Does this contradict safety or truth?
- Is this language or logic overclaiming?

AROD is the **honesty and safety discipline authority**.

---

### 2.3 AMO
AMO governs:

- internal branch comparison
- design-path exploration
- candidate ranking
- reconvergence
- continuation of unresolved design questions

AMO answers:
- Which candidate path is strongest?
- Should alternatives remain open temporarily?
- How do multiple design options reconverge cleanly?

AMO is the **controlled exploration authority**.

In mediCalm, AMO is internal-only by default.
It is not permission to create branch-heavy product UX.

---

### 2.4 Output Contract
The Output Contract governs:

- save discipline
- print discipline
- artifact naming clarity
- recoverability
- continuation-friendly workflow
- authority visibility across saved artifacts

It answers:
- Was the artifact saved clearly?
- Can it be reused later?
- Is the authoritative version obvious?
- Is the workflow resumable?

The Output Contract is the **artifact workflow authority**.

---

## 3. Order of Governance Use

When evaluating a proposal, milestone, reorganization, or implementation artifact, use governance in this order:

### Step 1 — AlignFlow
Ask:
- Does this belong in the current layer?
- Is it sequenced correctly?
- Is the structure ready for it?

### Step 2 — AROD
Ask:
- Is it honest?
- Is it safe?
- Is it overstated?
- Does it contradict feasibility, evidence, or current truth status?

### Step 3 — AMO
Ask:
- Are there multiple plausible paths worth comparing?
- Should alternatives remain open temporarily?
- Has the design space reconverged enough to lock one path?

### Step 4 — Output Contract
Ask:
- Was the decision documented clearly?
- Is the artifact recoverable?
- Is authority obvious?
- Can future work resume from this output cleanly?

---

## 4. Conflict Resolution

If governance systems appear to conflict, resolve them in this order:

### 4.1 Safety and honesty outrank elegance
If AROD and another system conflict, and the conflict concerns:
- safety
- truthfulness
- realism
- overclaiming

then **AROD wins**.

---

### 4.2 Structural order outranks convenience
If AlignFlow and another system conflict on:
- milestone timing
- readiness
- sequencing
- scope containment

then **AlignFlow wins**.

---

### 4.3 Reconvergence outranks endless branching
If AMO produces too many open paths without decision value:
- reconverge
- narrow
- lock the strongest path

AMO does not override structural clarity.

---

### 4.4 Recoverability outranks stylistic output preference
If artifact handling becomes unclear, truncated, or hard to resume:
- the Output Contract wins on workflow discipline

---

## 5. Canonical Governance Pattern

The canonical development pattern for mediCalm is:

```text
sequence correctly
-> pressure for honesty
-> compare only when necessary
-> save clearly

Expanded form:

AlignFlow
-> AROD
-> AMO
-> Output Contract

This is the default governance loop for:

milestone planning
feature proposals
repo organization
contract creation
architecture review
design decision comparison
6. What Governance Is For

These governance systems exist to protect mediCalm from:

feature drift
architecture collapse
false confidence
over-adaptation
unclear repo growth
branch-heavy confusion
workflow loss between sessions

They should increase:

calm precision
structural clarity
implementation discipline
trustworthiness
continuity
7. What Governance Is Not For

These documents must not be misused as permission to:

add visible complexity to the app
create unnecessary new abstraction layers
justify broad refactors automatically
over-document minor decisions
replace implementation work with theory
branch endlessly instead of deciding

Governance exists to improve execution, not delay it.

8. Governance Use Cases
8.1 Milestone Proposal Review

Use:

AlignFlow first
AROD second

Question:

Does this belong now, and is it honest/safe?
8.2 Refinement Layer Review

Use:

AlignFlow
AROD
optionally AMO if comparing alternative refinement surfaces

Question:

Is this structurally justified?
Is it bounded?
Does it preserve truth and safety?
Which candidate implementation path is strongest?
8.3 Repo Organization Audit

Use:

AlignFlow for active vs premature structure
AROD for authority clarity and legacy/confusion detection
AMO for comparing organization options
Output Contract for saved artifact discipline

Question:

What is active?
What is legacy?
What is clutter?
What should move, and what should wait?
8.4 Implementation Prompt Review

Use:

AlignFlow to protect scope
AROD to prevent overclaiming or unsafe expansion
Output Contract to ensure artifact recoverability
9. Authority Model
Authoritative

These governance files are authoritative for:

internal development workflow
organization review
milestone planning discipline
architecture evaluation
saved artifact handling
Not authoritative

They are not direct runtime authorities for:

breathing pattern execution
cue timing logic
frontend rendering behavior
user-facing medical claims policy

Those remain governed by milestone contracts and product-specific runtime architecture.

10. Relationship to Milestone Contracts

Milestone contracts remain the direct authority for implementation within their scope.

Governance documents operate one level above them.

That means:

governance decides how work should be evaluated and sequenced
milestone contracts decide what a specific milestone must do

If there is tension:

governance may delay or reject a proposal structurally
but once a milestone is legitimately active, its contract governs implementation details
11. Repo Organization Rule

Any future repo cleanup or restructuring should be evaluated through this sequence:

Identify current authoritative files
Distinguish active vs legacy assets
Identify clutter vs meaningful history
Compare possible organization paths if needed
Reconverge into one plan
Save the plan clearly before execution

No broad reorganization should occur without this discipline.

12. Failure Conditions

The governance layer has failed if mediCalm development begins to:

add features faster than they can be justified
confuse suggestion, preference, and validated truth
keep too many competing paths open
lose clarity about authoritative files
accumulate duplicate active-looking artifacts
let structure become secondary to momentum
13. Success Criteria

The governance layer succeeds if it helps mediCalm remain:

calm in product experience
clean in milestone sequence
honest in interpretation
bounded in adaptation
disciplined in branching
recoverable in workflow
legible in repository structure
14. Final Rule

Governance should make mediCalm:

more coherent
more trustworthy
easier to continue
harder to drift

If governance makes the project heavier without making it clearer, it is being used incorrectly.
