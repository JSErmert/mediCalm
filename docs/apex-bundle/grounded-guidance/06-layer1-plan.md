# Grounded Guidance — Layer 1 (Recommendation-Reveal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** At the pre-session preview (`SessionSetupScreen`), show the research that explains *this* session's recommendation — verbatim quote + linked PMID — selected deterministically by the engine's derived `RegulatoryGoal`.

**Architecture:** Extend the existing grounded-message layer. Add a `goal` routing selector to messages, a pure goal-gated/tag-ranked selection function alongside the shipped `selectPreSessionTip`, a small `RecommendationReveal` component reusing the shipped `GroundedTip`, and render it on the live `session_setup` preview. No engine changes; the reveal derives the goal from the already-stored `stateInterpretationResult` via `classifyNeedProfile`.

**Tech Stack:** React 19 + TypeScript (strict), Vite, Vitest + @testing-library/react. Windows/PowerShell dev env.

## Global Constraints

Copied from the bundle (`docs/apex-bundle/grounded-guidance/02-invariants.md`). Every task implicitly includes these.

- **INV-1 Runtime determinism:** all runtime selection is pure — no `Math.random`, no `Date.now`, no network, no inference. Same inputs → same output.
- **INV-2 Verbatim quote:** the rendered research claim is byte-identical to a stored field (`display_quote`); any plain-language "why" text is app-authored and never attributed to the paper.
- **INV-3 Two-lock liveness:** only `review_status === 'pt_advisor_passed'` messages reach a surface, via `liveMessages()`. The `goal` selector is engineering routing metadata (same class as `symptom`/`location`/`trigger`), NOT a faithfulness claim — adding it does not change `review_status`.
- **INV-4 Four-class firewall:** do not merge data classes; current-session state dominates. (Not exercised by Layer 1, but do not introduce cross-class writes.)
- **INV-5 Honest degradation:** no live, goal-bound match → render nothing. Never substitute a near-miss.
- **No em dashes inside user-facing copy strings** are not required here, but keep app-voice copy calm and plain.
- **TypeScript strict:** no unused vars, no implicit any. Run `npx tsc --noEmit` clean before each commit.

**Canonical `RegulatoryGoal` values (7):** `decompress`, `restore`, `stabilize`, `downregulate`, `expand`, `ground`, `activate` (source: `src/types/hari.ts`).

**Test commands:** single file `npx vitest run <path>`; full suite `npx vitest run`; typecheck `npx tsc --noEmit`.

---

### Task 1: `goal` selector + canonical runtime list + structural gate

**Files:**
- Modify: `src/types/hari.ts` (add runtime `REGULATORY_GOALS` next to the `RegulatoryGoal` type union, ~line 805)
- Modify: `src/types/groundedMessage.ts` (add `goal?` to `MessageSelectors`)
- Test: `src/data/groundedMessages.gate.test.ts` (extend structural gate)

**Interfaces:**
- Produces: `REGULATORY_GOALS: readonly RegulatoryGoal[]`; `MessageSelectors.goal?: RegulatoryGoal[]`
- Consumes: existing `RegulatoryGoal` type, `GROUNDED_MESSAGES`

