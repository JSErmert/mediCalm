# mediCalm Apex Bundle — Grounded Guidance

> **What this is.** A ProjectBrainer *apex dispatch bundle* for mediCalm: a tiered,
> sequenced artifact that captures a whole-app vision but marks **exactly one tier as
> executable**, so Apex Mode (Mission Control) — or a human + Claude Code — can dispatch
> it without it degrading into a wishlist. mediCalm is the flagship exemplar here: a real,
> shipping clinical app, grounded by an existing deterministic engine.

**Created:** 2026-06-20 · **Operator:** Joshua Ermert · **Status:** design — awaiting operator review of dispatch tier

---

## The discipline (read this first)

This bundle mixes two altitudes on purpose. The rule that keeps it apex-grade and not
aspiration:

> **Exactly one tier is the dispatch tier. Everything above it is roadmap context, not build instructions.**

- **Shipped:** Layer 1 — *Recommendation-Reveal* (gated + merged to `feat/grounded-guidance-layer1`).
- **Dispatch tier (build now):** Layer 3 — *In-Session Grounded Carousel*.
- **Roadmap (do not build yet):** Layer 2 (pre-session carousel) + Layer 4 (authoring), sequenced context.

---

## Tier map

| Tier | File | Altitude | State |
|---|---|---|---|
| Vision + Architecture | [`01-vision-and-architecture.md`](01-vision-and-architecture.md) | High | locked direction |
| Invariants (mechanism-named) | [`02-invariants.md`](02-invariants.md) | Guardrails | **LOCKED** |
| Context stack (source-isolated engine map) | [`03-context-engine-map.md`](03-context-engine-map.md) | Foundation | factual |
| Layer 1 spec | [`04-layer1-recommendation-reveal-spec.md`](04-layer1-recommendation-reveal-spec.md) | Low | ✅ shipped |
| Roadmap — Layers 2 & 4 | [`05-roadmap-layers-2-4.md`](05-roadmap-layers-2-4.md) | Bridge | sequenced, not dispatched |
| Layer 1 plan | [`06-layer1-plan.md`](06-layer1-plan.md) | Dispatch payload | ✅ shipped (gated, merged) |
| **Dispatch tier — Layer 3 spec** | [`07-layer3-in-session-carousel-spec.md`](07-layer3-in-session-carousel-spec.md) | Low (executable) | **approved** |
| **Layer 3 plan (TDD)** | [`08-layer3-plan.md`](08-layer3-plan.md) | Dispatch payload | **ready** (5 tasks) |

---

## Locked decisions (from the brainstorm, 2026-06-20)

1. **Authored grounding.** Fuzzy keyword / topic-relationship-strength matching is a
   **build-time authoring aid** that produces a *reviewed* lane→PMID table. At runtime the
   app does a deterministic table lookup and shows the researcher's **exact quote verbatim**.
   This preserves "hallucination structurally impossible" while still getting smart matching.
2. **Layer 1 lives at the recommendation-reveal moment** — after intake + safety-gate CLEAR,
   just before breathing begins — keyed on **this session's freshly-derived lane**, so it is
   literally "why *this* protocol for you, right now."
3. **First grounded message is live** (`pt_advisor_passed`) — Zach Ermert, SPT, attested
   2026-06-20. Shipped to `main` (commit `2506d7b`).

---

## How Apex Mode consumes this

The dispatch tier (Layer 1 spec → Layer 1 plan) is the payload. The invariants are the
non-negotiable guardrails any executor inherits. The context-engine-map is the
source-isolated substrate executors read to avoid re-deriving the codebase. The roadmap
is *context only* — it shapes interfaces so Layer 1 doesn't wall off Layers 2–4, but no
executor builds from it.

**Next step:** the Layer 3 TDD plan is ready ([`08-layer3-plan.md`](08-layer3-plan.md)).
Dispatch via Apex Mode — `apex-bundle.json` carries two nodes: **n0** Layer-3 comprehension
(the M7 breath render path + the 5 invariants) → **n1** Layer-3 build, coordinator-gated.
Layer 1 already shipped this way (n0→n1, gate passed, merged).
