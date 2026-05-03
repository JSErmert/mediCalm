# PT Clinical Pass 1 — Safety Screening Expansion + Hero Copy Refinement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land PT-advised refinements as Move 1 (expand the C4 safety gate to add a Cardiovascular red-flag section, expand the Neurological red-flag list with 6 specific symptoms, and tier stop messages) and Move 2 (rewrite hero copy and retire forbidden user-facing terminology in `HomeScreen`, `data/protocols.ts`, and `data/mechanisms.ts`).

**Architecture:** All Move 1 logic stays inside the existing C4 gate (`engine/hari/safetyGate.ts` + `screens/HariSafetyGateScreen.tsx`) — same 2-step funnel, expanded flag set + grouped UI sections + tiered stop copy. Move 2 is pure copy + label edits to three files. No engine routing changes, no HARI pipeline changes, no AppContext changes, no new screens.

**Tech Stack:** TypeScript, React 18, Vitest + @testing-library/react, CSS Modules, Playwright (baseline regen step at end).

**Authority:** Clinical refinement notes from external PT advisor (2026-05-02). This input is exogenous to the markdown pack — the safety-screen content extends the existing C4 spec rather than restating it. After this pass lands, `docs/context/M4.0-4.5_v1.1_CLARIFICATIONS.md §C4` should be amended to record the expanded flag set as the new source of truth (separate doc-update task, NOT in this plan).

---

## Scope Constraints

