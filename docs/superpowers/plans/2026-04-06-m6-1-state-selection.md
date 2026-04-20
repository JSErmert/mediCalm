# M6.1 + M6.1.1 State Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three M6.1/M6.1.1 screen stubs with fully styled, tested implementations — StateSelectionScreen, SADSafetyScreen, and SupportResourcesScreen.

**Architecture:** Three CSS module + TSX pairs, one test file per screen. Each screen is self-contained; routing is driven entirely by `AppContext` dispatches. No new context changes needed — M6.2 already supplies `pendingStateEntry`, `SET_STATE_ENTRY`, `CLEAR_STATE_ENTRY`, and all AppScreen identifiers.

**Tech Stack:** React 18 + TypeScript, CSS Modules, Vitest + Testing Library, existing `AppProvider`/`AppContext` from M6.2.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/screens/StateSelectionScreen.module.css` | Layout C v1.2 chip grid, breathe/ping animations, sub-block expand |
| Replace | `src/screens/StateSelectionScreen.tsx` | Multi-select logic, Heavy expand/collapse, routing on Continue |
| Create | `src/screens/StateSelectionScreen.test.tsx` | Render, select, Heavy toggle, routing, a11y |
| Create | `src/screens/SADSafetyScreen.module.css` | Safety gate copy styling |
| Replace | `src/screens/SADSafetyScreen.tsx` | Safety check copy, No/Yes/Back routing |
| Create | `src/screens/SADSafetyScreen.test.tsx` | Render, No/Yes/Back routing |
| Create | `src/screens/SupportResourcesScreen.module.css` | Escalation exit + 988 resource styling |
| Replace | `src/screens/SupportResourcesScreen.tsx` | Pause copy, 988 content, Return Home routing |
| Create | `src/screens/SupportResourcesScreen.test.tsx` | Render, 988 content, Return Home routing |

---

## Task 1: StateSelectionScreen — tests (write failing)

**Files:**
- Create: `src/screens/StateSelectionScreen.test.tsx`

- [ ] **Step 1: Write the failing test file**

```tsx
// src/screens/StateSelectionScreen.test.tsx
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

describe('StateSelectionScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /what are you feeling right now/i })
    ).toBeInTheDocument()
  })

  it('renders the wordmark', () => {
    renderWithProvider()
    expect(screen.getByText('mediCalm')).toBeInTheDocument()
  })

  it('renders all 5 primary chips', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /^pain$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^anxious$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^exhausted$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^tight$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^heavy$/i })).toBeInTheDocument()
  })

  it('does not expose subcategory chips to assistive tech when collapsed', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^angry$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^overwhelmed$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^sad$/i })).not.toBeInTheDocument()
  })

  it('Continue button is absent before any selection', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('Continue button appears after selecting a primary chip', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /^pain$/i }))
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
  })

  it('Continue button disappears if selection is cleared by deselecting', async () => {
    renderWithProvider()
    const pain = screen.getByRole('button', { name: /^pain$/i })
    await userEvent.click(pain)
    await userEvent.click(pain)
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('tapping Heavy reveals subcategory chips via aria-hidden removal', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /^heavy$/i }))
    expect(screen.getByRole('button', { name: /^angry$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^overwhelmed$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sad$/i })).toBeInTheDocument()
  })

  it('tapping Heavy twice collapses subcategories again', async () => {
    renderWithProvider()
    const heavy = screen.getByRole('button', { name: /^heavy$/i })
    await userEvent.click(heavy)
    await userEvent.click(heavy)
    expect(screen.queryByRole('button', { name: /^angry$/i })).not.toBeInTheDocument()
  })

  it('collapsing Heavy clears selected subcategories', async () => {
    renderWithProvider()
    const heavy = screen.getByRole('button', { name: /^heavy$/i })
    await userEvent.click(heavy)
    await userEvent.click(screen.getByRole('button', { name: /^angry$/i }))
    // Angry selected → Continue visible
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
    // Collapse Heavy
    await userEvent.click(heavy)
    // Continue gone because no selection remains
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('Continue without Sad navigates to session_intake', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /^pain$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => expect(capturedScreen).toBe('session_intake'))
  })

  it('Continue with Sad navigates to sad_safety', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <StateSelectionScreen />
      </AppProvider>
    )
    const heavy = screen.getByRole('button', { name: /^heavy$/i })
    await userEvent.click(heavy)
    await userEvent.click(screen.getByRole('button', { name: /^sad$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => expect(capturedScreen).toBe('sad_safety'))
  })

  it('Continue dispatches SET_STATE_ENTRY with selected states', async () => {
    let capturedEntry: string[] | null = null
    function StateCapture() {
      const { state } = useAppContext()
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <StateCapture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /^pain$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^exhausted$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedEntry).not.toBeNull()
      expect(capturedEntry).toContain('pain')
      expect(capturedEntry).toContain('exhausted')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
npx vitest run src/screens/StateSelectionScreen.test.tsx
```

Expected: Most tests FAIL — the stub has no chip grid, no selection logic, no routing.

---

## Task 2: StateSelectionScreen — CSS module + TSX (make tests pass)

**Files:**
- Create: `src/screens/StateSelectionScreen.module.css`
- Modify: `src/screens/StateSelectionScreen.tsx`

- [ ] **Step 1: Create the CSS module**

```css
/* src/screens/StateSelectionScreen.module.css
   D4-B4 Deep Current — Layout C v1.2 (approved)
   Authority: M6.1 State Selection Screen + visual companion final design
*/

/* ── Screen ── */
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: var(--screen-max-width);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--screen-padding) var(--space-8);
  color: var(--color-text-primary);
}

