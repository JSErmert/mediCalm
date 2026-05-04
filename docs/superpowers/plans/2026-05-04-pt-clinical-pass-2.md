# PT Clinical Pass 2 — Intake Simplification + Irritability Pattern Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current 7-state multi-select intake + 6-field SessionIntake with the PT advisor's branched 2-screen flow, preserve M6 engine via a small translation layer, and detach SAD safety from the intake path so it lives as a quiet HomeScreen affordance.

**Architecture:** New `intakeTranslation` module maps the user-visible `IntakeBranch` (`tightness_or_pain` | `anxious_or_overwhelmed`) and `IrritabilityPattern` (3 choices) into the existing `HariEmotionalState[]` and `FlareSensitivity` types that M6.4 already consumes. `HariSessionIntake` gains `branch` + `irritability`; `session_intent`, `symptom_focus`, and `flare_sensitivity` become silent defaults. `pendingStateEntry` retypes from `EntryState[]` to `IntakeBranch | null`. `EntryState` (the legacy emotional-state string union) is retained only for backward read compat on persisted `HistoryEntry.state_entry`.

**Tech Stack:** React 18 + TypeScript + Vite, Vitest + @testing-library/react, CSS Modules, Playwright (for baseline regen).

**Authority:** Spec at `docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md` — read it before starting if you are not the brainstorm participant.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/types/hari.ts` | Add `IntakeBranch`, `IrritabilityPattern`; modify `HariSessionIntake`; narrow `SessionLengthPreference`; widen `PersistedHariMetadata.intake` for backward compat |
| Create | `src/engine/intakeTranslation.ts` | Pure-function mappings: `branchToEmotionalStates`, `irritabilityToFlareSensitivity` |
| Create | `src/engine/intakeTranslation.test.ts` | Unit tests for translation layer |
| Modify | `src/context/AppContext.tsx` | Retype `pendingStateEntry`; update `SET_STATE_ENTRY` action payload |
| Modify | `src/context/AppProvider.tsx` | Update reducer for new `SET_STATE_ENTRY` shape |
| Modify | `src/context/AppContext.test.tsx` | Update test for new payload shape |
| Replace | `src/screens/StateSelectionScreen.tsx` | Branched 2-option intent screen |
| Replace | `src/screens/StateSelectionScreen.test.tsx` | Tests for new shape |
| Replace | `src/screens/SessionIntakeScreen.tsx` | 4-field intake with branch-aware severity copy |
| Replace | `src/screens/SessionIntakeScreen.test.tsx` | Tests for new shape (or create if missing) |
| Modify | `src/screens/HomeScreen.tsx` | Add quiet "Need crisis support?" affordance below history |
| Modify | `src/screens/HomeScreen.test.tsx` | Add assertion for new affordance routing |
| Modify | `src/screens/SADSafetyScreen.tsx` | "No" → `home`; "Back" → `home`; "Yes" unchanged |
| Modify | `src/screens/SADSafetyScreen.test.tsx` | Update routing assertions |
| Modify | `src/App.test.tsx` | Replace stale M6.6 routing assertion with new branched-flow walk |
| Modify | `e2e/baseline-capture.spec.ts` | Update locators referencing changed copy |
| Modify | `snapshots/*.png` | Regenerated via `npm run capture` |

---

## Scope Constraints

- DO NOT change `src/engine/hari/` engine modules (M6.4 / M6.5 / M6.8 / M5.2). They consume the same shapes; only the inputs that produce those shapes change.
- DO NOT modify `HariSafetyGateScreen`, `SessionSetupScreen`, `GuidedSessionScreen` — out of scope.
- DO NOT delete `EntryState` type — kept for legacy `HistoryEntry.state_entry` read compat.
- DO NOT touch the deferred items listed in the spec (PainInputScreen / SafetyStopScreen / RDReviewScreen, internal `shallow_breathing` rename, M7 / M6.9 work, pre-existing `feasibility.ts` and `setup.ts` TS noise).
- DO NOT skip git hooks (no `--no-verify`).

---

## Task 1: New types — `IntakeBranch`, `IrritabilityPattern`, narrow `SessionLengthPreference`

**Files:**
- Modify: `src/types/hari.ts`

- [ ] **Step 1: Add `IntakeBranch` and `IrritabilityPattern` types**

Open `src/types/hari.ts`. Find the existing `SessionLengthPreference` block (around line 60). Immediately AFTER it, add:

```typescript
/**
 * PT Clinical Pass 2 — branched intent (replaces 7-state multi-select).
 * Authority: PT clinical refinement notes 2026-05-02 §3
 */
export type IntakeBranch =
  | 'tightness_or_pain'
  | 'anxious_or_overwhelmed'

/**
 * PT Clinical Pass 2 — irritability pattern (Maitland classification).
 * Replaces the visible flare_sensitivity question.
 * Authority: PT clinical refinement notes 2026-05-02 §3
 */
export type IrritabilityPattern =
  | 'fast_onset_slow_resolution'  // comes quickly, leaves slowly → high
  | 'slow_onset_fast_resolution'  // comes slowly, leaves quickly → low
  | 'symmetric'                   // about the same → moderate
```

- [ ] **Step 2: Narrow `SessionLengthPreference`**

Find the existing `SessionLengthPreference` definition:

```typescript
export type SessionLengthPreference = 'shorter' | 'standard' | 'longer' | 'not_sure'
```

Replace with:

```typescript
export type SessionLengthPreference = 'short' | 'standard' | 'longer'
```

- [ ] **Step 3: Run TypeScript build to surface call sites needing updates**

Run: `npm run build`
Expected: Errors in `SessionIntakeScreen.tsx` (uses `'shorter'` and `'not_sure'`), `adaptiveIntakeDefaults.ts` (may emit `'shorter'`), and possibly `protocolHintReinforcement.ts`. **Do not fix these now — Tasks 6 and downstream rebuilds will resolve them.** This task only confirms the type is updated and the surface area of impact is visible.

- [ ] **Step 4: Commit**

```bash
git add src/types/hari.ts
git commit -m "$(cat <<'EOF'
feat(types): add IntakeBranch + IrritabilityPattern; narrow SessionLengthPreference

