# 05 — Roadmap: Layers 2–4 (sequenced, NOT dispatched)

> Context only. No executor builds from this file. Its purpose is to shape Layer 1's
> interfaces so the upper layers extend the same mechanism instead of being walled off.
> Each layer becomes its own dispatch tier (its own bundle slice) when its turn comes.

---

## Layer 2 — Pre-session evidence carousel

**What:** instead of one card, show 2–4 evidence *facets* for the derived lane + the user's
input dimension (e.g. *why this breath family* · *why this pace* · *why movement helps your
symptom pattern*).

**Builds on Layer 1:** reuses `goal`-bound selection; adds a `facet` axis to messages
(e.g. `facet?: 'mechanism' | 'pacing' | 'movement' | 'symptom'`) so the carousel can pick
one message per facet. Selection returns a small ordered set, not a single message.

**Sequencing gate:** ships only after Layer 1's binding + reveal are validated in production
and at least 2–3 goals have multiple live facet-tagged messages. Until the corpus is deep
enough, a carousel is mostly empty slots — premature.

---

## Layer 3 — In-session grounded micro-guidance

**What:** the coaching text shown *during* the breath (the m7 phase renderers /
`microGuidance.ts`) is drawn from the same evidence corpus, selected by the derived lane +
pre-session input — so mid-breath guidance is unique to what the user entered.

**Builds on Layer 1:** same `goal`-bound, tag-ranked selection, applied to a different
surface and a different copy slot. Must respect INV-2 hard (in-breath is the most
trust-sensitive moment — no synthesized claims) and INV-1 (no per-frame nondeterminism).

**Sequencing gate:** after Layer 2; needs a vetted in-session copy register distinct from
the paper quote (the calm micro-cue is app voice; the citation is available on tap, not
shouted mid-breath). Requires PT review of in-session phrasing specifically.

---

## Layer 4 — Authoring / corpus pipeline (build-time) + longitudinal profile

**What (authoring):** the operator's "keyword matching + topic-relationship strength" engine
— a **build-time** tool that ingests candidate PMIDs, scores topic relevance to each
`RegulatoryGoal`, extracts candidate `display_quote`/`exact_figure`, and produces a *draft*
lane→PMID table for human + PT review. Output is `draft` → `engineering_passed` →
`pt_advisor_passed`. This is the only place fuzzy matching is allowed (INV-1).

**What (longitudinal):** a firewall-respecting read across Classes A–D that lets
recommendations sharpen over time **without** dissolving the four-class boundary or letting
history override the present (INV-4). Likely surfaces the existing rich `PatternSummary`
(today underused by `YourPatternsPanel`).

**Builds on Layer 1:** consumes the same table schema Layer 1 reads. The authoring tool's
*entire job* is to fill that table faithfully and at scale.

**Sequencing gate:** last. It is the highest-leverage *asset* but not the highest-leverage
*first move* — Layers 1–3 prove the consumption side and define exactly what the table must
contain before automating its production. Building the factory before the product ships is
the classic mediCalm-portfolio over-investment trap.

---

## Why this order is the discipline

Layer 1 defines the contract (how evidence binds to a derived lane). Layers 2–3 widen
*consumption* of that contract across surfaces. Layer 4 automates *production* into the
contract. Reversing the order — automating production before the contract is proven — builds
a fast pipeline to a target that keeps moving. Consumption first, automation last.
