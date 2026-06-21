# Grounded Guidance — Layer 3 (In-Session Carousel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the breathing screen's static cues with a deterministic, research-grounded coaching system — setup cues (with citations) on `SessionSetupScreen` and a calm rotating set of app-voice cues during the breath (no citation UI) — all built once at session start by `selectBreathingCues`.

**Architecture:** A typed cue bank + one pure selector (`selectBreathingCues(input) → {setupCues, inSessionCues}`). `SessionSetupScreen` renders setup cues and resolves each cue's citation against the live `GROUNDED_MESSAGES` bank (coach-always / cite-when-attested). The M7 breath path (`GuidedSessionScreen → PhaseRenderer → BreathPhaseRenderer`) rotates `inSessionCues` by `completedRounds`, replacing the static `positionCue`/`diaphragmaticCue`.

**Tech Stack:** React 19 + TypeScript (strict), Vite, Vitest + @testing-library/react. Windows/PowerShell.

## Global Constraints

From [`02-invariants.md`](02-invariants.md):
- **INV-1 determinism:** `selectBreathingCues` and the rotation are pure — no `Math.random`, `Date.now`, network, inference. Rotation indexes by `completedRounds`.
- **INV-2 verbatim/app-voice:** cue `text` is app-voice coaching, never attributed to a paper. Verbatim citations appear ONLY on `SessionSetupScreen`, never mid-breath.
- **INV-3 two-lock liveness:** a setup citation renders only when a `pt_advisor_passed` GroundedMessage backs the cue's PMID (via `liveMessages`).
- **INV-5 honest degradation:** no live citation → cue text shows alone (no fabricated citation); empty cue list → render nothing.
- **D5 grounding model:** coach-always, cite-when-attested.
- **D6 consolidation:** remove the static `positionCue`/`diaphragmaticCue` path; no parallel cue systems.
- **Scope:** the in-breath carousel targets the M7 path (`BreathPhaseRenderer`), which is what live HARI sessions use. The legacy direct-orb path in `GuidedSessionScreen` is out of scope.
- **TypeScript strict:** run `npx tsc --noEmit` clean before each commit. Tests: `npm run test:run`.

**Canonical `RegulatoryGoal` values (7):** decompress, restore, stabilize, downregulate, expand, ground, activate.

---

## File Structure

- Create `src/types/breathingCue.ts` — cue model + input/output types.
- Create `src/data/breathingCues.ts` — the seed cue bank.
- Create `src/data/breathingCues.gate.test.ts` — structural gate.
- Create `src/engine/groundedMessages/selectBreathingCues.ts` — the pure selector.
- Create `src/engine/groundedMessages/selectBreathingCues.test.ts` — selector tests.
- Modify `src/data/groundedMessages.ts` — add PMID 24835338 GroundedMessage (dark) for setup citations.
- Modify `src/screens/SessionSetupScreen.tsx` (+ test) — render setup cues with citation resolution.
- Modify `src/components/m7/BreathPhaseRenderer.tsx` (+ test) — rotate in-session cues, remove static cue props.
- Modify `src/components/m7/PhaseRenderer.tsx` — forward `inSessionCues`.
- Modify `src/screens/GuidedSessionScreen.tsx` — compute + pass `inSessionCues`.

---

### Task 1: Cue model + bank + structural gate

**Files:**
- Create: `src/types/breathingCue.ts`
- Create: `src/data/breathingCues.ts`
- Test: `src/data/breathingCues.gate.test.ts`

**Interfaces:**
- Produces: `BreathingCue`, `CuePhase`, `CueSessionInput`, `SessionCues`, `BREATHING_CUES`

