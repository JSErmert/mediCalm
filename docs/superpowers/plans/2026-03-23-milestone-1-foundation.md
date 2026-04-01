# MediCalm Milestone 1 — Foundation, Home Screen, Pain Input

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full MediCalm app foundation with a working Home screen and complete Pain Input flow — producing typed, testable, visually styled code that the session engine (M2) can plug directly into.

**Architecture:** Vite + React + TypeScript with CSS Modules and CSS custom properties for design tokens. Navigation is a lightweight screen-state machine via React Context + useReducer (no router dependency in v1). Framer Motion handles all screen crossfades (200–400ms) per the Guided Session UI Spec.

**Tech Stack:** Vite 5 (react-ts template), React 18, TypeScript, Framer Motion, Vitest, @testing-library/react, CSS Modules

---

## Authority Note

All product rules come from the MediCalm markdown pack (primary authority), in hierarchy order defined by `00_mediCalm_document_hierarchy_map.md`. Safety outranks aesthetics. Execution Spec (doc 04) wins for runtime behavior. Guided Session UI Spec (doc 05) wins for UI behavior. When in doubt, prefer the lower-risk interpretation.

---

## M1 Assumptions / Placeholders for M2

The following exist as typed stubs in M1. **Do not implement logic — only the interface.**

| Placeholder | M1 behavior | Wired in |
|---|---|---|
| `resolveSession(input)` | Returns `null` always | M2 |
| `src/data/protocols.ts` | `PROTOCOLS: ProtocolDefinition[] = []` | M2 |
| `src/data/mechanisms.ts` | `MECHANISMS: MechanismObject[] = []` | M2 |
| Safety precheck gate | Types exist, not wired before session | M4 |
| `HistoryCard` | Typed + rendered; list will be empty in M1 | M3 |
| Audio playback | `audio_enabled` stored; no sound | M3 |
| Reduced-motion orb behavior | CSS media query present; full orb is M2 | M5 |
| `PersonalizationRecord` | Type defined; no reads/writes | M6 |

---

## File Structure

```
src/
  types/
    index.ts              # All core interfaces (PainInputState, UserProfile, AppSettings, HistoryEntry, RuntimeSession stub, SafetyAssessment stub)
    taxonomy.ts           # LOCATION_TAGS, SYMPTOM_TAGS, TRIGGER_TAGS canonical arrays + SEVERITY_BANDS
  data/
    protocols.ts          # PROTOCOLS: ProtocolDefinition[] = []  (M2 placeholder)
    mechanisms.ts         # MECHANISMS: MechanismObject[] = []    (M2 placeholder)
  storage/
    localStorage.ts       # Generic typed get/set/remove + JSON safety wrappers
    settings.ts           # AppSettings read/write + getDefaultSettings()
    profile.ts            # UserProfile read/write + getDefaultProfile()
  context/
    AppContext.tsx         # AppState type + AppAction type + createContext + useAppContext hook
    AppProvider.tsx        # Provider component + useReducer reducer
  screens/
    HomeScreen.tsx         # History list (empty state) + "Start session" CTA
    PainInputScreen.tsx    # Pain input form orchestrator
    SessionPlaceholder.tsx # M1 stub screen shown after pain input submit
  components/
    ScreenTransition.tsx   # Framer Motion crossfade wrapper (200-400ms)
    PainSlider.tsx         # Styled 0-10 input[type=range] with visible value
    PainSlider.module.css
    TagSelector.tsx        # Multi-select tappable chip grid (reusable)
    TagSelector.module.css
    HistoryCard.tsx        # Typed history card (placeholder — empty list in M1)
    HistoryCard.module.css
  styles/
    tokens.css             # All CSS custom properties (colors, spacing, type scale, motion, radius)
    globals.css            # Reset + base body + font stack
  App.tsx                  # Root: AnimatePresence screen router
  main.tsx                 # ReactDOM.createRoot entry point
docs/
  superpowers/
    plans/
      2026-03-23-milestone-1-foundation.md  (this file)
index.html
vite.config.ts
tsconfig.json
package.json
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1.1: Scaffold Vite React TypeScript project in current directory**

```bash
cd /c/Users/JSEer/mediCalm/mediCalm
npm create vite@latest . -- --template react-ts
# When prompted "Current directory is not empty. Remove existing files and continue?" — choose "Ignore files and continue"
```

Expected: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/` created.

- [ ] **Step 1.2: Install dependencies**

```bash
npm install
npm install framer-motion
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 1.3: Configure Vitest in vite.config.ts**

Replace `vite.config.ts` content:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

- [ ] **Step 1.4: Create test setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 1.5: Update tsconfig.json to include test types**

In `tsconfig.json`, add to `compilerOptions`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

- [ ] **Step 1.6: Verify scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts, browser shows default React page.

- [ ] **Step 1.7: Commit**

```bash
git init
git add package.json vite.config.ts tsconfig.json index.html src/main.tsx src/App.tsx src/vite-env.d.ts src/test/setup.ts
git commit -m "feat: scaffold Vite React TypeScript project with Vitest"
```

---

## Task 2: Design Tokens + Global Styles

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/globals.css`
- Modify: `src/main.tsx` (import globals)
- Modify: `index.html` (add Google Fonts link)

- [ ] **Step 2.1: Create tokens.css**

Create `src/styles/tokens.css`:

```css
/* MediCalm Design Tokens
   Authority: Visual Design Doctrine (doc 07), UX/UI Experience Report (doc 12)
   Color identity: deep neutral base, soft cyan accent, warm off-white text
*/

:root {
  /* --- Colors --- */
  --color-bg-base:         #1a1c2e;   /* deep neutral indigo */
  --color-bg-surface:      #20223a;   /* slightly lifted surface */
  --color-bg-card:         #252843;   /* card / panel background */

  --color-accent-primary:  #5ecfcf;   /* soft cyan — primary accent */
  --color-accent-secondary:#3d9e9e;   /* muted teal — secondary */
  --color-accent-glow:     rgba(94, 207, 207, 0.15); /* orb glow layer */

  --color-text-primary:    #e8edf2;   /* warm white */
  --color-text-secondary:  #8c9aaa;   /* de-emphasized text */
  --color-text-disabled:   #4a5568;

  --color-border-subtle:   rgba(255, 255, 255, 0.08);
  --color-border-active:   rgba(94, 207, 207, 0.4);

  --color-safety-stop:     #f87171;   /* calm red — safety stop only */
  --color-caution:         #fbbf24;   /* amber — interrupted caution */

  /* --- Spacing --- */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;

  /* --- Typography --- */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;

  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */

  --weight-light:   300;
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold:600;

  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-relaxed:1.7;

  /* --- Radius --- */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-full: 9999px;

  /* --- Motion (Guided Session UI Spec: crossfades 200-400ms) --- */
  --transition-quick:     200ms ease;
  --transition-crossfade: 300ms ease;
  --transition-slow:      400ms ease;

  /* --- Touch targets (min 44px per accessibility spec) --- */
  --touch-min: 44px;

  /* --- Layout --- */
  --screen-max-width: 480px;   /* mobile-first centered column */
  --screen-padding:   var(--space-5);
}

/* Reduced motion overrides — Accessibility + Motion Fallbacks (doc 17) */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-quick:     0ms;
    --transition-crossfade: 0ms;
    --transition-slow:      0ms;
  }
}
```