PT clinical pass 2 type foundation. SessionLengthPreference narrows
from 4 values to PT-aligned 3 ('short' | 'standard' | 'longer').
Downstream call sites surface as TypeScript errors and are fixed in
subsequent tasks.

Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: TDD `intakeTranslation` module

**Files:**
- Create: `src/engine/intakeTranslation.test.ts`
- Create: `src/engine/intakeTranslation.ts`

- [ ] **Step 1: Write the failing test file**

Create `src/engine/intakeTranslation.test.ts`:

```typescript
/**
 * PT Clinical Pass 2 — intakeTranslation tests.
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import { describe, it, expect } from 'vitest'
import {
  branchToEmotionalStates,
  irritabilityToFlareSensitivity,
} from './intakeTranslation'
import type { IntakeBranch, IrritabilityPattern } from '../types/hari'

describe('branchToEmotionalStates', () => {
  it('maps tightness_or_pain to ["pain"]', () => {
    expect(branchToEmotionalStates('tightness_or_pain')).toEqual(['pain'])
  })

  it('maps anxious_or_overwhelmed to ["anxious"]', () => {
    expect(branchToEmotionalStates('anxious_or_overwhelmed')).toEqual(['anxious'])
  })

  it('returns single-state arrays for both branches', () => {
    const branches: IntakeBranch[] = ['tightness_or_pain', 'anxious_or_overwhelmed']
    for (const b of branches) {
      expect(branchToEmotionalStates(b)).toHaveLength(1)
    }
  })
})

describe('irritabilityToFlareSensitivity', () => {
  it('maps fast_onset_slow_resolution to high', () => {
    expect(irritabilityToFlareSensitivity('fast_onset_slow_resolution')).toBe('high')
  })

  it('maps slow_onset_fast_resolution to low', () => {
    expect(irritabilityToFlareSensitivity('slow_onset_fast_resolution')).toBe('low')
  })

  it('maps symmetric to moderate', () => {
    expect(irritabilityToFlareSensitivity('symmetric')).toBe('moderate')
  })

  it('covers all IrritabilityPattern variants', () => {
    const patterns: IrritabilityPattern[] = [
      'fast_onset_slow_resolution',
      'slow_onset_fast_resolution',
      'symmetric',
    ]
    for (const p of patterns) {
      const result = irritabilityToFlareSensitivity(p)
      expect(['low', 'moderate', 'high']).toContain(result)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/engine/intakeTranslation.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the translation module**

Create `src/engine/intakeTranslation.ts`:

```typescript
/**
 * intakeTranslation — PT Clinical Pass 2.
 *
 * Maps PT-aligned user input (IntakeBranch, IrritabilityPattern) to the
 * existing HARI engine input types (HariEmotionalState[], FlareSensitivity).
 * Keeps M6.4/M6.5/M6.8 engine investment intact behind the simpler front door.
 *
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import type {
  HariEmotionalState,
  FlareSensitivity,
  IntakeBranch,
  IrritabilityPattern,
} from '../types/hari'

/**
 * Maps PT-aligned intent branch to M6.4 emotional state input.
 * Single-state output per branch — PT used "or" between terms (synonyms,
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
 *   fast_onset_slow_resolution → high (most irritable)
 *   slow_onset_fast_resolution → low (least irritable)
 *   symmetric                  → moderate
 */
