# PT Clinical Pass 2 — Intake Simplification + Irritability Pattern (Design)

**Authority:** PT clinical refinement notes 2026-05-02 §2 §3 §5; brainstorm session 2026-05-04 with user.

**Status:** Design approved — ready for implementation plan.

---

## Goal

Replace the current 7-state multi-select intake + 6-field session intake with the PT advisor's branched 2-screen flow, while preserving the M6 engine investment via a translation layer. Add a quiet crisis-support affordance to `HomeScreen` so the SAD safety check is reachable independently of intake flow.

## Why this fits

The current intake interrogates: 13 user-facing decisions before a session can start. The PT's flow is structured like a real clinical encounter — short, two-question root, inferences pulled from history and engine. This pass adopts the PT-shaped front door without retiring the M6 intelligence behind it. The engine continues to receive the same `HariSessionIntake` shape it expects, just derived from fewer user-visible inputs through a small translation module.

Three concrete improvements:

1. Less friction at the moment of pain — a person reaching for the app while hurting can complete two screens, not seven.
2. Irritability pattern is clinical signal (Maitland classification), replacing the vague "how sensitive does your body feel" question with a precise descriptor.
3. Crisis support stops hiding behind a multi-select — pulled out as a quiet home-screen link, findable regardless of what the user said about their physical pain.

The cost: M6.4 input narrows to one emotional state per branch instead of up to seven. Multi-state expressive range is preserved only via R&D override paths.

---

## Architecture

### Flow shape

```
HomeScreen
   ├── [Begin session] ───────────────────────────────────────────────┐
   └── [Need crisis support?]
          │
          ▼
       SADSafetyScreen ──"yes"──▶ SupportResourcesScreen (988)
                       └──"no"──▶ HomeScreen

StateSelectionScreen (rebuilt — branched intent)
   ▼
SessionIntakeScreen (rebuilt — 4 fields)
   ▼
HariSafetyGateScreen (unchanged from PT pass 1)
   ▼
SessionSetupScreen ─▶ GuidedSessionScreen
```

### What changes
- `StateSelectionScreen`: 7-state multi-select → 2-option branched single-select
- `SessionIntakeScreen`: 6 fields → 4 fields, with branch-aware copy
- `HomeScreen`: adds quiet "Need crisis support?" affordance below history
- New module: `src/engine/intakeTranslation.ts` (pure functions)
- `SADSafetyScreen` "No" route: `session_intake` → `home`
- `HariSessionIntake` interface: gains `branch` + `irritability`; `session_intent`, `symptom_focus`, `flare_sensitivity` become silently-derived

### What stays
- M6.4 state interpretation engine (consumes derived emotional state input)
- M6.5 session config / M6.8 breath family / M5.2 adaptive defaults / M7.1 adaptation
- HARI safety gate, session setup, guided session screens
- All 5 position options (PT spec literal was 3; activity context retained per user call)
- `SADSafetyScreen` "Yes" → `SupportResourcesScreen` routing
- `HistoryEntry` persistence shape (with new fields marked optional for backward compat)

### What's removed
- "Heavy" expandable subcategory and Sad/Angry/Overwhelmed sub-states
- Visible `session_intent` question (Quick reset / Deeper regulation / Flare-sensitive / Cautious test)
- Visible `symptom_focus` question (now silent default via M5.2 adaptive defaults)
- Visible `flare_sensitivity` question (replaced by irritability pattern)
- `'not_sure'` from `SessionLengthPreference`

---

## UI specification

### Screen 1 — `StateSelectionScreen` (rebuilt)

```
┌─────────────────────────────────────┐
│ ← Back                              │
│                                     │
│  Why are you using the app today?   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Tightness or pain            │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Anxious or overwhelmed       │  │
│  └───────────────────────────────┘  │
│                                     │
│                       [ Continue ]  │
└─────────────────────────────────────┘
```

- Header: **"Why are you using the app today?"** (PT verbatim)
- Two large tap targets, single-select radio behavior
- Continue enabled once one is selected; explicit Continue (not auto-advance)
- Back routes to `HomeScreen`