- [ ] **Step 1: Write the failing test** — append to `src/data/groundedMessages.gate.test.ts` (add `REGULATORY_GOALS` to the import on line 3's neighbor; add a new import line):

```ts
import { REGULATORY_GOALS } from '../types/hari'
```

Then add inside the top-level `describe('grounded message bank — structural gate', () => { ... })`, after the `has unique message_ids` test:

```ts
  it('REGULATORY_GOALS lists exactly the 7 canonical goals', () => {
    expect([...REGULATORY_GOALS].sort()).toEqual(
      ['activate', 'decompress', 'downregulate', 'expand', 'ground', 'restore', 'stabilize'],
    )
  })
```

And, inside the existing `for (const m of GROUNDED_MESSAGES)` → `describe(...)` block, replace the `has ≥1 selector tag, all from canonical taxonomy` test body with one that also covers `goal` and counts it toward routability:

```ts
      it('has ≥1 selector tag, all from canonical taxonomy', () => {
        const loc = m.selectors.location ?? []
        const sym = m.selectors.symptom ?? []
        const trg = m.selectors.trigger ?? []
        const goal = m.selectors.goal ?? []
        expect(loc.length + sym.length + trg.length + goal.length).toBeGreaterThan(0)
        for (const t of loc) expect(LOCATION_TAGS).toContain(t)
        for (const t of sym) expect(SYMPTOM_TAGS).toContain(t)
        for (const t of trg) expect(TRIGGER_TAGS).toContain(t)
        for (const g of goal) expect(REGULATORY_GOALS).toContain(g)
      })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/groundedMessages.gate.test.ts`
Expected: FAIL — `REGULATORY_GOALS` is not exported from `../types/hari` (import error), and/or `m.selectors.goal` is a type error.

- [ ] **Step 3: Add the runtime list** — in `src/types/hari.ts`, immediately after the `RegulatoryGoal` type union (around line 805–815), add:

```ts
/**
 * Runtime list of every RegulatoryGoal. Kept adjacent to the type union as the
 * single source of truth; the exhaustiveness guard below fails to compile if the
 * union and this list ever drift.
 */
export const REGULATORY_GOALS = [
  'decompress',
  'restore',
  'stabilize',
  'downregulate',
  'expand',
  'ground',
  'activate',
] as const satisfies readonly RegulatoryGoal[]

// Compile-time exhaustiveness: every RegulatoryGoal must appear in REGULATORY_GOALS.
type _GoalsCovered = Exclude<RegulatoryGoal, (typeof REGULATORY_GOALS)[number]>
const _goalsExhaustive: _GoalsCovered extends never ? true : false = true
void _goalsExhaustive
```

- [ ] **Step 4: Add the selector field** — in `src/types/groundedMessage.ts`, add the import and extend `MessageSelectors`:

```ts
import type { LocationTag, SymptomTag, TriggerTag } from './taxonomy'
import type { RegulatoryGoal } from './hari'

export type MessageSelectors = {
  location?: LocationTag[]
  symptom?: SymptomTag[]
  trigger?: TriggerTag[]
  goal?: RegulatoryGoal[]
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/data/groundedMessages.gate.test.ts` then `npx tsc --noEmit`
Expected: PASS (gate green), TYPECHECK CLEAN.

- [ ] **Step 6: Commit**

```bash
git add src/types/hari.ts src/types/groundedMessage.ts src/data/groundedMessages.gate.test.ts
git commit -m "feat(grounding): add goal routing selector + REGULATORY_GOALS canonical list"
```

---

### Task 2: `selectRecommendationEvidence` — goal-gated, tag-ranked selector

**Files:**
- Create: `src/engine/groundedMessages/selectRecommendationEvidence.ts`
- Test: `src/engine/groundedMessages/selectRecommendationEvidence.test.ts`

**Interfaces:**
- Consumes: `liveMessages` from `./selectTip`, `GroundedMessage`, `RegulatoryGoal`, taxonomy tag types
- Produces:
  ```ts
  export type SessionInputTags = { symptom?: SymptomTag[]; location?: LocationTag[]; trigger?: TriggerTag[] }
  export function selectRecommendationEvidence(
    derivedGoal: RegulatoryGoal,
    input: SessionInputTags,
    bank?: GroundedMessage[],
  ): GroundedMessage | null
  ```

- [ ] **Step 1: Write the failing test** — create `src/engine/groundedMessages/selectRecommendationEvidence.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { selectRecommendationEvidence } from './selectRecommendationEvidence'
import type { GroundedMessage } from '../../types/groundedMessage'

function msg(over: Partial<GroundedMessage> & Pick<GroundedMessage, 'message_id'>): GroundedMessage {
  return {
    message_id: over.message_id,
    text: over.text ?? 'text',
    selectors: over.selectors ?? {},
    citation: over.citation ?? {
      pmid: '1', source_link: 'https://pubmed.ncbi.nlm.nih.gov/1/',
      exact_figure: 'f', figure_units: 'u',
    },
    display_quote: over.display_quote ?? 'quote',
    authored_by: over.authored_by ?? 't',
    authored_at: over.authored_at ?? '2026-06-20T00:00:00.000Z',
    review_status: over.review_status ?? 'pt_advisor_passed',
  }
}

describe('selectRecommendationEvidence', () => {
  it('returns null when no live message is bound to the derived goal', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['restore'] } })]
    expect(selectRecommendationEvidence('decompress', {}, bank)).toBeNull()
  })

  it('returns a live message bound to the derived goal', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['decompress'] } })]
    expect(selectRecommendationEvidence('decompress', {}, bank)?.message_id).toBe('a')
  })

  it('never returns a message NOT bound to the goal, even with perfect tag overlap', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['restore'], symptom: ['aching'] } })]
    expect(selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)).toBeNull()
  })

  it('ranks same-goal messages by tag overlap, highest wins', () => {
    const bank = [
      msg({ message_id: 'low', selectors: { goal: ['decompress'] } }),
      msg({ message_id: 'high', selectors: { goal: ['decompress'], symptom: ['aching'] } }),
    ]
    expect(selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)?.message_id).toBe('high')
  })

  it('breaks ties by message_id ascending', () => {
    const bank = [
      msg({ message_id: 'zzz', selectors: { goal: ['decompress'] } }),
      msg({ message_id: 'aaa', selectors: { goal: ['decompress'] } }),
    ]
    expect(selectRecommendationEvidence('decompress', {}, bank)?.message_id).toBe('aaa')
  })

  it('excludes non-attested messages (two-lock liveness)', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['decompress'] }, review_status: 'engineering_passed' })]
    expect(selectRecommendationEvidence('decompress', {}, bank)).toBeNull()
  })

  it('is deterministic — identical inputs return identical output across calls', () => {
    const bank = [
      msg({ message_id: 'a', selectors: { goal: ['decompress'], symptom: ['aching'] } }),
      msg({ message_id: 'b', selectors: { goal: ['decompress'], symptom: ['aching'] } }),
    ]
    const r1 = selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)
    const r2 = selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)
    expect(r1?.message_id).toBe(r2?.message_id)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/groundedMessages/selectRecommendationEvidence.test.ts`
Expected: FAIL — module/function not defined.

- [ ] **Step 3: Write the implementation** — create `src/engine/groundedMessages/selectRecommendationEvidence.ts`:

```ts
/**
 * Deterministic recommendation-evidence selection (Grounded Guidance Layer 1).
 * Authority: docs/apex-bundle/grounded-guidance/04-layer1-recommendation-reveal-spec.md
 *
 * Goal-gated, tag-ranked, pure. No randomness, no clock (INV-1). Returns the
 * single best live, goal-bound message, or null (INV-5).
 */
import type { LocationTag, SymptomTag, TriggerTag } from '../../types/taxonomy'
import type { RegulatoryGoal } from '../../types/hari'
import type { GroundedMessage } from '../../types/groundedMessage'
import { GROUNDED_MESSAGES } from '../../data/groundedMessages'
import { liveMessages } from './selectTip'

export type SessionInputTags = {
  symptom?: SymptomTag[]
  location?: LocationTag[]
  trigger?: TriggerTag[]
}

function tagScore(message: GroundedMessage, input: SessionInputTags): number {
  const loc = new Set(input.location ?? [])
  const sym = new Set(input.symptom ?? [])
  const trg = new Set(input.trigger ?? [])
  let score = 0
  for (const t of message.selectors.location ?? []) if (loc.has(t)) score++
  for (const t of message.selectors.symptom ?? []) if (sym.has(t)) score++
  for (const t of message.selectors.trigger ?? []) if (trg.has(t)) score++
  return score
}

export function selectRecommendationEvidence(
  derivedGoal: RegulatoryGoal,
  input: SessionInputTags,
  bank: GroundedMessage[] = GROUNDED_MESSAGES,
): GroundedMessage | null {
  const eligible = liveMessages(bank).filter((m) => m.selectors.goal?.includes(derivedGoal))
  if (eligible.length === 0) return null
  const ranked = eligible
    .map((m) => ({ m, score: tagScore(m, input) }))
    .sort((a, b) => b.score - a.score || a.m.message_id.localeCompare(b.m.message_id))
  return ranked[0].m
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/engine/groundedMessages/selectRecommendationEvidence.test.ts` then `npx tsc --noEmit`
Expected: PASS (7 tests), TYPECHECK CLEAN.

- [ ] **Step 5: Commit**

```bash
git add src/engine/groundedMessages/selectRecommendationEvidence.ts src/engine/groundedMessages/selectRecommendationEvidence.test.ts
git commit -m "feat(grounding): deterministic goal-gated recommendation-evidence selector"
```

---

### Task 3: Bind the live message to its goal(s)

**Files:**
- Modify: `src/data/groundedMessages.ts`
- Test: `src/engine/groundedMessages/selectRecommendationEvidence.test.ts` (add one real-bank test)

**Interfaces:**
- Consumes: `selectRecommendationEvidence`, the real `GROUNDED_MESSAGES`
- Produces: the existing live message is reveal-eligible for `decompress` and `restore`

- [ ] **Step 1: Write the failing test** — append to `src/engine/groundedMessages/selectRecommendationEvidence.test.ts`:

```ts
import { selectRecommendationEvidence as selectReal } from './selectRecommendationEvidence'

describe('selectRecommendationEvidence — real bank', () => {
  it('surfaces the live message for its bound goal (decompress)', () => {
    const r = selectReal('decompress', { symptom: ['aching'] })
    expect(r?.message_id).toBe('gentle_exercise_eases_sensitization')
  })
  it('returns null for a goal with no bound live message (expand)', () => {
    expect(selectReal('expand', {})).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/groundedMessages/selectRecommendationEvidence.test.ts`
Expected: FAIL on the decompress case — the live message has no `goal` selector yet, so it returns null.

- [ ] **Step 3: Add the goal binding** — in `src/data/groundedMessages.ts`, change the existing message's `selectors`:

```ts
    selectors: { symptom: ['aching', 'soreness', 'burning'], goal: ['decompress', 'restore'] },
```

Leave a brief comment above it:

```ts
    // goal[] is engineering routing metadata (same class as symptom[]), not a
    // faithfulness claim — it decides where the already-attested message routes
    // at the recommendation-reveal. PT sanity-check of the routing recommended.
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/engine/groundedMessages/selectRecommendationEvidence.test.ts src/data/groundedMessages.gate.test.ts src/data/pmidVerification.test.ts`
Expected: PASS — selector tests green, structural gate green (goal values canonical), coverage gate green.

- [ ] **Step 5: Commit**

```bash
git add src/data/groundedMessages.ts src/engine/groundedMessages/selectRecommendationEvidence.test.ts
git commit -m "feat(grounding): route live message to decompress/restore goals"
```

---

### Task 4: `RecommendationReveal` component

**Files:**
- Create: `src/components/RecommendationReveal.tsx`
- Create: `src/components/RecommendationReveal.module.css`
- Test: `src/components/RecommendationReveal.test.tsx`

**Interfaces:**
- Consumes: `selectRecommendationEvidence`, `SessionInputTags`, `GroundedTip`, `RegulatoryGoal`, `GroundedMessage`
- Produces:
  ```ts
  export function RecommendationReveal(props: {
    goal: RegulatoryGoal | null
    input: SessionInputTags
    bank?: GroundedMessage[]
  }): JSX.Element | null
  ```

- [ ] **Step 1: Write the failing test** — create `src/components/RecommendationReveal.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecommendationReveal } from './RecommendationReveal'
import type { GroundedMessage } from '../types/groundedMessage'

const live: GroundedMessage = {
  message_id: 'm',
  text: 'Gentle movement can calm an over-sensitized system.',
  selectors: { goal: ['decompress'], symptom: ['aching'] },
  citation: {
    pmid: '39818121', source_link: 'https://pubmed.ncbi.nlm.nih.gov/39818121/',
    exact_figure: 'SMD -0.81', figure_units: 'SMD',
  },
  display_quote: 'Meta-analysis revealed large improvement (SMD -0.81).',
  authored_by: 't', authored_at: '2026-06-20T00:00:00.000Z',
  review_status: 'pt_advisor_passed',
}

describe('RecommendationReveal', () => {
  it('renders nothing when goal is null', () => {
    const { container } = render(<RecommendationReveal goal={null} input={{}} bank={[live]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when no message matches the goal (honest degradation)', () => {
    const { container } = render(<RecommendationReveal goal="expand" input={{}} bank={[live]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the message text and an app-voice why line for a matched goal', () => {
    render(<RecommendationReveal goal="decompress" input={{ symptom: ['aching'] }} bank={[live]} />)
    expect(screen.getByText(/Gentle movement can calm/)).toBeInTheDocument()
    // app-voice why line present, and NOT attributed to the paper
    expect(screen.getByText(/why this for you/i)).toBeInTheDocument()
  })

  it('shows the verbatim quote only after expanding Learn more (INV-2)', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(<RecommendationReveal goal="decompress" input={{}} bank={[live]} />)
    expect(screen.queryByText(/SMD -0.81/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /learn more/i }))
    expect(screen.getByText(live.display_quote)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/RecommendationReveal.test.tsx`
Expected: FAIL — component not defined.

- [ ] **Step 3: Write the component** — create `src/components/RecommendationReveal.module.css`:

```css
.reveal {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.whyLabel {
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(26, 138, 138, 0.6);
}

.whyText {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
  text-align: center;
  max-width: 320px;
}
```

Then create `src/components/RecommendationReveal.tsx`:

```tsx
/**
 * RecommendationReveal — Grounded Guidance Layer 1.
 * Shows the research that explains this session's recommendation, keyed on the
 * engine's derived RegulatoryGoal. App-voice "why" line + the shipped GroundedTip
 * (verbatim quote + linked PMID). Renders nothing when no live, goal-bound
 * message matches (INV-5). Pure selection (INV-1); quote is verbatim (INV-2).
 * Authority: docs/apex-bundle/grounded-guidance/04-layer1-recommendation-reveal-spec.md
 */
import type { RegulatoryGoal } from '../types/hari'
import type { GroundedMessage } from '../types/groundedMessage'
import { selectRecommendationEvidence, type SessionInputTags } from '../engine/groundedMessages/selectRecommendationEvidence'
import { GroundedTip } from './GroundedTip'
import styles from './RecommendationReveal.module.css'

// App-authored, plain-language rationale per goal. App voice — never attributed
// to any paper (INV-2). The verbatim research claim lives in GroundedTip.
const WHY_BY_GOAL: Record<RegulatoryGoal, string> = {
  decompress: 'Easing pressure and giving the area room can quiet an irritated system.',
  restore: 'Low-effort, restful breathing helps your system recover.',
  stabilize: 'Steady, balanced breathing helps your system find a stable baseline.',
  downregulate: 'Slower, longer exhales help settle an activated system.',
  expand: 'Gentle expansion through the breath can release held tension.',
  ground: 'Slow, grounding breaths help discharge and settle high energy.',
  activate: 'A gentle lift in the breath can raise low energy without strain.',
}

export function RecommendationReveal({
  goal,
  input,
  bank,
}: {
  goal: RegulatoryGoal | null
  input: SessionInputTags
  bank?: GroundedMessage[]
}) {
  if (!goal) return null
  const message = selectRecommendationEvidence(goal, input, bank)
  if (!message) return null

  return (
    <div className={styles.reveal} aria-label="Why this session">
      <span className={styles.whyLabel}>Why this for you</span>
      <p className={styles.whyText}>{WHY_BY_GOAL[goal]}</p>
      <GroundedTip message={message} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/RecommendationReveal.test.tsx` then `npx tsc --noEmit`
Expected: PASS (4 tests), TYPECHECK CLEAN.

- [ ] **Step 5: Commit**

```bash
git add src/components/RecommendationReveal.tsx src/components/RecommendationReveal.module.css src/components/RecommendationReveal.test.tsx
git commit -m "feat(grounding): RecommendationReveal component (why-line + grounded tip)"
```

---

### Task 5: Render the reveal on `SessionSetupScreen`

**Files:**
- Modify: `src/screens/SessionSetupScreen.tsx`
- Test: `src/screens/SessionSetupScreen.test.tsx` (create if absent)

**Interfaces:**
- Consumes: `classifyNeedProfile` (`../engine/hari/needProfile`), `RecommendationReveal`, app context `state.stateInterpretationResult` + `state.activeSession.pain_input`
- Produces: the reveal appears on the live pre-session preview

- [ ] **Step 1: Write the failing test** — create `src/screens/SessionSetupScreen.test.tsx`. This renders the screen with a provider state that yields `primaryGoal === 'decompress'` (a `pain`/`tightness` interpretation) so the real bank's live message surfaces. Mirror the provider-mocking pattern used in `src/screens/HomeScreen.test.tsx` (read it first for the exact `renderWithProvider` helper and adapt). Minimum assertions:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppContext } from '../context/AppContext'
import { SessionSetupScreen } from './SessionSetupScreen'
import type { RuntimeSession, StateInterpretationResult } from '../types/hari'

// Minimal active session + a state-interpretation result whose primaryGoal is
// 'decompress' (pain → decompress via GOAL_MAP). Adapt field names to the real
// StateInterpretationResult / RuntimeSession shapes (read src/types/hari.ts).
function renderSetup(stateInterpretationResult: StateInterpretationResult | null) {
  const session = {
    session_id: 's', protocol_id: 'PROTO_REDUCED_EFFORT', protocol_name: 'Gentle Breath',
    goal: 'Ease pressure', estimated_length_seconds: 240,
    timing_profile: { inhale_seconds: 3, exhale_seconds: 6, rounds: 20 },
    pain_input: { pain_level: 4, location_tags: [], symptom_tags: ['aching'] },
  } as unknown as RuntimeSession
  const value = {
    state: { activeSession: session, stateInterpretationResult, hariIntake: null },
    dispatch: () => {},
  } as unknown as React.ContextType<typeof AppContext>
  return render(<AppContext.Provider value={value}><SessionSetupScreen /></AppContext.Provider>)
}

describe('SessionSetupScreen — grounded recommendation reveal', () => {
  it('does not crash and shows no reveal when there is no interpretation result', () => {
    renderSetup(null)
    expect(screen.queryByText(/why this for you/i)).not.toBeInTheDocument()
  })
})
```

> NOTE to implementer: read `src/screens/HomeScreen.test.tsx` for the established provider/render pattern and `src/types/hari.ts` for the exact `StateInterpretationResult` shape, then add a positive-path test that constructs a result yielding `primaryGoal === 'decompress'` and asserts `screen.getByText(/why this for you/i)` is present. If constructing a full `StateInterpretationResult` is heavy, assert the positive path at the component level (already covered in Task 4) and keep this file to the no-crash/no-interpretation guard plus the wiring.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/SessionSetupScreen.test.tsx`
Expected: FAIL — `SessionSetupScreen` does not yet render `RecommendationReveal` (or import error if helper names differ; fix imports to match real types).

- [ ] **Step 3: Wire the reveal into the screen** — in `src/screens/SessionSetupScreen.tsx`, add imports:

```ts
import { classifyNeedProfile } from '../engine/hari/needProfile'
import { RecommendationReveal } from '../components/RecommendationReveal'
```

Inside the component body, after `const positionHint = ...`, derive the goal and input tags:

```ts
  // Grounded Guidance Layer 1 — derive the recommendation's goal from the
  // already-stored interpretation result (no new engine call into the reducer).
  const derivedGoal = state.stateInterpretationResult
    ? classifyNeedProfile(state.stateInterpretationResult).primaryGoal
    : null
  const evidenceInput = {
    symptom: session.pain_input.symptom_tags,
    location: session.pain_input.location_tags,
  }
```

Then render the reveal as a block on the preview — place it just before the closing `</div>` of `.content` (after the `<SessionInsightsPanel insights={insights} />` line):

```tsx
        <SessionInsightsPanel insights={insights} />

        <RecommendationReveal goal={derivedGoal} input={evidenceInput} />
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/SessionSetupScreen.test.tsx` then the full suite `npx vitest run` then `npx tsc --noEmit`
Expected: PASS (screen test green, full suite green — no regressions), TYPECHECK CLEAN.

- [ ] **Step 5: Commit**

```bash
git add src/screens/SessionSetupScreen.tsx src/screens/SessionSetupScreen.test.tsx
git commit -m "feat(grounding): surface recommendation-reveal on session setup preview"
```

---

## Self-Review

**Spec coverage (against `04-layer1-recommendation-reveal-spec.md`):**
- D-A goal binding → Task 1. D-B host = SessionSetupScreen → Task 5. D-C goal-gated/tag-ranked/null → Task 2. D-D additive (home tip untouched) → no task modifies `selectTip.ts`/HomeScreen; full-suite run in Task 5 guards it. D-E app-voice vs paper-voice → Task 4 (`WHY_BY_GOAL` app voice; `GroundedTip` carries verbatim quote).
- Acceptance criteria 1–9: (1) gate canonical goal → Task 1; (2) determinism → Task 2; (3) goal-gating → Task 2; (4) tag ranking + tie-break → Task 2; (5) null path → Task 2 + Task 4; (6) liveness excludes engineering_passed → Task 2; (7) verbatim quote + app-voice why → Task 4; (8) additivity → Task 5 full-suite; (9) coverage gate green → Task 3.

**Placeholder scan:** all code steps contain complete code. The only soft spot is the Task 5 positive-path test, intentionally delegated with explicit instructions because the full `StateInterpretationResult` shape must be read from source; the component positive path is fully covered in Task 4.

**Type consistency:** `selectRecommendationEvidence(goal, input, bank?)`, `SessionInputTags`, `RecommendationReveal({goal,input,bank?})`, `REGULATORY_GOALS`, `MessageSelectors.goal` are named identically across all tasks. `classifyNeedProfile` returns `NeedProfile` with `.primaryGoal` (verified in `src/engine/hari/needProfile.ts`).

## Out of scope (roadmap — do NOT build)
Carousel (L2), in-session micro-guidance (L3), build-time authoring/topic-strength tool (L4), longitudinal cross-class profile (L4). See `docs/apex-bundle/grounded-guidance/05-roadmap-layers-2-4.md`.