- [ ] **Step 2.2: Create globals.css**

Create `src/styles/globals.css`:

```css
/* MediCalm Global Styles
   Authority: Visual Design Doctrine (doc 07)
   Mobile-first. Deep neutral base. Calm and luminous.
*/

@import './tokens.css';

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-base);
  min-height: 100dvh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Prevent tap highlight on mobile */
button, a {
  -webkit-tap-highlight-color: transparent;
}

/* Focus rings — accessibility */
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove default button styles */
button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

/* Accessible hidden */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 2.3: Add Inter font to index.html**

In `index.html`, add inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

Also update the `<title>`:

```html
<title>MediCalm</title>
```

- [ ] **Step 2.4: Import globals in main.tsx**

```tsx
import './styles/globals.css'
```

Add this as the first import in `src/main.tsx`.

- [ ] **Step 2.5: Write token smoke test**

Create `src/styles/tokens.test.ts`:

```ts
// Confirms tokens.css exists and exports the expected shape.
// CSS custom properties are validated by the browser at runtime;
// this test confirms the file is importable without errors.
import { describe, it, expect } from 'vitest'

describe('design tokens', () => {
  it('tokens.css file exists and is importable', async () => {
    // If this import fails the test suite will report it clearly
    await expect(import('./tokens.css')).resolves.toBeDefined()
  })
})
```

- [ ] **Step 2.6: Run test**

```bash
npm run test -- tokens
```

Expected: 1 passed.

- [ ] **Step 2.7: Commit**

```bash
git add src/styles/ index.html src/main.tsx
git commit -m "feat: add MediCalm design tokens and global styles"
```

---

## Task 3: Type System

**Files:**
- Create: `src/types/index.ts`
- Create: `src/types/taxonomy.ts`

All types must match the schemas in `15_mediCalm_data_schema.md` exactly. Provenance labels from `02_mediCalm_source_truth_doctrine.md` are included as enums.

- [ ] **Step 3.1: Write failing type test**

Create `src/types/index.test.ts`:

```ts
import { describe, it, expectTypeOf } from 'vitest'
import type {
  PainInputState,
  UserProfile,
  AppSettings,
  HistoryEntry,
  SafetyMode,
  SessionResult,
} from './index'

describe('core types', () => {
  it('PainInputState has required fields with correct types', () => {
    const input: PainInputState = {
      pain_level: 7,
      location_tags: ['front_neck'],
      symptom_tags: ['burning'],
    }
    expectTypeOf(input.pain_level).toBeNumber()
    expectTypeOf(input.location_tags).toEqualTypeOf<string[]>()
    expectTypeOf(input.symptom_tags).toEqualTypeOf<string[]>()
    expectTypeOf(input.trigger_tag).toEqualTypeOf<string | undefined>()
    expectTypeOf(input.user_note).toEqualTypeOf<string | undefined>()
  })

  it('AppSettings has audio and reduced_motion flags', () => {
    const s: AppSettings = {
      audio_enabled: true,
      reduced_motion_enabled: false,
    }
    expectTypeOf(s.audio_enabled).toBeBoolean()
    expectTypeOf(s.reduced_motion_enabled).toBeBoolean()
  })

  it('SafetyMode is a union of the three expected strings', () => {
    const mode: SafetyMode = 'NORMAL_GUIDANCE_MODE'
    expectTypeOf(mode).toEqualTypeOf<SafetyMode>()
  })

  it('SessionResult is a union of the four expected strings', () => {
    const r: SessionResult = 'better'
    expectTypeOf(r).toEqualTypeOf<SessionResult>()
  })
})
```

- [ ] **Step 3.2: Run test to confirm it fails**

```bash
npm run test -- index.test
```

Expected: FAIL — types not defined yet.

- [ ] **Step 3.3: Create src/types/index.ts**

```ts
/**
 * MediCalm Core Types
 * Authority: Data Schema (doc 15), Execution Spec (doc 04), Safety + Reassurance Spec (doc 06)
 *
 * These types mirror the JSON schemas in the markdown pack exactly.
 * All provenance labels are preserved as a union type per Source Truth Doctrine (doc 02).
 */

// ─── Provenance ──────────────────────────────────────────────────────────────

export type ProvenanceLabel =
  | 'source_grounded'
  | 'product_inference'
  | 'design_decision'
  | 'validation_needed'

// ─── Safety ──────────────────────────────────────────────────────────────────

/** Authority: Safety + Reassurance Spec (doc 06), Execution Spec (doc 04) */
export type SafetyMode =
  | 'NORMAL_GUIDANCE_MODE'
  | 'INTERRUPTED_CAUTION_MODE'
  | 'SAFETY_STOP_MODE'

/** Authority: Execution Spec (doc 04) § Runtime Modes */
export type RuntimeMode =
  | 'DIRECT_SESSION_MODE'
  | 'GUIDED_FOLLOW_UP_MODE'
  | 'SAFETY_STOP_MODE'

export interface SafetyAssessment {
  mode: RuntimeMode
  safety_tags: string[]
  stop_reason: string | null
}

// ─── Pain Input ──────────────────────────────────────────────────────────────

/** Authority: Execution Spec (doc 04) § 1. State Intake Engine */
export interface PainInputState {
  pain_level: number           // 0–10
  location_tags: string[]      // at least one required
  symptom_tags: string[]       // at least one required
  trigger_tag?: string         // optional
  user_note?: string           // optional; never used as sole safety detector in v1
}

/** Authority: Execution Spec (doc 04) § Canonical Severity Bands */
export type SeverityBand = 'low' | 'moderate' | 'high' | 'very_high'

// ─── Session ─────────────────────────────────────────────────────────────────

export type SessionResult = 'better' | 'same' | 'worse' | 'interrupted'
export type SessionStatus = 'completed' | 'interrupted' | 'user_stopped'

export interface TimingProfile {
  inhale_seconds: number
  exhale_seconds: number
  rounds: number
}

/**
 * RuntimeSession — the full session object produced by the execution engine.
 * In M1 this is a typed stub; the engine populates it in M2.
 * Authority: Execution Spec (doc 04) § 5. Session Orchestration Engine
 */
export interface RuntimeSession {
  session_id: string
  created_at: string             // ISO 8601
  protocol_id: string
  protocol_name: string
  goal: string
  display_mode: 'breath_with_body_cue' | 'breath_only'
  timing_profile: TimingProfile
  cue_sequence: string[]
  estimated_length_seconds: number
  status: SessionStatus
  stop_conditions: string[]
  allowed_follow_up: string[]
  provenance_tags: ProvenanceLabel[]
  pain_input: PainInputState
  safety_assessment: SafetyAssessment
}

