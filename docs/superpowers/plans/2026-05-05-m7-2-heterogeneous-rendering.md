# M7.2 — Heterogeneous Phase Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert mediCalm's session render from single-breath-phase (legacy `TimingProfile`-driven) to multi-phase (PTVariant phases iterated end-to-end), with explicit 5-count intro, narrated 5-second between-transitions, and closing completion phase. First M7 milestone with visible UX change for users.

**Architecture:** New `src/components/m7/` directory holds phase-render components. `PhaseRenderer.tsx` drives a state machine over a variant's `phases[]`; per-phase children render breath cycles or transition narrations via a discriminated union. Template registry (`src/data/m7Templates.ts`) holds versioned transition templates with PMID-grounded copy where applicable; pathway library v0.2 extends every variant with intro + closing transitions. `GuidedSessionScreen` switches to `PhaseRenderer` when a session has `m7_build`; legacy single-phase render stays for sessions without M7 routing. Lightweight typography per the locked design intent (large + thin font-weight + calm).

**Tech Stack:** React 18, TypeScript 5.6, framer-motion (already in deps), Vitest, Playwright. CSS Modules for typography tokens.

**Source spec:** `docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md` §8 M7.2 (deliverables + acceptance), §3.2 (transition phase shape), §3.5 (PTPathway authored_duration_seconds), §5 I9 mass balance (durations sum within ±5%), §5 I40 (every M7.1+ session has phase_log with ≥1 entry — extended at M7.2 to ≥3 entries: intro + breath + closing).

**Branch:** Continue on `m7-pt-pathway-foundation` (M7.1 substrate at commit 56b1d49).

**Authority for ordering:** M7.2 EXECUTION ideally waits on PT advisor Phase 1 partition validation per the parallel-workstream framing. The PLAN can be authored and reviewed without blocking on advisor; partition revisions land cheaply against this plan.

**Behavioral contract:** Sessions effectively gain ~10 seconds (5s intro + 5s closing) per the spec's intentional UX change. M7.1's "no behavioral change" no-regression contract retires here; M7.2's contract is "every session has intro + breath + closing rendered cleanly, mass balance within tolerance, transitions feel calm and lightweight."

---

## File map

**Create:**
- `src/data/m7Templates.ts` — Template registry: `M7_TEMPLATES` array of versioned transition templates (`standard_5_count`, `standard_completion`, `standard_between`, etc.)
- `src/data/m7Templates.test.ts`
- `src/components/m7/PhaseRenderer.tsx` — Top-level multi-phase render loop; iterates `variant.phases[]`, dispatches per phase type
- `src/components/m7/PhaseRenderer.module.css` — Lightweight typography tokens shared across transitions
- `src/components/m7/PhaseRenderer.test.tsx`
- `src/components/m7/IntroTransition.tsx` — 5-count countdown rendering for `transition.subtype === 'intro'`
- `src/components/m7/IntroTransition.module.css`
- `src/components/m7/IntroTransition.test.tsx`
- `src/components/m7/BetweenTransition.tsx` — Narrated "what's next" 5s rendering for `transition.subtype === 'between'`
- `src/components/m7/BetweenTransition.module.css`
- `src/components/m7/BetweenTransition.test.tsx`
- `src/components/m7/ClosingTransition.tsx` — Completion narration 5s rendering for `transition.subtype === 'closing'`
- `src/components/m7/ClosingTransition.module.css`
- `src/components/m7/ClosingTransition.test.tsx`
- `src/components/m7/BreathPhaseRenderer.tsx` — Breath phase render (delegates to existing `BreathingOrb` + cue display)
- `src/components/m7/BreathPhaseRenderer.test.tsx`

**Modify:**
- `src/data/m7Pathways.ts` — Each of the 12 variants gains explicit `[intro, breath, closing]` phases; `authored_duration_seconds` adjusted by +10 (per M7.2 spec). Variant-level mass balance verified (I9).
- `src/data/m7Pathways.test.ts` — Tests assert 3-phase variants with intro + closing; I9 mass balance check.
- `src/screens/GuidedSessionScreen.tsx` — Switch to `PhaseRenderer` when `session.m7_build` is present; phase_log writes per phase boundary (intro start/end, breath start/end, closing start/end).
- `scripts/intakeOutputSweep.ts` — Sweep harness validates M7.2 phase counts (3 per variant) and mass balance; existing legacy timing equivalence assertion now compares the BREATH phase only (intro + closing are M7.2-additive).

---

## Pre-flight before execution begins

Before dispatching subagents, confirm:

- PT advisor Phase 1 partition validation is at least scheduled (preferably initial conversation completed). If advisor surfaces a partition concern, M7.1 substrate adjustments are cheap; revising at M7.2+ ripples through every consumer.
- M7.1 substrate commit is on origin (`origin/m7-pt-pathway-foundation` at 56b1d49 or later). Do not start M7.2 against an unpushed substrate.

---

## Task ordering

The 14 tasks below run sequentially. Phase A (templates) → Phase B (per-phase renderers) → Phase C (top-level PhaseRenderer) → Phase D (pathway library v0.2) → Phase E (integration + acceptance).

---

## Phase A — Template registry

### Task 1: Template registry types + initial templates

**Files:**
- Create: `src/data/m7Templates.ts`
- Create: `src/data/m7Templates.test.ts`

- [ ] **Step 1: Write failing test asserting template registry exists with the four required initial templates**