export function irritabilityToFlareSensitivity(
  pattern: IrritabilityPattern
): FlareSensitivity {
  switch (pattern) {
    case 'fast_onset_slow_resolution':
      return 'high'
    case 'slow_onset_fast_resolution':
      return 'low'
    case 'symmetric':
      return 'moderate'
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/engine/intakeTranslation.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/intakeTranslation.ts src/engine/intakeTranslation.test.ts
git commit -m "$(cat <<'EOF'
feat(engine): intakeTranslation — branch + irritability → HARI input

Pure-function module mapping PT-aligned IntakeBranch to
HariEmotionalState[] and IrritabilityPattern to FlareSensitivity.
Preserves M6.4 / M6.8 engine consumers behind the simpler front door.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Modify `HariSessionIntake` interface

**Files:**
- Modify: `src/types/hari.ts`

- [ ] **Step 1: Update `HariSessionIntake` to add branch + irritability**

Find the `HariSessionIntake` interface block (around line 67). Replace its entire body with:

```typescript
/**
 * HariSessionIntake — pre-session state.
 * Truth class B: Active Session State.
 *
 * PT Clinical Pass 2: gains `branch` and `irritability` as user-visible
 * fields. `session_intent`, `symptom_focus`, and `flare_sensitivity` are
 * retained but become silent defaults (derived or set from M5.2 adaptive
 * defaults; flare_sensitivity is derived from irritability).
 *
 * Authority: M4.2 MVP §3 §15; M4.5.2 baseline intensity patch;
 *            PT clinical refinement notes 2026-05-02
 */
export interface HariSessionIntake {
  // PT-aligned visible fields (PT pass 2)
  branch: IntakeBranch
  irritability: IrritabilityPattern
  /** Pre-session baseline intensity 0–10 (integer). Branch-aware copy in UI. */
  baseline_intensity: number
  current_context: CurrentContext
  session_length_preference: SessionLengthPreference

  // Silent / derived fields — engine compatibility
  session_intent: SessionIntent
  symptom_focus: SymptomFocus
  flare_sensitivity: FlareSensitivity
}
```

- [ ] **Step 2: Update `PersistedHariMetadata` for backward compat read**

Find the `PersistedHariMetadata` interface (around line 490). Find the `intake: HariSessionIntake` line inside it. Replace with:

```typescript
  /**
   * Pre-PT-Pass-2 history records lack `branch` and `irritability`.
   * Read consumers (e.g., adaptiveIntakeDefaults) must tolerate missing fields.
   */
  intake: Partial<HariSessionIntake> & {
    baseline_intensity: number
    session_intent: SessionIntent
    current_context: CurrentContext
    symptom_focus: SymptomFocus
    flare_sensitivity: FlareSensitivity
    session_length_preference: SessionLengthPreference
  }
```

- [ ] **Step 3: Build to surface call sites**

Run: `npm run build`
Expected: Errors in:
- `src/screens/SessionIntakeScreen.tsx` — uses old interface, missing `branch` and `irritability`. Fixed in Task 6.
- `src/engine/hari/sessionBridge.ts` (possibly) — may reference intake fields directly. If it does, keep changes minimal: any reads of `intake.session_intent`, etc., still work because those fields remain. Reads of `intake.branch` or `intake.irritability` from within the engine should not exist (engine consumes derived values only).
- `src/engine/hari/adaptiveIntakeDefaults.ts` — may emit `'shorter'` for `session_length_preference`. Update the relevant return statement to emit `'short'` instead.

**If `adaptiveIntakeDefaults.ts` emits `'shorter'`:**

Find the line(s) with `value: 'shorter'` (Grep for it). Replace with `value: 'short'`. This is a minimal mechanical fix to keep the build clean — semantically equivalent.

If it also emits `'not_sure'` for `session_length_preference`, change that emission path to `'standard'` (the safest fallback, matching new union).

- [ ] **Step 4: Run vitest to confirm engine tests still pass**

Run: `npm run test:run -- src/engine/`
Expected: All engine tests pass. The typing change doesn't alter engine behavior; only adds new optional structure.

If `adaptiveIntakeDefaults.test.ts` fails on a `'shorter'` assertion, update the assertion to `'short'`. If it fails on `'not_sure'`, update to `'standard'`. Mechanical update only.

- [ ] **Step 5: Commit**

```bash
git add src/types/hari.ts src/engine/hari/adaptiveIntakeDefaults.ts src/engine/hari/adaptiveIntakeDefaults.test.ts
git commit -m "$(cat <<'EOF'
feat(types): HariSessionIntake gains branch + irritability fields

PT Clinical Pass 2 interface change. branch (IntakeBranch) and
irritability (IrritabilityPattern) become user-visible fields.
session_intent, symptom_focus, and flare_sensitivity are retained
but become silent defaults filled by the rebuilt SessionIntakeScreen.
PersistedHariMetadata.intake widens via Partial for backward compat
on pre-PT-pass-2 HistoryEntry records. adaptiveIntakeDefaults
mechanical fix: 'shorter' → 'short' to match narrowed
SessionLengthPreference union.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: AppContext / `EntryState` migration

**Files:**
- Modify: `src/context/AppContext.tsx`
- Modify: `src/context/AppProvider.tsx`
- Modify: `src/context/AppContext.test.tsx`

- [ ] **Step 1: Update `AppContext.tsx` types**

Open `src/context/AppContext.tsx`. Find the `import` block at the top:

```typescript
import type { AppSettings, PainInputState, RuntimeSession, SafetyAssessment, EntryState } from '../types'
import type { HariSessionIntake, InterventionPackage, StateInterpretationResult, BreathPrescription } from '../types/hari'
```

Replace with:

```typescript
import type { AppSettings, PainInputState, RuntimeSession, SafetyAssessment } from '../types'
import type { HariSessionIntake, InterventionPackage, StateInterpretationResult, BreathPrescription, IntakeBranch } from '../types/hari'
```

(`EntryState` is no longer used in AppContext — kept only for legacy HistoryEntry read compat in `src/types/index.ts`.)

- [ ] **Step 2: Retype `pendingStateEntry`**

In the same file, find:

```typescript
  /**
   * M6.2: Selected entry states from StateSelectionScreen.
   * ...
   */
  pendingStateEntry: EntryState[] | null
```

Replace with:

```typescript
  /**
   * PT Clinical Pass 2: Selected intake branch from StateSelectionScreen.
   * Single value (not array) — branched intent replaces multi-state selection.
   * Cleared on session save, escalation exit, or home reset.
   */
  pendingStateEntry: IntakeBranch | null
```

- [ ] **Step 3: Update `SET_STATE_ENTRY` action payload**

Find the `AppAction` union. Replace:

```typescript
  | { type: 'SET_STATE_ENTRY'; entry: EntryState[] }              // M6.2
```

with:

```typescript
  | { type: 'SET_STATE_ENTRY'; entry: IntakeBranch }              // PT pass 2
```

- [ ] **Step 4: Update reducer in `AppProvider.tsx`**

Open `src/context/AppProvider.tsx`. The existing reducer case `case 'SET_STATE_ENTRY'` already does `pendingStateEntry: action.entry` — that line is fine because `action.entry` is now typed as `IntakeBranch` directly. **No code change needed in AppProvider** — TypeScript validates the change automatically.

Verify: `case 'SET_STATE_ENTRY':` returns `{ ...state, pendingStateEntry: action.entry }` — leave as-is.

- [ ] **Step 5: Update `AppContext.test.tsx`**

Open `src/context/AppContext.test.tsx`. Grep for `SET_STATE_ENTRY` and update any test that dispatches it:

```typescript
// BEFORE (typical)
dispatch({ type: 'SET_STATE_ENTRY', entry: ['pain', 'anxious'] })

// AFTER
dispatch({ type: 'SET_STATE_ENTRY', entry: 'tightness_or_pain' })
```

Update any assertions that check `pendingStateEntry` shape:

```typescript
// BEFORE (typical)
expect(state.pendingStateEntry).toEqual(['pain', 'anxious'])

// AFTER
expect(state.pendingStateEntry).toEqual('tightness_or_pain')
```

- [ ] **Step 6: Run AppContext tests**

Run: `npm run test:run -- src/context/AppContext.test.tsx`
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/context/AppContext.tsx src/context/AppProvider.tsx src/context/AppContext.test.tsx
git commit -m "$(cat <<'EOF'
refactor(context): pendingStateEntry → IntakeBranch (single value)

PT Clinical Pass 2 AppContext migration. pendingStateEntry retypes
from EntryState[] (multi-state array) to IntakeBranch | null (single
branched value). SET_STATE_ENTRY action payload updated. EntryState
type retained in types/index.ts for legacy HistoryEntry.state_entry
read compat.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Rebuild `StateSelectionScreen`

**Files:**
- Replace: `src/screens/StateSelectionScreen.tsx`
- Replace: `src/screens/StateSelectionScreen.test.tsx`

- [ ] **Step 1: Write the new test file**

Replace the entire content of `src/screens/StateSelectionScreen.test.tsx` with:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { StateSelectionScreen } from './StateSelectionScreen'
import { useAppContext } from '../context/AppContext'

function renderWithProvider() {
  return render(
    <AppProvider>
      <StateSelectionScreen />
    </AppProvider>
  )
}

describe('StateSelectionScreen — PT Clinical Pass 2', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
  })

  it('renders the PT-spec heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /why are you using the app today/i })
    ).toBeInTheDocument()
  })

  it('renders both branch options', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /tightness or pain/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anxious or overwhelmed/i })).toBeInTheDocument()
  })

  it('does not render any of the retired multi-select chips', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^heavy$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^exhausted$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^tight$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^sad$/i })).not.toBeInTheDocument()
  })

  it('Continue button is absent before any selection', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('Continue button appears after selecting a branch', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
  })

  it('selecting one branch deselects the other (single-select)', async () => {
    renderWithProvider()
    const tightness = screen.getByRole('button', { name: /tightness or pain/i })
    const anxious = screen.getByRole('button', { name: /anxious or overwhelmed/i })
    await userEvent.click(tightness)
    expect(tightness).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(anxious)
    expect(anxious).toHaveAttribute('aria-pressed', 'true')
    expect(tightness).toHaveAttribute('aria-pressed', 'false')
  })

  it('Continue with tightness_or_pain dispatches branch and routes to session_intake', async () => {
    let capturedScreen = ''
    let capturedEntry: unknown = 'INITIAL'
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('session_intake')
      expect(capturedEntry).toBe('tightness_or_pain')
    })
  })

  it('Continue with anxious_or_overwhelmed dispatches branch and routes to session_intake', async () => {
    let capturedScreen = ''
    let capturedEntry: unknown = 'INITIAL'
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /anxious or overwhelmed/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('session_intake')
      expect(capturedEntry).toBe('anxious_or_overwhelmed')
    })
  })

  it('Back button navigates to home', async () => {
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    await waitFor(() => expect(capturedScreen).toBe('home'))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/screens/StateSelectionScreen.test.tsx`
Expected: FAIL — old component still has multi-select shape.

- [ ] **Step 3: Replace the component**

Replace the entire content of `src/screens/StateSelectionScreen.tsx` with:

```typescript
/**
 * StateSelectionScreen — PT Clinical Pass 2.
 *
 * Branched intent question (replaces M6.1 multi-state chip grid).
 * "Why are you using the app today?" → IntakeBranch single-select.
 *
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import { useState } from 'react'
import type { IntakeBranch } from '../types/hari'
import { useAppContext } from '../context/AppContext'
import styles from './StateSelectionScreen.module.css'

const BRANCH_OPTIONS: { value: IntakeBranch; label: string }[] = [
  { value: 'tightness_or_pain', label: 'Tightness or pain' },
  { value: 'anxious_or_overwhelmed', label: 'Anxious or overwhelmed' },
]

export function StateSelectionScreen() {
  const { dispatch } = useAppContext()
  const [selected, setSelected] = useState<IntakeBranch | null>(null)

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleContinue() {
    if (!selected) return
    dispatch({ type: 'SET_STATE_ENTRY', entry: selected })
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
  }

  return (
    <main className={styles.screen} aria-label="State selection">
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label="Back to home"
        >
          ← Back
        </button>
      </header>

      <p className={styles.wordmark}>mediCalm</p>
      <h1 className={styles.heading}>Why are you using the app today?</h1>

      <div className={styles.branchGrid} role="group" aria-label="Intake branch">
        {BRANCH_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`${styles.branchButton} ${selected === value ? styles.branchSelected : ''}`}
            aria-pressed={selected === value}
            onClick={() => setSelected(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {selected && (
        <button
          type="button"
          className={styles.continueBtn}
          onClick={handleContinue}
        >
          Continue
        </button>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Update the CSS module**

Open `src/screens/StateSelectionScreen.module.css`. Append the following classes (don't delete existing ones — many are still used as fallbacks; the new layout uses `.branchGrid`, `.branchButton`, `.branchSelected` plus existing `.screen`, `.heading`, `.wordmark`, `.continueBtn`):

```css

/* PT Clinical Pass 2 — branched intent layout */
.header {
  width: 100%;
  padding: var(--space-4) var(--screen-padding) 0;
}

.backButton {
  background: none;
  border: none;
  padding: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  min-height: var(--touch-min);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color var(--transition-quick);
}

.backButton:hover {
  color: var(--color-text-primary);
}

.branchGrid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--screen-padding);
  margin-block-start: var(--space-4);
}