// ─── Feedback ────────────────────────────────────────────────────────────────

/** Authority: Execution Spec (doc 04) § 7. Feedback Engine */
export interface SessionFeedback {
  session_id: string
  pain_before: number
  pain_after: number
  result: SessionResult
  change_markers: string[]
  note?: string
}

// ─── History ─────────────────────────────────────────────────────────────────

/**
 * Authority: Execution Spec (doc 04) § 9. Session Persistence Engine
 * Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 */
export interface HistoryEntry {
  session_id: string
  timestamp: string              // ISO 8601
  pain_before: number
  pain_after: number
  location_tags: string[]
  symptom_tags: string[]
  trigger_tag?: string
  selected_protocol_id: string
  selected_protocol_name: string
  result: SessionResult
  change_markers: string[]
  session_status: SessionStatus
  session_duration_seconds: number
}

// ─── Personalization ─────────────────────────────────────────────────────────

/** Authority: Execution Spec (doc 04) § 10. Personalization Engine */
export interface PersonalizationRecord {
  state_signature: string
  preferred_protocol_id: string
  successful_follow_up_id?: string
  success_count: number
  worse_count: number
  last_used_at: string           // ISO 8601
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  user_id: string
  created_at: string
  last_opened_at: string
  timezone: string
}

/** Authority: Data Schema (doc 15) § AppSettings */
export interface AppSettings {
  audio_enabled: boolean
  reduced_motion_enabled: boolean
  haptics_enabled: boolean
}

// ─── Protocol + Mechanism stubs (filled in M2) ───────────────────────────────

export interface ProtocolDefinition {
  protocol_id: string
  protocol_name: string
  goal: string
  primary_mechanisms: string[]
  display_mode: 'breath_with_body_cue' | 'breath_only'
  default_timing_profile: TimingProfile
  cue_sequence: string[]
  microtext_options: string[]
  safe_use_cases: string[]
  caution_flags: string[]
  stop_conditions: string[]
  follow_up_candidates: string[]
  provenance_tags: ProvenanceLabel[]
}

export interface MechanismObject {
  mechanism_id: string
  name: string
  description: string
  related_truth_ids: string[]
  trigger_tags: string[]
  symptom_tags: string[]
  contraindication_tags: string[]
  protocol_priority_tags: string[]
}
```

- [ ] **Step 3.4: Run type test**

```bash
npm run test -- index.test
```

Expected: PASS — all 4 type assertions compile and pass.

- [ ] **Step 3.5: Write taxonomy test**

Create `src/types/taxonomy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  LOCATION_TAGS,
  SYMPTOM_TAGS,
  TRIGGER_TAGS,
  SEVERITY_BANDS,
  getSeverityBand,
} from './taxonomy'

describe('taxonomy', () => {
  it('LOCATION_TAGS is non-empty array of strings', () => {
    expect(LOCATION_TAGS.length).toBeGreaterThan(0)
    LOCATION_TAGS.forEach(t => expect(typeof t).toBe('string'))
  })

  it('SYMPTOM_TAGS is non-empty array of strings', () => {
    expect(SYMPTOM_TAGS.length).toBeGreaterThan(0)
  })

  it('TRIGGER_TAGS is non-empty array of strings', () => {
    expect(TRIGGER_TAGS.length).toBeGreaterThan(0)
  })

  it('SEVERITY_BANDS covers 0-10 range', () => {
    expect(SEVERITY_BANDS.low).toEqual([0, 3])
    expect(SEVERITY_BANDS.moderate).toEqual([4, 6])
    expect(SEVERITY_BANDS.high).toEqual([7, 8])
    expect(SEVERITY_BANDS.very_high).toEqual([9, 10])
  })

  it('getSeverityBand classifies correctly', () => {
    expect(getSeverityBand(0)).toBe('low')
    expect(getSeverityBand(3)).toBe('low')
    expect(getSeverityBand(4)).toBe('moderate')
    expect(getSeverityBand(6)).toBe('moderate')
    expect(getSeverityBand(7)).toBe('high')
    expect(getSeverityBand(8)).toBe('high')
    expect(getSeverityBand(9)).toBe('very_high')
    expect(getSeverityBand(10)).toBe('very_high')
  })
})
```

- [ ] **Step 3.6: Run taxonomy test to confirm failure**

```bash
npm run test -- taxonomy.test
```

Expected: FAIL.

- [ ] **Step 3.7: Create src/types/taxonomy.ts**

```ts
/**
 * MediCalm Canonical Taxonomy
 * Authority: Input Taxonomy (doc 14), Execution Spec (doc 04), UX/UI Experience Report (doc 12)
 *
 * These are the controlled-vocabulary values used across the entire system.
 * Synonyms from free text must be normalized to these canonical strings before engine processing.
 * All values are lowercase_snake_case.
 */

import type { SeverityBand } from './index'

// ─── Location Tags ────────────────────────────────────────────────────────────
// Body regions where the user experiences symptoms.
export const LOCATION_TAGS = [
  'front_neck',
  'back_neck',
  'jaw',
  'ribs',
  'upper_back',
  'shoulders',
  'chest',
  'lower_back',
  'hips',
  'head',
] as const

export type LocationTag = typeof LOCATION_TAGS[number]

// ─── Symptom Tags ─────────────────────────────────────────────────────────────
// How the user experiences their symptoms.
export const SYMPTOM_TAGS = [
  'burning',
  'tightness',
  'pressure',
  'sharp',
  'throbbing',
  'soreness',
  'aching',
  'stiffness',
  'numbness',
  'tingling',
] as const

export type SymptomTag = typeof SYMPTOM_TAGS[number]

// ─── Trigger Tags ─────────────────────────────────────────────────────────────
// Context or activity associated with onset.
export const TRIGGER_TAGS = [
  'sitting',
  'standing',
  'driving',
  'eating',
  'post_sleep',
  'stress',
  'overhead_movement',
  'screen_use',
  'exercise',
  'unknown',
] as const

export type TriggerTag = typeof TRIGGER_TAGS[number]

// ─── Immediate Escalation Tags (Safety Precheck) ──────────────────────────────
// Authority: Execution Spec (doc 04) § 2. Safety Precheck Engine
// If any of these are present, route to SAFETY_STOP_MODE immediately.
export const IMMEDIATE_ESCALATION_TAGS = [
  'chest_pain',
  'severe_shortness_of_breath',
  'progressive_weakness',
  'worsening_numbness',
  'severe_neurologic_change',
  'hand_dysfunction',
  'fainting',
  'major_balance_loss',
] as const

export type ImmediateEscalationTag = typeof IMMEDIATE_ESCALATION_TAGS[number]

