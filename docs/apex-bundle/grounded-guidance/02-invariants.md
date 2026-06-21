# 02 — Invariants (LOCKED)

These are the non-negotiable guardrails. They are named by **mechanism**, not by feature,
so any executor inherits the *reason* and cannot satisfy the letter while breaking the
intent. A violation of any one of these is a blocking defect, not a tradeoff.

---

### INV-1 — Build-time fuzziness, runtime determinism
Keyword / topic-relationship-strength matching may **only** run at build/authoring time
(Layer 4). Runtime selection is a **deterministic lookup/score over a fixed table** — no
probabilistic ranking, no clock dependency, no randomness, no model call. Given identical
inputs, the runtime returns identical evidence, forever.

**Why:** this is the literal mechanism behind "hallucination structurally impossible." It is
mediCalm's core differentiator and the basis of the clinical trust channel.
**Test of compliance:** every runtime selection function is pure and snapshot-stable;
no `Math.random`, no `Date.now`, no network, no inference in the runtime path.

---

### INV-2 — Verbatim quote, never synthesized guidance
What reaches the user as the research claim is the researcher's **exact words** (the stored
`display_quote` / `exact_figure`), shown verbatim with the PMID. The app never paraphrases,
summarizes, or "extracts directions" from a paper, and never implies a paper prescribes a
protocol it did not test.

**Why:** putting words in a researcher's mouth is the exact over-claim the two-lock model
exists to prevent.
**Test of compliance:** the rendered quote string is byte-identical to a stored field; the
plain-language "why" text shown next to it is **app-authored and clearly the app's voice**,
never attributed to the paper.

---

### INV-3 — Two-lock liveness gate
A message reaches a user surface only when **both** locks are satisfied:
1. **Machine lock** — passes structural gate (PMID format, canonical taxonomy tags, no
   unfilled-transcription sentinel `⟦`) **and** the PMID is present in the offline
   verification cache (coverage gate).
2. **Clinical lock** — `review_status === 'pt_advisor_passed'`, backed by a traceable
   attestation from a named PT advisor with a date.

`liveMessages()` is the single chokepoint. Seeds ship `engineering_passed` (dark) until a
PT attests.

**Why:** machine-correct ≠ clinically faithful. Both are required; neither substitutes.
**Test of compliance:** no surface reads the raw bank; all read through `liveMessages()`.

---

### INV-4 — Four-class firewall (no silent override of the present)
mediCalm's four data classes stay firewalled and are **never merged into one mutable
profile**:
- **A** Body Context (user-owned, persistent, free text)
- **B** Live session state (this session's intake + interpretation)
- **C** Session records (history archive)
- **D** Derived patterns (reconstructible computation over C)

Any "profile" or "gets-smarter-over-time" feature (Layer 4 / longitudinal) **reads across**
these classes to *inform* a recommendation but must let **Class B (what the user feels now)
override** historical influence, and must never write a derived inference back into Class A
as if the user stated it.

**Why:** this is a clinical-safety boundary — stale history must not silently override the
present symptom. Dissolving the firewall is the failure mode, not the feature.
**Test of compliance:** current-session inputs dominate; no code path mutates Class A from
derived data without an explicit user confirmation action.

---

### INV-5 — Honest degradation
When no live, lane-bound evidence exists for a derived lane, the app shows **nothing** in
the grounded surface — no generic filler, no nearest-miss substitution presented as a match.
Absence is honest; fabrication is not.

**Why:** a near-miss shown as "the evidence for your recommendation" is a quiet lie.
**Test of compliance:** selection returns `null` and the surface renders empty when no
goal-bound `pt_advisor_passed` message matches.