.branchButton {
  width: 100%;
  min-height: 64px;
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  text-align: left;
  cursor: pointer;
  transition:
    background var(--transition-quick),
    border-color var(--transition-quick);
}

.branchButton:hover {
  border-color: var(--color-border-active);
}

.branchSelected {
  background: var(--color-accent-subtle);
  border-color: var(--color-accent-border);
  color: var(--color-accent-primary);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/screens/StateSelectionScreen.test.tsx`
Expected: All 9 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/screens/StateSelectionScreen.tsx src/screens/StateSelectionScreen.test.tsx src/screens/StateSelectionScreen.module.css
git commit -m "$(cat <<'EOF'
feat(screens): rebuild StateSelectionScreen as branched intent question

PT Clinical Pass 2. Replaces M6.1 7-state multi-select chip grid with
PT advisor's branched 2-option intent question ("Why are you using the
app today?"). Single-select radio behavior; Continue button gated on
selection. Routes to session_intake (the SAD safety branch is detached
from intake — moved to HomeScreen affordance in Task 7).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Rebuild `SessionIntakeScreen`

**Files:**
- Replace: `src/screens/SessionIntakeScreen.tsx`
- Create or replace: `src/screens/SessionIntakeScreen.test.tsx`

- [ ] **Step 1: Write the new test file**

Create or replace `src/screens/SessionIntakeScreen.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { SessionIntakeScreen } from './SessionIntakeScreen'
import { useAppContext } from '../context/AppContext'

function renderWithBranch(branch: 'tightness_or_pain' | 'anxious_or_overwhelmed') {
  function Setup() {
    const { dispatch } = useAppContext()
    if (branch) {
      dispatch({ type: 'SET_STATE_ENTRY', entry: branch })
    }
    return null
  }
  return render(
    <AppProvider>
      <Setup />
      <SessionIntakeScreen />
    </AppProvider>
  )
}

describe('SessionIntakeScreen — PT Clinical Pass 2', () => {
  beforeEach(() => localStorage.clear())

  it('renders branch-aware severity copy for tightness_or_pain', () => {
    renderWithBranch('tightness_or_pain')
    expect(
      screen.getByText(/how severe is your tightness or pain right now/i)
    ).toBeInTheDocument()
  })

  it('renders branch-aware severity copy for anxious_or_overwhelmed', () => {
    renderWithBranch('anxious_or_overwhelmed')
    expect(
      screen.getByText(/how intense is it right now/i)
    ).toBeInTheDocument()
  })

  it('renders the irritability prompt and 3 options', () => {
    renderWithBranch('tightness_or_pain')
    expect(screen.getByText(/how would you describe it/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comes on slowly, goes away quickly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comes on and goes away about the same/i })).toBeInTheDocument()
  })

  it('renders all 5 position options', () => {
    renderWithBranch('tightness_or_pain')
    expect(screen.getByText(/where are you right now/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sitting$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^standing$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /driving \/ in vehicle/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lying down/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /after strain or overuse/i })).toBeInTheDocument()
  })

  it('renders 3 length options matching PT spec', () => {
    renderWithBranch('tightness_or_pain')
    expect(screen.getByText(/how long feels right today/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^short$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^standard$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^longer$/i })).toBeInTheDocument()
  })

  it('does not render retired field labels', () => {
    renderWithBranch('tightness_or_pain')
    expect(screen.queryByText(/what is this session for/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/what best describes today's focus/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/how sensitive does your body feel/i)).not.toBeInTheDocument()
  })

  it('Continue button is disabled until irritability, position, and length are set', async () => {
    renderWithBranch('tightness_or_pain')
    const continueBtn = screen.getByRole('button', { name: /^continue$/i })
    expect(continueBtn).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i }))
    expect(continueBtn).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    expect(continueBtn).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
    expect(continueBtn).toBeEnabled()
  })

  it('Continue dispatches HARI intake with branch + irritability and navigates to safety gate', async () => {
    let capturedIntake: unknown = null
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedIntake = state.hariIntake
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <Setup branch="tightness_or_pain" />
        <SessionIntakeScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i }))
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('hari_safety_gate')
      expect(capturedIntake).toMatchObject({
        branch: 'tightness_or_pain',
        irritability: 'fast_onset_slow_resolution',
        current_context: 'sitting',
        session_length_preference: 'standard',
        flare_sensitivity: 'high', // derived via translation
      })
    })
  })

  it('Back via breadcrumb returns to state_selection', async () => {
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <Setup branch="tightness_or_pain" />
        <SessionIntakeScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    await waitFor(() => expect(capturedScreen).toBe('state_selection'))
  })
})