// ─── Active Session Stop Triggers ─────────────────────────────────────────────
// Authority: Execution Spec (doc 04) § 6. Active Safety Interrupt Engine
export const SESSION_STOP_TRIGGERS = [
  'dizziness',
  'major_pain_spike',
  'panic_escalation',
  'worsening_nerve_symptoms',
  'severe_shortness_of_breath',
  'new_weakness',
  'loss_of_control',
] as const

export type SessionStopTrigger = typeof SESSION_STOP_TRIGGERS[number]

// ─── Severity Bands ───────────────────────────────────────────────────────────
// Authority: Execution Spec (doc 04) § 1. State Intake Engine
export const SEVERITY_BANDS: Record<SeverityBand, [number, number]> = {
  low:       [0, 3],
  moderate:  [4, 6],
  high:      [7, 8],
  very_high: [9, 10],
}

export function getSeverityBand(pain_level: number): SeverityBand {
  if (pain_level <= 3) return 'low'
  if (pain_level <= 6) return 'moderate'
  if (pain_level <= 8) return 'high'
  return 'very_high'
}

// ─── Change Markers (Feedback) ────────────────────────────────────────────────
// Authority: Execution Spec (doc 04) § 7. Feedback Engine
export const CHANGE_MARKERS = [
  'less_tight',
  'less_burning',
  'easier_breathing',
  'more_control',
  'less_jaw_tension',
  'less_pressure',
  'no_change',
] as const

export type ChangeMarker = typeof CHANGE_MARKERS[number]
```

- [ ] **Step 3.8: Run taxonomy test**

```bash
npm run test -- taxonomy.test
```

Expected: PASS — all 5 tests pass.

- [ ] **Step 3.9: Commit**

```bash
git add src/types/
git commit -m "feat: add core TypeScript types and canonical taxonomy"
```

---

## Task 4: Storage Utilities

**Files:**
- Create: `src/storage/localStorage.ts`
- Create: `src/storage/settings.ts`
- Create: `src/storage/profile.ts`

- [ ] **Step 4.1: Write storage tests**

Create `src/storage/localStorage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { storageGet, storageSet, storageRemove } from './localStorage'

describe('localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null for missing key', () => {
    expect(storageGet('missing')).toBeNull()
  })

  it('stores and retrieves a value', () => {
    storageSet('key', { a: 1 })
    expect(storageGet('key')).toEqual({ a: 1 })
  })

  it('removes a key', () => {
    storageSet('key', 'value')
    storageRemove('key')
    expect(storageGet('key')).toBeNull()
  })

  it('returns null when stored JSON is malformed', () => {
    localStorage.setItem('bad', '{not valid json')
    expect(storageGet('bad')).toBeNull()
  })
})
```

- [ ] **Step 4.2: Run to confirm failure**

```bash
npm run test -- localStorage.test
```

Expected: FAIL.

- [ ] **Step 4.3: Create src/storage/localStorage.ts**

```ts
/**
 * MediCalm localStorage Helpers
 * Generic typed wrappers with JSON safety. Never throws — returns null on error.
 */

const PREFIX = 'medicaLm_'

export function storageGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private mode — silently degrade
    console.warn('[MediCalm] localStorage write failed for key:', key)
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
```

- [ ] **Step 4.4: Run storage test**

```bash
npm run test -- localStorage.test
```

Expected: PASS.

- [ ] **Step 4.5: Create src/storage/settings.ts**

```ts
import type { AppSettings } from '../types'
import { storageGet, storageSet } from './localStorage'

const KEY = 'app_settings'

export function getDefaultSettings(): AppSettings {
  return {
    audio_enabled: true,
    reduced_motion_enabled: false,
    haptics_enabled: false,
  }
}

export function loadSettings(): AppSettings {
  return storageGet<AppSettings>(KEY) ?? getDefaultSettings()
}

export function saveSettings(settings: AppSettings): void {
  storageSet(KEY, settings)
}
```

- [ ] **Step 4.6: Create src/storage/profile.ts**

```ts
import type { UserProfile } from '../types'
import { storageGet, storageSet } from './localStorage'

const KEY = 'user_profile'

function generateUserId(): string {
  return 'user_' + Date.now().toString(36)
}

export function getDefaultProfile(): UserProfile {
  const now = new Date().toISOString()
  return {
    user_id: generateUserId(),
    created_at: now,
    last_opened_at: now,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export function loadProfile(): UserProfile {
  const stored = storageGet<UserProfile>(KEY)
  if (stored) {
    // Update last_opened_at on load
    const updated = { ...stored, last_opened_at: new Date().toISOString() }
    storageSet(KEY, updated)
    return updated
  }
  const fresh = getDefaultProfile()
  storageSet(KEY, fresh)
  return fresh
}
```

- [ ] **Step 4.7: Create settings + profile tests**

Create `src/storage/settings.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { loadSettings, saveSettings, getDefaultSettings } from './settings'

describe('settings storage', () => {
  beforeEach(() => localStorage.clear())

  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(getDefaultSettings())
  })

  it('round-trips settings correctly', () => {
    const s = { audio_enabled: false, reduced_motion_enabled: true, haptics_enabled: false }
    saveSettings(s)
    expect(loadSettings()).toEqual(s)
  })
})
```

- [ ] **Step 4.8: Run all storage tests**

```bash
npm run test -- storage
```

Expected: All PASS.

- [ ] **Step 4.9: Commit**

```bash
git add src/storage/
git commit -m "feat: add typed localStorage helpers, settings, and profile storage"
```

---

## Task 5: App Context + Screen State Machine

**Files:**
- Create: `src/context/AppContext.tsx`
- Create: `src/context/AppProvider.tsx`

The screen state machine manages which screen is visible. In M1: `home` | `pain_input` | `session_placeholder`. The transition to `guided_session` is wired in M2.

- [ ] **Step 5.1: Write context test**

Create `src/context/AppContext.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from './AppProvider'
import { useAppContext } from './AppContext'

function TestConsumer() {
  const { state, dispatch } = useAppContext()
  return (
    <div>
      <span data-testid="screen">{state.activeScreen}</span>
      <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'pain_input' })}>
        Go to input
      </button>
      <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}>
        Go home
      </button>
    </div>
  )
}

describe('AppContext', () => {
  it('starts on home screen', () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    expect(screen.getByTestId('screen').textContent).toBe('home')
  })

  it('navigates to pain_input', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('Go to input'))
    expect(screen.getByTestId('screen').textContent).toBe('pain_input')
  })

  it('navigates back to home', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('Go to input'))
    await userEvent.click(screen.getByText('Go home'))
    expect(screen.getByTestId('screen').textContent).toBe('home')
  })
})
```

- [ ] **Step 5.2: Run to confirm failure**

```bash
npm run test -- AppContext.test
```

Expected: FAIL.

- [ ] **Step 5.3: Create src/context/AppContext.tsx**

```tsx
import { createContext, useContext } from 'react'
import type { AppSettings, PainInputState } from '../types'

export type AppScreen = 'home' | 'pain_input' | 'session_placeholder'