/* ── Wordmark ── */
.wordmark {
  font-size: 0.60rem;
  font-weight: var(--weight-medium);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.18);
  text-align: center;
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
}

/* ── Heading ── */
.heading {
  font-size: 1.2rem;
  font-weight: var(--weight-light);
  color: var(--color-text-primary);
  letter-spacing: -0.018em;
  line-height: var(--leading-tight);
  margin-bottom: 5px;
}

/* ── Subtitle ── */
.sub {
  font-size: 0.68rem;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-6);
}

/* ── Grid ── */
.grid {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: var(--space-5);
}

.row {
  display: flex;
  gap: 9px;
}

/* ── Base chip ── */
.chip {
  flex: 1;
  padding: 11px 0;
  border-radius: var(--radius-full);
  font-size: 0.84rem;
  font-weight: var(--weight-regular);
  font-family: var(--font-sans);
  letter-spacing: 0.01em;
  text-align: center;
  position: relative;
  cursor: pointer;
  min-height: var(--touch-min);
  transition:
    color var(--transition-quick),
    background var(--transition-quick),
    border-color var(--transition-quick);
}

/* Heavy is centered at ~50% width */
.heavy {
  flex: 0 0 calc(50% - 4.5px);
  margin: 0 auto;
}

/* ── Off ── */
.off {
  background: rgba(10, 26, 36, 0.85);
  border: 1px solid rgba(26, 138, 138, 0.15);
  color: rgba(255, 255, 255, 0.46);
}

/* ── On — breathe animation + ping ring ── */
.on {
  background: rgba(26, 138, 138, 0.12);
  border: 1px solid rgba(26, 138, 138, 0.50);
  color: rgba(255, 255, 255, 0.92);
  animation: breathe 4s ease-in-out infinite;
}

.on::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(26, 138, 138, 0.55);
  animation: ping 0.70s cubic-bezier(0.2, 0, 0.8, 1) forwards;
  pointer-events: none;
}

@keyframes breathe {
  0%, 100% {
    box-shadow:
      0 0 0 2px rgba(26, 138, 138, 0.06),
      0 0 10px rgba(26, 138, 138, 0.16),
      0 0 22px rgba(26, 138, 138, 0.07);
  }
  50% {
    box-shadow:
      0 0 0 4px rgba(26, 138, 138, 0.09),
      0 0 20px rgba(26, 138, 138, 0.30),
      0 0 42px rgba(26, 138, 138, 0.14);
  }
}

@keyframes ping {
  0%   { transform: scale(1.0);  opacity: 0.65; }
  100% { transform: scale(1.75); opacity: 0; }
}