// Setup helper used by integration-style tests above
function Setup({ branch }: { branch: 'tightness_or_pain' | 'anxious_or_overwhelmed' }) {
  const { dispatch } = useAppContext()
  // Dispatch in effect-free render-time to mimic how the live flow primes branch
  if (branch) {
    dispatch({ type: 'SET_STATE_ENTRY', entry: branch })
  }
  return null
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/screens/SessionIntakeScreen.test.tsx`
Expected: FAIL — old component still has 6-field shape.

- [ ] **Step 3: Replace the component**

Replace the entire content of `src/screens/SessionIntakeScreen.tsx` with:

```typescript
/**
 * SessionIntakeScreen — PT Clinical Pass 2.
 *
 * 4-field intake (down from 6). Branch-aware severity copy.
 * Silent fields (session_intent, symptom_focus) populated via M5.2
 * adaptiveIntakeDefaults; flare_sensitivity derived from irritability.
 *
 * Authority: docs/superpowers/specs/2026-05-04-pt-clinical-pass-2-intake-design.md
 */
import { useEffect, useState } from 'react'
import type {
  HariSessionIntake,
  CurrentContext,
  SessionLengthPreference,
  IrritabilityPattern,
  IntakeBranch,
  HariEmotionalState,
  SessionIntent,
  SymptomFocus,
} from '../types/hari'
import { useAppContext } from '../context/AppContext'
import { getEligibleHariHistory } from '../storage/sessionHistory'
import { getOrComputePatternSummary } from '../engine/hari/patternReader'
import { computeAdaptiveIntakeDefaults } from '../engine/hari/adaptiveIntakeDefaults'
import { interpretStates } from '../engine/hari/stateInterpretation'
import {
  branchToEmotionalStates,
  irritabilityToFlareSensitivity,
} from '../engine/intakeTranslation'
import styles from './SessionIntakeScreen.module.css'

// ── Option Definitions ────────────────────────────────────────────────────────

const IRRITABILITY_OPTIONS: { value: IrritabilityPattern; label: string }[] = [
  { value: 'fast_onset_slow_resolution', label: 'Comes on quickly, goes away slowly' },
  { value: 'slow_onset_fast_resolution', label: 'Comes on slowly, goes away quickly' },
  { value: 'symmetric', label: 'Comes on and goes away about the same' },
]

const CONTEXT_OPTIONS: { value: CurrentContext; label: string }[] = [
  { value: 'sitting', label: 'Sitting' },
  { value: 'standing', label: 'Standing' },
  { value: 'driving', label: 'Driving / in vehicle' },
  { value: 'lying_down', label: 'Lying down' },
  { value: 'after_strain', label: 'After strain or overuse' },
]

const LENGTH_OPTIONS: { value: SessionLengthPreference; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'standard', label: 'Standard' },
  { value: 'longer', label: 'Longer' },
]

// Defaults for silent fields (PT pass 2)
const DEFAULT_SESSION_INTENT: SessionIntent = 'quick_reset'
const DEFAULT_SYMPTOM_FOCUS: SymptomFocus = 'spread_tension'

