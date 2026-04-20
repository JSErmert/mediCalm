
# MediCalm Open Questions and Validation Register
Version: v2
Status: Draft
Owner: Josh
Depends on: Product Vision, Source Truth Doctrine, Knowledge + Protocol Doctrine, Execution Spec, Guided Session UI Spec, Safety + Reassurance Spec, Master Architecture, References + Source Mapping Pack

## Purpose

This document tracks:
- true unresolved product questions
- validation needs
- review priorities
- implementation risks
- source-boundary gaps that still need confirmation before or after Claude Code handoff

This file should only contain items that are genuinely still open.

If a decision has already been resolved elsewhere, remove it from this register.

---

## What Is No Longer Open in v1

The following are now considered resolved enough for v1 implementation:

- MediCalm is not a diagnosis engine.
- MediCalm is not a generic wellness or meditation app.
- The product loop is: home -> pain input -> guided session -> completion -> history.
- The session UI is countdown-first, low-overload, and centered on a breathing orb.
- Sessions use a 3-step emergence model during active guidance.
- Safety overrides normal flow when serious symptoms are present.
- History is part of the core product loop.
- Personalization in v1 is bounded and conservative, not black-box learning.

These are now governed by:
- Product Vision
- Guided Session UI Spec
- Safety + Reassurance Spec
- Master Architecture
- Execution Spec

---

## Open Questions by Category

## 1. Source / Evidence Questions

### Q1.1 Additional Source Expansion
Question:
Which additional publication-level sources should be added after the current canonical source spine to strengthen:
- breathing mechanics language
- conservative self-care wording
- musculoskeletal calming protocol framing

Status:
- open
- not required for first prototype
- recommended before broader public launch

Priority:
- medium

Validation Type:
- source review

### Q1.2 Page-Level Traceability
Question:
Which protocol-facing statements need page-level confirmation if the team wants stronger publication traceability beyond publisher-level and source-stack grounding?

Status:
- open
- not required for internal prototype
- important for long-term trust and compliance rigor

Priority:
- medium

Validation Type:
- citation audit

### Q1.3 Re-Validation of Secondary Consumer Sources
Question:
Which secondary public-facing PT guidance pages should be directly re-opened and archived before launch for stronger sentence-level trust?

Status:
- open

Priority:
- medium

Validation Type:
- source refresh

---

## 2. Clinical / Expert Review Questions

### Q2.1 Mechanism Taxonomy Review
Question:
Which mechanism objects should be reviewed first by a PT, rehab professional, or other qualified clinician for:
- naming accuracy
- contraindication completeness
- sequencing caution

Likely first-review candidates:
- Mechanically Driven Nerve Irritation
- Jaw-Cervical Co-Contraction
- General Flare / Overprotection State

Status:
- open

Priority:
- high

Validation Type:
- expert review

### Q2.2 Protocol Review Priority
Question:
Which protocol definitions should be specialist-reviewed first for safety and clarity?

Likely first-review candidates:
- Burning / Nerve-Calm Reset
- Gentle Cervical Reconnection
- Jaw Unclench Reset
- Reach-and-Expand

Status:
- open

Priority:
- high

Validation Type:
- expert review

### Q2.3 Symptom Escalation Threshold Tuning
Question:
Do the current caution and stop thresholds need refinement for:
- severe but non-dangerous pain spikes
- mixed nerve-like symptoms
- user-reported panic vs true cardiopulmonary concern

Status:
- open

Priority:
- high

Validation Type:
- expert review + real-world test observation

---

## 3. Runtime / Logic Questions

### Q3.1 Weight Tuning in Deterministic Scoring
Question:
Do the v1 mechanism weights in the execution layer produce the intended protocol choices across representative scenarios?

Status:
- open

Priority:
- high

Validation Type:
- scenario testing

Example test cases needed:
- burning + sitting + neck + ribs
- jaw tension + flare + shallow breathing
- driving-triggered compression state
- same-region symptoms with different severity bands

### Q3.2 Tie-Break Behavior Review
Question:
When mechanisms score equally, do the current tie-break rules consistently choose the safest and most intuitive first protocol?

Status:
- open

Priority:
- medium-high

Validation Type:
- scenario testing

### Q3.3 Multi-Region Prioritization Edge Cases
Question:
Are the v1 multi-region prioritization rules sufficient when users report:
- jaw + neck + ribs
- shoulder + neck + arm symptoms
- broad flare states without a clear main location

Status:
- open

Priority:
- high

Validation Type:
- scenario testing + expert review

### Q3.4 Follow-Up Gating Precision
Question:
Should `same` results ever permit follow-up for certain low-risk protocols, and if so, under what exact constraints?

Status:
- open

Priority:
- medium

Validation Type:
- product rule review

---

## 4. UX / Interaction Questions

### Q4.1 Reduced Motion Mode
Question:
What is the exact reduced-motion alternative to:
- breathing orb expansion/contraction
- blur-to-clarity transitions
- crossfades
while preserving pacing clarity?

Status:
- open

Priority:
- medium-high

Validation Type:
- accessibility design review

### Q4.2 Voice Guidance Timing
Question:
Should voice guidance be included in v1, deferred entirely, or released only after the visual-only flow is validated?