/* ── Sub-block: expand/collapse container ── */
.subBlock {
  display: flex;
  flex-direction: column;
  gap: 7px;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition:
    max-height 0.38s cubic-bezier(0.0, 0.0, 0.4, 1.0),
    opacity 0.30s ease;
}

.subBlockOpen {
  max-height: 52px;
  opacity: 1;
  overflow: visible;
}

.subRow {
  display: flex;
  gap: 7px;
  align-items: center;
  overflow: visible;
}

/* ── Sub-chip: Angry + Sad (fixed 68px each) ── */
.subChip {
  flex: 0 0 68px;
  padding: 9px 0;
  border-radius: var(--radius-full);
  font-size: 0.74rem;
  font-weight: var(--weight-regular);
  font-family: var(--font-sans);
  letter-spacing: 0.01em;
  text-align: center;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  min-height: var(--touch-min);
  transition:
    color var(--transition-quick),
    background var(--transition-quick),
    border-color var(--transition-quick);
}

.subChip.off {
  background: rgba(8, 20, 30, 0.80);
  border: 1px dashed rgba(26, 138, 138, 0.20);
  color: rgba(255, 255, 255, 0.40);
}

.subChip.on {
  background: rgba(26, 138, 138, 0.12);
  border: 1px solid rgba(26, 138, 138, 0.50);
  color: rgba(255, 255, 255, 0.92);
  animation: breathe 4s ease-in-out infinite;
}

.subChip.on::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(26, 138, 138, 0.55);
  animation: ping 0.70s cubic-bezier(0.2, 0, 0.8, 1) forwards;
  pointer-events: none;
}

/* ── Sub-chip-wide: Overwhelmed (flex-grow center) ── */
.subChipWide {
  flex: 1;
  padding: 9px 10px;
  border-radius: var(--radius-full);
  font-size: 0.74rem;
  font-weight: var(--weight-regular);
  font-family: var(--font-sans);
  letter-spacing: 0.01em;
  text-align: center;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  min-height: var(--touch-min);
  transition:
    color var(--transition-quick),
    background var(--transition-quick),
    border-color var(--transition-quick);
}

.subChipWide.off {
  background: rgba(8, 20, 30, 0.80);
  border: 1px dashed rgba(26, 138, 138, 0.20);
  color: rgba(255, 255, 255, 0.40);
}

.subChipWide.on {
  background: rgba(26, 138, 138, 0.12);
  border: 1px solid rgba(26, 138, 138, 0.50);
  color: rgba(255, 255, 255, 0.92);
  animation: breathe 4s ease-in-out infinite;
}

.subChipWide.on::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(26, 138, 138, 0.55);
  animation: ping 0.70s cubic-bezier(0.2, 0, 0.8, 1) forwards;
  pointer-events: none;
}

/* ── Continue button ── */
.continueBtn {
  width: 100%;
  height: 46px;
  background: rgba(26, 138, 138, 0.10);
  border: 1px solid rgba(26, 138, 138, 0.32);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  font-family: var(--font-sans);
  cursor: pointer;
  margin-top: 4px;
  transition: opacity var(--transition-quick);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .on,
  .subChip.on,
  .subChipWide.on {
    animation: none;
    box-shadow: 0 0 10px rgba(26, 138, 138, 0.16);
  }
  .on::after,
  .subChip.on::after,
  .subChipWide.on::after {
    display: none;
  }
  .subBlock {
    transition: none;
  }
}
```

- [ ] **Step 2: Replace the TSX stub**

Replace the entire contents of `src/screens/StateSelectionScreen.tsx` with:

```tsx
/**
 * StateSelectionScreen — M6.1 State Selection
 *
 * Layout C v1.2: 2-col equal grid + Heavy expand row.
 * Heavy is the umbrella chip for Angry / Overwhelmed / Sad.
 * Multi-select. Continue appears on ≥1 selection.
 * If Sad selected → sad_safety. Otherwise → session_intake.
 * Authority: M6.1 State Selection Screen spec
 */
import { useState } from 'react'
import type { EntryState } from '../types'
import { useAppContext } from '../context/AppContext'
import styles from './StateSelectionScreen.module.css'