// ── Component ─────────────────────────────────────────────────────────────────

export function SessionIntakeScreen() {
  const { state, dispatch } = useAppContext()
  const branch = state.pendingStateEntry as IntakeBranch | null

  const [irritability, setIrritability] = useState<IrritabilityPattern | null>(null)
  const [currentContext, setCurrentContext] = useState<CurrentContext | null>(null)
  const [baselineIntensity, setBaselineIntensity] = useState(5)
  const [sessionLength, setSessionLength] = useState<SessionLengthPreference | null>(null)

  // Silent / derived fields (M5.2 adaptive defaults if available; fallback otherwise)
  const [silentIntent, setSilentIntent] = useState<SessionIntent>(DEFAULT_SESSION_INTENT)
  const [silentFocus, setSilentFocus] = useState<SymptomFocus>(DEFAULT_SYMPTOM_FOCUS)

  // Guard: should not render without branch (return to state selection)
  useEffect(() => {
    if (!branch) {
      dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
    }
  }, [branch, dispatch])

  // M5.2 — load adaptive defaults for silent fields only
  useEffect(() => {
    const history = getEligibleHariHistory()
    const recentFlare = history[0]?.hari_metadata?.intake?.flare_sensitivity
    const summary = getOrComputePatternSummary()
    const adaptiveDefaults = computeAdaptiveIntakeDefaults(summary, recentFlare ?? undefined)
    if (adaptiveDefaults.session_intent !== undefined) {
      setSilentIntent(adaptiveDefaults.session_intent.value)
    }
    if (adaptiveDefaults.symptom_focus !== undefined) {
      setSilentFocus(adaptiveDefaults.symptom_focus.value)
    }
  }, [])

  const allRequiredSet =
    irritability !== null &&
    currentContext !== null &&
    sessionLength !== null

  const severityHeading =
    branch === 'anxious_or_overwhelmed'
      ? 'How intense is it right now?'
      : 'How severe is your tightness or pain right now?'

  const branchLabel =
    branch === 'anxious_or_overwhelmed' ? 'Anxious or overwhelmed' : 'Tightness or pain'

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }

  function handleSubmit() {
    if (!allRequiredSet || !branch) return

    const flareSensitivity = irritabilityToFlareSensitivity(irritability)

    const intake: HariSessionIntake = {
      branch,
      irritability,
      baseline_intensity: baselineIntensity,
      current_context: currentContext,
      session_length_preference: sessionLength,
      // Silent / derived
      session_intent: silentIntent,
      symptom_focus: silentFocus,
      flare_sensitivity: flareSensitivity,
    }

    // M6.4: interpret derived emotional states
    const states: HariEmotionalState[] = branchToEmotionalStates(branch)
    const interpretationResult = interpretStates({
      states,
      intensity: baselineIntensity,
      sensitivity: flareSensitivity,
    })
    dispatch({ type: 'SET_STATE_INTERPRETATION', result: interpretationResult })

    dispatch({ type: 'SET_HARI_INTAKE', intake })
    dispatch({ type: 'NAVIGATE', screen: 'hari_safety_gate' })
  }

  if (!branch) return null

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          aria-label={`Edit branch: ${branchLabel}`}
        >
          ← {branchLabel}
        </button>
      </header>

      <div className={styles.content}>

        {/* 1. Severity (branch-aware) */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>{severityHeading}</span>
          <div className={styles.intensitySlider}>
            <div className={styles.intensityDisplay} aria-hidden="true">
              <span className={styles.intensityValue}>{baselineIntensity}</span>
              <span className={styles.intensityOutOf}>/10</span>
            </div>
            <input
              type="range"
              className={styles.intensityRange}
              min={0}
              max={10}
              step={1}
              value={baselineIntensity}
              style={{ '--slider-fill': `${baselineIntensity * 10}%` } as React.CSSProperties}
              aria-label="Severity"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={baselineIntensity}
              onChange={(e) => setBaselineIntensity(Number(e.target.value))}
            />
            <div className={styles.intensityLabels} aria-hidden="true">
              <span>None</span>
              <span>Intense</span>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 2. Irritability */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>How would you describe it?</span>
          <div className={styles.chipGrid} role="group" aria-label="Irritability pattern">
            {IRRITABILITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${irritability === value ? styles.chipSelected : ''}`}
                aria-pressed={irritability === value}
                onClick={() => setIrritability(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 3. Position */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>Where are you right now?</span>
          <div className={styles.chipGrid} role="group" aria-label="Current context">
            {CONTEXT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${currentContext === value ? styles.chipSelected : ''}`}
                aria-pressed={currentContext === value}
                onClick={() => setCurrentContext(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 4. Length */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>How long feels right today?</span>
          <div className={styles.chipGrid} role="group" aria-label="Session length preference">
            {LENGTH_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${sessionLength === value ? styles.chipSelected : ''}`}
                aria-pressed={sessionLength === value}
                onClick={() => setSessionLength(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <footer className={styles.footer}>
        <button
          className={styles.actionButton}
          type="button"
          onClick={handleSubmit}
          disabled={!allRequiredSet}
          aria-disabled={!allRequiredSet}
        >
          Continue
        </button>
      </footer>
    </main>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/screens/SessionIntakeScreen.test.tsx`
Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/SessionIntakeScreen.tsx src/screens/SessionIntakeScreen.test.tsx
git commit -m "$(cat <<'EOF'
feat(screens): rebuild SessionIntakeScreen as PT 4-field branched intake

PT Clinical Pass 2. Replaces the 6-field intake with 4 user-facing
fields (severity, irritability, position, length). session_intent
and symptom_focus become silent defaults populated by M5.2 adaptive
defaults; flare_sensitivity derives from irritability via the
intakeTranslation module. Severity copy is branch-aware: pain branch
asks "How severe is your tightness or pain right now?"; anxious
branch asks "How intense is it right now?". Breadcrumb back-link
shows the active branch and tappable to edit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: HomeScreen crisis-support affordance

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/HomeScreen.test.tsx`
- Modify: `src/screens/HomeScreen.module.css`

- [ ] **Step 1: Add the failing test**

Open `src/screens/HomeScreen.test.tsx`. Inside `describe('HomeScreen', ...)`, append:

```typescript
it('renders the crisis support affordance', () => {
  renderWithProvider()
  expect(screen.getByRole('button', { name: /need crisis support/i })).toBeInTheDocument()
})

it('crisis support affordance navigates to sad_safety', async () => {
  let capturedScreen = ''
  function Capture() {
    const { state } = useAppContext()
    capturedScreen = state.activeScreen
    return null
  }
  render(
    <AppProvider>
      <Capture />
      <HomeScreen />
    </AppProvider>
  )
  await userEvent.click(screen.getByRole('button', { name: /need crisis support/i }))
  await waitFor(() => expect(capturedScreen).toBe('sad_safety'))
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/screens/HomeScreen.test.tsx`
Expected: 2 new tests FAIL — affordance not yet rendered.

- [ ] **Step 3: Add the affordance to `HomeScreen.tsx`**

Open `src/screens/HomeScreen.tsx`. Find the closing `</section>` of the history section (around line 225). Immediately AFTER that closing `</section>` and BEFORE the `{caseFileEntry && ...}` block, add:

```tsx
      {/* ── Crisis support affordance (PT Clinical Pass 2) ──────────── */}
      <div className={styles.crisisSupport}>
        <div className={styles.crisisDivider} aria-hidden="true" />
        <button
          type="button"
          className={styles.crisisLink}
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'sad_safety' })}
          aria-label="Need crisis support? Open SAD safety check"
        >
          Need crisis support?
        </button>
      </div>
```

- [ ] **Step 4: Add styles to `HomeScreen.module.css`**

Append to `src/screens/HomeScreen.module.css`:

```css

/* ── Crisis support affordance (PT Clinical Pass 2) ──────────────────────── */
.crisisSupport {
  width: 100%;
  padding: var(--space-5) var(--screen-padding) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.crisisDivider {
  width: 60%;
  height: 1px;
  background: var(--color-border-subtle);
  opacity: 0.5;
}

.crisisLink {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  min-height: var(--touch-min);
  transition: color var(--transition-quick);
}

.crisisLink:hover {
  color: var(--color-text-secondary);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/screens/HomeScreen.test.tsx`
Expected: All 11 HomeScreen tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/HomeScreen.test.tsx src/screens/HomeScreen.module.css
git commit -m "$(cat <<'EOF'
feat(home): add quiet 'Need crisis support?' affordance

PT Clinical Pass 2. Detaches SAD safety from the intake flow by
surfacing it as a low-prominence text-link below past sessions on
HomeScreen. Routes to sad_safety screen, which then handles the
persistent-low-mood check (yes → support_resources / 988; no → home).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: SADSafetyScreen routing fix

**Files:**
- Modify: `src/screens/SADSafetyScreen.tsx`
- Modify: `src/screens/SADSafetyScreen.test.tsx`

- [ ] **Step 1: Update the test file**

Open `src/screens/SADSafetyScreen.test.tsx`. Find the `'"No, continue" navigates to session_intake'` test (around line 43). Replace with:

```typescript
  it('"No, continue" navigates to home', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <SADSafetyScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /no, continue/i }))
    await waitFor(() => expect(capturedScreen).toBe('home'))
  })
```

Find the `'Back button navigates to state_selection'` test (around line 82). Replace with:

```typescript
  it('Back button navigates to home', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <SADSafetyScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    await waitFor(() => expect(capturedScreen).toBe('home'))
  })
