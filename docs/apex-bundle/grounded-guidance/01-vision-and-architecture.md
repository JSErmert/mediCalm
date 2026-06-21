# 01 — Vision & Architecture

## North star

Every piece of guidance mediCalm shows is tied to a researched, PMID-backed rationale
**matched to the lane the engine derived from what the user told you.** The research stops
being decoration and becomes the *spine of the recommendation*: not "here is a tip," but
"here is why *this* protocol, for *you*, right now — and here is the peer-reviewed evidence,
verifiable on the spot."

At maturity this reaches the whole app:

- The **recommendation** the engine already makes is explained by research.
- The **pre-session** surface previews evidence for the user's pattern.
- Even the **in-session coaching** — the words shown mid-breath — is unique to the input
  the user gave before the session started.
- The system **gets smarter about the user over time**, within a clinical-safety firewall
  (it never lets stale history silently override what the user is feeling *now*).

This is not a new engine. mediCalm's recommendation engine is already deep and deterministic
(see [`03-context-engine-map.md`](03-context-engine-map.md)). The north star is the
**connective tissue** that binds research to the recommendations the engine already produces.

## The four-layer stack

Each layer ships independently and reads from the layer below it.

### Layer 1 — Lane → Evidence binding (the spine) · **DISPATCH TIER**
The engine derives a lane (`RegulatoryGoal` → `BreathFamily`). Attach a reviewed
PMID + exact quote to each lane. Surface it at the **recommendation-reveal** moment
(after intake + safety-gate CLEAR, before breathing). The reveal says: *"Here is your
[Session Name] — [why, in plain language] — grounded by [exact quote · linked PMID]."*
Spec: [`04-layer1-recommendation-reveal-spec.md`](04-layer1-recommendation-reveal-spec.md).

### Layer 2 — Pre-session evidence carousel
Multiple evidence facets for the derived lane **+ the user's input dimension** (why this
family · why this pace · why movement helps your symptom pattern). Built on Layer 1's
binding plus the symptom/location/trigger matching that already exists in `selectTip.ts`.

### Layer 3 — In-session grounded micro-guidance
The coaching text shown *during* the breath is drawn from the same evidence corpus,
selected by the derived lane + pre-session input. Deepest layer; reuses Layer 1's binding
entirely. Existing surface: `src/engine/presentation/microGuidance.ts` + the m7 phase
renderers.

### Layer 4 — Authoring / corpus pipeline (build-time)
Where the operator's "keyword matching + topic-relationship strength" idea lives: a
**build-time tool** that helps the operator and the PT advisor curate which PMIDs back
which lanes, producing the reviewed table Layers 1–3 read. Fuzzy matching is confined
here, offline, and every output is gated by clinical attestation before it can go live.
**No fuzziness ever runs at runtime** (see [`02-invariants.md`](02-invariants.md)).

## Dependency direction

```
Layer 4 (authoring, build-time)  ──produces──>  reviewed lane→PMID table
                                                      │
Layer 1 (reveal)  <── reads ──┐                       │ reads
Layer 2 (carousel) <── reads ─┼── the table  <────────┘
Layer 3 (in-session) <── reads┘
```

Layer 1 defines *how evidence attaches to a derived lane*. Once that exists, Layers 2–4
are extensions of the same mechanism, not new inventions. That is why Layer 1 is the spine
and the sole dispatch tier.
