# 03 — Context Stack: Source-Isolated Engine Map

> Factual map of the parts of mediCalm's engine the Grounded Guidance layers touch.
> Produced by source-isolated reconnaissance (code as ground truth, no narrative).
> Executors read this to avoid re-deriving the codebase. **No changes are proposed here.**

## The derivation chain (this is the lane the evidence binds to)

```
StateInterpretationInput { states: HariEmotionalState[], intensity: number, sensitivity: FlareSensitivity }
   │  interpretStates()                        src/engine/hari/stateInterpretation.ts
   ▼
StateInterpretationResult
   │  classifyNeedProfile()                    src/engine/hari/needProfile.ts
   ▼
NeedProfile { primaryGoal: RegulatoryGoal, secondaryGoal?, effortCapacity, safetyLevel,
              activationPermitted, breathDowngraded, overload }
   │  selectBreathFamily(need, feasibility)    src/engine/hari/breathFamily.ts
   ▼
BreathFamily  ──prescribeBreath()──>  BreathPrescription  ──>  GuidedSessionScreen
```

**The lane key Layer 1 binds evidence to = `NeedProfile.primaryGoal` (a `RegulatoryGoal`).**
Rationale: research speaks to a *mechanism* (e.g. "slow exhale-dominant breathing
downregulates arousal"), which is the goal — not a specific 4s/7s timing, which is
implementation detail of the `BreathFamily`.

## RegulatoryGoal (7) — the binding key

`decompress` · `restore` · `stabilize` · `downregulate` · `expand` · `ground` · `activate`

`GOAL_MAP` (emotional state → goal): `overwhelmed→downregulate`, `pain→decompress`,
`exhausted→restore`, `anxious→downregulate`, `tight→expand`, `angry→ground`,
`sad→restore` (→`activate` only if `activationPermitted`). Overload always →
`downregulate`, `safetyLevel:'high'`, `activationPermitted:false`.

## BreathFamily (8) — what the goal resolves to

| Name | In | Hold | Out | Session name |
|---|---|---|---|---|
| `flare_safe_soft_exhale` | 3 | 0 | 6 | Gentle Breath |
| `decompression_expand` | 4 | 0 | 6 | Open Breath |
| `restorative` | 3 | 0 | 6 | Rest and Restore |
| `neutral_reset` | 4 | 0 | 6 | Steady Ground |
| `calm_downregulate` | 4 | 0 | 7 | Calm Reset |
| `lateral_expansion` | 3 | 0 | 5 | Open and Release |
| `grounding` | 3 | 0 | 5 | Ground and Release |
| `gentle_activation` | 4 | 0 | 3 | Gentle Lift |

## The user-input dimension (for personalization / ranking)

Taxonomy in `src/types/taxonomy.ts`:
- **LocationTag (15):** head, jaw, ear, front_neck, back_neck, throat, shoulders, chest,
  upper_back, ribs, mid_back, lower_back, hips, arm, hand
- **SymptomTag (17):** burning, tingling, numbness, nerve_like, radiating, sharp, throbbing,
  tightness, pressure, soreness, aching, stiffness, shallow_breathing, guarding, instability,
  coordination_change, weakness
- **TriggerTag (10):** sitting, standing, driving, eating, post_sleep, stress,
  overhead_movement, screen_use, exercise, unknown

## The grounded message layer (already shipped — Slice 1)

`src/types/groundedMessage.ts`:
```ts
type MessageSelectors = { location?: LocationTag[]; symptom?: SymptomTag[]; trigger?: TriggerTag[] }
type GroundedMessage = {
  message_id, text, selectors: MessageSelectors,
  citation: TierACitation,            // { pmid, source_link, exact_figure, figure_units }
  display_quote, authored_by, authored_at,
  review_status,                      // 'draft' | 'engineering_passed' | 'pt_advisor_passed' | 'locked'
}
```
`src/engine/groundedMessages/selectTip.ts`:
- `liveMessages(bank?)` — filters to `review_status === 'pt_advisor_passed'`. The single liveness chokepoint.
- `selectPreSessionTip(lastSession, bank?)` — scores live messages against the **last** session's
  tags; deterministic; tie-break `message_id` asc; `null` when no session or no match.

Bank: `src/data/groundedMessages.ts` — currently **1 live message**
(`gentle_exercise_eases_sensitization`, PMID 39818121, attested 2026-06-20).
Cache + coverage gate: `src/data/pmidVerification.json` (`npm run verify:pmids`).

## Session flow & the reveal insertion point

`StateSelectionScreen → SessionIntakeScreen → HariSafetyGateScreen → (build session) → GuidedSessionScreen`

The **recommendation-reveal** (Layer 1) inserts **after `HariSafetyGateScreen` returns CLEAR
and the session/NeedProfile is built, before `GuidedSessionScreen` begins**. Natural host:
the M7 intro transition family (`src/components/m7/IntroTransition.tsx` /
`BetweenTransition.tsx`). At that point `NeedProfile.primaryGoal` and the user's intake tags
are both known.

## Four data classes (firewall — see INV-4)

- **A** `BodyContext` (localStorage, user-owned, 8 categories) — `bodyContextSummary.ts`
- **B** `HariSessionIntake` + `StateInterpretationResult` (this session) — not persisted as profile
- **C** `HistoryEntry[]` (`sessionHistory` storage)
- **D** `PatternSummary` (`patternReader.ts`, cached, reconstructible from C)
> Explicitly prohibited from merging into one profile. Class B overrides historical influence.

## Shallow points relevant to upper layers (not Layer 1 blockers)

- `YourPatternsPanel` does **not** use the rich `PatternSummary` engine (uses 3 hardcoded strings).
- `location_muscles` / `location_pattern` captured but engine-ignored today ("future M7+").
- `pacing_tendency` hard-capped at `candidate` (D1 debt). `outcome_trajectory` observational only.
- Body Context influence on state estimation capped at +1 compression-sensitivity bias.