- [ ] **Step 1: Write the failing gate test** — create `src/data/breathingCues.gate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { BREATHING_CUES } from './breathingCues'

const SENTINEL = '⟦'

describe('breathing cue bank — structural gate', () => {
  it('has unique ids', () => {
    const ids = BREATHING_CUES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('has at least one core cue per phase', () => {
    expect(BREATHING_CUES.some((c) => c.phase === 'setup' && c.core)).toBe(true)
    expect(BREATHING_CUES.some((c) => c.phase === 'in_session' && c.core)).toBe(true)
  })
  for (const c of BREATHING_CUES) {
    describe(`cue ${c.id}`, () => {
      it('has non-empty text with no sentinel', () => {
        expect(c.text.trim()).not.toBe('')
        expect(c.text.includes(SENTINEL)).toBe(false)
      })
      it('has a valid phase', () => {
        expect(['setup', 'in_session']).toContain(c.phase)
      })
      it('grounding pmid, if present, is numeric', () => {
        if (c.grounding) expect(c.grounding.pmid).toMatch(/^\d+$/)
      })
    })
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/breathingCues.gate.test.ts`
Expected: FAIL — `./breathingCues` does not exist.

- [ ] **Step 3: Create the types** — create `src/types/breathingCue.ts`:

```ts
import type { LocationTag } from './taxonomy'
import type { RegulatoryGoal, LocationPattern } from './hari'

export type CuePhase = 'setup' | 'in_session'

export type BreathingCue = {
  id: string
  text: string // app-voice coaching — never attributed to a paper (INV-2)
  phase: CuePhase
  core?: boolean
  condition?: {
    locationIncludes?: LocationTag[]
    goalIncludes?: RegulatoryGoal[]
    locationPatternIncludes?: LocationPattern[]
  }
  grounding?: { pmid: string; record_id?: string }
}

export type CueSessionInput = {
  location?: LocationTag[]
  locationPattern?: LocationPattern
  goal?: RegulatoryGoal | null
}

export type SessionCues = { setupCues: BreathingCue[]; inSessionCues: BreathingCue[] }
```

- [ ] **Step 4: Create the bank** — create `src/data/breathingCues.ts`:

```ts
import type { BreathingCue } from '../types/breathingCue'

export const BREATHING_CUES: BreathingCue[] = [
  {
    id: 'setup_position_supine',
    text: 'If you can, try this lying down.',
    phase: 'setup',
    condition: { locationPatternIncludes: ['single', 'connected'] },
    grounding: { pmid: '24835338', record_id: 'research-001' },
  },
  {
    id: 'setup_hand_belly_chest',
    text: 'One hand on your lower belly, one on your chest — let only the lower hand rise.',
    phase: 'setup',
    core: true,
    grounding: { pmid: '31436595', record_id: 'research-010' },
  },
  {
    id: 'setup_rib_expand',
    text: 'Rest a hand over the sore rib and breathe gently into it.',
    phase: 'setup',
    condition: { locationIncludes: ['ribs'] },
    grounding: { pmid: '24835338', record_id: 'research-001' },
  },
  {
    id: 'breath_longer_exhale',
    text: 'Let the exhale be a little longer than the inhale.',
    phase: 'in_session',
    core: true,
    grounding: { pmid: '35623448', record_id: 'research-011' },
  },
  {
    id: 'breath_soft_belly',
    text: 'Let the belly stay soft.',
    phase: 'in_session',
    core: true,
    grounding: { pmid: '31436595', record_id: 'research-010' },
  },
  {
    id: 'breath_easy_shoulders',
    text: 'Let the shoulders be easy.',
    phase: 'in_session',
    core: true,
  },
  {
    id: 'breath_decompress_room',
    text: 'Give the sore area a little room with each breath.',
    phase: 'in_session',
    condition: { goalIncludes: ['decompress'] },
    grounding: { pmid: '24835338', record_id: 'research-001' },
  },
]
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/data/breathingCues.gate.test.ts` then `npx tsc --noEmit`
Expected: PASS; TYPECHECK CLEAN.

- [ ] **Step 6: Commit**

```bash
git add src/types/breathingCue.ts src/data/breathingCues.ts src/data/breathingCues.gate.test.ts
git commit -m "feat(grounding): breathing cue model + seed bank + structural gate"
```

---

### Task 2: `selectBreathingCues` selector

**Files:**
- Create: `src/engine/groundedMessages/selectBreathingCues.ts`
- Test: `src/engine/groundedMessages/selectBreathingCues.test.ts`

**Interfaces:**
- Consumes: `BREATHING_CUES`, `BreathingCue`, `CueSessionInput`, `SessionCues`
- Produces: `selectBreathingCues(input: CueSessionInput, bank?: BreathingCue[]): SessionCues`