const SUB_STATES: EntryState[] = ['angry', 'overwhelmed', 'sad']

export function StateSelectionScreen() {
  const { dispatch } = useAppContext()
  const [selected, setSelected] = useState<Set<EntryState>>(new Set())
  const [heavyExpanded, setHeavyExpanded] = useState(false)

  function toggle(state: EntryState) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(state) ? next.delete(state) : next.add(state)
      return next
    })
  }

  function toggleHeavy() {
    if (heavyExpanded) {
      // Collapse — clear any selected sub-states
      setSelected(prev => {
        const next = new Set(prev)
        SUB_STATES.forEach(s => next.delete(s))
        return next
      })
    }
    setHeavyExpanded(e => !e)
  }

  function handleContinue() {
    const entry = Array.from(selected)
    dispatch({ type: 'SET_STATE_ENTRY', entry })
    dispatch({
      type: 'NAVIGATE',
      screen: selected.has('sad') ? 'sad_safety' : 'session_intake',
    })
  }

  const hasSelection = selected.size > 0

  function chipCls(state: EntryState) {
    return `${styles.chip} ${selected.has(state) ? styles.on : styles.off}`
  }

  return (
    <main className={styles.screen} aria-label="State selection">
      <p className={styles.wordmark}>mediCalm</p>
      <h1 className={styles.heading}>What are you feeling right now?</h1>
      <p className={styles.sub}>We'll help your system settle.</p>

      <div className={styles.grid}>
        {/* Row 1 */}
        <div className={styles.row}>
          <button type="button" className={chipCls('pain')} onClick={() => toggle('pain')}>
            Pain
          </button>
          <button type="button" className={chipCls('anxious')} onClick={() => toggle('anxious')}>
            Anxious
          </button>
        </div>

        {/* Row 2 */}
        <div className={styles.row}>
          <button type="button" className={chipCls('exhausted')} onClick={() => toggle('exhausted')}>
            Exhausted
          </button>
          <button type="button" className={chipCls('tight')} onClick={() => toggle('tight')}>
            Tight
          </button>
        </div>

        {/* Row 3: Heavy (centered, ~50% width) */}
        <div className={styles.row}>
          <button
            type="button"
            className={`${styles.chip} ${styles.heavy} ${heavyExpanded ? styles.on : styles.off}`}
            onClick={toggleHeavy}
            aria-expanded={heavyExpanded}
            aria-label="Heavy"
          >
            Heavy
          </button>
        </div>

        {/* Subcategory expand block — aria-hidden when collapsed */}
        <div
          className={`${styles.subBlock}${heavyExpanded ? ` ${styles.subBlockOpen}` : ''}`}
          aria-hidden={!heavyExpanded}
        >
          <div className={styles.subRow}>
            <button
              type="button"
              className={`${styles.subChip} ${selected.has('angry') ? styles.on : styles.off}`}
              onClick={() => toggle('angry')}
              tabIndex={heavyExpanded ? 0 : -1}
            >
              Angry
            </button>
            <button
              type="button"
              className={`${styles.subChipWide} ${selected.has('overwhelmed') ? styles.on : styles.off}`}
              onClick={() => toggle('overwhelmed')}
              tabIndex={heavyExpanded ? 0 : -1}
            >
              Overwhelmed
            </button>
            <button
              type="button"
              className={`${styles.subChip} ${selected.has('sad') ? styles.on : styles.off}`}
              onClick={() => toggle('sad')}
              tabIndex={heavyExpanded ? 0 : -1}
            >
              Sad
            </button>
          </div>
        </div>
      </div>

      {hasSelection && (
        <button type="button" className={styles.continueBtn} onClick={handleContinue}>
          Continue
        </button>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Run tests to verify they pass**

```
npx vitest run src/screens/StateSelectionScreen.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/screens/StateSelectionScreen.module.css src/screens/StateSelectionScreen.tsx src/screens/StateSelectionScreen.test.tsx
git commit -m "feat: implement M6.1 StateSelectionScreen — Layout C v1.2 with Heavy expand"
```

---

## Task 3: SADSafetyScreen — tests (write failing)

**Files:**
- Create: `src/screens/SADSafetyScreen.test.tsx`

- [ ] **Step 1: Write the failing test file**

```tsx
// src/screens/SADSafetyScreen.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { SADSafetyScreen } from './SADSafetyScreen'
import { useAppContext } from '../context/AppContext'

function renderWithProvider() {
  return render(
    <AppProvider>
      <SADSafetyScreen />
    </AppProvider>
  )
}

describe('SADSafetyScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /before we continue/i })
    ).toBeInTheDocument()
  })

  it('renders the safety body copy', () => {
    renderWithProvider()
    expect(screen.getByText(/persistently low/i)).toBeInTheDocument()
  })

  it('renders No and Yes action buttons', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /no, continue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^yes$/i })).toBeInTheDocument()
  })

  it('renders a Back button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('"No, continue" navigates to session_intake', async () => {
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
    await waitFor(() => expect(capturedScreen).toBe('session_intake'))
  })

  it('"Yes" dispatches CLEAR_STATE_ENTRY and navigates to support_resources', async () => {
    let capturedScreen = ''
    let capturedEntry: unknown = 'INITIAL'
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <SADSafetyScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /^yes$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('support_resources')
      expect(capturedEntry).toBeNull()
    })
  })

  it('Back button navigates to state_selection', async () => {
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
    await waitFor(() => expect(capturedScreen).toBe('state_selection'))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
npx vitest run src/screens/SADSafetyScreen.test.tsx
```

Expected: Tests for heading, body copy, and No/Yes/Back routing FAIL (stub has no real copy or styling).

---

## Task 4: SADSafetyScreen — CSS module + TSX (make tests pass)

**Files:**
- Create: `src/screens/SADSafetyScreen.module.css`
- Modify: `src/screens/SADSafetyScreen.tsx`

- [ ] **Step 1: Create the CSS module**

```css
/* src/screens/SADSafetyScreen.module.css
   D4-B4 Deep Current — Safety gate copy screen
   Authority: M6.1.1 SAD Safety Screen (v2.1)
*/

.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: var(--screen-max-width);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--screen-padding) var(--space-8);
  color: var(--color-text-primary);
}

.back {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  letter-spacing: 0.04em;
  cursor: pointer;
  padding: var(--space-8) 0 0;
  margin-bottom: var(--space-8);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: var(--space-10);
}

.heading {
  font-size: 1.2rem;
  font-weight: var(--weight-light);
  color: var(--color-text-primary);
  letter-spacing: -0.018em;
  line-height: var(--leading-tight);
  margin-bottom: var(--space-4);
}

.body {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.noCta {
  width: 100%;
  height: 50px;
  background: rgba(26, 138, 138, 0.10);
  border: 1px solid rgba(26, 138, 138, 0.32);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.80);
  font-size: 0.875rem;
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  font-family: var(--font-sans);
  cursor: pointer;
}

.yesCta {
  width: 100%;
  height: 50px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.44);
  font-size: 0.82rem;
  font-weight: var(--weight-regular);
  letter-spacing: 0.04em;
  font-family: var(--font-sans);
  cursor: pointer;
}
```

- [ ] **Step 2: Replace the TSX stub**

Replace the entire contents of `src/screens/SADSafetyScreen.tsx` with:

```tsx
/**
 * SADSafetyScreen — M6.1.1 SAD Safety Gate
 *
 * Appears when Sad is in state_entry. Brief boundary check only.
 * No → session_intake (preserve state).
 * Yes → CLEAR_STATE_ENTRY → support_resources.
 * Back → state_selection (preserve selections).
 * Authority: M6.1.1 SAD Safety Screen spec (v2.1)
 */
import { useAppContext } from '../context/AppContext'
import styles from './SADSafetyScreen.module.css'

export function SADSafetyScreen() {
  const { dispatch } = useAppContext()

  function handleNo() {
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
  }

  function handleYes() {
    dispatch({ type: 'CLEAR_STATE_ENTRY' })
    dispatch({ type: 'NAVIGATE', screen: 'support_resources' })
  }

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }

  return (
    <main className={styles.screen} aria-label="SAD safety check">
      <button type="button" className={styles.back} onClick={handleBack} aria-label="Back to state selection">
        ← Back
      </button>

      <div className={styles.content}>
        <h1 className={styles.heading}>Before we continue, a quick check</h1>
        <p className={styles.body}>
          Are you feeling persistently low — in a way that goes beyond today?
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.noCta} onClick={handleNo}>
            No, continue
          </button>
          <button type="button" className={styles.yesCta} onClick={handleYes}>
            Yes
          </button>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Run tests to verify they pass**

```
npx vitest run src/screens/SADSafetyScreen.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/screens/SADSafetyScreen.module.css src/screens/SADSafetyScreen.tsx src/screens/SADSafetyScreen.test.tsx
git commit -m "feat: implement M6.1.1 SADSafetyScreen — safety gate with No/Yes/Back routing"
```

---

## Task 5: SupportResourcesScreen — tests (write failing)

**Files:**
- Create: `src/screens/SupportResourcesScreen.test.tsx`

- [ ] **Step 1: Write the failing test file**

```tsx
// src/screens/SupportResourcesScreen.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { SupportResourcesScreen } from './SupportResourcesScreen'
import { useAppContext } from '../context/AppContext'

function renderWithProvider() {
  return render(
    <AppProvider>
      <SupportResourcesScreen />
    </AppProvider>
  )
}

describe('SupportResourcesScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the escalation exit heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /pause here for a moment/i })
    ).toBeInTheDocument()
  })

  it('renders the short-term regulation body copy', () => {
    renderWithProvider()
    expect(screen.getByText(/short-term regulation/i)).toBeInTheDocument()
  })

  it('renders the 988 crisis line reference', () => {
    renderWithProvider()
    expect(screen.getByText(/988/)).toBeInTheDocument()
  })

  it('renders the Support Resources heading', () => {
    renderWithProvider()
    expect(screen.getByText(/support resources/i)).toBeInTheDocument()
  })

  it('renders a Return Home button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /return home/i })).toBeInTheDocument()
  })

  it('Return Home dispatches CLEAR_STATE_ENTRY and navigates to home', async () => {
    let capturedScreen = ''
    let capturedEntry: unknown = 'INITIAL'
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <SupportResourcesScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /return home/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('home')
      expect(capturedEntry).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
npx vitest run src/screens/SupportResourcesScreen.test.tsx
```

Expected: Tests for heading, body copy, 988 content FAIL (stub has none of this).

---

## Task 6: SupportResourcesScreen — CSS module + TSX (make tests pass)

**Files:**
- Create: `src/screens/SupportResourcesScreen.module.css`
- Modify: `src/screens/SupportResourcesScreen.tsx`

- [ ] **Step 1: Create the CSS module**

```css
/* src/screens/SupportResourcesScreen.module.css
   D4-B4 Deep Current — Escalation exit + support resources
   Authority: M6.1.1 SAD Safety Screen spec (v2.1) § Escalation Exit + Support Resources
*/

.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: var(--screen-max-width);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--screen-padding) var(--space-8);
  color: var(--color-text-primary);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-10) 0;
}