```

The `'"Yes" dispatches CLEAR_STATE_ENTRY and navigates to support_resources'` test stays as-is.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/screens/SADSafetyScreen.test.tsx`
Expected: 2 tests FAIL — component still routes to `session_intake` and `state_selection`.

- [ ] **Step 3: Update the component**

Open `src/screens/SADSafetyScreen.tsx`. Find:

```typescript
  function handleNo() {
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
  }
```

Replace with:

```typescript
  function handleNo() {
    // PT Pass 2: SAD safety detached from intake flow; "No" returns home
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }
```

Find:

```typescript
  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }
```

Replace with:

```typescript
  function handleBack() {
    // PT Pass 2: entry point is HomeScreen, not state_selection
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }
```

Update the back button's `aria-label`:

```tsx
      <button type="button" className={styles.back} onClick={handleBack} aria-label="Back to home">
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/screens/SADSafetyScreen.test.tsx`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/SADSafetyScreen.tsx src/screens/SADSafetyScreen.test.tsx
git commit -m "$(cat <<'EOF'
fix(safety): SAD safety 'No' and Back routes return to home

PT Clinical Pass 2. SAD safety screen is now reached only via
HomeScreen affordance (not mid-intake), so 'No, continue' and Back
both return to home rather than session_intake / state_selection.
'Yes' → support_resources unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: App.test.tsx integration rewrite

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Inspect the current failing test**

Run: `npm run test:run -- src/App.test.tsx 2>&1 | head -30`
Expected: 1 test fails — `reaches SessionSetupScreen after completing HARI intake with safe input`. This test uses the old multi-state intake flow that no longer compiles correctly.

- [ ] **Step 2: Replace the failing test**

Open `src/App.test.tsx`. Find the failing test (the one looking for `name: /session setup/i` around line 47). Replace the entire `it('reaches SessionSetupScreen after completing HARI intake with safe input', ...)` block with:

```typescript
  it('walks the new branched intake flow from state_selection through hari_safety_gate', async () => {
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <App />
      </AppProvider>
    )

    // Start at home
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    await waitFor(() => expect(capturedScreen).toBe('state_selection'))

    // Pick branch on StateSelectionScreen
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => expect(capturedScreen).toBe('session_intake'))

    // Fill the 4 required fields on SessionIntakeScreen
    await userEvent.click(screen.getByRole('button', { name: /comes on slowly, goes away quickly/i }))
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => expect(capturedScreen).toBe('hari_safety_gate'))
  })
```

- [ ] **Step 3: Run the App test**