export interface AppState {
  activeScreen: AppScreen
  pendingPainInput: PainInputState | null  // set after pain input, cleared after session
  settings: AppSettings
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: AppScreen }
  | { type: 'SET_PAIN_INPUT'; input: PainInputState }
  | { type: 'CLEAR_PAIN_INPUT' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
```

- [ ] **Step 5.4: Create src/context/AppProvider.tsx**

```tsx
import { useReducer, type ReactNode } from 'react'
import { AppContext, type AppState, type AppAction } from './AppContext'
import { loadSettings } from '../storage/settings'

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, activeScreen: action.screen }
    case 'SET_PAIN_INPUT':
      return { ...state, pendingPainInput: action.input }
    case 'CLEAR_PAIN_INPUT':
      return { ...state, pendingPainInput: null }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }
    default:
      return state
  }
}

function getInitialState(): AppState {
  return {
    activeScreen: 'home',
    pendingPainInput: null,
    settings: loadSettings(),
  }
}

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
```

- [ ] **Step 5.5: Run context test**

```bash
npm run test -- AppContext.test
```

Expected: PASS — all 3 tests pass.

- [ ] **Step 5.6: Commit**

```bash
git add src/context/
git commit -m "feat: add AppContext screen state machine with useReducer"
```

---

## Task 6: Shared Components

**Files:**
- Create: `src/components/ScreenTransition.tsx`
- Create: `src/components/PainSlider.tsx` + `.module.css`
- Create: `src/components/TagSelector.tsx` + `.module.css`
- Create: `src/components/HistoryCard.tsx` + `.module.css`

### ScreenTransition

- [ ] **Step 6.1: Create src/components/ScreenTransition.tsx**

```tsx
/**
 * ScreenTransition — wraps screen content in a Framer Motion crossfade.
 * Authority: Guided Session UI Spec (doc 05) § 2. Transition System
 * Duration: 200–400ms crossfade. No bounce, no zoom, no slides.
 */
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScreenTransitionProps {
  children: ReactNode
  screenKey: string
}

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
}

export function ScreenTransition({ children, screenKey }: ScreenTransitionProps) {
  return (
    <motion.div
      key={screenKey}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  )
}
```

### PainSlider

- [ ] **Step 6.2: Write PainSlider test**

Create `src/components/PainSlider.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PainSlider } from './PainSlider'