- DO NOT restructure the intake flow (that's Move 3, deferred)
- DO NOT add the irritability-pattern question (that's Move 4, deferred)
- DO NOT rename internal `shallow_breathing` symptom_tag or `MECH_RIB_RESTRICTION` mechanism_id — engine-only keys, no user impact, deferred
- DO NOT change the CLEAR routing path (M4.5.1 §Step 2–5 invariant: CLEAR → bridge → session_setup)
- DO preserve `not_sure` HOLD path (existing UX nuance not contradicted by PT)
- DO retire `major_numbness_sensation_change` flag — replaced by specific PT items (saddle, extremities)

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `src/engine/hari/safetyGate.ts` | Modify | Expand `SafetyFlagClass` union; rebuild `STOP_FLAGS`; add `CARDIO_FLAGS` set; tier `stopMessage()`; expand `SAFETY_FLAG_LABELS`; replace `STEP_1_SYMPTOMS` with grouped `STEP_1_NEURO_SYMPTOMS` + `STEP_1_CARDIO_SYMPTOMS` |
| `src/engine/hari/safetyGate.test.ts` | **Create** | New test file — classification, tiered messages, cardio precedence, label parentheticals |
| `src/engine/hari/index.ts` | Modify | Re-export new grouped symptom constants alongside (or replacing) `STEP_1_SYMPTOMS` |
| `src/screens/HariSafetyGateScreen.tsx` | Modify | Step 1: render two grouped sections (Neuro / Cardio) with PT's exact header + subheader copy; Step 2: render `FLAG_OPTIONS` grouped by section |
| `src/screens/HariSafetyGateScreen.module.css` | Modify | Add styles for grouped sections + section labels |
| `src/screens/HomeScreen.tsx` | Modify | Lines 130–134 hero copy + line 160 CTA subtitle |
| `src/screens/HomeScreen.test.tsx` | Modify | Update assertion for hero/sub copy |
| `src/data/protocols.ts` | Modify | Replace `'shallow or uncomfortable breathing'` in `safe_use_cases` |
| `src/data/mechanisms.ts` | Modify | Rename `name: 'Rib Restriction'` → `name: 'Ribcage Compression'` |

---

## Move 1 — Safety Pass

### Task 1: Write failing tests for expanded safetyGate engine (TDD)

**Files:**
- Create: `src/engine/hari/safetyGate.test.ts`

- [ ] **Step 1: Create the test file with failing assertions**

```typescript
// src/engine/hari/safetyGate.test.ts
import { describe, it, expect } from 'vitest'
import {
  classifySafetyFlags,
  safetyGateClear,
  SAFETY_FLAG_LABELS,
  STEP_1_NEURO_SYMPTOMS,
  STEP_1_CARDIO_SYMPTOMS,
  type SafetyFlagClass,
} from './safetyGate'

describe('safetyGate — classification', () => {
  it('returns CLEAR with no flags', () => {
    expect(safetyGateClear()).toEqual({ outcome: 'CLEAR' })
    expect(classifySafetyFlags([])).toEqual({ outcome: 'CLEAR' })
  })

  it('classifies all neuro red flags as STOP', () => {
    const neuroFlags: SafetyFlagClass[] = [
      'new_worsening_weakness',
      'coordination_change',
      'numbness_extremities_or_saddle',
      'dizziness_balance_loss',
      'double_vision',
      'speech_difficulty',
      'swallowing_difficulty',
      'drop_attacks',
      'symptoms_severe_or_concerning',
    ]
    for (const f of neuroFlags) {
      expect(classifySafetyFlags([f]).outcome).toBe('STOP')
    }
  })

  it('classifies all cardio red flags as STOP', () => {
    const cardioFlags: SafetyFlagClass[] = [
      'chest_pain_or_pressure',
      'radiating_pain_jaw_arm',
      'interscapular_pain',
      'dyspnea_at_rest',
      'irregular_heartbeat',
    ]
    for (const f of cardioFlags) {
      expect(classifySafetyFlags([f]).outcome).toBe('STOP')
    }
  })

  it('classifies not_sure as HOLD', () => {
    expect(classifySafetyFlags(['not_sure']).outcome).toBe('HOLD')
  })
})

describe('safetyGate — tiered stop messages', () => {
  it('cardio flag returns 911 message', () => {
    const result = classifySafetyFlags(['chest_pain_or_pressure'])
    expect(result.message).toBe(
      'These symptoms may indicate a serious cardiac event. Call 911 or your local emergency services immediately.'
    )
  })

  it('cardio takes priority over neuro when both present', () => {
    const result = classifySafetyFlags(['coordination_change', 'chest_pain_or_pressure'])
    expect(result.message).toContain('Call 911')
  })

  it('neuro red flag returns provider message', () => {
    const result = classifySafetyFlags(['drop_attacks'])
    expect(result.message).toBe(
      'These symptoms may indicate a serious neurological condition. Please discontinue use and contact a healthcare provider before proceeding.'
    )
  })
})

describe('safetyGate — labels with plain-language parentheticals', () => {
  it('drop_attacks label includes parenthetical', () => {
    expect(SAFETY_FLAG_LABELS['drop_attacks']).toBe(
      'Sudden drop attacks (unexpectedly falling without warning)'
    )
  })

  it('numbness_extremities_or_saddle names body regions', () => {
    expect(SAFETY_FLAG_LABELS['numbness_extremities_or_saddle']).toBe(
      'Numbness or tingling in hands, arms, legs, or groin and inner thigh'
    )
  })

  it('radiating_pain_jaw_arm names body regions', () => {
    expect(SAFETY_FLAG_LABELS['radiating_pain_jaw_arm']).toBe(
      'Pain radiating to your jaw, neck, left shoulder, or left arm'
    )
  })
})

describe('safetyGate — Step 1 grouped symptom lists', () => {
  it('exposes neuro symptoms list', () => {
    expect(STEP_1_NEURO_SYMPTOMS.length).toBeGreaterThanOrEqual(6)
    expect(STEP_1_NEURO_SYMPTOMS).toContain(
      'Sudden drop attacks (unexpectedly falling without warning)'
    )
  })

  it('exposes cardio symptoms list', () => {
    expect(STEP_1_CARDIO_SYMPTOMS.length).toBe(5)
    expect(STEP_1_CARDIO_SYMPTOMS[0]).toBe('Chest pain or chest pressure')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/engine/hari/safetyGate.test.ts`
Expected: All 9 tests FAIL with `is not exported` / `cannot find` errors.

- [ ] **Step 3: Commit failing tests**

```bash
git add src/engine/hari/safetyGate.test.ts
git commit -m "test(safety): add failing specs for expanded C4 flag set + tiered messages"
```

---

### Task 2: Expand `SafetyFlagClass` union and classification rules

**Files:**
- Modify: `src/engine/hari/safetyGate.ts:23-49`

- [ ] **Step 1: Replace the union and flag arrays**

Replace lines 23–49 with:

```typescript
// ── Safety Flag Types ─────────────────────────────────────────────────────────

export type SafetyFlagClass =
  // Existing generic flags (retained)
  | 'new_worsening_weakness'
  | 'coordination_change'
  | 'symptoms_severe_or_concerning'
  | 'not_sure'
  // PT-spec neurological red flags (cervical myelopathy / instability screen)
  | 'numbness_extremities_or_saddle'
  | 'dizziness_balance_loss'
  | 'double_vision'
  | 'speech_difficulty'
  | 'swallowing_difficulty'
  | 'drop_attacks'
  // PT-spec cardiovascular red flags (active cardiac event screen)
  | 'chest_pain_or_pressure'
  | 'radiating_pain_jaw_arm'
  | 'interscapular_pain'
  | 'dyspnea_at_rest'
  | 'irregular_heartbeat'

// ── Decision Rules (C4 §decision_rules + PT clinical refinement 2026-05-02) ──

/**
 * Cardiovascular red flags — STOP with 911 escalation message.
 * Authority: PT clinical refinement 2026-05-02
 */
const CARDIO_FLAGS: SafetyFlagClass[] = [
  'chest_pain_or_pressure',
  'radiating_pain_jaw_arm',
  'interscapular_pain',
  'dyspnea_at_rest',
  'irregular_heartbeat',
]

/**
 * Neurological red flags — STOP with provider-contact message.
 * Combines original C4 STOP flags with PT-spec specifics.
 */
const NEURO_STOP_FLAGS: SafetyFlagClass[] = [
  'new_worsening_weakness',
  'coordination_change',
  'symptoms_severe_or_concerning',
  'numbness_extremities_or_saddle',
  'dizziness_balance_loss',
  'double_vision',
  'speech_difficulty',
  'swallowing_difficulty',
  'drop_attacks',
]

/**
 * Flags that result in HOLD — pause, encourage non-urgent awareness.
 * `not_sure` retained from C4 §decision_rules; generic
 * `major_numbness_sensation_change` retired (replaced by specific neuro items).
 */
const HOLD_FLAGS: SafetyFlagClass[] = [
  'not_sure',
]
```

- [ ] **Step 2: Update `classifySafetyFlags` to apply cardio precedence**

Replace lines 71–94 (the `classifySafetyFlags` function body) with:

```typescript
export function classifySafetyFlags(
  flags: SafetyFlagClass[]
): SafetyGateResult {
  // CARDIO precedence — any cardio flag → 911 message immediately
  const cardioFlag = flags.find((f) => CARDIO_FLAGS.includes(f))
  if (cardioFlag) {
    return {
      outcome: 'STOP',
      trigger: cardioFlag,
      message: cardioStopMessage(),
    }
  }

  // NEURO STOP next
  const neuroFlag = flags.find((f) => NEURO_STOP_FLAGS.includes(f))
  if (neuroFlag) {
    return {
      outcome: 'STOP',
      trigger: neuroFlag,
      message: neuroStopMessage(neuroFlag),
    }
  }

  // HOLD last
  const holdFlag = flags.find((f) => HOLD_FLAGS.includes(f))
  if (holdFlag) {
    return {
      outcome: 'HOLD',
      trigger: holdFlag,
      message: holdMessage(holdFlag),
    }
  }

  return { outcome: 'CLEAR' }
}
```

- [ ] **Step 3: Run cardio + classification tests**

Run: `npm run test:run -- src/engine/hari/safetyGate.test.ts -t "classification"`
Expected: classification tests PASS; message tests still FAIL (still need stop-message rewrite).

- [ ] **Step 4: Commit**

```bash
git add src/engine/hari/safetyGate.ts
git commit -m "feat(safety): expand C4 flag union with PT neuro + cardio sets"
```

---

### Task 3: Tier the stop messages

**Files:**
- Modify: `src/engine/hari/safetyGate.ts:103-116`

- [ ] **Step 1: Replace `stopMessage` with two tiered helpers**

Replace lines 103–116 with:

```typescript
// ── User-Facing Messages (non-diagnostic, calm, medically restrained) ─────────

/**
 * Cardio escalation message — uniform 911 text per PT spec 2026-05-02.
 */
function cardioStopMessage(): string {
  return 'These symptoms may indicate a serious cardiac event. Call 911 or your local emergency services immediately.'
}

/**
 * Neuro stop message — uniform provider-contact text per PT spec 2026-05-02.
 * The original per-flag C4 messaging is retired in favor of one consistent
 * neuro red-flag message. Specific symptom is preserved in `trigger`.
 */
function neuroStopMessage(_flag: SafetyFlagClass): string {
  return 'These symptoms may indicate a serious neurological condition. Please discontinue use and contact a healthcare provider before proceeding.'
}
```

- [ ] **Step 2: Run message tests**

Run: `npm run test:run -- src/engine/hari/safetyGate.test.ts -t "tiered stop messages"`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/engine/hari/safetyGate.ts
git commit -m "feat(safety): tier stop messages — cardio = 911, neuro = provider"
```

---

### Task 4: Expand `SAFETY_FLAG_LABELS` and split `STEP_1_SYMPTOMS`

**Files:**
- Modify: `src/engine/hari/safetyGate.ts:131-144`

- [ ] **Step 1: Replace label record + symptom constants**

Replace lines 131–144 with:

```typescript
// ── Label Helpers for UI ──────────────────────────────────────────────────────
//
// All clinical terminology is paired with a plain-language parenthetical
// per PT spec 2026-05-02 §5 ("Always pair clinical terminology with a
// plain language parenthetical").

export const SAFETY_FLAG_LABELS: Record<SafetyFlagClass, string> = {
  // Generic (retained)
  new_worsening_weakness: 'New or worsening weakness',
  coordination_change: 'Coordination trouble',
  symptoms_severe_or_concerning: 'Symptoms feel unusually severe or concerning',
  not_sure: 'Not sure',
  // Neuro
  numbness_extremities_or_saddle: 'Numbness or tingling in hands, arms, legs, or groin and inner thigh',
  dizziness_balance_loss: 'Dizziness or loss of balance',
  double_vision: 'Double vision',
  speech_difficulty: 'Difficulty speaking or slurred speech',
  swallowing_difficulty: 'Difficulty swallowing',
  drop_attacks: 'Sudden drop attacks (unexpectedly falling without warning)',
  // Cardio
  chest_pain_or_pressure: 'Chest pain or chest pressure',
  radiating_pain_jaw_arm: 'Pain radiating to your jaw, neck, left shoulder, or left arm',
  interscapular_pain: 'Pain between your shoulder blades',
  dyspnea_at_rest: 'Shortness of breath at rest',
  irregular_heartbeat: 'Rapid or irregular heartbeat',
}

/**
 * Section A — Neurological symptoms shown in Step 1.
 * Order matches PT spec 2026-05-02 §2 Section A.
 */
export const STEP_1_NEURO_SYMPTOMS = [
  'Numbness or tingling in your hands, arms, legs, or groin and inner thigh area',
  'Dizziness or loss of balance',
  'Double vision',
  'Difficulty speaking or slurred speech',
  'Difficulty swallowing',
  'Sudden drop attacks (unexpectedly falling without warning)',
] as const

/**
 * Section B — Cardiovascular symptoms shown in Step 1.
 * Order matches PT spec 2026-05-02 §2 Section B.
 */
export const STEP_1_CARDIO_SYMPTOMS = [
  'Chest pain or chest pressure',
  'Pain radiating to your jaw, neck, left shoulder, or left arm',
  'Pain between your shoulder blades',
  'Shortness of breath at rest',
  'Rapid or irregular heartbeat',
] as const
```

- [ ] **Step 2: Update `engine/hari/index.ts` re-exports**

Modify `src/engine/hari/index.ts:90`:

```typescript
// Replace:
export { SAFETY_FLAG_LABELS, STEP_1_SYMPTOMS } from './safetyGate'
// With:
export {
  SAFETY_FLAG_LABELS,
  STEP_1_NEURO_SYMPTOMS,
  STEP_1_CARDIO_SYMPTOMS,
} from './safetyGate'
```

- [ ] **Step 3: Run all safetyGate tests**

Run: `npm run test:run -- src/engine/hari/safetyGate.test.ts`
Expected: ALL PASS.

- [ ] **Step 4: Commit**

```bash
git add src/engine/hari/safetyGate.ts src/engine/hari/index.ts
git commit -m "feat(safety): expand labels + grouped Step-1 symptom lists per PT spec"
```

---

### Task 5: Update `HariSafetyGateScreen` to render two grouped sections

**Files:**
- Modify: `src/screens/HariSafetyGateScreen.tsx`
- Modify: `src/screens/HariSafetyGateScreen.module.css`

- [ ] **Step 1: Update imports + `FLAG_OPTIONS`**

Replace lines 28 + 37–43 with:

```typescript
// Line 28
import {
  SAFETY_FLAG_LABELS,
  STEP_1_NEURO_SYMPTOMS,
  STEP_1_CARDIO_SYMPTOMS,
} from '../engine/hari/index'

// Lines 37–43 — split FLAG_OPTIONS into two grouped arrays
const NEURO_FLAG_OPTIONS: SafetyFlagClass[] = [
  'new_worsening_weakness',
  'coordination_change',
  'numbness_extremities_or_saddle',
  'dizziness_balance_loss',
  'double_vision',
  'speech_difficulty',
  'swallowing_difficulty',
  'drop_attacks',
  'symptoms_severe_or_concerning',
]

const CARDIO_FLAG_OPTIONS: SafetyFlagClass[] = [
  'chest_pain_or_pressure',
  'radiating_pain_jaw_arm',
  'interscapular_pain',
  'dyspnea_at_rest',
  'irregular_heartbeat',
]

const FALLBACK_FLAG_OPTIONS: SafetyFlagClass[] = ['not_sure']
```

- [ ] **Step 2: Replace Step 1 render block (lines 136–184)**

Replace the `if (gateStep === 'step1')` block with the PT's exact header + subheader and two grouped sections:

```tsx
if (gateStep === 'step1') {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          aria-label="Back to session intake"
        >
          ← Back
        </button>
        <h1 className={styles.heading}>Before we begin — please review the following</h1>
      </header>

      <div className={styles.content}>
        <p className={styles.lead}>
          Stop and seek medical attention if you are currently experiencing any of the following.
        </p>

        <section
          className={styles.symptomSection}
          aria-labelledby="neuro-section-label"
        >
          <h2 id="neuro-section-label" className={styles.sectionLabel}>
            Neurological symptoms
          </h2>
          <ul className={styles.symptomList}>
            {STEP_1_NEURO_SYMPTOMS.map((symptom) => (
              <li key={symptom} className={styles.symptomItem}>
                <span className={styles.symptomDot} aria-hidden="true" />
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={styles.symptomSection}
          aria-labelledby="cardio-section-label"
        >
          <h2 id="cardio-section-label" className={styles.sectionLabel}>
            Cardiovascular symptoms
          </h2>
          <ul className={styles.symptomList}>
            {STEP_1_CARDIO_SYMPTOMS.map((symptom) => (
              <li key={symptom} className={styles.symptomItem}>
                <span className={styles.symptomDot} aria-hidden="true" />
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.actionPrimary}
          type="button"
          onClick={handleStep1No}
        >
          No, none of these
        </button>
        <button
          className={styles.actionYes}
          type="button"
          onClick={handleStep1Yes}
        >
          Yes, at least one applies
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Replace Step 2 chip grid render to use grouped options (lines 188–243)**

Replace the `if (gateStep === 'step2')` block. Render three grouped chip sections (Neuro / Cardio / Fallback):

```tsx
if (gateStep === 'step2') {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => setGateStep('step1')}
          type="button"
          aria-label="Back to previous step"
        >
          ← Back
        </button>
        <h1 className={styles.heading}>Which best describes it?</h1>
      </header>

      <div className={styles.content}>
        <p className={styles.lead}>Select all that apply.</p>

        {[
          { label: 'Neurological', options: NEURO_FLAG_OPTIONS },
          { label: 'Cardiovascular', options: CARDIO_FLAG_OPTIONS },
          { label: 'Other', options: FALLBACK_FLAG_OPTIONS },
        ].map((group) => (
          <section
            key={group.label}
            className={styles.symptomSection}
            aria-label={`${group.label} symptoms`}
          >
            <h2 className={styles.sectionLabel}>{group.label}</h2>
            <div className={styles.flagGrid} role="group">
              {group.options.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  className={`${styles.flagChip} ${selectedFlags.includes(flag) ? styles.flagChipSelected : ''}`}
                  aria-pressed={selectedFlags.includes(flag)}
                  onClick={() => toggleFlag(flag)}
                >
                  {SAFETY_FLAG_LABELS[flag]}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.confirmButton}
          type="button"
          onClick={handleStep2Confirm}
          disabled={selectedFlags.length === 0}
          aria-disabled={selectedFlags.length === 0}
        >
          Confirm
        </button>
        <button
          className={styles.actionBack}
          type="button"
          onClick={() => setGateStep('step1')}
        >
          Back
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Add CSS classes for grouped sections**

Append to `src/screens/HariSafetyGateScreen.module.css`:

```css
.symptomSection {
  margin-block: 1.25rem;
}

.sectionLabel {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted, rgba(255, 255, 255, 0.65));
  margin-block-end: 0.5rem;
}
```

- [ ] **Step 5: Run typecheck + tests**

Run: `npm run build` (full tsc + vite build)
Expected: PASS, no type errors.

Run: `npm run test:run`
Expected: All existing suites still PASS. (HomeScreen test will still pass at this point — Move 2 hasn't run yet.)

- [ ] **Step 6: Commit**

```bash
git add src/screens/HariSafetyGateScreen.tsx src/screens/HariSafetyGateScreen.module.css
git commit -m "feat(safety): render grouped neuro + cardio sections in C4 gate UI"
```

---

## Move 2 — Hero Copy + User-Facing Language Sweep

### Task 6: Rewrite hero copy + CTA subtitle

**Files:**
- Modify: `src/screens/HomeScreen.tsx:130-134`, `:160`
- Modify: `src/screens/HomeScreen.test.tsx`

- [ ] **Step 1: Update HomeScreen hero copy**

Replace lines 130–134:

```tsx
<p className={styles.sub}>
  Structured breathing protocol addressing ribcage compression
  (limited rib expansion), deviated breathing mechanics, neck,
  shoulder, and jaw tension, and protective muscle overactivation —
  calibrated specifically to your current intensity level.
</p>
```

Replace line 160:

```tsx
<p className={styles.ctaSub}>Calibrated to your current intensity level · approx. 4–6 min</p>
```

- [ ] **Step 2: Update HomeScreen test to assert new copy**

Add to `src/screens/HomeScreen.test.tsx` inside `describe('HomeScreen', ...)`:

```tsx
it('renders revised hero copy with PT-approved terminology', () => {
  renderWithProvider()
  expect(screen.getByText(/ribcage compression/i)).toBeInTheDocument()
  expect(screen.getByText(/deviated breathing mechanics/i)).toBeInTheDocument()
  expect(screen.getByText(/neck, shoulder, and jaw tension/i)).toBeInTheDocument()
})

it('does not contain retired terminology in hero', () => {
  renderWithProvider()
  expect(screen.queryByText(/rib restriction/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/shallow breathing/i)).not.toBeInTheDocument()
})
```

- [ ] **Step 3: Run HomeScreen tests**

Run: `npm run test:run -- src/screens/HomeScreen.test.tsx`
Expected: All PASS, including the two new assertions.

- [ ] **Step 4: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/HomeScreen.test.tsx
git commit -m "refactor(copy): rewrite hero per PT clinical refinement 2026-05-02"
```

---

### Task 7: Sweep user-facing language in data files

**Files:**
- Modify: `src/data/protocols.ts:37`
- Modify: `src/data/mechanisms.ts:24`

- [ ] **Step 1: Replace `'shallow or uncomfortable breathing'` in protocols.ts**

In `src/data/protocols.ts:37`, replace:

```typescript
'shallow or uncomfortable breathing',
```

with:

```typescript
'restricted or uncomfortable breathing',
```

- [ ] **Step 2: Rename mechanism display name in mechanisms.ts**

In `src/data/mechanisms.ts:24`, replace:

```typescript
name: 'Rib Restriction',
```

with:

```typescript
name: 'Ribcage Compression',
```

(Internal `mechanism_id: 'MECH_RIB_RESTRICTION'` is unchanged — engine-only key.)

- [ ] **Step 3: Run full test suite to catch any string-coupled tests**

Run: `npm run test:run`
Expected: All PASS. If any test asserted on the old strings, update it inline (assertion on internal `mechanism_id` is fine; assertion on `name` should be updated).

- [ ] **Step 4: Commit**

```bash
git add src/data/protocols.ts src/data/mechanisms.ts
git commit -m "refactor(copy): retire forbidden terms from user-visible data fields"
```

---

### Task 8: Regenerate Playwright baseline snapshots

**Files:**
- Modify: `snapshots/*` (auto-generated)

- [ ] **Step 1: Run baseline capture to refresh snapshots**

Run: `npm run capture`
Expected: Two snapshots will drift — HomeScreen hero and HariSafetyGateScreen step 1. Inspect each updated PNG before committing.

- [ ] **Step 2: Manually verify the two changed snapshots look correct**

Open `snapshots/` directory and visually confirm:
- HomeScreen shows the new hero text
- HariSafetyGateScreen shows two grouped sections with PT-spec headers

- [ ] **Step 3: Commit**

```bash
git add snapshots/
git commit -m "chore(snapshots): regenerate baseline for hero copy + grouped safety sections"
```

---

## Self-Review Checklist (run after all tasks)

- [ ] **Spec coverage:** Every PT directive from Move 1 + Move 2 maps to at least one task above. Confirmed: cardio screening (T1, T2, T3, T5), neuro expansion (T1, T2, T4, T5), tiered messages (T3), parentheticals (T4), hero rewrite (T6), language sweep (T7), shoulder added to tension list (T6), 911 escalation present (T3).

- [ ] **Placeholder scan:** No "TBD", "TODO", "implement later", or "add appropriate error handling" text anywhere in this plan.

- [ ] **Type consistency:** `SafetyFlagClass` union additions in T2 match exactly the strings used in T1 tests, T4 labels, and T5 chip arrays. `STEP_1_NEURO_SYMPTOMS` / `STEP_1_CARDIO_SYMPTOMS` names are consistent across T4 (define), index re-export (T4 step 2), and T5 import.

- [ ] **CLEAR routing invariant preserved:** No task touches `proceedWithHariEngine` (lines 111–132 of HariSafetyGateScreen.tsx) or M4.5.1 bridge logic. CLEAR → bridge → session_setup remains unchanged.

---

## Out of Scope — explicitly deferred

| Item | Why deferred |
|------|--------------|
| Move 3 — intake simplification (collapse 6-field SessionIntake to 4-field PT branched flow) | Bigger surface area; touches HARI engine integration; user authorized only Moves 1 + 2 |
| Move 4 — irritability-pattern question | Only fits cleanly after Move 3 |
| Internal `shallow_breathing` symptom_tag rename across `taxonomy.ts`, `mechanisms.ts`, `interpretationLayer.ts` | Engine-only keys, no user impact |
| Updating `docs/context/M4.0-4.5_v1.1_CLARIFICATIONS.md §C4` to record expanded flag set as new source of truth | Doc-update task — should follow code merge, not precede it |
| Renaming generic flag `major_numbness_sensation_change` everywhere (it's been retired from the union) | Already retired; no callers reference it after Task 2 lands |