.heading {
  font-size: 1.2rem;
  font-weight: var(--weight-light);
  color: var(--color-text-primary);
  letter-spacing: -0.018em;
  line-height: var(--leading-tight);
  margin-bottom: var(--space-4);
}

.body {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

.divider {
  height: 1px;
  background: var(--color-border-subtle);
  margin-bottom: var(--space-6);
}

.resourcesLabel {
  font-size: 0.60rem;
  font-weight: var(--weight-semibold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(26, 138, 138, 0.50);
  margin-bottom: var(--space-3);
}

.resourceItem {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

.resourceItem strong {
  color: var(--color-text-primary);
  font-weight: var(--weight-medium);
}

.returnBtn {
  width: 100%;
  height: 50px;
  background: rgba(26, 138, 138, 0.10);
  border: 1px solid rgba(26, 138, 138, 0.32);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.875rem;
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  font-family: var(--font-sans);
  cursor: pointer;
  margin-top: auto;
}
```

- [ ] **Step 2: Replace the TSX stub**

Replace the entire contents of `src/screens/SupportResourcesScreen.tsx` with:

```tsx
/**
 * SupportResourcesScreen — M6.1.1 Escalation Exit + Support Resources
 *
 * Reached via SADSafetyScreen "Yes". Shows pause copy + 988 crisis line.
 * Return Home dispatches CLEAR_STATE_ENTRY then navigates to home.
 * Authority: M6.1.1 SAD Safety Screen spec (v2.1) § Escalation Exit + Support Resources
 */
import { useAppContext } from '../context/AppContext'
import styles from './SupportResourcesScreen.module.css'

export function SupportResourcesScreen() {
  const { dispatch } = useAppContext()

  function handleReturnHome() {
    dispatch({ type: 'CLEAR_STATE_ENTRY' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen} aria-label="Support resources">
      <div className={styles.content}>
        <h1 className={styles.heading}>Pause here for a moment</h1>
        <p className={styles.body}>
          This tool is designed for short-term regulation. What you're describing may
          benefit from more direct support.
        </p>
        <p className={styles.body}>
          If you can, consider reaching out to someone you trust or a professional resource.
        </p>

        <div className={styles.divider} />

        <p className={styles.resourcesLabel}>Support Resources</p>
        <p className={styles.resourceItem}>
          If you're in the U.S. and need immediate support, you can call or text{' '}
          <strong>988</strong> to reach the Suicide &amp; Crisis Lifeline.
        </p>
        <p className={styles.resourceItem}>
          If you're elsewhere, consider contacting a local crisis or mental health support service.
        </p>
      </div>

      <button type="button" className={styles.returnBtn} onClick={handleReturnHome}>
        Return Home
      </button>
    </main>
  )
}
```

- [ ] **Step 3: Run tests to verify they pass**

```
npx vitest run src/screens/SupportResourcesScreen.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 4: Run all screen tests together**

```
npx vitest run src/screens/StateSelectionScreen.test.tsx src/screens/SADSafetyScreen.test.tsx src/screens/SupportResourcesScreen.test.tsx
```

Expected: All PASS.

- [ ] **Step 5: Run full test suite**

```
npm run test:run
```

Expected: All existing tests still pass. No regressions.

- [ ] **Step 6: Commit**

```bash
git add src/screens/SupportResourcesScreen.module.css src/screens/SupportResourcesScreen.tsx src/screens/SupportResourcesScreen.test.tsx
git commit -m "feat: implement M6.1.1 SupportResourcesScreen — escalation exit with 988 resource"
```

---

## Spec Coverage Check

| Spec requirement | Task that covers it |
|---|---|
| M6.1 — 7 states selectable (Pain/Anxious/Angry/Sad/Exhausted/Tight/Overwhelmed) | Task 1-2 |
| M6.1 — Multi-select, no limit | Task 1-2 |
| M6.1 — Continue hidden until ≥1 selection | Task 1-2 |
| M6.1 — Sad → sad_safety routing | Task 1-2 |
| M6.1 — No Sad → session_intake routing | Task 1-2 |
| M6.1 — SET_STATE_ENTRY dispatched on Continue | Task 1-2 |
| M6.1 — Layout C v1.2 (2-col grid, Heavy expand) | Task 2 (CSS + TSX) |
| M6.1 — L animation (breathe + ping) same for primary + sub chips | Task 2 (CSS) |
| M6.1.1 — SAD gate shows before intake | Task 3-4 |
| M6.1.1 — No → session_intake preserving state | Task 3-4 |
| M6.1.1 — Yes → CLEAR_STATE_ENTRY → support_resources | Task 3-4 |
| M6.1.1 — Back → state_selection | Task 3-4 |
| M6.1.1 — Escalation exit copy (pause + short-term regulation) | Task 5-6 |
| M6.1.1 — 988 Suicide & Crisis Lifeline reference | Task 5-6 |
| M6.1.1 — Return Home → CLEAR_STATE_ENTRY → home | Task 5-6 |
| Reduced motion — no animations | Task 2 CSS (media query) |
| Touch targets ≥44px | Task 2 + 4 + 6 CSS (min-height: var(--touch-min)) |