### Screen 2 — `SessionIntakeScreen` (rebuilt)

```
┌─────────────────────────────────────┐
│ ← Tightness or pain                 │  (tappable breadcrumb to edit branch)
│                                     │
│  How severe is your tightness       │  ← branch-aware:
│  or pain right now?                 │     "How intense is it right now?"
│                                     │     when anxious branch
│  [────────────●─────────] 7/10      │
│                                     │
│  How would you describe it?         │
│  ◯ Comes on quickly, goes away slowly
│  ◯ Comes on slowly, goes away quickly
│  ◯ Comes on and goes away about the same
│                                     │
│  Where are you right now?           │
│  ◯ Sitting    ◯ Standing            │
│  ◯ Driving / in vehicle             │
│  ◯ Lying down                       │
│  ◯ After strain or overuse          │
│                                     │
│  How long feels right today?        │
│  ◯ Short   ◯ Standard   ◯ Longer    │
│                                     │
│                       [ Continue ]  │
└─────────────────────────────────────┘
```

**Field copy:**
- Severity slider header (branch-aware):
  - `tightness_or_pain`: **"How severe is your tightness or pain right now?"**
  - `anxious_or_overwhelmed`: **"How intense is it right now?"**
- Irritability prompt: **"How would you describe it?"** with 3 PT-verbatim options
- Position prompt: **"Where are you right now?"** — 5 options retained
- Length prompt: **"How long feels right today?"** — 3 options (Short / Standard / Longer)

**Continue:** enabled once severity, irritability, position, and length are all set. (Severity defaults to 5 → effectively gated on the other three.)

**Back:** breadcrumb at top is tappable, routes to `StateSelectionScreen` with current branch preselected.

### `HomeScreen` — crisis support affordance

```
┌─────────────────────────────────────┐
│  mediCalm                           │
│  Just Breathe.                      │
│  Structured breathing protocol...   │
│                                     │
│         (orb)                       │
│                                     │
│      [ Begin session ]              │
│  Calibrated to your current...      │
│                                     │
│  Your State    Your Patterns        │
│  Continue What Helped               │
│                                     │
│  Past sessions...                   │
│                                     │
│  ─────────────────────              │
│  Need crisis support?  ←── NEW      │
│  ─────────────────────              │
└─────────────────────────────────────┘
```

- Placement: below past-sessions list, separated by quiet divider
- Copy: **"Need crisis support?"** — text-link style, muted color
- Routes: `dispatch({ type: 'NAVIGATE', screen: 'sad_safety' })`
- Intentionally low-prominence — present for those who need it, not promoted

### `SADSafetyScreen` routing fix
- "No" → `home` (was: `session_intake`)
- "Yes" → `support_resources` (unchanged)
- Origin-context awareness no longer required — single entry point now

---

## Engineering specification

### New module: `src/engine/intakeTranslation.ts`

Pure functions, no side effects, no I/O. Owns the user-input → engine-input mapping.

```ts
import type { HariEmotionalState, FlareSensitivity } from '../types/hari'
import type { IntakeBranch, IrritabilityPattern } from '../types/hari'

/**
 * Maps PT-aligned intent branch to M6.4 emotional state input.
 * Single-state output per branch (PT used "or" between terms — synonyms,
 * not a checklist). M6.4 unified mode handles single state cleanly.
 */
export function branchToEmotionalStates(
  branch: IntakeBranch
): HariEmotionalState[] {
  return branch === 'tightness_or_pain' ? ['pain'] : ['anxious']
}

/**
 * Maps PT irritability pattern to existing FlareSensitivity field.
 * Authority: Maitland irritability classification.
 */
export function irritabilityToFlareSensitivity(
  pattern: IrritabilityPattern
): FlareSensitivity {
  switch (pattern) {
    case 'fast_onset_slow_resolution': return 'high'
    case 'slow_onset_fast_resolution': return 'low'
    case 'symmetric': return 'moderate'
  }
}
```

### Type changes — `types/hari.ts`

