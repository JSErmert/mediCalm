
# MediCalm Safety + Reassurance Spec
Version: v3
Status: Draft
Owner: Josh
Depends on: Product Vision, Source Truth Doctrine, References + Source Mapping Pack, Execution Spec, Guided Session UI Spec

## Purpose

This document defines the authoritative v1 safety, reassurance, and escalation language system for MediCalm.

It governs:
- safety gating before session start
- interruption behavior during an active session
- post-session response handling
- reassurance tone
- escalation language
- claims boundaries
- provenance discipline for medical-sounding language

If another document is more aspirational or poetic, this file wins for user-facing safety and reassurance behavior.

---

## Core Safety Principle

MediCalm must be:
- calm
- clear
- conservative
- medically bounded
- non-diagnostic

The app may support self-guided calming and low-risk symptom response.

The app must not:
- diagnose
- imply medical certainty
- overrule urgent symptoms
- present product logic as publication-proven treatment protocol
- create false reassurance when escalation signs are present

---

## Provenance Rule

All major safety or reassurance statements should remain compatible with the source mapping framework:

- `source_grounded`
- `product_inference`
- `design_decision`
- `validation_needed`

### Runtime Requirement
- source-grounded caution logic may be presented as medical caution
- product inference may guide app behavior, but should not be framed as established medical consensus
- design decisions should never masquerade as medical authority
- validation-needed items must not be presented as settled truth

---

## Safety Modes

v1 uses three safety-relevant modes:

1. `NORMAL_GUIDANCE_MODE`
2. `INTERRUPTED_CAUTION_MODE`
3. `SAFETY_STOP_MODE`

### Mode Intent

#### NORMAL_GUIDANCE_MODE
User is eligible for standard session flow.

#### INTERRUPTED_CAUTION_MODE
User began a session but reported or triggered a warning event that requires stopping normal guidance and giving calm caution messaging.

#### SAFETY_STOP_MODE
User reports or triggers symptoms that require urgent stop behavior and seek-care messaging instead of self-guided continuation.

---

## 1. Pre-Session Safety Gate

Pre-session safety runs before mechanism scoring and protocol selection.

### Immediate Stop Indicators
- chest pain
- severe shortness of breath
- fainting
- major balance loss
- new severe weakness
- progressive weakness
- worsening numbness
- severe neurologic change
- major hand dysfunction
- loss of coordination that is worsening

### Pre-Session Rule
If any immediate stop indicator is present:
- do not start a session
- do not present normal breathing guidance
- do not offer follow-up
- route directly to `SAFETY_STOP_MODE`

### Pre-Session Message Goals
The message must:
- stop the user clearly
- remain calm
- avoid panic
- direct appropriate care-seeking

### Example Message Set
Primary:
- `Stop here.`

Secondary:
- `Do not start this session.`

Tertiary:
- `Seek urgent medical care now.`

### Alternative Softer-But-Firm Variant
- `Do not continue in the app.`
- `Your symptoms need urgent medical attention.`

---

## 2. Active Session Safety Interrupts

Safety checks continue while the user is in an active session.

### Active Stop Triggers
- dizziness
- faintness
- major pain spike
- severe shortness of breath
- new weakness
- worsening numbness
- worsening nerve symptoms
- panic escalation that prevents continuation
- loss of control
- sudden coordination change

### Interrupt Rule
If any active stop trigger occurs:
- pause countdown immediately
- stop step progression immediately
- suppress follow-up suggestions
- shift from guided mode into caution or stop mode
- mark session as interrupted

### Escalation Routing
- if trigger is mild but stopping is prudent -> `INTERRUPTED_CAUTION_MODE`
- if trigger is severe or neurologic / cardiopulmonary -> `SAFETY_STOP_MODE`

### Example Interrupted Caution Copy
Primary:
- `Stop here.`

Secondary:
- `Do not continue this session.`

Tertiary:
- `Rest and reassess before doing more.`

### Example Safety Stop Copy
Primary:
- `Stop now.`

Secondary:
- `Do not continue in the app.`

Tertiary:
- `Seek urgent medical care.`

---

## 3. Post-Session Result Handling

Every completed session ends in one of:
- better
- same
- worse
- interrupted

### Result Rules

#### better
- compatible follow-up may be offered if doctrine allows
- tone remains measured
- no claims of treatment success beyond the reported change

#### same
- limited low-risk follow-up may be offered only if doctrine allows
- language should avoid frustration or blame
- system may recommend stopping after one more low-risk session

#### worse
- do not offer normal follow-up
- shift to caution messaging
- if worsening includes neurologic or serious symptom markers, route to `SAFETY_STOP_MODE`

#### interrupted
- suppress standard encouragement
- present caution or stop copy depending on trigger

### Example Result Copy

#### Better
- `Good. Notice what changed.`
- `You can stop here or continue carefully.`

#### Same
- `No clear change yet.`
- `Use only a low-risk next step.`