- [ ] **Step 1: Write the failing test** — create `src/engine/groundedMessages/selectBreathingCues.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { selectBreathingCues } from './selectBreathingCues'

describe('selectBreathingCues', () => {
  it('always includes core cues in each phase', () => {
    const { setupCues, inSessionCues } = selectBreathingCues({})
    expect(setupCues.map((c) => c.id)).toContain('setup_hand_belly_chest')
    expect(inSessionCues.map((c) => c.id)).toEqual(
      expect.arrayContaining(['breath_longer_exhale', 'breath_soft_belly', 'breath_easy_shoulders']),
    )
  })
  it('includes the rib cue only when location includes ribs', () => {
    expect(selectBreathingCues({}).setupCues.map((c) => c.id)).not.toContain('setup_rib_expand')
    expect(selectBreathingCues({ location: ['ribs'] }).setupCues.map((c) => c.id)).toContain('setup_rib_expand')
  })
  it('includes the decompress cue only when goal is decompress', () => {
    expect(selectBreathingCues({ goal: 'restore' }).inSessionCues.map((c) => c.id)).not.toContain('breath_decompress_room')
    expect(selectBreathingCues({ goal: 'decompress' }).inSessionCues.map((c) => c.id)).toContain('breath_decompress_room')
  })
  it('includes the supine cue only for single/connected location patterns', () => {
    expect(selectBreathingCues({ locationPattern: 'widespread' }).setupCues.map((c) => c.id)).not.toContain('setup_position_supine')
    expect(selectBreathingCues({ locationPattern: 'single' }).setupCues.map((c) => c.id)).toContain('setup_position_supine')
  })
  it('is deterministic — identical input returns identical ids', () => {
    const a = selectBreathingCues({ location: ['ribs'], goal: 'decompress' })
    const b = selectBreathingCues({ location: ['ribs'], goal: 'decompress' })
    expect(a.inSessionCues.map((c) => c.id)).toEqual(b.inSessionCues.map((c) => c.id))
    expect(a.setupCues.map((c) => c.id)).toEqual(b.setupCues.map((c) => c.id))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/groundedMessages/selectBreathingCues.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation** — create `src/engine/groundedMessages/selectBreathingCues.ts`:

```ts
/**
 * Deterministic per-session breathing-cue selection (Grounded Guidance Layer 3).
 * Pure: no clock, no randomness (INV-1). Built once at session start.
 * Authority: docs/apex-bundle/grounded-guidance/07-layer3-in-session-carousel-spec.md
 */
import type { BreathingCue, CueSessionInput, SessionCues } from '../../types/breathingCue'
import { BREATHING_CUES } from '../../data/breathingCues'

function included(cue: BreathingCue, input: CueSessionInput): boolean {
  if (cue.core) return true
  const cond = cue.condition
  if (!cond) return false
  if (cond.locationIncludes) {
    const loc = new Set(input.location ?? [])
    if (cond.locationIncludes.some((t) => loc.has(t))) return true
  }
  if (cond.goalIncludes && input.goal && cond.goalIncludes.includes(input.goal)) return true
  if (cond.locationPatternIncludes && input.locationPattern &&
      cond.locationPatternIncludes.includes(input.locationPattern)) return true
  return false
}

