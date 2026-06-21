# 04 — Dispatch Tier: Layer 1 — Recommendation-Reveal

**Goal:** at the moment the engine has derived a session's lane, show the user the
research that explains *that* recommendation — exact quote, linked PMID — keyed on the
derived `RegulatoryGoal`. Honest, deterministic, verbatim.

**Inherits:** all invariants in [`02-invariants.md`](02-invariants.md). Reads the engine
facts in [`03-context-engine-map.md`](03-context-engine-map.md).

---

## Design decisions (flagged for operator review)

> These are my best-judgment calls filling the open Layer-1 details. Each is reversible;
> flag any you want changed before the plan is written.

- **D-A — Bind on `RegulatoryGoal`.** Add `goal?: RegulatoryGoal[]` to `MessageSelectors`.
  Evidence binds to the *mechanism* (the goal), not to a specific `BreathFamily` timing.
  *(Alternative considered: bind on `BreathFamily`. Rejected — research grounds mechanisms,
  not 4/7 timings; goal is the stable key and there are fewer of them.)*
- **D-B — Surface = the session intro moment.** Render the reveal in the M7 intro-transition
  region, after safety-gate CLEAR, before the breath loop. Not a new full screen — an
  evidence panel within the existing intro beat, so flow isn't lengthened by a hard stop.
- **D-C — Selection is goal-gated, tag-ranked.** Eligible = live messages whose `goal`
  selector includes the derived `primaryGoal`. Rank eligible by overlap with this session's
  symptom/location/trigger tags (personalization); tie-break `message_id` asc. `null` → render
  nothing (INV-5).
- **D-D — Additive.** The existing home-screen last-session tip (`selectPreSessionTip`) stays
  unchanged. Layer 1 adds a new surface; it does not move or remove the old one.
- **D-E — App voice vs paper voice are visually distinct.** The plain-language "why this for
  you" line is app-authored and styled as the app's voice; the quote + PMID is the paper's
  voice (INV-2).

## New / changed interfaces

```ts
// src/types/groundedMessage.ts  — extend selectors
type MessageSelectors = {
  location?: LocationTag[]
  symptom?: SymptomTag[]
  trigger?: TriggerTag[]
  goal?: RegulatoryGoal[]          // NEW — binds evidence to the engine's derived lane
}

// src/engine/groundedMessages/selectRecommendationEvidence.ts  — NEW
export type SessionInputTags = {
  symptom?: SymptomTag[]
  location?: LocationTag[]
  trigger?: TriggerTag[]
}

/**
 * Deterministic. Returns the live, goal-bound message best matching this session,
 * or null if none. No clock, no randomness (INV-1).
 */
export function selectRecommendationEvidence(
  derivedGoal: RegulatoryGoal,
  input: SessionInputTags,
  bank?: GroundedMessage[],
): GroundedMessage | null
```

**Selection algorithm (pure):**
1. `eligible = liveMessages(bank).filter(m => m.selectors.goal?.includes(derivedGoal))`
2. If `eligible.length === 0` → return `null`.
3. `score(m) = |m.selectors.symptom ∩ input.symptom| + |m.selectors.location ∩ input.location| + |m.selectors.trigger ∩ input.trigger|` (a message with no input-tag selectors scores 0 but stays eligible on the goal match).
4. Sort by `score` desc, then `message_id` asc. Return `eligible[0]`.

## Surface contract

Given a non-null result, the reveal renders:
- **Session name** (from the resolved `BreathFamily`, e.g. "Calm Reset").
- **App-voice "why" line** — one app-authored sentence tying the derived goal to the user
  (e.g. "Slower, longer exhales help settle an activated system."). NOT attributed to the paper.
- **`GroundedTip`** (reuse the shipped component): message text → "Learn more" → exact quote
  (`display_quote`) + linked PMID, verbatim.

Given `null`: render nothing in the evidence slot (the intro proceeds normally). INV-5.

## Bank seeding (Layer 1)

Add `goal` selectors to the existing message and seed **at least one live, goal-bound
message per goal that the demo path can hit** (`downregulate`, `decompress`, `restore` are
the highest-traffic). Each new message: passes structural + coverage gates, ships
`engineering_passed` (dark) until PT attestation, then flips to `pt_advisor_passed`. The
existing `gentle_exercise_eases_sensitization` gains `goal: ['decompress','restore']`
(movement-eases-sensitization supports protect/restore mechanisms) — **subject to PT
re-attestation of the goal binding**, since the binding is itself a clinical claim.

## Acceptance criteria

1. `MessageSelectors.goal` exists; structural gate accepts canonical `RegulatoryGoal` values
   and rejects non-canonical ones.
2. `selectRecommendationEvidence` is pure and snapshot-stable (INV-1) — verified by a
   determinism test (same inputs → same output across repeated calls).
3. Goal-gating: a message NOT bound to the derived goal is never returned, even with perfect
   tag overlap.
4. Tag ranking: among same-goal messages, higher tag overlap wins; ties broken by
   `message_id` asc.
5. `null` path: no eligible message → function returns `null` and the surface renders empty
   (INV-5) — asserted by a component test.
6. Liveness: a goal-bound but `engineering_passed` message is never returned (INV-3).
7. Quote fidelity: rendered quote is byte-identical to `display_quote`; the "why" line is
   app-authored and not attributed to the paper (INV-2) — asserted by a component test.
8. Additivity: the home-screen `selectPreSessionTip` surface is unchanged (its tests still pass).
9. Coverage gate still green: every bank PMID present in `pmidVerification.json`.

## Out of scope for Layer 1 (belongs to roadmap)

Carousel of multiple facets (L2), in-session micro-guidance (L3), the build-time
authoring/topic-strength tool (L4), any cross-class longitudinal profile (L4 + INV-4).