```ts
// NEW types
export type IntakeBranch =
  | 'tightness_or_pain'
  | 'anxious_or_overwhelmed'

export type IrritabilityPattern =
  | 'fast_onset_slow_resolution'
  | 'slow_onset_fast_resolution'
  | 'symmetric'

// MODIFIED — SessionLengthPreference narrows
export type SessionLengthPreference = 'short' | 'standard' | 'longer'
//   was: 'shorter' | 'standard' | 'longer' | 'not_sure'

// MODIFIED — HariSessionIntake gains visible fields, retires three to "silent"
export interface HariSessionIntake {
  // Visible / user-set
  branch: IntakeBranch                                  // NEW
  irritability: IrritabilityPattern                     // NEW
  baseline_intensity: number                            // unchanged
  current_context: CurrentContext                       // unchanged (5 options)
  session_length_preference: SessionLengthPreference    // narrowed

  // Silent / derived
  session_intent: SessionIntent                         // always 'quick_reset'
  symptom_focus: SymptomFocus                           // M5.2 adaptive default; fallback 'spread_tension'
  flare_sensitivity: FlareSensitivity                   // derived via irritabilityToFlareSensitivity()
}

// MODIFIED — PersistedHariMetadata.intake fields are optional for backward read compat
// Old HistoryEntry records lack `branch` and `irritability`; defaults applied at read time
```

### `EntryState` (`pendingStateEntry`) shape change

```ts
// BEFORE
export interface EntryState {
  states: HariEmotionalState[]
}

// AFTER
export interface EntryState {
  branch: IntakeBranch
}
```

`pendingStateEntry` is per-session ephemeral state (not persisted to localStorage). Breaking change is safe — any in-flight session before the deploy is lost on refresh, which is already the existing contract.