export function selectBreathingCues(
  input: CueSessionInput,
  bank: BreathingCue[] = BREATHING_CUES,
): SessionCues {
  const chosen = bank.filter((c) => included(c, input))
  return {
    setupCues: chosen.filter((c) => c.phase === 'setup'),
    inSessionCues: chosen.filter((c) => c.phase === 'in_session'),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/engine/groundedMessages/selectBreathingCues.test.ts` then `npx tsc --noEmit`
Expected: PASS (5 tests); TYPECHECK CLEAN.

- [ ] **Step 5: Commit**

```bash
git add src/engine/groundedMessages/selectBreathingCues.ts src/engine/groundedMessages/selectBreathingCues.test.ts
git commit -m "feat(grounding): deterministic selectBreathingCues (core + conditional/goal)"
```

---

### Task 3: Setup-citation data — add PMID 24835338 GroundedMessage (dark)

**Files:**
- Modify: `src/data/groundedMessages.ts`

**Interfaces:**
- Consumes: `GroundedMessage`, `liveMessages`
- Produces: a `GroundedMessage` for PMID 24835338 (review_status `engineering_passed` — dark)

> The setup cues `setup_position_supine` and `setup_rib_expand` cite PMID 24835338 (research-001, clean figure r=0.42). This task adds that message so its citation can resolve once attested. The diaphragmatic (31436595) and paced (35623448) citations are NOT added here — 31436595 has no abstract effect-size (pending Zach's 31436595-vs-39477355 pick) and 35623448 needs the pooled SMD from full text. Those cues coach text-only until their figures + attestation land (D5).

- [ ] **Step 1: Write the failing test** — append to `src/data/pmidVerification.test.ts` is NOT correct here; instead add to `src/data/groundedMessages.gate.test.ts`. Add this test inside the top-level describe:

```ts
  it('includes PMID 24835338 (research-001) for setup-cue citations', () => {
    expect(GROUNDED_MESSAGES.some((m) => m.citation.pmid === '24835338')).toBe(true)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/groundedMessages.gate.test.ts`
Expected: FAIL — no message with PMID 24835338 yet.

- [ ] **Step 3: Add the message** — in `src/data/groundedMessages.ts`, add this entry to the `GROUNDED_MESSAGES` array (after the existing entry):

```ts
  {
    message_id: 'chest_expansion_supports_breathing',
    text: 'Gentle rib and chest expansion supports easier breathing.',
    selectors: { location: ['ribs', 'chest', 'upper_back'], goal: ['decompress'] },
    citation: {
      pmid: '24835338',
      source_link: 'https://pubmed.ncbi.nlm.nih.gov/24835338/',
      exact_figure: 'r = 0.42',
      figure_units: 'Pearson correlation (chest expansion vs maximum voluntary ventilation)',
    },
    display_quote:
      'Chest expansion correlated significantly with maximum voluntary ventilation (r = 0.42).',
    authored_by: 'JSEer',
    authored_at: '2026-06-21T00:00:00.000Z',
    // Sourced from the-muscle-pt research-001 (Wirth 2014), PubMed-direct verified.
    // DARK (engineering_passed) until Zach Ermert, SPT attests faithfulness.
    review_status: 'engineering_passed',
  },
```

- [ ] **Step 4: Run tests + verify coverage** — the PMID must be in the verification cache. Run `npm run verify:pmids` to add 24835338 to `pmidVerification.json`, then:

Run: `npx vitest run src/data/groundedMessages.gate.test.ts src/data/pmidVerification.test.ts` then `npx tsc --noEmit`
Expected: PASS (gate green incl. new PMID test; coverage gate green after verify:pmids); TYPECHECK CLEAN.

- [ ] **Step 5: Commit**

```bash
git add src/data/groundedMessages.ts src/data/pmidVerification.json
git commit -m "feat(grounding): add PMID 24835338 message (dark) for setup-cue citations"
```

---

### Task 4: `SessionSetupScreen` — render setup cues with citation resolution

**Files:**
- Modify: `src/screens/SessionSetupScreen.tsx`
- Test: `src/screens/SessionSetupScreen.test.tsx`

**Interfaces:**
- Consumes: `selectBreathingCues`, `liveMessages`, `classifyNeedProfile`, `GroundedTip`, `BreathingCue`
- Produces: setup cues rendered below the existing content; citation shown when a live message matches the cue PMID

- [ ] **Step 1: Write the failing test** — add to `src/screens/SessionSetupScreen.test.tsx` a test asserting a core setup cue renders. Reuse the file's existing provider/render helper (read the file first). Minimum new test:

```tsx
it('renders the diaphragmatic setup cue text', () => {
  renderSetup('tightness_or_pain', 'single')
  expect(screen.getByText(/only the lower hand rise/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/SessionSetupScreen.test.tsx`
Expected: FAIL — cue text not rendered yet.

- [ ] **Step 3: Wire setup cues** — in `src/screens/SessionSetupScreen.tsx`, add imports:

```ts
import { selectBreathingCues } from '../engine/groundedMessages/selectBreathingCues'
import { liveMessages } from '../engine/groundedMessages/selectTip'
import { GROUNDED_MESSAGES } from '../data/groundedMessages'
```

After the existing `derivedGoal` derivation (added in Layer 1), build the setup cues:

```ts
  const { setupCues } = selectBreathingCues({
    location: session.pain_input.location_tags,
    locationPattern: state.hariIntake?.location_pattern,
    goal: derivedGoal,
  })
  const live = liveMessages(GROUNDED_MESSAGES)
  function citationFor(pmid?: string) {
    return pmid ? live.find((m) => m.citation.pmid === pmid) ?? null : null
  }
```

Render the cues as a block (after `<RecommendationReveal .../>`, before the closing `.content`):

```tsx
        {setupCues.length > 0 && (
          <div className={styles.setupCues} aria-label="Before you begin">
            {setupCues.map((cue) => {
              const cited = citationFor(cue.grounding?.pmid)
              return (
                <div key={cue.id} className={styles.setupCue}>
                  <p className={styles.setupCueText}>{cue.text}</p>
                  {cited && <GroundedTip message={cited} />}
                </div>
              )
            })}
          </div>
        )}
```

Add minimal styles to `src/screens/SessionSetupScreen.module.css`:

```css
.setupCues { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; width: 100%; max-width: 22rem; }
.setupCue { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.setupCueText { font-size: 0.75rem; color: rgba(255,255,255,0.6); text-align: center; line-height: 1.5; }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/SessionSetupScreen.test.tsx` then `npx tsc --noEmit`
Expected: PASS; TYPECHECK CLEAN. (Citation does not render yet because 24835338 is dark — coach-always per D5; that is correct.)

- [ ] **Step 5: Commit**

```bash
git add src/screens/SessionSetupScreen.tsx src/screens/SessionSetupScreen.test.tsx src/screens/SessionSetupScreen.module.css
git commit -m "feat(grounding): render setup cues + citation resolution on SessionSetupScreen"
```

---

### Task 5: In-breath rotation — `BreathPhaseRenderer` + `PhaseRenderer` + `GuidedSessionScreen`

**Files:**
- Modify: `src/components/m7/BreathPhaseRenderer.tsx`
- Modify: `src/components/m7/PhaseRenderer.tsx`
- Modify: `src/screens/GuidedSessionScreen.tsx`
- Test: `src/components/m7/BreathPhaseRenderer.test.tsx`

**Interfaces:**
- Consumes: `BreathingCue`, `selectBreathingCues`, `completedRounds` (BreathPhaseRenderer state)
- Produces: rotating in-session cue; removes static `positionCue`/`diaphragmaticCue` props

- [ ] **Step 1: Write the failing test** — in `src/components/m7/BreathPhaseRenderer.test.tsx`, replace the `positionCue` assertions with the rotation. Add:

```tsx
it('shows the first in-session cue at round 0', () => {
  const cues = [
    { id: 'a', text: 'First cue', phase: 'in_session' as const, core: true },
    { id: 'b', text: 'Second cue', phase: 'in_session' as const, core: true },
  ]
  render(
    <BreathPhaseRenderer phase={phase} onComplete={() => {}} inSessionCues={cues} />,
  )
  expect(screen.getByText('First cue')).toBeInTheDocument()
  expect(screen.queryByText(/PMID/i)).not.toBeInTheDocument() // no citation UI mid-breath (INV-2)
})
```

(Read the existing test file first for the `phase` fixture; remove tests asserting the old `positionCue`/`diaphragmaticCue` props per D6.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/m7/BreathPhaseRenderer.test.tsx`
Expected: FAIL — `inSessionCues` prop not supported.

- [ ] **Step 3: Update `BreathPhaseRenderer`** — in `src/components/m7/BreathPhaseRenderer.tsx`:

Add the import and a rotation constant:
```ts
import type { BreathingCue } from '../../types/breathingCue'
const CUES_PER_ROTATION = 2
```

Replace the `diaphragmaticCue` and `positionCue` props with:
```ts
  /** Pre-compiled, rotated in-session cues (Layer 3). App-voice text only. */
  inSessionCues?: BreathingCue[]
```
(remove `diaphragmaticCue?: string` and `positionCue?: string` from `Props` and the destructure.)

Compute the current cue (using existing `completedRounds` state):
```ts
  const cues = inSessionCues ?? []
  const currentCue = cues.length > 0
    ? cues[Math.floor(completedRounds / CUES_PER_ROTATION) % cues.length]
    : null
```

Update `hasTopZone` to drop `diaphragmaticCue`:
```ts
  const hasTopZone = !!(sessionName || durationLabel)
```
Remove the `{diaphragmaticCue && ...}` line from the top zone. Replace the bottom `{positionCue && ...}` block with:
```tsx
        {currentCue && (
          <p className={styles.positionCue} aria-label="Breathing cue">
            {currentCue.text}
          </p>
        )}
```

- [ ] **Step 4: Forward through `PhaseRenderer`** — in `src/components/m7/PhaseRenderer.tsx`, add `inSessionCues?: BreathingCue[]` to its Props (import the type), remove `positionCue`/`diaphragmaticCue` from its Props, and forward `inSessionCues` to `<BreathPhaseRenderer ... inSessionCues={inSessionCues} />`. (Read the file to match its prop-forwarding pattern.)

- [ ] **Step 5: Wire `GuidedSessionScreen`** — in `src/screens/GuidedSessionScreen.tsx`:

Add imports:
```ts
import { selectBreathingCues } from '../engine/groundedMessages/selectBreathingCues'
import { classifyNeedProfile } from '../engine/hari/needProfile'
```
Compute the cues once (near the other derivations, before the return):
```ts
  const inSessionCues = selectBreathingCues({
    location: session.pain_input.location_tags,
    locationPattern: state.hariIntake?.location_pattern,
    goal: state.stateInterpretationResult
      ? classifyNeedProfile(state.stateInterpretationResult).primaryGoal
      : null,
  }).inSessionCues
```
In the `<PhaseRenderer ... />` invocation, remove `diaphragmaticCue={...}` and `positionCue={derivePositionHint(state.hariIntake)}` and add `inSessionCues={inSessionCues}`. Remove the now-unused `derivePositionHint` import if no longer used elsewhere in the file.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/components/m7/BreathPhaseRenderer.test.tsx` then the full suite `npm run test:run` then `npx tsc --noEmit`
Expected: PASS; full suite green (update/remove any other test asserting the old static cue props — e.g. PhaseRenderer tests); TYPECHECK CLEAN.

- [ ] **Step 7: Commit**

```bash
git add src/components/m7/BreathPhaseRenderer.tsx src/components/m7/BreathPhaseRenderer.test.tsx src/components/m7/PhaseRenderer.tsx src/screens/GuidedSessionScreen.tsx
git commit -m "feat(grounding): in-session breathing-cue carousel (rotate by round); remove static cues"
```

---

## Self-Review

**Spec coverage (against `07-layer3-in-session-carousel-spec.md`):** D1 source → Task 2. D2 setup cues + citations → Task 4. D3 in-breath rotation, text-only → Task 5. D4 core + conditional/goal → Tasks 1-2. D5 coach-always/cite-when-attested → Task 4 (citation only when live). D6 consolidation → Task 5 (removes static props). Data precursor → Task 3 (24835338 dark). Acceptance criteria 1-10 map: AC1/8 determinism → Task 2 + Task 5 rotation; AC2 core → Task 2; AC3 rib → Task 2; AC4 decompress → Task 2; AC5 pattern → Task 2; AC6 citation-when-live → Task 4; AC7 in-breath text-only → Task 5; AC9 removes static path → Task 5; AC10 full green → Task 5.

**Placeholder scan:** all code steps contain complete code. Tasks 4 and 5 reference reading the existing test/component files for their established patterns (provider helper, prop-forwarding) — these are real files to mirror, not placeholders.

**Type consistency:** `selectBreathingCues(input, bank?)`, `CueSessionInput`, `SessionCues`, `BreathingCue`, `inSessionCues`, `BREATHING_CUES` are named identically across tasks. `classifyNeedProfile(...).primaryGoal` matches Layer 1's usage.

## Out of scope (roadmap)
Post-session "what guided this" recap; Layer 4 authoring automation; diaphragmatic/paced setup citations (pending Zach's 31436595-vs-39477355 pick + 35623448 full-text figure); the legacy direct-orb breath path.