```ts
// src/data/m7Templates.test.ts
import { describe, it, expect } from 'vitest'
import { M7_TEMPLATES, getTemplate, type TransitionTemplate } from './m7Templates'

describe('M7 template registry — initial population', () => {
  it('exports M7_TEMPLATES array with required initial templates', () => {
    expect(Array.isArray(M7_TEMPLATES)).toBe(true)
    const ids = M7_TEMPLATES.map(t => t.template_id)
    expect(ids).toContain('standard_5_count')
    expect(ids).toContain('standard_between')
    expect(ids).toContain('standard_completion')
  })

  it('every template carries (template_id, template_version, subtype, copy)', () => {
    for (const t of M7_TEMPLATES) {
      expect(typeof t.template_id).toBe('string')
      expect(typeof t.template_version).toBe('string')
      expect(['intro', 'between', 'closing']).toContain(t.subtype)
      expect(typeof t.copy).toBe('string')
    }
  })

  it('getTemplate(id, version) returns the matching template', () => {
    const t = getTemplate('standard_5_count', '1.0.0')
    expect(t.template_id).toBe('standard_5_count')
    expect(t.subtype).toBe('intro')
  })

  it('getTemplate throws on unknown (id, version) pair', () => {
    expect(() => getTemplate('does_not_exist', '1.0.0')).toThrow()
    expect(() => getTemplate('standard_5_count', '99.0.0')).toThrow()
  })

  it('TransitionTemplate type carries the expected fields', () => {
    const t: TransitionTemplate = {
      template_id: 'x',
      template_version: '1.0.0',
      subtype: 'intro',
      copy: 'test',
    }
    expect(t.template_id).toBe('x')
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/data/m7Templates.test.ts`
Expected: FAIL with `Cannot find module './m7Templates'`

- [ ] **Step 3: Create `src/data/m7Templates.ts`**

```ts
/**
 * M7 Transition Template Registry.
 *
 * Stores versioned templates referenced by `TransitionPhase.template_id` +
 * `TransitionPhase.template_version` from variant artifacts. Templates are
 * Class 2 (immutable post-publish; new versions added, old retained).
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.2
 *            (TransitionPhase data shape) + Q5 Refinement 1 (template_version
 *            pinned in artifact for historical reproducibility).
 */
import type { SemVer, TemplateId } from '../types/m7'

export type TransitionTemplate = {
  template_id: TemplateId
  template_version: SemVer
  subtype: 'intro' | 'between' | 'closing'
  /**
   * Default copy rendered for this template. Variants may override per-instance
   * via TransitionPhase.subtitle if pathway-specific framing is needed.
   */
  copy: string
}

export const M7_TEMPLATES: TransitionTemplate[] = [
  {
    template_id: 'standard_5_count',
    template_version: '1.0.0',
    subtype: 'intro',
    copy: "Take a moment. We'll begin in a few breaths.",
  },
  {
    template_id: 'standard_between',
    template_version: '1.0.0',
    subtype: 'between',
    copy: 'Easing into the next phase.',
  },
  {
    template_id: 'standard_completion',
    template_version: '1.0.0',
    subtype: 'closing',
    copy: 'Session complete. Take what you need from this.',
  },
]

const REGISTRY: Map<string, TransitionTemplate> = new Map(
  M7_TEMPLATES.map(t => [`${t.template_id}@${t.template_version}`, t]),
)

export function getTemplate(template_id: TemplateId, template_version: SemVer): TransitionTemplate {
  const key = `${template_id}@${template_version}`
  const t = REGISTRY.get(key)
  if (!t) throw new Error(`M7 template registry: unknown template ${key}`)
  return t
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/data/m7Templates.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/m7Templates.ts src/data/m7Templates.test.ts
git commit -m "feat(m7.2): template registry with initial transitions (standard 5_count / between / completion)"
```

---

## Phase B — Per-phase renderers

### Task 2: BreathPhaseRenderer (delegates to existing BreathingOrb + cue display)

**Files:**
- Create: `src/components/m7/BreathPhaseRenderer.tsx`
- Create: `src/components/m7/BreathPhaseRenderer.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/m7/BreathPhaseRenderer.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BreathPhaseRenderer } from './BreathPhaseRenderer'
import type { BreathPhase } from '../../types/m7'

const phase: BreathPhase = {
  type: 'breath',
  breath_family: 'calm_downregulate',
  num_cycles: 4,
  cue: { opening: 'Settle into the breath', closing: 'Easing back' },
}

describe('BreathPhaseRenderer', () => {
  it('renders the phase opening cue', () => {
    render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
    expect(screen.getByText(/settle into the breath/i)).toBeInTheDocument()
  })

  it('invokes onComplete after num_cycles × (inhale + exhale) seconds', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<BreathPhaseRenderer phase={phase} onComplete={onComplete} />)
    // calm_downregulate is 4/0/7 = 11s × 4 cycles = 44s
    vi.advanceTimersByTime(44_000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/components/m7/BreathPhaseRenderer.test.tsx`
Expected: FAIL with `Cannot find module './BreathPhaseRenderer'`.

- [ ] **Step 3: Create `src/components/m7/BreathPhaseRenderer.tsx`**

```tsx
import { useEffect } from 'react'
import { BREATH_FAMILIES } from '../../engine/hari/breathFamily'
import type { BreathPhase } from '../../types/m7'

type Props = {
  phase: BreathPhase
  onComplete: () => void
}

export function BreathPhaseRenderer({ phase, onComplete }: Props) {
  const family = BREATH_FAMILIES[phase.breath_family]
  const cycleSeconds = family.inhaleSeconds + family.exhaleSeconds + (family.holdSeconds ?? 0)
  const totalMs = cycleSeconds * phase.num_cycles * 1000

  useEffect(() => {
    const id = setTimeout(onComplete, totalMs)
    return () => clearTimeout(id)
  }, [totalMs, onComplete])

  return (
    <div role="region" aria-label="Breath phase">
      <p>{phase.cue.opening}</p>
      {phase.cue.mid && <p>{phase.cue.mid}</p>}
      <p>{phase.cue.closing}</p>
    </div>
  )
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/components/m7/BreathPhaseRenderer.test.tsx`
Expected: PASS (2 tests).

