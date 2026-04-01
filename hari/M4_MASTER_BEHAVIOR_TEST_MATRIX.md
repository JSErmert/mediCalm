# M4 — Master Behavior Test Matrix
## Workflow Integration Rule

This document is directly connected to the current M4 Claude workflow.

It is not a passive reference file.
It is an active verification layer for currently developed M4 updates.

### Trigger Rule

When the user writes:

`test [current update]`

Examples:
- `test 4.6`
- `test 4.6.1`
- `test 4.7`

Claude must interpret that as a verification command.

### Required Claude Behavior

On a `test [update]` command, Claude must:

1. Read:
   - the current M4 ground truth file
   - the current M4 clarifications/version file
   - this M4 master behavior test matrix
   - the implementation files relevant to the requested update

2. Identify:
   - which test matrix sections apply to that update
   - which related earlier layers could be affected by regression

3. Return:
   - Pass items
   - Fail items
   - Missing items
   - Regression risks
   - Minimal required fixes

4. Keep the response focused only on:
   - the currently requested update
   - its dependent behaviors
   - any regressions it caused

### Example interpretation

`test 4.6.1`

means:
- verify reassessment control behavior
- verify no auto-advance
- verify Continue / Finish & Save / Exit & Discard behavior
- verify worsening override safety behavior
- verify no regressions to M4.6 loop behavior

`test 4.7`

means:
- verify HARI metadata persistence
- verify HistoryEntry differentiation between HARI and legacy sessions
- verify discarded sessions do not persist
- verify invalidated sessions do not influence retained intelligence
- verify no regressions to session bridge and save flow

### Scope Rule

Do not retest all of M4 every time unless explicitly requested.

Default behavior:
- test the requested update
- test the immediately dependent behaviors
- test obvious regression boundaries only

### Output Format Rule

On a `test [update]` command, return:

- Tested Scope
- Pass
- Fail
- Missing
- Regression Risks
- Required Fixes

Keep it concise and implementation-focused.
## Status
Living test document for M4 (HARI system).

This document tracks whether the current implementation satisfies all required system behaviors across:
- safety
- intake
- engine logic
- runtime bridge
- reassessment loop
- persistence
- body context
- UX integrity

This is NOT a historical version comparison.
This is a **current system verification matrix**.

Update this document as M4 evolves.
Freeze it when M4 is complete.
Create a new version for M5.

---

# Legend

- Not Started
- In Progress
- Pass
- Fail
- Deferred

---

# 1. Safety Layer (M4.2 + Safety Gate)

| Behavior | Status | Notes |
|--------|--------|------|
| Previous-session validation gate blocks new session |  |  |
| User must choose keep or invalidate before new session |  |  |
| Safety gate runs AFTER intake and BEFORE engine |  |  |
| HOLD prevents session creation |  |  |
| STOP prevents session creation |  |  |
| CLEAR allows session creation |  |  |
| Exit is available at all times |  |  |

---

# 2. Intake Layer (M4.2 MVP)

| Behavior | Status | Notes |
|--------|--------|------|
| Intake includes 5 required fields |  |  |
| PainInputScreen no longer required |  |  |
| Baseline intensity slider exists |  |  |
| Baseline intensity stored in intake state |  |  |
| Body Context summary banner appears |  |  |
| Intake remains low-friction (not form-heavy) |  |  |

---

# 3. State Estimation (M4.3)

| Behavior | Status | Notes |
|--------|--------|------|
| State estimate generated from intake + context |  |  |
| Uses banded outputs (low/moderate/high) |  |  |
| No single-input absolutism |  |  |
| Conservative bias under uncertainty |  |  |
| Confidence level affects behavior |  |  |

---

# 4. Link Mapping (M4.4 MVP)

| Behavior | Status | Notes |
|--------|--------|------|
| Link map generated |  |  |
| Only allowed link types used |  |  |
| No causal language or chain inflation |  |  |
| Typical links ≤ 2 |  |  |
| Links influence intervention selection |  |  |

---

# 5. Intervention Selection (M4.5)

| Behavior | Status | Notes |
|--------|--------|------|
| Intervention package generated |  |  |
| Uses state + links as constraints |  |  |
| Softness-first logic respected |  |  |
| No escalation under worsening |  |  |
| Intervention objective defined |  |  |

---

# 6. Session Bridge (M4.5.1)

| Behavior | Status | Notes |
|--------|--------|------|
| Intervention maps to protocol ID |  |  |
| Protocol ID resolves correctly |  |  |
| Session object is created |  |  |
| GuidedSession receives valid data |  |  |
| Breathing orb renders |  |  |
| No "No session data available" errors |  |  |

---

# 7. Reassessment Loop (M4.6)

| Behavior | Status | Notes |
|--------|--------|------|
| Round-based model implemented |  |  |
| Round sizes follow 10 / 20 / 30 rule |  |  |
| Reassessment occurs after each round |  |  |
| Session is bounded (no infinite loops) |  |  |
| Round limits enforced |  |  |

---

# 8. Reassessment Control (M4.6.1)

| Behavior | Status | Notes |
|--------|--------|------|
| Response selection does NOT auto-advance |  |  |
| Continue requires explicit user action |  |  |
| Finish & Save works correctly |  |  |
| Exit & Discard works correctly |  |  |
| User agency preserved at all times |  |  |
| System recommendation does NOT force action |  |  |

---

# 9. Safety Override Behavior

| Behavior | Status | Notes |
|--------|--------|------|
| "Worse" + Continue results in softer continuation |  |  |
| System never escalates after worsening |  |  |
| Protective override remains invisible but effective |  |  |

---

# 10. Persistence Layer (M4.7 — upcoming)

| Behavior | Status | Notes |
|--------|--------|------|
| HARI metadata saved to HistoryEntry |  |  |
| Baseline intensity persisted |  |  |
| Reassessment history stored |  |  |
| Intervention class stored |  |  |
| Legacy sessions still render correctly |  |  |
| Discarded sessions do NOT persist |  |  |
| Invalidated sessions excluded from learning |  |  |

---

# 11. Body Context (M4.1 / M4.1.1)

| Behavior | Status | Notes |
|--------|--------|------|
| Body Context loads correctly |  |  |
| Body Context summary displayed in intake |  |  |
| User can add/edit/remove entries |  |  |
| Categories supported |  |  |
| Uncertainty preserved |  |  |

---

# 12. UX / Experience Layer

| Behavior | Status | Notes |
|--------|--------|------|
| Breathing UI feels immersive (scaled correctly) |  |  |
| Progress indicator matches round model |  |  |
| Long rounds (20–30 breaths) remain usable |  |  |
| Intake flow feels lightweight |  |  |
| Reassessment flow feels calm and controlled |  |  |

---

# 13. Testing Coverage

| Behavior | Status | Notes |
|--------|--------|------|
| Unit tests for state estimation |  |  |
| Unit tests for intervention selection |  |  |
| Tests for reassessment control (M4.6.1) |  |  |
| Tests for safety gate behavior |  |  |
| Tests for session bridge mapping |  |  |
| Integration tests for full session flow |  |  |

---

# Final Rule

This document represents the **current truth of system behavior**.

It must:
- be updated as features evolve
- reflect actual implementation state
- remain concise and actionable

When M4 is complete:
- freeze this document
- begin M5 with a new version