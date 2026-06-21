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

- **Dispatch tier (build now):** Layer 1 — *Recommendation-Reveal*.
- **Roadmap (do not build yet):** Layers 2–4, carried as sequenced context so the
  dispatch-tier work is designed to extend, not block, them.

---

## Tier map

| Tier | File | Altitude | State |
|---|---|---|---|
| Vision + Architecture | [`01-vision-and-architecture.md`](01-vision-and-architecture.md) | High | locked direction |
| Invariants (mechanism-named) | [`02-invariants.md`](02-invariants.md) | Guardrails | **LOCKED** |
| Context stack (source-isolated engine map) | [`03-context-engine-map.md`](03-context-engine-map.md) | Foundation | factual |
| **Dispatch tier — Layer 1** | [`04-layer1-recommendation-reveal-spec.md`](04-layer1-recommendation-reveal-spec.md) | Low (executable) | **awaiting review** |
| Roadmap — Layers 2–4 | [`05-roadmap-layers-2-4.md`](05-roadmap-layers-2-4.md) | Bridge | sequenced, not dispatched |
| Implementation plan (Layer 1 TDD tasks) | `../../superpowers/plans/2026-06-20-grounded-guidance-layer1.md` | Dispatch payload | produced by writing-plans **after review** |

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

**Next step:** operator reviews `04-…` (the dispatch-tier spec). On approval, invoke
`superpowers:writing-plans` to generate the Layer 1 TDD plan, then dispatch.