Note: this minimal implementation renders cue text only; rich BreathingOrb integration happens in Task 12 wire-in. The component contract (props in, onComplete fired after duration) is what M7.2 PhaseRenderer depends on.

- [ ] **Step 5: Commit**

```bash
git add src/components/m7/BreathPhaseRenderer.tsx src/components/m7/BreathPhaseRenderer.test.tsx
git commit -m "feat(m7.2): BreathPhaseRenderer — minimal cue display + duration-driven onComplete"
```

---

### Task 3: IntroTransition (5-count countdown for `subtype === 'intro'`)

**Files:**
- Create: `src/components/m7/IntroTransition.tsx`
- Create: `src/components/m7/IntroTransition.module.css`
- Create: `src/components/m7/IntroTransition.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/m7/IntroTransition.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IntroTransition } from './IntroTransition'

describe('IntroTransition — 5-count countdown', () => {
  it('renders the template copy', () => {
    render(<IntroTransition copy="Take a moment." subtitle={undefined} onComplete={() => {}} />)
    expect(screen.getByText(/take a moment/i)).toBeInTheDocument()
  })

  it('renders the subtitle when provided', () => {
    render(<IntroTransition copy="Take a moment." subtitle="Diaphragmatic onboarding" onComplete={() => {}} />)
    expect(screen.getByText(/diaphragmatic onboarding/i)).toBeInTheDocument()
  })

  it('counts down from 5 to 1 over 5 seconds, then invokes onComplete', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<IntroTransition copy="Take a moment." subtitle={undefined} onComplete={onComplete} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    vi.advanceTimersByTime(1000)
    expect(screen.getByText('4')).toBeInTheDocument()
    vi.advanceTimersByTime(3000)
    expect(screen.getByText('1')).toBeInTheDocument()
    vi.advanceTimersByTime(1000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/components/m7/IntroTransition.test.tsx`
Expected: FAIL with `Cannot find module './IntroTransition'`.

- [ ] **Step 3: Create `src/components/m7/IntroTransition.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 200;
}

.count {
  font-size: 6rem;
  font-weight: 100;
  letter-spacing: -0.05em;
  line-height: 1;
  color: var(--text-primary, #1a1a1a);
}

.copy {
  font-size: 1.25rem;
  font-weight: 300;
  text-align: center;
  color: var(--text-secondary, #4a4a4a);
  max-width: 28ch;
}

.subtitle {
  font-size: 0.95rem;
  font-weight: 300;
  text-align: center;
  color: var(--text-tertiary, #6a6a6a);
  max-width: 32ch;
}
```

- [ ] **Step 4: Create `src/components/m7/IntroTransition.tsx`**

```tsx
import { useEffect, useState } from 'react'
import styles from './IntroTransition.module.css'

type Props = {
  copy: string
  subtitle: string | undefined
  onComplete: () => void
}

export function IntroTransition({ copy, subtitle, onComplete }: Props) {
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }
    const id = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [count, onComplete])

  return (
    <div className={styles.container} role="region" aria-label="Session intro">
      <div className={styles.count} aria-live="polite">{count > 0 ? count : ''}</div>
      <p className={styles.copy}>{copy}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npx vitest run src/components/m7/IntroTransition.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/m7/IntroTransition.tsx src/components/m7/IntroTransition.module.css src/components/m7/IntroTransition.test.tsx
git commit -m "feat(m7.2): IntroTransition — 5-count countdown with lightweight typography"
```

---

### Task 4: BetweenTransition (narrated 5s "what's next")

**Files:**
- Create: `src/components/m7/BetweenTransition.tsx`
- Create: `src/components/m7/BetweenTransition.module.css`
- Create: `src/components/m7/BetweenTransition.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/m7/BetweenTransition.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BetweenTransition } from './BetweenTransition'

describe('BetweenTransition — 5s narrated transition', () => {
  it('renders the template copy', () => {
    render(<BetweenTransition copy="Easing into the next phase." subtitle={undefined} onComplete={() => {}} />)
    expect(screen.getByText(/easing into the next phase/i)).toBeInTheDocument()
  })

  it('invokes onComplete after 5 seconds', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<BetweenTransition copy="Easing into the next phase." subtitle={undefined} onComplete={onComplete} />)
    vi.advanceTimersByTime(4999)
    expect(onComplete).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/components/m7/BetweenTransition.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Create `src/components/m7/BetweenTransition.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 200;
}