Run: `npm run test:run -- src/App.test.tsx`
Expected: All App tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.test.tsx
git commit -m "$(cat <<'EOF'
test(app): rewrite intake flow integration for PT pass 2 branched flow

Replaces stale M6.6 routing assertion (which has been failing since
PT pass 1 due to the stateInterpretationResult shortcut to
guided_session) with a fresh integration walk: home → state_selection
→ session_intake → hari_safety_gate via the new branched flow.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Full vitest + Playwright snapshot regen

**Files:**
- Modify: `e2e/baseline-capture.spec.ts` (locator updates if any)
- Modify: `snapshots/*` (auto-generated)

- [ ] **Step 1: Run the full vitest suite**

Run: `npm run test:run`
Expected: All tests pass (or only the same pre-existing `e2e/baseline-capture.spec.ts` config-quirk file-load failure that vitest reports — that's not a real test failure, just vitest trying to parse a Playwright file).

If anything else fails, STOP and report.

- [ ] **Step 2: Run TypeScript build**

Run: `npm run build`
Expected: PASS, or only the pre-existing `feasibility.ts` and `setup.ts` errors that have been there since before this pass. No new errors in any file modified in this plan.

- [ ] **Step 3: Run Playwright capture**

Run: `npm run capture`
Expected: All 21 capture tests pass, OR a small number of locator failures because the e2e spec references old copy (e.g., "What are you feeling right now"). For each failure, find the failing locator in `e2e/baseline-capture.spec.ts` and update it:

| Old locator | New locator |
|---|---|
| `text=What are you feeling right now` | `text=Why are you using the app today` |
| `getByRole('button', { name: 'Pain' })` | `getByRole('button', { name: /tightness or pain/i })` |
| `getByRole('button', { name: 'Anxious' })` | `getByRole('button', { name: /anxious or overwhelmed/i })` |
| `getByRole('button', { name: 'Quick reset' })` | (drop — field no longer exists) |
| `getByRole('button', { name: 'Neck / upper region' })` | (drop — field no longer exists) |
| `getByRole('button', { name: 'Moderate' })` | (drop — field no longer exists) |
| `getByRole('button', { name: 'Standard' })` | (still works — Standard length button) |

Specifically: tests `04` through `08` (state selection) and `11`–`12` (intake) will need locator updates. After each update, re-run `npm run capture` until all 21 pass.

- [ ] **Step 4: Inspect changed snapshots**

Run: `git status snapshots/`
Expected: Many PNGs modified.

Real visual changes concentrate in:
- `01_home_empty.png`, `02_home_with_history.png`, `03_home_your_state_card.png` — new crisis-support affordance visible
- `04_state_selection_empty.png` through `08_state_selection_heavy_sub_selected.png` — entirely new layout (the heavy/sub-selected snapshots may need to be retired or replaced; the new flow has only 2 options)
- `11_intake_initial.png`, `12_intake_filled.png` — entirely new layout
- `golden_01_home.png`, `golden_02_state_selection.png`, `golden_03_states_selected.png`, `golden_04_intake.png`, `golden_05_intake_filled.png` — same content drift

Other PNGs may show small drift from continuous orb animation — accept as-is, consistent with PT pass 1.

**Stop here and ask the user to eyeball the high-stakes snapshots before committing.** Do NOT auto-commit `snapshots/`.

- [ ] **Step 5: After user approves visually, commit snapshots + e2e fixes**

```bash
git add e2e/baseline-capture.spec.ts snapshots/
git commit -m "$(cat <<'EOF'
chore(snapshots): regenerate baseline for PT clinical pass 2

Updates Playwright baseline PNGs after StateSelectionScreen rebuild
(branched intent question), SessionIntakeScreen rebuild (4 fields
including irritability), and HomeScreen crisis-support affordance.
Real visual deltas: 01-03 home, 04-08 state selection, 11-12 intake,
and matching golden composites. Continuous-orb-animation drift on the
remaining PNGs is consistent with PT pass 1 behavior.

e2e/baseline-capture.spec.ts locators updated to match new copy.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Push to origin**

```bash
git push origin m5-6-architecture-pass
```

---

## Self-Review Checklist (run after all tasks)

- [ ] **Spec coverage:** Every section of the design spec has a corresponding task. Confirmed:
  - §Goal (replace intake) — Tasks 5, 6
  - §UI Screen 1 — Task 5
  - §UI Screen 2 — Task 6
  - §HomeScreen affordance — Task 7
  - §SAD routing fix — Task 8
  - §Translation layer — Task 2
  - §HariSessionIntake interface — Task 3
  - §EntryState migration — Task 4
  - §Routing edges table — Tasks 5, 6, 7, 8
  - §Build order — Tasks 1–10 in order
  - §Migration concerns (HistoryEntry backward compat) — Task 3 Step 2
  - §Test coverage strategy — every screen task has TDD steps
  - §Playwright snapshot regen — Task 10

- [ ] **Placeholder scan:** No "TBD", "TODO", "implement later", "add appropriate error handling", "similar to Task N", or steps without code in this plan.

- [ ] **Type consistency:**
  - `IntakeBranch` defined in T1, referenced in T2/T3/T4/T5/T6 with the same two literal members
  - `IrritabilityPattern` defined in T1, referenced in T2/T3/T6 with the same three literal members
  - `branchToEmotionalStates` / `irritabilityToFlareSensitivity` function signatures match across T2 (define) and T6 (call)
  - `SessionLengthPreference` narrowed in T1 to `'short' | 'standard' | 'longer'`; T6 LENGTH_OPTIONS uses these exact values
  - `pendingStateEntry: IntakeBranch | null` consistent across T4 (define) and T5/T6 (consume)
  - `SET_STATE_ENTRY` action payload `entry: IntakeBranch` consistent across T4 (define), T5 (dispatch), test files in T5/T6
  - All literal copy strings ("Why are you using the app today?", "How would you describe it?", etc.) match between component code and test assertions

- [ ] **Invariants preserved:**
  - HARI safety gate (PT pass 1) untouched
  - SessionSetupScreen + GuidedSessionScreen untouched
  - M6.4 / M6.5 / M6.8 engine modules untouched
  - HistoryEntry persistence shape backward-compatible