### Routing edges
| Edge | Before | After |
|---|---|---|
| `HomeScreen` Begin session | → `state_selection` | → `state_selection` *(unchanged)* |
| `HomeScreen` Need crisis support? | *(didn't exist)* | → `sad_safety` |
| `StateSelectionScreen` Continue | → `sad_safety` if Sad selected, else `session_intake` | → `session_intake` |
| `SADSafetyScreen` "No" | → `session_intake` | → `home` |
| `SADSafetyScreen` "Yes" | → `support_resources` | → `support_resources` *(unchanged)* |
| `SessionIntakeScreen` Continue | → `hari_safety_gate` | → `hari_safety_gate` *(unchanged)* |

---

## Build order

Designed to keep the codebase compile-clean throughout. TDD applied selectively (translation layer + screens), skipped on type-shape mechanical edits.

1. **Add new types** — `IntakeBranch`, `IrritabilityPattern` in `types/hari.ts`. Widen `SessionLengthPreference` temporarily (keep both old and new union members) to avoid breaking existing call sites mid-build.
2. **TDD translation layer** — `src/engine/intakeTranslation.test.ts` first (failing), then `intakeTranslation.ts`.
3. **Modify `HariSessionIntake` interface** — add new required fields; mark `PersistedHariMetadata.intake` fields as `Partial<HariSessionIntake> & {...}` for backward compat read.
4. **`EntryState` migration** — update reducer + `pendingStateEntry` payload. Keep action name `SET_STATE_ENTRY` (avoid AppContext caller churn); change payload shape only from `{ states: HariEmotionalState[] }` to `{ branch: IntakeBranch }`.
5. **Rebuild `StateSelectionScreen`** — full UI rewrite + test rewrite.
6. **Rebuild `SessionIntakeScreen`** — full UI rewrite + test rewrite. Wire `adaptiveIntakeDefaults` to populate `symptom_focus` and `session_intent` silently.
7. **`HomeScreen`** — add crisis-support link + test assertion.
8. **`SADSafetyScreen`** — fix "No" routing + update test.
9. **`App.test.tsx`** — rewrite integration coverage to walk the new branched flow. Delete the stale M6.6 routing assertion that's been failing since PT pass 1.
10. **Tighten `SessionLengthPreference`** — narrow to final union once nothing references old members.
11. **Build + full vitest run** — must be green.
12. **Playwright snapshot regen** — `npm run capture`. Real visual deltas in: home (new affordance), state selection (new layout), session intake (new layout). Continuous orb animation accounts for residual drift.

---

## Migration concerns

### `HistoryEntry` records (persisted)
Existing entries store the old `HariSessionIntake` shape and lack `branch` / `irritability`. Solution: mark these fields optional on `PersistedHariMetadata.intake` (separate from the live `HariSessionIntake` interface used in the active flow). New entries get them; reads of old entries treat them as `undefined`. `adaptiveIntakeDefaults` already has fallback behavior for missing fields — no migration script needed.

### `pendingStateEntry` shape
Per-session ephemeral, not persisted. Breaking change is safe.

---

## Risks

- **M6.4 input narrowed.** Always exactly 1 emotional state from production paths. Overload (5+) and prioritized (3-4) modes become unreachable except via R&D override. Acceptable per design call B in Q1; one-time visual check recommended that prescribed sessions still feel reasonable across both branches after deploy.
- **Severity slider semantic shift.** Pain branch = "how severe is your pain"; anxious branch = "how intense is the anxiety." Engine consumes both as `baseline_intensity` 0–10 — same field, different meaning. Downgrade thresholds (intensity ≥ 7) apply uniformly. If anxious users hit unexpected safety downgrades, this is the seam.
- **Playwright snapshot drift.** Most regenerated PNGs will be continuous-orb-animation noise; ~5 will have real visual content changes. Same accept-as-is approach as PT pass 1.

---

## Pre-existing issues we'll touch

- `App.test.tsx` routing failure (failing since PT pass 1 due to M6.6 routing change). We're rewriting `App.test.tsx` integration coverage anyway — fix this as part of the rewrite.
- `SADSafetyScreen.test.tsx` "No" routing assertions — update to assert `home` instead of `session_intake`.

## Pre-existing issues we won't touch (deferred)

- Atypical right-sided cardiac radiation copy (PT advisor question)
- Internal `shallow_breathing` symptom_tag rename (`taxonomy.ts`, `mechanisms.ts`, `interpretationLayer.ts`)
- Legacy R&D path cleanup (`PainInputScreen` / `SafetyStopScreen` / `RDReviewScreen`)
- M7 work (Entry Behavior Layer)
- M6.9 User Refinement Layer (locked for after M7.3)
- `feasibility.ts` and `setup.ts` pre-existing TS noise

---

## Testing strategy

- **Translation layer:** new `src/engine/intakeTranslation.test.ts` — both branches, all 3 irritability mappings, type-correctness assertions
- **`StateSelectionScreen`:** rewrite tests for 2-option radio + Continue + branch persistence to AppContext
- **`SessionIntakeScreen`:** rewrite tests — irritability options + branch-aware severity label + position 5-option set + length 3-option set + Continue gating
- **`HomeScreen`:** add assertion for "Need crisis support?" link presence + routing
- **`SADSafetyScreen`:** update "No" routing assertion to `home`
- **`App.test.tsx`:** at least one full-flow test from `state_selection` through `hari_safety_gate` via the new branched path
- **Playwright baseline:** regenerate via `npm run capture`; manual eyeball check of the ~5 real visual deltas before committing

---

## Rollout

Single feature branch (`m5-6-architecture-pass`), batched commits per build-order step, push to `origin`. Optional fast-forward merge of `main` to feature-branch tip after manual verification via the running ngrok tunnel. No production users, no migration window, no rollback plan needed.

## Authority chain

This spec extends:
- M4.2 MVP intake spec (defines existing `HariSessionIntake` 6-field shape)
- M6.1 State Selection Screen spec (defines existing 7-state multi-select)
- M6.1.1 SAD Safety Screen v2.1 (defines current SAD safety check)
- M6.4 State Interpretation Engine spec (consumer of emotional state input)
- PT clinical refinement notes 2026-05-02 (NEW — exogenous to markdown pack)

After this pass lands, the M6.1 and M6.1.1 specs should be amended with a "SUPERSEDED 2026-05-04: see PT clinical pass 2 design doc" note. Doc-update task, not code-update — separate from the implementation plan.