Recommended current stance:
- defer until core visual flow is validated

Status:
- open but leaning deferred

Priority:
- medium

Validation Type:
- product decision

### Q4.3 Haptic Guidance
Question:
Should subtle haptics be added to inhale/exhale pacing, and if so, are they helpful or distracting during real discomfort?

Status:
- open

Priority:
- medium

Validation Type:
- user testing

### Q4.4 Home / History Density
Question:
How much detail should appear on home history cards before the screen starts feeling too clinical or cluttered?

Status:
- open

Priority:
- medium

Validation Type:
- UX testing

---

## 5. Safety / Trust Questions

### Q5.1 Disclaimer Placement Strategy
Question:
What is the strongest disclaimer architecture that preserves trust without overwhelming or frightening users?

Areas to define:
- app onboarding disclaimer
- session-level caution copy
- safety-stop copy
- settings / about medical boundary copy

Status:
- open

Priority:
- high

Validation Type:
- product/legal review

### Q5.2 Regional Compliance Review
Question:
What legal or compliance review is needed before release in different regions if the app is publicly distributed?

Status:
- open

Priority:
- high before launch
- not required for early internal prototype

Validation Type:
- legal/compliance review

### Q5.3 High-Pain Edge Handling
Question:
For very high pain states without explicit red flags, is the current "calm first, movement restricted" approach sufficient and clear enough?

Status:
- open

Priority:
- high

Validation Type:
- scenario testing + expert review

---

## 6. Personalization / Learning Questions

### Q6.1 Writeback Thresholds
Question:
How many successful repeats should be required before the personalization layer lightly boosts a protocol?

Status:
- open

Priority:
- medium

Validation Type:
- implementation tuning

### Q6.2 Repeated Worse Outcomes
Question:
How quickly should repeated `worse` results suppress a protocol from future top-ranking choices?

Status:
- open

Priority:
- medium-high

Validation Type:
- implementation tuning + safety review

### Q6.3 State Signature Granularity
Question:
How specific should state signatures be in v1?
Examples:
- symptom + region only
- symptom + region + trigger
- symptom + region + trigger + severity band

Status:
- open

Priority:
- medium

Validation Type:
- implementation design review

### Q6.4 Personalization Explainability
Question:
How should the app explain repeated helpful matches without sounding like it is making medical claims?

Status:
- open

Priority:
- medium

Validation Type:
- copy review

---

## 7. Validation Targets

These are the main v1 validation goals.

### V1 Product Validation Goals
- Can users complete sessions easily during real discomfort?
- Do users understand the countdown-first breathing UI without extra explanation?
- Do the first-session protocol choices feel reasonable for representative symptom states?
- Does the app remain calm without drifting into vague wellness language?
- Does safety interruption feel clear without feeling panic-inducing?
- Does home/history feel useful and reviewable without becoming a dashboard?

### V1 Medical-Trust Validation Goals
- Does the language stay within source-boundary discipline?
- Are product inferences clearly prevented from sounding like publication-proven claims?
- Do escalation messages remain clear, calm, and non-dismissive?

### V1 Runtime Validation Goals
- Does deterministic scoring produce stable outcomes?
- Do tie-break rules behave safely?
- Are follow-up decisions conservative enough?
- Are interrupted and worse sessions handled accurately in history?

---

## 8. Validation Methods

Recommended validation methods by phase:

### Phase A: Internal Document Validation
- contradiction audit across docs
- provenance label audit
- authority hierarchy check
- build-readiness review

### Phase B: Scenario Testing
- structured symptom-state walkthroughs
- protocol selection review
- tie-break testing
- edge-case safety testing

### Phase C: UX Testing
- iPhone usability in discomfort states
- desktop clarity review
- reduced-motion review
- history readability review

### Phase D: Expert Review
- PT / rehab review of selected mechanisms
- specialist review of highest-risk protocol logic
- safety copy review

---

## 9. Immediate Pre-Claude Priorities

Before or alongside Claude Code handoff, the most important remaining validation items are:

1. finalize deterministic scoring examples
2. confirm first-wave protocol review priorities
3. define reduced-motion fallback
4. decide initial disclaimer placement strategy
5. tighten open questions that affect build decisions directly

---

## 10. Post-Claude Prototype Review Checklist

After the first build exists, review:

- Did the app actually implement the authority hierarchy correctly?
- Did guided sessions preserve the countdown-first calm design?
- Did safety mode become visibly more direct?
- Did home/history feel like a calm record of care?
- Did any implementation drift into diagnosis-like wording or generic wellness language?
- Did transitions remain smooth without becoming sluggish?

---

## 11. Register Maintenance Rule

This register should be pruned over time.

For each item:
- if resolved -> move decision into the authoritative spec and remove it here
- if still unresolved -> keep it here with status and priority
- if no longer relevant -> remove it entirely

This keeps the document useful instead of turning it into a graveyard of old questions.

---

## 12. Implementation Note for Claude Code

Claude Code should treat this file as the authoritative v1 register of:
- unresolved questions
- validation targets
- build risks
- post-build review priorities

Claude should not treat this file as the place to redefine already settled product identity or UX doctrine.