#### Worse
- `Stop here.`
- `Do not continue this sequence.`

---

## 4. Reassurance Doctrine

Reassurance in MediCalm must reduce threat without creating false certainty.

### Reassurance Goals
- support the user
- reduce overwhelm
- encourage deliberate action
- preserve medical honesty

### Reassurance Must Not
- guarantee relief
- imply diagnosis
- suggest symptoms are harmless when escalation signs exist
- imply the app replaces clinical care
- minimize serious symptoms

### Tone Targets
- calm
- steady
- brief
- grounded
- respectful

### Good Reassurance Examples
- `Start here.`
- `Follow this.`
- `Good. Continue.`
- `Notice what changed.`
- `Stop here.`

### Avoid
- `You are safe.` unless specifically validated for context
- `This will fix it.`
- `You are healing now.`
- `Nothing is wrong.`
- `You do not need medical care.`

---

## 5. Claims Boundary

MediCalm may say:
- it is medically grounded
- it is informed by therapeutic exercise principles, pain-science education, and PT-style caution logic
- it provides low-risk guided sessions for symptom support

MediCalm may not say:
- it diagnoses the cause of symptoms
- its sequencing is an established medical protocol unless specifically validated
- its exact breath ratios are medically proven for a symptom cluster
- its personalization logic is medically validated
- it can rule out serious conditions

### Safe Product Framing
- `MediCalm provides guided symptom-support sessions.`
- `This app does not diagnose or replace medical care.`
- `If symptoms worsen or feel concerning, seek medical care.`

---

## 6. Session-Layer Message System

User-facing safety copy should be organized by message intent.

### A. Start Guidance
- `Start here.`
- `Follow this.`

### B. Continue Guidance
- `Good. Continue.`
- `Keep the jaw loose.`
- `Drop shoulders.`

### C. Pause / Reduce
- `Slow down here.`
- `Use less effort.`
- `Do not force this.`

### D. Stop / Caution
- `Stop here.`
- `Do not continue this session.`
- `Rest and reassess.`

### E. Stop / Seek Care
- `Stop now.`
- `Do not continue in the app.`
- `Seek urgent medical care.`

These should remain brief, highly legible, and emotionally steady.

---

## 7. UI Safety Presentation Rules

### Normal Guidance
- calming visual field remains active
- countdown continues
- step text remains primary

### Interrupted Caution
- countdown stops
- guidance de-emphasizes
- caution text becomes primary
- aesthetic calm remains, but urgency becomes clearer

### Safety Stop
- countdown stops
- step guidance disappears
- caution / seek-care message becomes dominant
- visual treatment becomes simpler and more explicit
- ambient effects should not overpower the seriousness of the message

### Design Rule
Safety mode should still feel composed, but it must be visibly more direct than normal guidance mode.

---

## 8. Follow-Up Safety Gate

Follow-up is blocked when:
- result = worse
- session interrupted due to caution or stop trigger
- pain remains very high
- new serious symptom markers are present
- doctrine blocks continuation

Follow-up may be allowed when:
- result = better
- no serious triggers occurred
- first session completed normally
- next protocol is low-risk and doctrine-compatible

### Follow-Up Copy
Allowed:
- `You may continue carefully.`
- `Use one more low-risk step.`

Blocked:
- `Do not continue another session right now.`
- `Stop here and reassess.`

---

## 9. Home / History Safety Behavior

History should preserve accuracy.

### Required Behavior
- interrupted sessions must be marked as interrupted
- worse outcomes must not be displayed like successes
- no celebratory styling for caution or stop outcomes
- the user must be able to review what happened

### History Result Labels
- `Helped`
- `No clear change`
- `Worse`
- `Interrupted`

### Review Screen Rule
When opening a past session:
- display result clearly
- display whether it ended normally or was interrupted
- do not recommend repeating a sequence that previously worsened symptoms without explicit doctrine approval

---

## 10. Escalation Copy Library

### General Caution
- `Stop here.`
- `Rest and reassess.`
- `Do not force another step.`

### Seek Care Soon
- `Do not continue this session.`
- `These symptoms may need medical evaluation.`

### Seek Urgent Care
- `Stop now.`
- `Do not continue in the app.`
- `Seek urgent medical care.`

### Tone Rule
The app should sound:
- calm
- firm
- non-alarming
- unambiguous

---

## 11. v1 Non-Goals

This spec does not authorize the app to:
- classify emergencies with certainty
- replace professional triage
- generate novel medical advice
- infer diagnosis from symptom clusters
- reassure beyond the evidence and source-boundary model

---

## 12. Implementation Note for Claude Code

Claude Code should treat this file as the authoritative v1 source for:
- safety gating language
- interruption behavior
- post-session worse handling
- reassurance boundaries
- escalation copy tone
- claims limitations

If another document is more poetic, this file wins for user-facing safety behavior.