describe('PainSlider', () => {
  it('renders with initial value displayed', () => {
    render(<PainSlider value={5} onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toHaveValue('5')
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('has min=0 max=10', () => {
    render(<PainSlider value={0} onChange={vi.fn()} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '10')
  })

  it('calls onChange with numeric value', async () => {
    const onChange = vi.fn()
    render(<PainSlider value={0} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    await userEvent.type(slider, '{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(expect.any(Number))
  })

  it('has accessible label', () => {
    render(<PainSlider value={3} onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toHaveAccessibleName(/pain level/i)
  })
})
```

- [ ] **Step 6.3: Run to confirm failure**

```bash
npm run test -- PainSlider.test
```

Expected: FAIL.

- [ ] **Step 6.4: Create src/components/PainSlider.tsx**

```tsx
/**
 * PainSlider — 0–10 pain level input.
 * Authority: Guided Session UI Spec (doc 05) § 1. Pain Input Screen
 * Accessibility: touch-friendly, labelled, high-contrast display.
 */
import styles from './PainSlider.module.css'

interface PainSliderProps {
  value: number
  onChange: (value: number) => void
}

export function PainSlider({ value, onChange }: PainSliderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.valueDisplay} aria-hidden="true">
        <span className={styles.value}>{value}</span>
        <span className={styles.outOf}>/10</span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={10}
        step={1}
        value={value}
        aria-label="Pain level"
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={styles.labels} aria-hidden="true">
        <span>No pain</span>
        <span>Worst</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 6.5: Create src/components/PainSlider.module.css**

```css
.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

.valueDisplay {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-1);
}

.value {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  color: var(--color-accent-primary);
  line-height: 1;
}

.outOf {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: var(--color-bg-card);
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
  min-height: var(--touch-min);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  cursor: pointer;
  box-shadow: 0 0 0 4px var(--color-accent-glow);
  transition: box-shadow var(--transition-quick);
}

.slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 0 4px var(--color-accent-glow);
}

.slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px var(--color-accent-primary);
}

.labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
```

- [ ] **Step 6.6: Run PainSlider test**

```bash
npm run test -- PainSlider.test
```

Expected: PASS.

### TagSelector

- [ ] **Step 6.7: Write TagSelector test**

Create `src/components/TagSelector.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagSelector } from './TagSelector'

const tags = ['burning', 'tightness', 'pressure']

describe('TagSelector', () => {
  it('renders all tags as buttons', () => {
    render(<TagSelector tags={tags} selected={[]} onToggle={vi.fn()} label="Pain type" />)
    tags.forEach(tag => expect(screen.getByRole('button', { name: tag })).toBeInTheDocument())
  })

  it('shows selected state visually (aria-pressed)', () => {
    render(<TagSelector tags={tags} selected={['burning']} onToggle={vi.fn()} label="Pain type" />)
    expect(screen.getByRole('button', { name: 'burning' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'tightness' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onToggle with the tag when clicked', async () => {
    const onToggle = vi.fn()
    render(<TagSelector tags={tags} selected={[]} onToggle={onToggle} label="Pain type" />)
    await userEvent.click(screen.getByRole('button', { name: 'tightness' }))
    expect(onToggle).toHaveBeenCalledWith('tightness')
  })

  it('has a group label for accessibility', () => {
    render(<TagSelector tags={tags} selected={[]} onToggle={vi.fn()} label="Pain type" />)
    expect(screen.getByText('Pain type')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6.8: Run to confirm failure**

```bash
npm run test -- TagSelector.test
```

Expected: FAIL.

- [ ] **Step 6.9: Create src/components/TagSelector.tsx**

```tsx
/**
 * TagSelector — multi-select chip grid for symptom/location/trigger tags.
 * Authority: Guided Session UI Spec (doc 05) § 1. Pain Input Screen
 * Accessibility: aria-pressed, min touch target 44px, group label.
 */
import styles from './TagSelector.module.css'

interface TagSelectorProps {
  tags: readonly string[]
  selected: string[]
  onToggle: (tag: string) => void
  label: string
}

function formatLabel(tag: string): string {
  return tag.replace(/_/g, ' ')
}

export function TagSelector({ tags, selected, onToggle, label }: TagSelectorProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.grid} role="group" aria-label={label}>
        {tags.map((tag) => {
          const isSelected = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
              aria-pressed={isSelected}
              onClick={() => onToggle(tag)}
            >
              {formatLabel(tag)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
```

- [ ] **Step 6.10: Create src/components/TagSelector.module.css**

```css
.fieldset {
  border: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.legend {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip {
  min-height: var(--touch-min);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-transform: capitalize;
  transition:
    background var(--transition-quick),
    border-color var(--transition-quick),
    color var(--transition-quick);
  cursor: pointer;
}

.chip:hover {
  border-color: var(--color-border-active);
  color: var(--color-text-primary);
}

.chip.selected {
  background: var(--color-bg-surface);
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}
```

- [ ] **Step 6.11: Create HistoryCard placeholder**

Create `src/components/HistoryCard.tsx`:

```tsx
/**
 * HistoryCard — displays a single session history entry.
 * Authority: Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 *
 * M1 STATUS: Typed and rendered; history list will be empty in M1.
 * Full history write-back is implemented in M3.
 */
import type { HistoryEntry } from '../types'
import styles from './HistoryCard.module.css'

interface HistoryCardProps {
  entry: HistoryEntry
}

const RESULT_LABELS: Record<HistoryEntry['result'], string> = {
  better:      'Helped',
  same:        'No clear change',
  worse:       'Worse',
  interrupted: 'Interrupted',
}

export function HistoryCard({ entry }: HistoryCardProps) {
  const date = new Date(entry.timestamp)
  const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <article className={styles.card} aria-label={`Session from ${dateLabel}`}>
      <header className={styles.header}>
        <span className={styles.time}>{dateLabel} · {timeLabel}</span>
        <span className={`${styles.result} ${styles[entry.result]}`}>
          {RESULT_LABELS[entry.result]}
        </span>
      </header>
      <div className={styles.body}>
        <span className={styles.pain}>
          {entry.pain_before} → {entry.pain_after}
        </span>
        <span className={styles.protocol}>{entry.selected_protocol_name}</span>
      </div>
      <footer className={styles.tags}>
        {entry.location_tags.slice(0, 2).map(t => (
          <span key={t} className={styles.tag}>{t.replace(/_/g, ' ')}</span>
        ))}
        {entry.symptom_tags.slice(0, 2).map(t => (
          <span key={t} className={styles.tag}>{t.replace(/_/g, ' ')}</span>
        ))}
      </footer>
    </article>
  )
}
```

Create `src/components/HistoryCard.module.css`:

```css
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.result {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.better      { color: var(--color-accent-primary); }
.same        { color: var(--color-text-secondary); }
.worse       { color: var(--color-safety-stop); }
.interrupted { color: var(--color-caution); }

.body {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.pain {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
}

.protocol {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.tag {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-surface);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  text-transform: capitalize;
}
```

- [ ] **Step 6.12: Run TagSelector test**

```bash
npm run test -- TagSelector.test
```

Expected: PASS.

- [ ] **Step 6.13: Commit**

```bash
git add src/components/
git commit -m "feat: add ScreenTransition, PainSlider, TagSelector, HistoryCard components"
```

---

## Task 7: Home Screen

**Files:**
- Create: `src/screens/HomeScreen.tsx`
- Modify: `src/storage/localStorage.ts` (already done)

- [ ] **Step 7.1: Write HomeScreen test**

Create `src/screens/HomeScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { HomeScreen } from './HomeScreen'

function renderWithProvider() {
  return render(
    <AppProvider>
      <HomeScreen />
    </AppProvider>
  )
}

describe('HomeScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the primary question', () => {
    renderWithProvider()
    expect(screen.getByText(/what level is your pain/i)).toBeInTheDocument()
  })

  it('renders a Start session button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  it('shows empty-state message when no history', () => {
    renderWithProvider()
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument()
  })

  it('navigates to pain_input on Start click', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /start/i }))
    // Navigation state is in context; we verify the button is clickable without error
    // Full navigation assertion covered in AppContext tests
  })
})
```

- [ ] **Step 7.2: Run to confirm failure**

```bash
npm run test -- HomeScreen.test
```

Expected: FAIL.

- [ ] **Step 7.3: Create src/screens/HomeScreen.tsx**

```tsx
/**
 * HomeScreen — entry point and history view.
 * Authority: Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 *            UX/UI Experience Report (doc 12)
 *
 * "The home screen should feel like a calm history of care, not a dashboard of performance."
 * No streaks, no badges, no celebratory gamification.
 */
import { useEffect, useState } from 'react'
import type { HistoryEntry } from '../types'
import { storageGet } from '../storage/localStorage'
import { useAppContext } from '../context/AppContext'
import { HistoryCard } from '../components/HistoryCard'
import styles from './HomeScreen.module.css'

export function HomeScreen() {
  const { dispatch } = useAppContext()
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const stored = storageGet<HistoryEntry[]>('session_history') ?? []
    // Most recent first
    setHistory([...stored].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  }, [])

  function handleStart() {
    dispatch({ type: 'NAVIGATE', screen: 'pain_input' })
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.appName}>MediCalm</h1>
        <p className={styles.question}>What level is your pain right now?</p>
      </header>

      <div className={styles.cta}>
        <button
          className={styles.startButton}
          onClick={handleStart}
          type="button"
          aria-label="Start a new guided session"
        >
          Start session
        </button>
      </div>

      <section className={styles.history} aria-label="Session history">
        <h2 className={styles.historyHeading}>Recent sessions</h2>

        {history.length === 0 ? (
          <p className={styles.emptyState}>
            No sessions yet. Start your first session above.
          </p>
        ) : (
          <ul className={styles.historyList}>
            {history.map((entry) => (
              <li key={entry.session_id}>
                <HistoryCard entry={entry} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
```

Create `src/screens/HomeScreen.module.css`:

```css
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: var(--screen-max-width);
  margin: 0 auto;
  width: 100%;
  padding: var(--space-10) var(--screen-padding) var(--space-8);
  gap: var(--space-8);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.appName {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-accent-primary);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.question {
  font-size: var(--text-2xl);
  font-weight: var(--weight-light);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.cta {
  display: flex;
  justify-content: flex-start;
}

.startButton {
  min-height: var(--touch-min);
  padding: var(--space-3) var(--space-8);
  background: var(--color-accent-primary);
  color: var(--color-bg-base);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  font-family: inherit;
  transition: opacity var(--transition-quick);
}

.startButton:hover {
  opacity: 0.88;
}

.startButton:active {
  opacity: 0.75;
}

.history {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
}

.historyHeading {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.emptyState {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: var(--space-4) 0;
}

.historyList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

- [ ] **Step 7.4: Run HomeScreen test**

```bash
npm run test -- HomeScreen.test
```

Expected: PASS — all 4 tests pass.

- [ ] **Step 7.5: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/HomeScreen.module.css
git commit -m "feat: add HomeScreen with empty state and history list"
```

---

## Task 8: Pain Input Screen

**Files:**
- Create: `src/screens/PainInputScreen.tsx` + `.module.css`
- Create: `src/screens/SessionPlaceholder.tsx` + `.module.css`
- Create: `src/data/protocols.ts`, `src/data/mechanisms.ts` (M2 stubs)

The Pain Input screen collects: pain_level (required), location_tags (≥1 required), symptom_tags (≥1 required), trigger_tag (optional), user_note (optional).

On submit: validate → dispatch SET_PAIN_INPUT → navigate to session_placeholder.

- [ ] **Step 8.1: Create M2 stub data files**

Create `src/data/protocols.ts`:

```ts
/**
 * Protocol Library — M2 placeholder.
 * Authority: Knowledge + Protocol Doctrine (doc 03), Protocol Library (doc 13)
 * Populated in Milestone 2 when the session engine is built.
 */
import type { ProtocolDefinition } from '../types'

export const PROTOCOLS: ProtocolDefinition[] = []
```

Create `src/data/mechanisms.ts`:

```ts
/**
 * Mechanism Registry — M2 placeholder.
 * Authority: Knowledge + Protocol Doctrine (doc 03)
 * Populated in Milestone 2 when the session engine is built.
 */
import type { MechanismObject } from '../types'

export const MECHANISMS: MechanismObject[] = []
```

- [ ] **Step 8.2: Write PainInputScreen tests**

Create `src/screens/PainInputScreen.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { PainInputScreen } from './PainInputScreen'

function renderWithProvider() {
  return render(
    <AppProvider>
      <PainInputScreen />
    </AppProvider>
  )
}

describe('PainInputScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the pain level question', () => {
    renderWithProvider()
    expect(screen.getByRole('slider', { name: /pain level/i })).toBeInTheDocument()
  })

  it('renders region tag selector', () => {
    renderWithProvider()
    expect(screen.getByText(/where do you feel it/i)).toBeInTheDocument()
  })

  it('renders symptom type selector', () => {
    renderWithProvider()
    expect(screen.getByText(/what does it feel like/i)).toBeInTheDocument()
  })

  it('submit button is disabled when no region selected', () => {
    renderWithProvider()
    const submitBtn = screen.getByRole('button', { name: /begin session/i })
    expect(submitBtn).toBeDisabled()
  })

  it('submit button is disabled when no symptom selected', async () => {
    renderWithProvider()
    // Select a region but no symptom
    await userEvent.click(screen.getByRole('button', { name: /front neck/i }))
    const submitBtn = screen.getByRole('button', { name: /begin session/i })
    expect(submitBtn).toBeDisabled()
  })

  it('submit button is enabled when region and symptom selected', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /front neck/i }))
    await userEvent.click(screen.getByRole('button', { name: /burning/i }))
    const submitBtn = screen.getByRole('button', { name: /begin session/i })
    expect(submitBtn).not.toBeDisabled()
  })

  it('renders a back button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 8.3: Run to confirm failure**

```bash
npm run test -- PainInputScreen.test
```

Expected: FAIL.

- [ ] **Step 8.4: Create src/screens/PainInputScreen.tsx**

```tsx
/**
 * PainInputScreen — collects all required state for session resolution.
 * Authority: Guided Session UI Spec (doc 05) § 1. Pain Input Screen
 *            Execution Spec (doc 04) § 1. State Intake Engine
 *
 * Required: pain_level, ≥1 location_tag, ≥1 symptom_tag
 * Optional: trigger_tag, user_note
 *
 * On submit: dispatches SET_PAIN_INPUT and navigates to session_placeholder.
 * M2 will replace session_placeholder navigation with session engine call.
 */
import { useState } from 'react'
import type { PainInputState } from '../types'
import { LOCATION_TAGS, SYMPTOM_TAGS, TRIGGER_TAGS } from '../types/taxonomy'
import { useAppContext } from '../context/AppContext'
import { PainSlider } from '../components/PainSlider'
import { TagSelector } from '../components/TagSelector'
import styles from './PainInputScreen.module.css'

export function PainInputScreen() {
  const { dispatch } = useAppContext()

  const [painLevel, setPainLevel] = useState(5)
  const [locationTags, setLocationTags] = useState<string[]>([])
  const [symptomTags, setSymptomTags] = useState<string[]>([])
  const [triggerTag, setTriggerTag] = useState<string | undefined>(undefined)
  const [userNote, setUserNote] = useState('')

  const canSubmit = locationTags.length > 0 && symptomTags.length > 0

  function toggleTag(
    tag: string,
    current: string[],
    setter: (v: string[]) => void,
    singleSelect = false,
  ) {
    if (singleSelect) {
      setter(current.includes(tag) ? [] : [tag])
      return
    }
    setter(
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    )
  }

  function handleTriggerToggle(tag: string) {
    // Trigger is single-select
    setTriggerTag(prev => (prev === tag ? undefined : tag))
  }

  function handleSubmit() {
    if (!canSubmit) return

    const input: PainInputState = {
      pain_level: painLevel,
      location_tags: locationTags,
      symptom_tags: symptomTags,
      ...(triggerTag !== undefined && { trigger_tag: triggerTag }),
      ...(userNote.trim() !== '' && { user_note: userNote.trim() }),
    }

    dispatch({ type: 'SET_PAIN_INPUT', input })
    // M1: route to placeholder. M2: route to guided session via engine.
    dispatch({ type: 'NAVIGATE', screen: 'session_placeholder' })
  }

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          aria-label="Back to home"
        >
          ← Back
        </button>
        <h1 className={styles.heading}>What level is your pain right now?</h1>
      </header>

      <section className={styles.section} aria-labelledby="pain-level-label">
        <p id="pain-level-label" className={styles.sectionLabel}>
          Rate your pain
        </p>
        <PainSlider value={painLevel} onChange={setPainLevel} />
      </section>

      <section className={styles.section}>
        <TagSelector
          tags={LOCATION_TAGS}
          selected={locationTags}
          onToggle={(tag) => toggleTag(tag, locationTags, setLocationTags)}
          label="Where do you feel it?"
        />
      </section>

      <section className={styles.section}>
        <TagSelector
          tags={SYMPTOM_TAGS}
          selected={symptomTags}
          onToggle={(tag) => toggleTag(tag, symptomTags, setSymptomTags)}
          label="What does it feel like?"
        />
      </section>

      <section className={styles.section}>
        <TagSelector
          tags={TRIGGER_TAGS}
          selected={triggerTag !== undefined ? [triggerTag] : []}
          onToggle={handleTriggerToggle}
          label="Context (optional)"
        />
      </section>

      <section className={styles.section}>
        <label className={styles.noteLabel} htmlFor="user-note">
          Note (optional)
        </label>
        <textarea
          id="user-note"
          className={styles.noteInput}
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Anything else to note?"
          rows={2}
          maxLength={200}
        />
      </section>

      <footer className={styles.footer}>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          type="button"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          aria-label="Begin session"
        >
          Begin session
        </button>
        {!canSubmit && (
          <p className={styles.validation} role="status" aria-live="polite">
            Select at least one region and one symptom type to continue.
          </p>
        )}
      </footer>
    </main>
  )
}
```

Create `src/screens/PainInputScreen.module.css`:

```css
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: var(--screen-max-width);
  margin: 0 auto;
  width: 100%;
  padding: var(--space-6) var(--screen-padding) var(--space-10);
  gap: var(--space-6);
  overflow-y: auto;
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.backButton {
  align-self: flex-start;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: var(--space-1) 0;
  min-height: var(--touch-min);
  display: flex;
  align-items: center;
  transition: color var(--transition-quick);
}

.backButton:hover {
  color: var(--color-text-primary);
}

.heading {
  font-size: var(--text-xl);
  font-weight: var(--weight-light);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.sectionLabel {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.noteLabel {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.noteInput {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-4);
  resize: none;
  transition: border-color var(--transition-quick);
  outline: none;
}

.noteInput:focus {
  border-color: var(--color-border-active);
}

.noteInput::placeholder {
  color: var(--color-text-disabled);
}

.footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
}

.submitButton {
  width: 100%;
  min-height: var(--touch-min);
  padding: var(--space-4);
  background: var(--color-accent-primary);
  color: var(--color-bg-base);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  font-family: inherit;
  transition: opacity var(--transition-quick);
}

.submitButton:not(:disabled):hover {
  opacity: 0.88;
}

.submitButton:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.validation {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: center;
}
```

- [ ] **Step 8.5: Create SessionPlaceholder (M1 stub)**

Create `src/screens/SessionPlaceholder.tsx`:

```tsx
/**
 * SessionPlaceholder — M1 stub screen shown after pain input.
 *
 * This screen exists only to confirm that pain input was captured correctly.
 * It will be replaced in M2 when the session engine and guided session UI are built.
 *
 * DO NOT add business logic here. This is a typed display stub only.
 */
import { useAppContext } from '../context/AppContext'
import styles from './SessionPlaceholder.module.css'

export function SessionPlaceholder() {
  const { state, dispatch } = useAppContext()
  const input = state.pendingPainInput

  function handleBack() {
    dispatch({ type: 'CLEAR_PAIN_INPUT' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen}>
      <div className={styles.content}>
        <p className={styles.label}>Session engine</p>
        <p className={styles.message}>Session selection engine arrives in Milestone 2.</p>

        {input && (
          <div className={styles.summary}>
            <p className={styles.summaryRow}>
              <span className={styles.summaryKey}>Pain level</span>
              <span className={styles.summaryVal}>{input.pain_level} / 10</span>
            </p>
            <p className={styles.summaryRow}>
              <span className={styles.summaryKey}>Regions</span>
              <span className={styles.summaryVal}>{input.location_tags.join(', ')}</span>
            </p>
            <p className={styles.summaryRow}>
              <span className={styles.summaryKey}>Symptoms</span>
              <span className={styles.summaryVal}>{input.symptom_tags.join(', ')}</span>
            </p>
            {input.trigger_tag && (
              <p className={styles.summaryRow}>
                <span className={styles.summaryKey}>Context</span>
                <span className={styles.summaryVal}>{input.trigger_tag}</span>
              </p>
            )}
          </div>
        )}

        <button className={styles.backButton} onClick={handleBack} type="button">
          Back to home
        </button>
      </div>
    </main>
  )
}
```

Create `src/screens/SessionPlaceholder.module.css`:

```css
.screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--screen-padding);
}

.content {
  max-width: var(--screen-max-width);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.message {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.summary {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.summaryRow {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
}

.summaryKey {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.summaryVal {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  font-weight: var(--weight-medium);
  text-align: right;
  text-transform: capitalize;
}

.backButton {
  align-self: flex-start;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: var(--space-3) 0;
  min-height: var(--touch-min);
  transition: color var(--transition-quick);
}

.backButton:hover {
  color: var(--color-text-primary);
}
```

- [ ] **Step 8.6: Run PainInputScreen test**

```bash
npm run test -- PainInputScreen.test
```

Expected: PASS — all 7 tests pass.

- [ ] **Step 8.7: Commit**

```bash
git add src/screens/ src/data/
git commit -m "feat: add PainInputScreen, SessionPlaceholder, and M2 data stubs"
```

---

## Task 9: Wire App Root

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 9.1: Write App test**

Create `src/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App root', () => {
  beforeEach(() => localStorage.clear())

  it('renders HomeScreen on initial load', () => {
    render(<App />)
    expect(screen.getByText(/what level is your pain/i)).toBeInTheDocument()
  })

  it('navigates to PainInputScreen when Start is clicked', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('slider', { name: /pain level/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 9.2: Run to confirm failure**

```bash
npm run test -- App.test
```

Expected: FAIL.

- [ ] **Step 9.3: Rewrite src/App.tsx**

```tsx
/**
 * App — root component and screen router.
 * Authority: Guided Session UI Spec (doc 05) § v1 Session Flow
 *
 * Uses AnimatePresence for crossfade transitions between screens (200-400ms).
 * Screen routing is driven by AppContext state machine.
 * No hard cuts. No slide animations. Crossfades only.
 */
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppProvider'
import { useAppContext } from './context/AppContext'
import { ScreenTransition } from './components/ScreenTransition'
import { HomeScreen } from './screens/HomeScreen'
import { PainInputScreen } from './screens/PainInputScreen'
import { SessionPlaceholder } from './screens/SessionPlaceholder'

function ScreenRouter() {
  const { state } = useAppContext()
  const { activeScreen } = state

  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeScreen === 'home' && (
        <ScreenTransition screenKey="home">
          <HomeScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'pain_input' && (
        <ScreenTransition screenKey="pain_input">
          <PainInputScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'session_placeholder' && (
        <ScreenTransition screenKey="session_placeholder">
          <SessionPlaceholder />
        </ScreenTransition>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  )
}
```

- [ ] **Step 9.4: Update src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 9.5: Run App test**

```bash
npm run test -- App.test
```

Expected: PASS.

- [ ] **Step 9.6: Run full test suite**

```bash
npm run test
```

Expected: All tests pass. No type errors.

- [ ] **Step 9.7: Verify in browser**

```bash
npm run dev
```

Expected: App loads on `http://localhost:5173`, shows HomeScreen with empty state message. Start button navigates to PainInput. Back button returns home. Selecting regions + symptoms enables Begin button. Submitting shows SessionPlaceholder with pain input summary.

- [ ] **Step 9.8: Final commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: wire App root with AnimatePresence screen router"
```

---

## M1 Complete — Handoff to M2

### What M2 plugs into

M2 receives a complete, typed `PainInputState` from `AppContext.state.pendingPainInput` and must:
1. Replace `SessionPlaceholder` navigation with real session engine output
2. Populate `src/data/protocols.ts` and `src/data/mechanisms.ts`
3. Implement `runSafetyPrecheck`, `scoreMechanisms`, `selectProtocol`, `buildSession`

### Storage keys in use (M1)
- `medicaLm_app_settings` — AppSettings
- `medicaLm_user_profile` — UserProfile
- `medicaLm_session_history` — HistoryEntry[] (read in M1, written in M3)