.copy {
  font-size: 2rem;
  font-weight: 200;
  text-align: center;
  letter-spacing: -0.01em;
  color: var(--text-primary, #1a1a1a);
  max-width: 24ch;
  line-height: 1.3;
}

.subtitle {
  font-size: 1rem;
  font-weight: 300;
  text-align: center;
  color: var(--text-tertiary, #6a6a6a);
  max-width: 32ch;
}
```

- [ ] **Step 4: Create `src/components/m7/BetweenTransition.tsx`**

```tsx
import { useEffect } from 'react'
import styles from './BetweenTransition.module.css'

type Props = {
  copy: string
  subtitle: string | undefined
  onComplete: () => void
}

export function BetweenTransition({ copy, subtitle, onComplete }: Props) {
  useEffect(() => {
    const id = setTimeout(onComplete, 5000)
    return () => clearTimeout(id)
  }, [onComplete])

  return (
    <div className={styles.container} role="region" aria-label="Phase transition">
      <p className={styles.copy}>{copy}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npx vitest run src/components/m7/BetweenTransition.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/m7/BetweenTransition.tsx src/components/m7/BetweenTransition.module.css src/components/m7/BetweenTransition.test.tsx
git commit -m "feat(m7.2): BetweenTransition — narrated 5s phase transition"
```

---

### Task 5: ClosingTransition (completion narration 5s)

**Files:**
- Create: `src/components/m7/ClosingTransition.tsx`
- Create: `src/components/m7/ClosingTransition.module.css`
- Create: `src/components/m7/ClosingTransition.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/m7/ClosingTransition.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClosingTransition } from './ClosingTransition'

describe('ClosingTransition — 5s completion narration', () => {
  it('renders the template copy', () => {
    render(<ClosingTransition copy="Session complete." subtitle={undefined} onComplete={() => {}} />)
    expect(screen.getByText(/session complete/i)).toBeInTheDocument()
  })

  it('invokes onComplete after 5 seconds', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ClosingTransition copy="Session complete." subtitle={undefined} onComplete={onComplete} />)
    vi.advanceTimersByTime(5000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/components/m7/ClosingTransition.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Create `src/components/m7/ClosingTransition.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 200;
}

.copy {
  font-size: 2rem;
  font-weight: 200;
  text-align: center;
  letter-spacing: -0.01em;
  color: var(--text-primary, #1a1a1a);
  max-width: 24ch;
  line-height: 1.3;
}

.subtitle {
  font-size: 1rem;
  font-weight: 300;
  text-align: center;
  color: var(--text-tertiary, #6a6a6a);
  max-width: 32ch;
}
```

- [ ] **Step 4: Create `src/components/m7/ClosingTransition.tsx`**

```tsx
import { useEffect } from 'react'
import styles from './ClosingTransition.module.css'

type Props = {
  copy: string
  subtitle: string | undefined
  onComplete: () => void
}

export function ClosingTransition({ copy, subtitle, onComplete }: Props) {
  useEffect(() => {
    const id = setTimeout(onComplete, 5000)
    return () => clearTimeout(id)
  }, [onComplete])

  return (
    <div className={styles.container} role="region" aria-label="Session closing">
      <p className={styles.copy}>{copy}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npx vitest run src/components/m7/ClosingTransition.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/m7/ClosingTransition.tsx src/components/m7/ClosingTransition.module.css src/components/m7/ClosingTransition.test.tsx
git commit -m "feat(m7.2): ClosingTransition — 5s completion narration"
```

---

## Phase C — Top-level PhaseRenderer

### Task 6: PhaseRenderer state machine

**Files:**
- Create: `src/components/m7/PhaseRenderer.tsx`
- Create: `src/components/m7/PhaseRenderer.module.css`
- Create: `src/components/m7/PhaseRenderer.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/m7/PhaseRenderer.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { PhaseRenderer } from './PhaseRenderer'
import type { PTVariant } from '../../types/m7'

function variant(): PTVariant {
  return {
    variant_id: 'v', variant_version: '0.2.0',
    pathway_id: 'p', pathway_version: '0.2.0',
    conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
    phases: [
      { type: 'transition', subtype: 'intro', template_id: 'standard_5_count', template_version: '1.0.0', duration_seconds: 5 },
      { type: 'breath', breath_family: 'calm_downregulate', num_cycles: 1, cue: { opening: 'Breath phase opening', closing: 'closing' } },
      { type: 'transition', subtype: 'closing', template_id: 'standard_completion', template_version: '1.0.0', duration_seconds: 5 },
    ],
    authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
    review_status: 'engineering_passed',
  }
}

describe('PhaseRenderer — multi-phase state machine', () => {
  it('starts on phase 0 (intro) and renders the intro', () => {
    render(<PhaseRenderer variant={variant()} onPhaseStart={() => {}} onPhaseEnd={() => {}} onSessionComplete={() => {}} />)
    expect(screen.getByLabelText('Session intro')).toBeInTheDocument()
  })

  it('advances through intro → breath → closing → onSessionComplete', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const onPhaseStart = vi.fn()
    const onPhaseEnd = vi.fn()
    render(<PhaseRenderer variant={variant()} onPhaseStart={onPhaseStart} onPhaseEnd={onPhaseEnd} onSessionComplete={onComplete} />)

    // intro 5s
    expect(onPhaseStart).toHaveBeenCalledWith(0, 'transition', 'intro')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(0)

    // breath 1 cycle = 11s for calm_downregulate (4/0/7)
    expect(onPhaseStart).toHaveBeenCalledWith(1, 'breath', undefined)
    act(() => { vi.advanceTimersByTime(11_000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(1)

    // closing 5s
    expect(onPhaseStart).toHaveBeenCalledWith(2, 'transition', 'closing')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(2)

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/components/m7/PhaseRenderer.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Create `src/components/m7/PhaseRenderer.module.css`**

```css
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 4: Create `src/components/m7/PhaseRenderer.tsx`**

```tsx
import { useCallback, useState } from 'react'
import { BreathPhaseRenderer } from './BreathPhaseRenderer'
import { IntroTransition } from './IntroTransition'
import { BetweenTransition } from './BetweenTransition'
import { ClosingTransition } from './ClosingTransition'
import { getTemplate } from '../../data/m7Templates'
import type { PTVariant, Phase, TransitionPhase } from '../../types/m7'
import styles from './PhaseRenderer.module.css'

type Props = {
  variant: PTVariant
  onPhaseStart: (
    phase_index: number,
    phase_type: 'breath' | 'position_hold' | 'transition',
    phase_subtype: 'intro' | 'between' | 'closing' | undefined,
  ) => void
  onPhaseEnd: (phase_index: number) => void
  onSessionComplete: () => void
}

export function PhaseRenderer({ variant, onPhaseStart, onPhaseEnd, onSessionComplete }: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const phase: Phase | undefined = variant.phases[phaseIndex]

  // Fire onPhaseStart on each phase entry
  const startedRef = useRefInitOnce(phaseIndex, () => {
    if (!phase) return
    const subtype = phase.type === 'transition' ? phase.subtype : undefined
    onPhaseStart(phaseIndex, phase.type, subtype)
  })
  void startedRef

  const handlePhaseComplete = useCallback(() => {
    onPhaseEnd(phaseIndex)
    if (phaseIndex + 1 >= variant.phases.length) {
      onSessionComplete()
    } else {
      setPhaseIndex(phaseIndex + 1)
    }
  }, [phaseIndex, variant.phases.length, onPhaseEnd, onSessionComplete])

  if (!phase) return null

  return (
    <div className={styles.container}>
      {phase.type === 'breath' && (
        <BreathPhaseRenderer phase={phase} onComplete={handlePhaseComplete} />
      )}
      {phase.type === 'transition' && (
        <TransitionDispatcher phase={phase} onComplete={handlePhaseComplete} />
      )}
    </div>
  )
}

function TransitionDispatcher({ phase, onComplete }: { phase: TransitionPhase; onComplete: () => void }) {
  const tmpl = getTemplate(phase.template_id, phase.template_version)
  const copy = tmpl.copy
  const subtitle = phase.subtitle
  switch (phase.subtype) {
    case 'intro':
      return <IntroTransition copy={copy} subtitle={subtitle} onComplete={onComplete} />
    case 'between':
      return <BetweenTransition copy={copy} subtitle={subtitle} onComplete={onComplete} />
    case 'closing':
      return <ClosingTransition copy={copy} subtitle={subtitle} onComplete={onComplete} />
  }
}

// Helper: fires `effect` once per `key` change, returning a sentinel.
import { useEffect, useRef } from 'react'
function useRefInitOnce(key: number | string, effect: () => void) {
  const lastKey = useRef<number | string | null>(null)
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key
      effect()
    }
  }, [key, effect])
  return lastKey
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npx vitest run src/components/m7/PhaseRenderer.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/m7/PhaseRenderer.tsx src/components/m7/PhaseRenderer.module.css src/components/m7/PhaseRenderer.test.tsx
git commit -m "feat(m7.2): PhaseRenderer — multi-phase state machine with transition dispatch"
```

---

## Phase D — Pathway library v0.2

### Task 7: Extend variant phase arrays with explicit intro + closing transitions

**Files:**
- Modify: `src/data/m7Pathways.ts`
- Modify: `src/data/m7Pathways.test.ts`

- [ ] **Step 1: Add failing tests for v0.2 phase shape**

Append to `src/data/m7Pathways.test.ts`:

```ts
describe('M7 pathway library v0.2 — variants gain explicit intro + closing', () => {
  it('every variant has exactly 3 phases: intro transition + breath + closing transition', () => {
    for (const v of M7_VARIANTS) {
      expect(v.phases.length).toBe(3)
      expect(v.phases[0].type).toBe('transition')
      expect(v.phases[1].type).toBe('breath')
      expect(v.phases[2].type).toBe('transition')
    }
  })

  it('phase[0] is an intro transition', () => {
    for (const v of M7_VARIANTS) {
      const p0 = v.phases[0]
      if (p0.type !== 'transition') throw new Error('expected transition')
      expect(p0.subtype).toBe('intro')
    }
  })

  it('phase[2] is a closing transition', () => {
    for (const v of M7_VARIANTS) {
      const p2 = v.phases[2]
      if (p2.type !== 'transition') throw new Error('expected transition')
      expect(p2.subtype).toBe('closing')
    }
  })

  it('every transition references a template with version 1.0.0', () => {
    for (const v of M7_VARIANTS) {
      for (const phase of v.phases) {
        if (phase.type === 'transition') {
          expect(phase.template_version).toBe('1.0.0')
        }
      }
    }
  })

  it('I9 mass balance — phase durations sum to authored_duration_seconds within ±5%', () => {
    for (const v of M7_VARIANTS) {
      const pathway = M7_PATHWAYS.find(p => p.pathway_id === v.pathway_id)!
      const sum = v.phases.reduce((acc, phase) => {
        if (phase.type === 'transition') return acc + phase.duration_seconds
        if (phase.type === 'breath') {
          const family = require('../engine/hari/breathFamily').BREATH_FAMILIES[phase.breath_family]
          return acc + (family.inhaleSeconds + family.exhaleSeconds + (family.holdSeconds ?? 0)) * phase.num_cycles
        }
        return acc
      }, 0)
      const tolerance = pathway.authored_duration_seconds * 0.05
      expect(Math.abs(sum - pathway.authored_duration_seconds)).toBeLessThanOrEqual(tolerance)
    }
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/data/m7Pathways.test.ts`
Expected: FAIL — phases.length is 1, not 3.

- [ ] **Step 3: Update `src/data/m7Pathways.ts` to extend variants with intro + closing**

Replace the `variant()` factory and update `authored_duration_seconds` on each pathway. Open `src/data/m7Pathways.ts` and:

(a) Update the `variant()` factory:

```ts
function variant(
  pathway_id: string,
  family: BreathPhase['breath_family'],
  num_cycles: number,
): PTVariant {
  return {
    variant_id: `${pathway_id}_v1`,
    variant_version: '0.2.0',  // bumped for M7.2 phase additions
    pathway_id,
    pathway_version: '0.2.0',
    conditioning: {
      irritability: 'symmetric',
      flare_sensitivity: 'moderate',
      baseline_intensity_band: 'moderate',
    },
    phases: [
      { type: 'transition', subtype: 'intro', template_id: 'standard_5_count', template_version: '1.0.0', duration_seconds: 5 },
      breathPhase(family, num_cycles),
      { type: 'transition', subtype: 'closing', template_id: 'standard_completion', template_version: '1.0.0', duration_seconds: 5 },
    ],
    authored_by: 'JSEer',
    authored_at: NOW,
    review_status: 'engineering_passed',
  }
}
```

(b) Update each pathway's `authored_duration_seconds` to add 10 (intro 5 + closing 5):
- 240 → 250
- 360 → 370
- 480 → 490

Pathway constants update — find each `pathway(...)` call and bump:
- `tightness_flare_safe_reduced_effort_short`: 240 → 250
- `anxious_calm_downregulate_reduced_effort_standard`: 360 → 370
- `anxious_calm_downregulate_reduced_effort_long`: 480 → 490
- `tightness_decompression_reduced_effort_short`: 240 → 250
- `tightness_decompression_calm_downregulate_short`: 240 → 250
- `anxious_calm_downregulate_calm_downregulate_standard`: 360 → 370
- `anxious_calm_downregulate_calm_downregulate_long`: 480 → 490
- `tightness_flare_safe_calm_downregulate_short`: 240 → 250
- `anxious_calm_downregulate_stabilize_balance_standard`: 360 → 370
- `tightness_decompression_stabilize_balance_short`: 240 → 250
- `tightness_flare_safe_stabilize_balance_short`: 240 → 250
- `anxious_calm_downregulate_stabilize_balance_long`: 480 → 490

Bump `pathway_version` from '0.1.0' to '0.2.0' in the `pathway()` factory's VER constant. Same for variants.

(c) Verify `BreathPhase` type is imported (used by the variant() factory).

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/data/m7Pathways.test.ts`
Expected: PASS — all 15 tests (4 from T7, 6 from T8 v0.1, 5 new v0.2).

- [ ] **Step 5: Run full suite + sweep harness to verify no other breakage**

Run: `npx vitest run`
Expected: most tests pass; the `timingProfileAdapter.test.ts` test that asserts breath phase is at index 0 will FAIL (the variant now has transition at index 0). Adjust the adapter to handle this in Task 11.

Run: `SWEEP_VARIANT=postfix npx vite-node scripts/intakeOutputSweep.ts 2>&1 | tail -10`
Expected: the M7 timing assertion may FAIL because the variant's first phase is no longer breath. Adjust the sweep harness in Task 13.

These two failures are EXPECTED and addressed in Tasks 11 and 13. Document them in the commit message.

- [ ] **Step 6: Commit (with known follow-up failures noted)**

```bash
git add src/data/m7Pathways.ts src/data/m7Pathways.test.ts
git commit -m "$(cat <<'EOF'
feat(m7.2): pathway library v0.2 — variants gain explicit intro + closing transitions

Each variant now has 3 phases: [intro_transition, breath, closing_transition].
authored_duration_seconds bumped by +10s on each pathway.
pathway_version + variant_version bumped to 0.2.0.

Known follow-up failures (addressed in upcoming tasks):
- timingProfileAdapter assumes phase[0] is breath; Task 11 retires the adapter
  for M7-routed sessions or adjusts to find the breath phase
- sweep harness M7 timing assertion compares phase[0]; Task 13 updates it to
  compare the breath phase only

I9 mass balance verified within tolerance for all 12 variants.
EOF
)"
```

---

## Phase E — Integration

### Task 8: GuidedSessionScreen routes M7 sessions through PhaseRenderer

**Files:**
- Modify: `src/screens/GuidedSessionScreen.tsx`

- [ ] **Step 1: Read `src/screens/GuidedSessionScreen.tsx` end-to-end**

Run: `cat src/screens/GuidedSessionScreen.tsx | head -100` to understand the current render flow. Identify:
- Where the session content (BreathingOrb + cue display) is rendered
- Where session completion fires
- Where `phase_log` writes happen (added in M7.1 Task 16)
- Where `m7_build` from RuntimeSession is read (added in M7.1 Task 15)

- [ ] **Step 2: Add a conditional render branch for M7-routed sessions**

In the render block, add:

```tsx
import { PhaseRenderer } from '../components/m7/PhaseRenderer'
import { startPhase, completePhase, abortPhase, safetyStopPhase } from '../engine/m7/phaseLog'

// Inside the component, where session content renders:
const m7Build = session.m7_build
if (m7Build) {
  return (
    <PhaseRenderer
      variant={m7Build.variant}
      onPhaseStart={(phase_index, phase_type, phase_subtype) => {
        startPhase(phaseLogRef.current, phase_index, phase_type, phase_subtype)
      }}
      onPhaseEnd={(phase_index) => {
        completePhase(phaseLogRef.current, phase_index)
      }}
      onSessionComplete={() => {
        handleCompletedSave()
      }}
    />
  )
}
// ... legacy single-phase render path falls through for non-M7 sessions
```

The phase_log writes per phase boundary (intro start/end, breath start/end, closing start/end), giving I40-extended invariant: every M7.2+ session has phase_log with ≥3 entries.

- [ ] **Step 3: Run all tests; expect existing GuidedSessionScreen tests to still pass and new component tests pass**

Run: `npx vitest run`
Expected: pass (or note any test that now needs updating to handle M7 path).

- [ ] **Step 4: Smoke-test in dev server**

Run: `npm run dev`. In a browser, walk through an intake → guided session and observe: 5-count intro, breath phase, closing narration, history entry shows phase_log with 3 entries (intro, breath, closing).

- [ ] **Step 5: Commit**

```bash
git add src/screens/GuidedSessionScreen.tsx
git commit -m "feat(m7.2): GuidedSessionScreen routes M7 sessions through PhaseRenderer"
```

---

### Task 9: Retire (or scope-limit) the TimingProfile adapter for M7-routed sessions

**Files:**
- Modify: `src/engine/m7/timingProfileAdapter.ts`
- Modify: `src/engine/m7/timingProfileAdapter.test.ts`

- [ ] **Step 1: Update tests to reflect M7.2 multi-phase variants**

Update the existing tests in `src/engine/m7/timingProfileAdapter.test.ts` to construct variants with the v0.2 shape (intro + breath + closing). The adapter must now find the BREATH phase rather than assuming phase[0]. Update the test:

```ts
function variant(family: 'flare_safe_soft_exhale' | 'calm_downregulate' | 'decompression_expand', cycles: number): PTVariant {
  return {
    variant_id: 'v', variant_version: '0.2.0',
    pathway_id: 'p', pathway_version: '0.2.0',
    conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
    phases: [
      { type: 'transition', subtype: 'intro', template_id: 'standard_5_count', template_version: '1.0.0', duration_seconds: 5 },
      { type: 'breath', breath_family: family, num_cycles: cycles, cue: { opening: '', closing: '' } },
      { type: 'transition', subtype: 'closing', template_id: 'standard_completion', template_version: '1.0.0', duration_seconds: 5 },
    ],
    authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
    review_status: 'engineering_passed',
  }
}
```

Add a test asserting the throw case is now "no breath phase found":

```ts
it('throws when variant has no breath phase', () => {
  const v = variant('calm_downregulate', 1)
  v.phases = v.phases.filter(p => p.type !== 'breath')
  expect(() => variantToTimingProfile(v)).toThrow(/breath/)
})
```

- [ ] **Step 2: Update `variantToTimingProfile` to find the breath phase**

```ts
import type { PTVariant, BreathPhase } from '../../types/m7'
import type { TimingProfile } from '../../types'
import { BREATH_FAMILIES } from '../hari/breathFamily'

export function variantToTimingProfile(variant: PTVariant): TimingProfile {
  const breathPhase = variant.phases.find((p): p is BreathPhase => p.type === 'breath')
  if (!breathPhase) {
    throw new Error(`M7 timingProfileAdapter: variant ${variant.variant_id} has no breath phase`)
  }
  const family = BREATH_FAMILIES[breathPhase.breath_family]
  return {
    inhale_seconds: family.inhaleSeconds,
    exhale_seconds: family.exhaleSeconds,
    rounds: breathPhase.num_cycles,
  }
}
```

- [ ] **Step 3: Run tests, verify they pass**

Run: `npx vitest run src/engine/m7/timingProfileAdapter.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/engine/m7/timingProfileAdapter.ts src/engine/m7/timingProfileAdapter.test.ts
git commit -m "feat(m7.2): TimingProfile adapter finds breath phase by type (not index)"
```

---

### Task 10: Sweep harness updates for v0.2 phase counts

**Files:**
- Modify: `scripts/intakeOutputSweep.ts`

- [ ] **Step 1: Adjust the M7 timing equivalence assertion**

Find the existing M7 assertion in `scripts/intakeOutputSweep.ts` (added in M7.1 Task 17). Update it to compare against the BREATH phase's timing rather than assuming the first phase. The adapter (`variantToTimingProfile`) now does this internally, so the existing call may already be correct — verify by reading the harness code.

If the harness reads `m7Result.timing` (returned by `buildM7Session` which calls `variantToTimingProfile`), no change is needed — the adapter update from Task 9 propagates.

If the harness directly indexes `variant.phases[0]` for timing, replace with `variant.phases.find(p => p.type === 'breath')`.

- [ ] **Step 2: Add a phase count assertion**

After the existing M7 timing assertion, add:

```ts
if (m7Result.variant.phases.length !== 3) {
  throw new Error(`M7.2 phase count regression at case ${caseIndex}: expected 3 phases (intro+breath+closing), got ${m7Result.variant.phases.length}`)
}
```

- [ ] **Step 3: Run sweep harness, verify zero throws**

Run: `SWEEP_VARIANT=postfix npx vite-node scripts/intakeOutputSweep.ts 2>&1 | tail -10`
Expected: completes without errors. M7 timing matches legacy on every case (since breath phase content is unchanged from M7.1); phase count is 3 for all 253,440 cases.

- [ ] **Step 4: Commit**

```bash
git add scripts/intakeOutputSweep.ts
git commit -m "feat(m7.2): sweep harness validates v0.2 phase counts + breath-phase timing equivalence"
```

---

## Phase F — Acceptance

### Task 11: Canonical scenarios — M7.2 transition rendering scenarios green

**Files:**
- Create: `src/components/m7/PhaseRenderer.scenarios.test.tsx` (named end-to-end scenarios per spec §7)

- [ ] **Step 1: Write canonical scenarios 1, 2, 4 from spec §7 as integration tests**

```tsx
// src/components/m7/PhaseRenderer.scenarios.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { PhaseRenderer } from './PhaseRenderer'
import { M7_VARIANTS } from '../../data/m7Pathways'

describe('M7.2 canonical scenarios — phase render', () => {
  it('Scenario 1 (active M7.2+) — anxious branch normal completion: intro → breath → closing', () => {
    const v = M7_VARIANTS.find(v => v.pathway_id === 'anxious_calm_downregulate_reduced_effort_standard')!
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<PhaseRenderer variant={v} onPhaseStart={() => {}} onPhaseEnd={() => {}} onSessionComplete={onComplete} />)

    expect(screen.getByLabelText('Session intro')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(5000) })  // intro
    // breath: 32 cycles × 11s = 352s
    act(() => { vi.advanceTimersByTime(352_000) })
    expect(screen.getByLabelText('Session closing')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(5000) })

    expect(onComplete).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('Scenario 7 (active M7.2+) — tightness branch normal completion', () => {
    const v = M7_VARIANTS.find(v => v.pathway_id === 'tightness_decompression_reduced_effort_short')!
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<PhaseRenderer variant={v} onPhaseStart={() => {}} onPhaseEnd={() => {}} onSessionComplete={onComplete} />)
    act(() => { vi.advanceTimersByTime(5000) })
    // breath: 24 cycles × 10s = 240s
    act(() => { vi.advanceTimersByTime(240_000) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onComplete).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run scenarios test**

Run: `npx vitest run src/components/m7/PhaseRenderer.scenarios.test.tsx`
Expected: PASS (2 scenarios).

- [ ] **Step 3: Commit**

```bash
git add src/components/m7/PhaseRenderer.scenarios.test.tsx
git commit -m "test(m7.2): canonical scenarios 1 + 7 — phase render end-to-end"
```

---

### Task 12: Final acceptance pass — full suite, sweep harness, tsc, Playwright

**Files:** none modified (verification only).

- [ ] **Step 1: Full vitest suite**

Run: `npx vitest run`
Expected: all tests pass.

- [ ] **Step 2: Sweep harness both variants**

Run: `npx vite-node scripts/intakeOutputSweep.ts && SWEEP_VARIANT=postfix npx vite-node scripts/intakeOutputSweep.ts`
Expected: both runs complete; postfix sweep validates M7.2 v0.2 phase counts + breath-phase timing equivalence.

- [ ] **Step 3: TypeScript build**

Run: `npx tsc -b 2>&1 | grep -v "BodyPickerSVG.test.tsx\|feasibility.ts:95\|test/setup.ts" | head -20`
Expected: no new errors.

- [ ] **Step 4: Playwright captures**

Run: `npm run capture 2>&1 | tail -20`
Expected: snapshots NOW DIFFER from baseline because intro + closing transitions are visible. Document the diffs in a brief audit note (`docs/superpowers/audits/m7-2-playwright-diffs-2026-MM-DD.md`) showing the expected visible changes (intro countdown screen, closing screen). Update Playwright baselines if the diffs are the intended UX change.

If diffs are unexpected (e.g., wrong typography, broken rendering), STOP AND REPORT.

- [ ] **Step 5: Final summary commit**

```bash
git add -A
git commit --allow-empty -m "$(cat <<'EOF'
m7.2: heterogeneous phase rendering complete — 5-count intro + narrated transitions visible to users

Acceptance:
- All 12 v0.2 variants ship with [intro, breath, closing] phase sequence
- PhaseRenderer drives multi-phase sessions through state machine
- IntroTransition (5-count countdown), BetweenTransition (5s narration),
  ClosingTransition (5s completion) render with lightweight typography
- Template registry populated with standard_5_count / standard_between /
  standard_completion at version 1.0.0
- GuidedSessionScreen routes M7-routed sessions through PhaseRenderer
- HistoryEntry phase_log carries 3 entries per session (intro+breath+closing)
- Sweep harness validates v0.2 phase counts (3 each) + breath-phase timing
  equivalence with M7.1 baseline
- Mass balance (I9) verified ±5% on every variant
- Full test suite green; tsc clean; Playwright baselines refreshed for
  intro + closing rendering

Behavioral change for users: sessions effectively gain ~10s (5s intro + 5s
closing) per the spec's intentional UX upgrade. Breath content within the
breath phase unchanged from M7.1.

Substrate ready for M7.3 (mid-session controls + position_hold phase type +
M6.9 substrate). Pathway library v0.2 stays at engineering_passed status;
M7.4 advisor review gate flips it to pt_advisor_passed.

Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §8

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-review checklist

After completing all 12 tasks, run the following self-review:

1. **Spec coverage:** every M7.2 ship in spec §8 has a corresponding task.
   - [ ] Render loop handles breath + transition phase types → Task 6 (PhaseRenderer)
   - [ ] Transition phase rendering with subtype-specific behavior → Tasks 3, 4, 5 (Intro, Between, Closing)
   - [ ] Template registry initial population → Task 1
   - [ ] Lightweight typography styling → Tasks 3, 4, 5 (CSS modules)
   - [ ] Pathway library v0.2 — variants gain intro + closing → Task 7
   - [ ] Updated canonical scenarios test pass → Task 11
   - [ ] authored_duration_seconds adjusted (+10) → Task 7

2. **Acceptance criteria:**
   - [ ] All M7.1 variants extended to include intro + closing → Task 7
   - [ ] Transition phase rendering passes recovery dynamics tests → Tasks 3-6
   - [ ] Template registry has version-pinned references in every variant artifact → Task 7 (uses '1.0.0' on every transition)
   - [ ] 5-count intro and 5s transitions visible to users for all sessions → Task 8 (GuidedSessionScreen wire-in)

3. **No placeholders:** every task has full code, exact commands, expected output. Spot-checked.

4. **Type consistency:** function names referenced consistently (PhaseRenderer, IntroTransition, BetweenTransition, ClosingTransition, BreathPhaseRenderer, getTemplate, M7_TEMPLATES, M7_PATHWAYS, M7_VARIANTS, variantToTimingProfile).

---

## Out of scope (deferred to M7.3+)

- position_hold phase rendering — M7.3 introduces both the renderer and the variant additions.
- Mid-session controls (pause / skip / resume) — M7.3.
- M6.9 artifact generation — M7.3.
- Multi-variant per-pathway differentiation — M7.4.
- PT advisor review of variants — M7.4 gate.
- Custom intro/closing copy per pathway (currently uses standard templates with no subtitle on M7.1-migrated variants) — M7.4 authoring may add subtitles.
- Animation polish via framer-motion (transitions are currently css-only) — can land any time M7.2+; not required for behavioral correctness.
- BreathingOrb integration into BreathPhaseRenderer — currently the breath phase renders cue text only; richer visualization is a polish pass that can land at M7.2.5 or M7.3.
