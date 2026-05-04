# Visual Body Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 23-chip Location field on `SessionIntakeScreen` with an interactive anatomical body picker (anterior + posterior views) that supports region-level selection plus optional muscle-level precision via a bottom-sheet drawer.

**Architecture:** A new `BodyPicker` component composed of `BodyPickerSVG` (front + back SVG bodies) + `MuscleDrawer` (region → muscle subgroups bottom sheet) + chip list + fallback row. SVG path data is vendored from `vulovix/body-muscles` (Apache-2.0). Drops into the existing `SessionIntakeScreen` where the chip grid currently lives. HARI engine reads `location: BodyLocation[]` exactly as today; muscles are recorded for future use without changing engine pipeline.

**Tech Stack:** React 18 + TypeScript + Vite + CSS Modules + Vitest + Testing Library + Playwright. Design spec: `docs/superpowers/specs/2026-05-04-body-picker-design.md`. Cached source data (verbatim from upstream): `.cache/muscles.front.ts`, `.cache/muscles.back.ts`, `.cache/LICENSE-body-muscles`, `.cache/NOTICE-body-muscles`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/BodyPicker/index.ts` | Barrel export |
| `src/components/BodyPicker/BodyPicker.tsx` | Wrapper component — composes SVG + drawer + chips + fallbacks |
| `src/components/BodyPicker/BodyPicker.module.css` | Wrapper layout + chip + fallback styles |
| `src/components/BodyPicker/BodyPickerSVG.tsx` | Renders one anatomical SVG (front or back) with all muscle paths |
| `src/components/BodyPicker/BodyPickerSVG.module.css` | SVG / region / muscle stroke styles |
| `src/components/BodyPicker/MuscleDrawer.tsx` | Bottom-sheet for muscle subgroups |
| `src/components/BodyPicker/MuscleDrawer.module.css` | Drawer slide/transform styles |
| `src/components/BodyPicker/data/muscles.ts` | 87 muscle path entries (vendored from vulovix) |
| `src/components/BodyPicker/data/regions.ts` | `MUSCLE_TO_REGION` map + `MUSCLES_FOR_REGION` helper |
| `src/components/BodyPicker/data/types.ts` | Internal `MusclePathDef` type |
| `src/components/BodyPicker/data/LICENSE-body-muscles` | Apache-2.0 license text (verbatim) |
| `src/components/BodyPicker/data/NOTICE-body-muscles` | Source notice (verbatim) |
| `src/types/hari.ts` | Add `BodyMuscle` type + extend `HariSessionIntake` with `location_muscles?` |
| `src/types/index.ts` | Re-export `BodyMuscle` |
| `src/screens/SessionIntakeScreen.tsx` | Replace `LOCATION_GROUPS` chip-grid section with `<BodyPicker>` |
| `src/screens/SessionIntakeScreen.test.tsx` | Update tests for new picker integration |
| `src/App.test.tsx` | Update integration helpers to drive body picker |
| `e2e/baseline-capture.spec.ts` | Update intake-fill steps to use body picker |

---

## Task 1: Vendor muscle path data + Apache-2.0 license/notice

**Files:**
- Create: `src/components/BodyPicker/data/types.ts`
- Create: `src/components/BodyPicker/data/muscles.ts`
- Create: `src/components/BodyPicker/data/LICENSE-body-muscles`
- Create: `src/components/BodyPicker/data/NOTICE-body-muscles`
- Test: `src/components/BodyPicker/data/muscles.test.ts`

The muscle paths and license text are already cached in `.cache/`. This task transcribes them into the project source tree with the BodyMuscle naming convention (snake_case ids that match the design spec).

- [ ] **Step 1: Write the failing test**

Path: `src/components/BodyPicker/data/muscles.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { MUSCLE_PATHS } from './muscles'

describe('MUSCLE_PATHS — vendored from vulovix/body-muscles', () => {
  it('contains 87 entries (40 front + 47 back)', () => {
    expect(MUSCLE_PATHS.length).toBe(87)
    expect(MUSCLE_PATHS.filter(m => m.view === 'front').length).toBe(40)
    expect(MUSCLE_PATHS.filter(m => m.view === 'back').length).toBe(47)
  })

  it('every entry has a non-empty path string', () => {
    for (const m of MUSCLE_PATHS) {
      expect(m.path.length).toBeGreaterThan(10)
    }
  })

  it('every id is unique', () => {
    const ids = new Set(MUSCLE_PATHS.map(m => m.id))
    expect(ids.size).toBe(MUSCLE_PATHS.length)
  })

  it('every entry has a non-empty human-readable name', () => {
    for (const m of MUSCLE_PATHS) {
      expect(m.name.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/components/BodyPicker/data/muscles.test.ts`
Expected: FAIL with "Cannot find module './muscles'".

- [ ] **Step 3: Create the types file**

Path: `src/components/BodyPicker/data/types.ts`

```ts
import type { BodyLocation, BodyMuscle } from '../../../types/hari'

export interface MusclePathDef {
  id: BodyMuscle
  name: string
  view: 'front' | 'back'
  region: BodyLocation
  /** Verbatim SVG path d-attribute from upstream source */
  path: string
}
```

- [ ] **Step 4: Create the muscles data file**

Path: `src/components/BodyPicker/data/muscles.ts`

The path data is already correctly assembled in the mockup at `docs/superpowers/specs/2026-05-04-body-picker-mockups.html` inside the `FRONT_MUSCLES` and `BACK_MUSCLES` JS arrays. Copy those arrays verbatim into this TS file with the following transformations:

1. Wrap as a single `MUSCLE_PATHS: MusclePathDef[]` exported constant
2. Convert kebab-case ids to snake_case to match `BodyMuscle` type:
   - `head` → `head_front`
   - `face` → `face_front`
   - `neck-left` → `neck_left`
   - `shoulder-front-left` → `shoulder_front_left`
   - `knee-left` → `knee_front_left` (front) / keep `knee_back_left` for back
   - `foot-left` → `foot_front_left` (front) / keep `foot_back_left` for back
   - `hand-left` → `hand_front_left` (front) / keep `hand_back_left` for back
   - All other ids: replace hyphens with underscores
3. Add `view: 'front'` (FRONT block) or `view: 'back'` (BACK block)
4. Keep `region` field as-is from the mockup
5. Add the attribution header comment shown below

```ts
/*
 * Anatomical SVG path data adapted from:
 *   vulovix/body-muscles · https://github.com/vulovix/body-muscles
 *   Copyright 2024 Ivan Vulović
 *   Licensed under the Apache License, Version 2.0
 *
 * Modifications from source:
 *   - id values renamed to mediCalm BodyMuscle convention (snake_case)
 *     and front/back qualifier added to disambiguate knee, foot, hand
 *   - region key added (mediCalm BodyLocation)
 *   - File converted to MUSCLE_PATHS named export with MusclePathDef shape
 *
 * Path geometry is verbatim. Apache-2.0 LICENSE and NOTICE files preserved
 * alongside this file at LICENSE-body-muscles, NOTICE-body-muscles.
 */
import type { MusclePathDef } from './types'

export const MUSCLE_PATHS: MusclePathDef[] = [
  // Front (40)
  { id: 'head_front', name: 'Head', view: 'front', region: 'head_temples',
    path: 'm 11.671635,6.3585449 -0.0482,-2.59085 4.20648,-2.46806 4.42769,2.95361 -0.0405,1.94408 0.24197,-3.34467 -2.03129,-2.31103004 -2.84508,-0.51629 -2.20423,0.52915 -1.9363,2.63077004 z' },
  { id: 'face_front', name: 'Face', view: 'front', region: 'jaw_tmj_facial',
    path: 'm 19.748825,6.7034949 0.0203,-2.20747 -3.96689,-2.7637 -3.74099,2.23559 -0.006,2.63528 -0.60741,0.0403 0.27408,1.82447 0.97635,0.33932 0.44244,2.1802901 1.82222,2.06556 2.03518,-0.0607 1.79223,-1.94408 0.35957,-2.2406601 0.97616,-0.33932 0.25159,-1.78416 z' },
  // ... continue for all remaining 38 front entries from mockup ...
  // Back (47)
  { id: 'head_back', name: 'Head (Back)', view: 'back', region: 'head_temples',
    path: 'm 48.157455,6.3585449 0.44208,-0.14964 0.16111,0.16427 1.48163,4.0475101 2.32401,1.45118 2.39971,-1.52387 0.97577,-3.6896901 0.52752,-0.55908 0.23367,0.0981 0.24198,-3.34467 -2.03129,-2.31103004 -2.84509,-0.51629 -2.20422,0.52915 -1.93631,2.63077004 z' },
  // ... continue for all remaining 46 back entries from mockup ...
]
```

The complete copy-and-rename source is in the mockup file. The implementer should not retype paths by hand — open the mockup, copy the FRONT_MUSCLES and BACK_MUSCLES arrays, then apply the id renaming with a single regex find/replace per id pattern.

- [ ] **Step 5: Copy LICENSE and NOTICE files**

The full text is already cached. Run:

```bash
cp .cache/LICENSE-body-muscles src/components/BodyPicker/data/LICENSE-body-muscles
cp .cache/NOTICE-body-muscles src/components/BodyPicker/data/NOTICE-body-muscles
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- --run src/components/BodyPicker/data/muscles.test.ts`
Expected: PASS, all 4 cases green.

- [ ] **Step 7: Commit**

```bash
git add src/components/BodyPicker/data/
git commit -m "feat(body-picker): vendor 87 muscle paths from vulovix/body-muscles (Apache-2.0)"
```

---

## Task 2: BodyMuscle type, type exports, and MUSCLE_TO_REGION map

**Files:**
- Modify: `src/types/hari.ts`
- Modify: `src/types/index.ts`
- Create: `src/components/BodyPicker/data/regions.ts`
- Test: `src/components/BodyPicker/data/regions.test.ts`

- [ ] **Step 1: Write the failing test**

Path: `src/components/BodyPicker/data/regions.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { MUSCLE_TO_REGION, musclesForRegion } from './regions'
import { MUSCLE_PATHS } from './muscles'

describe('MUSCLE_TO_REGION', () => {
  it('every muscle in MUSCLE_PATHS appears in MUSCLE_TO_REGION', () => {
    for (const m of MUSCLE_PATHS) {
      expect(MUSCLE_TO_REGION[m.id]).toBeDefined()
    }
  })

  it('every entry in MUSCLE_TO_REGION matches the muscles.ts region', () => {
    for (const m of MUSCLE_PATHS) {
      expect(MUSCLE_TO_REGION[m.id]).toBe(m.region)
    }
  })
})

describe('musclesForRegion', () => {
  it('returns all muscles whose region matches', () => {
    const shoulderL = musclesForRegion('shoulder_left')
    expect(shoulderL.length).toBeGreaterThan(0)
    expect(shoulderL.every(m => m.region === 'shoulder_left')).toBe(true)
  })

  it('returns empty array for region with no muscles (e.g. fallback)', () => {
    expect(musclesForRegion('whole_body')).toEqual([])
  })

  it('shoulder_left aggregates anterior + posterior (front shoulder + traps + rear delt)', () => {
    const ids = musclesForRegion('shoulder_left').map(m => m.id)
    expect(ids).toContain('shoulder_front_left')
    expect(ids).toContain('shoulder_side_left')
    expect(ids).toContain('traps_upper_left')
    expect(ids).toContain('deltoid_rear_left')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/components/BodyPicker/data/regions.test.ts`
Expected: FAIL with "Cannot find module './regions'".

- [ ] **Step 3: Add `BodyMuscle` to `src/types/hari.ts`**

Insert after the `BodyLocation` definition (around line 60):

```ts
/**
 * BodyMuscle — anatomical muscle subgroup beneath a BodyLocation region.
 * Source path data: vulovix/body-muscles (Apache-2.0).
 * Each muscle's parent region is encoded in MUSCLE_TO_REGION at
 * src/components/BodyPicker/data/regions.ts.
 */
export type BodyMuscle =
  // Front (40)
  | 'head_front' | 'face_front'
  | 'neck_left' | 'neck_right'
  | 'shoulder_front_left' | 'shoulder_side_left'
  | 'shoulder_front_right' | 'shoulder_side_right'
  | 'biceps_left' | 'forearm_left' | 'elbow_left'
  | 'biceps_right' | 'forearm_right' | 'elbow_right'
  | 'chest_upper_left' | 'chest_lower_left'
  | 'chest_upper_right' | 'chest_lower_right'
  | 'abs_upper_left' | 'abs_lower_left'
  | 'abs_upper_right' | 'abs_lower_right'
  | 'serratus_anterior_left' | 'serratus_anterior_right'
  | 'obliques_left' | 'obliques_right'
  | 'hip_flexor_left' | 'hip_flexor_right'
  | 'adductors_left' | 'adductors_right'
  | 'quads_left' | 'quads_right'
  | 'tibialis_anterior_left' | 'tibialis_anterior_right'
  | 'knee_front_left' | 'knee_front_right'
  | 'foot_front_left' | 'foot_front_right'
  | 'hand_front_left' | 'hand_front_right'
  // Back (47)
  | 'head_back' | 'nape'
  | 'traps_upper_left' | 'traps_mid_left' | 'traps_lower_left'
  | 'traps_upper_right' | 'traps_mid_right' | 'traps_lower_right'
  | 'lats_upper_left' | 'lats_mid_left' | 'lats_lower_left'
  | 'lats_upper_right' | 'lats_mid_right' | 'lats_lower_right'
  | 'deltoid_rear_left' | 'deltoid_rear_right'
  | 'triceps_long_left' | 'triceps_lateral_left'
  | 'triceps_long_right' | 'triceps_lateral_right'
  | 'forearm_flexors_left' | 'forearm_extensors_left'
  | 'forearm_flexors_right' | 'forearm_extensors_right'
  | 'spine'
  | 'lower_back_erectors_left' | 'lower_back_ql_left'
  | 'lower_back_erectors_right' | 'lower_back_ql_right'
  | 'gluteus_medius_left' | 'gluteus_maximus_left'
  | 'gluteus_medius_right' | 'gluteus_maximus_right'
  | 'hamstrings_medial_left' | 'hamstrings_lateral_left'
  | 'hamstrings_medial_right' | 'hamstrings_lateral_right'
  | 'calves_gastroc_medial_left' | 'calves_gastroc_lateral_left' | 'calves_soleus_left'
  | 'calves_gastroc_medial_right' | 'calves_gastroc_lateral_right' | 'calves_soleus_right'
  | 'knee_back_left' | 'knee_back_right'
  | 'foot_back_left' | 'foot_back_right'
  | 'hand_back_left' | 'hand_back_right'
```

- [ ] **Step 4: Extend `HariSessionIntake` with `location_muscles`**

In `src/types/hari.ts`, in the `HariSessionIntake` interface, add the new optional field directly under `location: BodyLocation[]`:

```ts
  /** Restored 2026-05-04 — multi-select anatomical regions. */
  location: BodyLocation[]
  /**
   * Muscle-level detail when user opens the body-picker drawer.
   * Always rolls up to entries in `location[]` — every muscle's parent
   * region is also present in location[]. Engine ignores this field today;
   * captured for future M7+ adaptation.
   */
  location_muscles?: BodyMuscle[]
```

- [ ] **Step 5: Re-export `BodyMuscle` from `src/types/index.ts`**

Find the line `BodyLocation,` (added in commit 473a6f7) and add `BodyMuscle,` directly under it:

```ts
  BodyLocation,
  BodyMuscle,
```

- [ ] **Step 6: Create the regions map**

Path: `src/components/BodyPicker/data/regions.ts`

```ts
import type { BodyLocation, BodyMuscle } from '../../../types/hari'
import { MUSCLE_PATHS } from './muscles'
import type { MusclePathDef } from './types'

/**
 * Maps every BodyMuscle to its parent BodyLocation region.
 * Auto-derived from MUSCLE_PATHS — kept as an explicit Record for
 * TypeScript exhaustiveness checking when consumers add or rename muscles.
 */
export const MUSCLE_TO_REGION: Record<BodyMuscle, BodyLocation> =
  Object.fromEntries(
    MUSCLE_PATHS.map(m => [m.id, m.region])
  ) as Record<BodyMuscle, BodyLocation>

/** Returns all muscle defs whose parent region is `region`. */
export function musclesForRegion(region: BodyLocation): MusclePathDef[] {
  return MUSCLE_PATHS.filter(m => m.region === region)
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- --run src/components/BodyPicker/data/regions.test.ts src/components/BodyPicker/data/muscles.test.ts`
Expected: PASS, 7 cases total.

- [ ] **Step 8: Run the full vitest suite to verify nothing else broke**

Run: `npm test -- --run`
Expected: 250+ tests pass (existing 248 + 7 new). No regressions.

- [ ] **Step 9: Commit**

```bash
git add src/types/hari.ts src/types/index.ts src/components/BodyPicker/data/regions.ts src/components/BodyPicker/data/regions.test.ts
git commit -m "feat(body-picker): BodyMuscle type + MUSCLE_TO_REGION map"
```

---

## Task 3: BodyPickerSVG component (render-only, no interaction)

**Files:**
- Create: `src/components/BodyPicker/BodyPickerSVG.tsx`
- Create: `src/components/BodyPicker/BodyPickerSVG.module.css`
- Test: `src/components/BodyPicker/BodyPickerSVG.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `src/components/BodyPicker/BodyPickerSVG.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BodyPickerSVG } from './BodyPickerSVG'

describe('BodyPickerSVG', () => {
  it('front view renders 40 muscle paths', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(40)
  })

  it('back view renders 47 muscle paths', () => {
    const { container } = render(
      <BodyPickerSVG side="back" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(47)
  })

  it('paths are grouped under <g class="region"> per BodyLocation', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const groups = container.querySelectorAll('g[data-region]')
    expect(groups.length).toBeGreaterThan(0)
    // Every group should have at least one path child
    groups.forEach(g => {
      expect(g.querySelectorAll('path').length).toBeGreaterThan(0)
    })
  })

  it('selected regions get a .selected class on their <g>', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={['shoulder_left']} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')
    expect(shoulderGroup?.className.baseVal).toMatch(/selected/)
  })

  it('selecting a muscle marks its parent region as selected via class', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={['shoulder_front_left']} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')
    expect(shoulderGroup?.className.baseVal).toMatch(/selected/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/components/BodyPicker/BodyPickerSVG.test.tsx`
Expected: FAIL with "Cannot find module './BodyPickerSVG'".

- [ ] **Step 3: Create the component**

Path: `src/components/BodyPicker/BodyPickerSVG.tsx`

```tsx
import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { MUSCLE_PATHS } from './data/muscles'
import { MUSCLE_TO_REGION } from './data/regions'
import styles from './BodyPickerSVG.module.css'

interface BodyPickerSVGProps {
  side: 'front' | 'back'
  selectedRegions: BodyLocation[]
  selectedMuscles: BodyMuscle[]
  onRegionTap: (region: BodyLocation) => void
  onRegionHover: (region: BodyLocation | null) => void
}

const VIEW_BOX_FRONT = '0 0 35 93'
const VIEW_BOX_BACK = '37 0 35 93'

export function BodyPickerSVG({
  side, selectedRegions, selectedMuscles, onRegionTap, onRegionHover,
}: BodyPickerSVGProps) {
  // Filter to this side, then group by region
  const muscles = MUSCLE_PATHS.filter(m => m.view === side)
  const regions = new Map<BodyLocation, typeof muscles>()
  for (const m of muscles) {
    if (!regions.has(m.region)) regions.set(m.region, [])
    regions.get(m.region)!.push(m)
  }

  const selectedRegionSet = new Set(selectedRegions)
  const muscleParents = new Set(selectedMuscles.map(id => MUSCLE_TO_REGION[id]))

  return (
    <svg
      className={styles.body}
      viewBox={side === 'front' ? VIEW_BOX_FRONT : VIEW_BOX_BACK}
      role="img"
      aria-label={`${side === 'front' ? 'Anterior' : 'Posterior'} body picker`}
    >
      {[...regions.entries()].map(([region, list]) => {
        const isSelected = selectedRegionSet.has(region) || muscleParents.has(region)
        return (
          <g
            key={region}
            data-region={region}
            className={`${styles.region}${isSelected ? ' ' + styles.selected : ''}`}
            onClick={() => onRegionTap(region)}
            onMouseEnter={() => onRegionHover(region)}
            onMouseLeave={() => onRegionHover(null)}
          >
            {list.map(m => (
              <path key={m.id} d={m.path} data-muscle={m.id} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 4: Create the styles**

Path: `src/components/BodyPicker/BodyPickerSVG.module.css`

```css
.body {
  width: 100%;
  max-width: 175px;
  height: 380px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.region {
  cursor: pointer;
}

.region path {
  fill: rgba(255, 255, 255, 0.02);
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 0.18;
  stroke-linejoin: round;
  transition: fill var(--transition-quick),
              stroke var(--transition-quick),
              stroke-width var(--transition-quick);
}

.region:hover path {
  fill: rgba(26, 138, 138, 0.20);
  stroke: rgba(74, 210, 210, 0.70);
  stroke-width: 0.22;
}

.region.selected path {
  fill: rgba(26, 138, 138, 0.55);
  stroke: rgba(74, 210, 210, 0.95);
  stroke-width: 0.25;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- --run src/components/BodyPicker/BodyPickerSVG.test.tsx`
Expected: PASS, 5 cases.

- [ ] **Step 6: Commit**

```bash
git add src/components/BodyPicker/BodyPickerSVG.tsx src/components/BodyPicker/BodyPickerSVG.module.css src/components/BodyPicker/BodyPickerSVG.test.tsx
git commit -m "feat(body-picker): BodyPickerSVG renders front/back anatomy with region selection"
```

---

## Task 4: Confirm interaction wiring + accessibility

The interaction props (`onRegionTap`, `onRegionHover`) were already wired in Task 3. This task locks them in with explicit interaction tests and adds keyboard/aria affordances.

**Files:**
- Modify: `src/components/BodyPicker/BodyPickerSVG.tsx`
- Modify: `src/components/BodyPicker/BodyPickerSVG.test.tsx`

- [ ] **Step 1: Add the interaction test**

Append to `src/components/BodyPicker/BodyPickerSVG.test.tsx`:

```tsx
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

describe('BodyPickerSVG — interactions', () => {
  it('clicking a region <g> fires onRegionTap with the region id', async () => {
    const onTap = vi.fn()
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={onTap} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')!
    await userEvent.click(shoulderGroup)
    expect(onTap).toHaveBeenCalledWith('shoulder_left')
  })

  it('mouse-enter / mouse-leave fires onRegionHover', async () => {
    const onHover = vi.fn()
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={onHover} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')!
    await userEvent.hover(shoulderGroup)
    expect(onHover).toHaveBeenLastCalledWith('shoulder_left')
    await userEvent.unhover(shoulderGroup)
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  it('region <g> has role="button" and tabindex="0" for keyboard access', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const groups = container.querySelectorAll('g[data-region]')
    groups.forEach(g => {
      expect(g.getAttribute('role')).toBe('button')
      expect(g.getAttribute('tabindex')).toBe('0')
    })
  })

  it('Enter or Space on a region group fires onRegionTap', async () => {
    const onTap = vi.fn()
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={onTap} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]') as HTMLElement
    shoulderGroup.focus()
    await userEvent.keyboard('{Enter}')
    expect(onTap).toHaveBeenCalledWith('shoulder_left')
    onTap.mockClear()
    await userEvent.keyboard(' ')
    expect(onTap).toHaveBeenCalledWith('shoulder_left')
  })
})
```

- [ ] **Step 2: Run the test to verify the keyboard cases fail**

Run: `npm test -- --run src/components/BodyPicker/BodyPickerSVG.test.tsx`
Expected: 5 cases pass (from Task 3) + 2 new cases pass (click + hover) + 2 new cases FAIL (role/tabindex + keyboard).

- [ ] **Step 3: Add role + tabindex + keyboard handler**

In `src/components/BodyPicker/BodyPickerSVG.tsx`, update the `<g>` element to:

```tsx
<g
  key={region}
  data-region={region}
  role="button"
  tabIndex={0}
  aria-label={`Body region: ${region}`}
  className={`${styles.region}${isSelected ? ' ' + styles.selected : ''}`}
  onClick={() => onRegionTap(region)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onRegionTap(region)
    }
  }}
  onMouseEnter={() => onRegionHover(region)}
  onMouseLeave={() => onRegionHover(null)}
>
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npm test -- --run src/components/BodyPicker/BodyPickerSVG.test.tsx`
Expected: PASS, 9 cases total.

- [ ] **Step 5: Commit**

```bash
git add src/components/BodyPicker/BodyPickerSVG.tsx src/components/BodyPicker/BodyPickerSVG.test.tsx
git commit -m "feat(body-picker): keyboard interaction + ARIA on body regions"
```

---

## Task 5: MuscleDrawer component

**Files:**
- Create: `src/components/BodyPicker/MuscleDrawer.tsx`
- Create: `src/components/BodyPicker/MuscleDrawer.module.css`
- Test: `src/components/BodyPicker/MuscleDrawer.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `src/components/BodyPicker/MuscleDrawer.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MuscleDrawer } from './MuscleDrawer'

describe('MuscleDrawer', () => {
  it('is hidden when region is null (no .open class)', () => {
    const { container } = render(
      <MuscleDrawer region={null} selectedMuscles={[]} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).not.toMatch(/open/)
  })

  it('opens with .open class when region is set', () => {
    const { container } = render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).toMatch(/open/)
  })

  it('renders one chip per muscle in that region', () => {
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    expect(screen.getByRole('button', { name: /left shoulder \(front\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /left shoulder \(side\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /left trapezius \(upper\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /left rear deltoid/i })).toBeInTheDocument()
  })

  it('selected muscle chips have .selected class', () => {
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={['shoulder_front_left']} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    const btn = screen.getByRole('button', { name: /left shoulder \(front\)/i })
    expect(btn.className).toMatch(/selected/)
  })

  it('clicking a muscle chip fires onToggleMuscle', async () => {
    const onToggle = vi.fn()
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={onToggle} onClose={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(front\)/i }))
    expect(onToggle).toHaveBeenCalledWith('shoulder_front_left')
  })

  it('clicking the close button fires onClose', async () => {
    const onClose = vi.fn()
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={() => {}} onClose={onClose} />
    )
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/components/BodyPicker/MuscleDrawer.test.tsx`
Expected: FAIL with "Cannot find module './MuscleDrawer'".

- [ ] **Step 3: Create the component**

Path: `src/components/BodyPicker/MuscleDrawer.tsx`

```tsx
import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { musclesForRegion } from './data/regions'
import styles from './MuscleDrawer.module.css'

const REGION_LABELS: Record<string, string> = {
  head_temples: 'Head / temples',
  jaw_tmj_facial: 'Jaw / TMJ / facial',
  neck: 'Neck',
  shoulder_left: 'Shoulder (L)',
  shoulder_right: 'Shoulder (R)',
  chest_sternum: 'Chest / sternum',
  rib_side: 'Rib / side',
  hip_pelvis: 'Hip / pelvis',
  elbow_forearm_left: 'Elbow / forearm (L)',
  elbow_forearm_right: 'Elbow / forearm (R)',
  wrist_hand_left: 'Wrist / hand (L)',
  wrist_hand_right: 'Wrist / hand (R)',
  thigh_left: 'Thigh (L)',
  thigh_right: 'Thigh (R)',
  knee_left: 'Knee (L)',
  knee_right: 'Knee (R)',
  calf_shin_left: 'Calf / shin (L)',
  calf_shin_right: 'Calf / shin (R)',
  ankle_foot_left: 'Ankle / foot (L)',
  ankle_foot_right: 'Ankle / foot (R)',
  upper_back: 'Upper back',
  mid_back: 'Mid back',
  lower_back: 'Lower back',
  glute: 'Glute',
}

interface MuscleDrawerProps {
  region: BodyLocation | null
  selectedMuscles: BodyMuscle[]
  onToggleMuscle: (muscle: BodyMuscle) => void
  onClose: () => void
}

export function MuscleDrawer({ region, selectedMuscles, onToggleMuscle, onClose }: MuscleDrawerProps) {
  const isOpen = region !== null
  const muscles = region ? musclesForRegion(region) : []
  const selectedSet = new Set(selectedMuscles)

  return (
    <div
      data-testid="muscle-drawer"
      className={`${styles.drawer}${isOpen ? ' ' + styles.open : ''}`}
      aria-hidden={!isOpen}
    >
      <header className={styles.header}>
        <div>
          <div className={styles.label}>Muscle group</div>
          <div className={styles.region}>{region ? REGION_LABELS[region] ?? region : '—'}</div>
          <div className={styles.hint}>Tap one or more, or close to keep just the region.</div>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close drawer"
        >
          ✕
        </button>
      </header>

      <div className={styles.grid}>
        {muscles.map(m => (
          <button
            key={m.id}
            type="button"
            className={`${styles.muscleChip}${selectedSet.has(m.id) ? ' ' + styles.selected : ''}`}
            onClick={() => onToggleMuscle(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create the styles**

Path: `src/components/BodyPicker/MuscleDrawer.module.css`

```css
.drawer {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg, #0a232b 0%, #061821 100%);
  border-top: 1px solid var(--color-accent-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-4) var(--space-4) var(--space-5);
  transform: translateY(100%);
  transition: transform 0.28s ease;
  z-index: 10;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.45);
  max-height: 70%;
  overflow-y: auto;
}

.drawer.open { transform: translateY(0); }

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.label {
  font-size: var(--text-xs);
  color: var(--color-accent-bright, var(--color-accent-primary));
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.region {
  font-size: var(--text-lg);
  font-weight: var(--weight-light);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-3);
}

.close {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: 18px;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  line-height: 1;
}

.close:hover { color: var(--color-text-primary); }

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.muscleChip {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-quick);
}

.muscleChip:hover {
  background: var(--color-bg-card-hover);
  border-color: var(--color-border-active);
}

.muscleChip.selected {
  background: var(--color-accent-subtle);
  border-color: var(--color-accent-border);
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- --run src/components/BodyPicker/MuscleDrawer.test.tsx`
Expected: PASS, 6 cases.

- [ ] **Step 6: Commit**

```bash
git add src/components/BodyPicker/MuscleDrawer.tsx src/components/BodyPicker/MuscleDrawer.module.css src/components/BodyPicker/MuscleDrawer.test.tsx
git commit -m "feat(body-picker): MuscleDrawer bottom sheet for muscle subgroups"
```

---

## Task 6: BodyPicker wrapper component

**Files:**
- Create: `src/components/BodyPicker/BodyPicker.tsx`
- Create: `src/components/BodyPicker/BodyPicker.module.css`
- Create: `src/components/BodyPicker/index.ts`
- Test: `src/components/BodyPicker/BodyPicker.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `src/components/BodyPicker/BodyPicker.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BodyPicker } from './BodyPicker'

describe('BodyPicker — basic structure', () => {
  it('renders both anterior and posterior body SVGs', () => {
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={() => {}} />
    )
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(2)
    expect(svgs[0].getAttribute('aria-label')).toMatch(/anterior/i)
    expect(svgs[1].getAttribute('aria-label')).toMatch(/posterior/i)
  })

  it('renders three fallback buttons: Spread / Whole body / Not sure', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={() => {}} />
    )
    expect(screen.getByRole('button', { name: /spread \/ multiple/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /whole body/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^not sure$/i })).toBeInTheDocument()
  })

  it('shows empty hint when nothing is selected', () => {
    render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={() => {}} />
    )
    expect(screen.getByText(/none yet — tap a region above/i)).toBeInTheDocument()
  })
})

describe('BodyPicker — region tap', () => {
  it('tapping a region with multiple muscles opens the drawer', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).not.toMatch(/open/)
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')!
    await userEvent.click(shoulderGroup)
    expect(drawer.className).toMatch(/open/)
  })

  it('tapping a region with a single muscle auto-tags the region (no drawer)', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    // ankle_foot_left has only one path on each side; counts as single-region select
    const ankleGroup = container.querySelector('g[data-region="ankle_foot_left"]')!
    await userEvent.click(ankleGroup)
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).not.toMatch(/open/)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      regions: ['ankle_foot_left'],
      muscles: [],
    }))
  })
})

describe('BodyPicker — muscle pick', () => {
  it('selecting a muscle in the drawer adds the muscle AND its parent region', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(front\)/i }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      regions: expect.arrayContaining(['shoulder_left']),
      muscles: ['shoulder_front_left'],
    }))
  })
})

describe('BodyPicker — drawer close', () => {
  it('closing drawer with no muscles picked tags the region itself', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      regions: ['shoulder_left'],
      muscles: [],
    }))
  })

  it('closing drawer after picking a muscle keeps the muscle (region inferred)', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <BodyPicker selectedRegions={[]} selectedMuscles={[]} fallback={null} onChange={onChange} />
    )
    await userEvent.click(container.querySelector('g[data-region="shoulder_left"]')!)
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(side\)/i }))
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(last.muscles).toEqual(['shoulder_side_left'])
    expect(last.regions).toEqual(['shoulder_left'])
  })
})

describe('BodyPicker — fallbacks', () => {
  it('tapping a fallback clears regions and muscles', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker selectedRegions={['shoulder_left']} selectedMuscles={['shoulder_front_left']} fallback={null} onChange={onChange} />
    )
    await userEvent.click(screen.getByRole('button', { name: /whole body/i }))
    expect(onChange).toHaveBeenCalledWith({
      regions: [],
      muscles: [],
      fallback: 'whole_body',
    })
  })
})

describe('BodyPicker — chip removal', () => {
  it('removing a region chip also removes child muscles', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker selectedRegions={['shoulder_left']} selectedMuscles={['shoulder_front_left', 'shoulder_side_left']} fallback={null} onChange={onChange} />
    )
    const chip = screen.getByText(/shoulder \(l\)/i).closest('button, span')!
    await userEvent.click(chip)
    expect(onChange).toHaveBeenCalledWith({
      regions: [],
      muscles: [],
      fallback: null,
    })
  })

  it('removing a muscle chip leaves parent region alone', async () => {
    const onChange = vi.fn()
    render(
      <BodyPicker selectedRegions={['shoulder_left']} selectedMuscles={['shoulder_front_left']} fallback={null} onChange={onChange} />
    )
    const chip = screen.getByText(/left shoulder \(front\)/i).closest('button, span')!
    await userEvent.click(chip)
    expect(onChange).toHaveBeenCalledWith({
      regions: ['shoulder_left'],
      muscles: [],
      fallback: null,
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/components/BodyPicker/BodyPicker.test.tsx`
Expected: FAIL with "Cannot find module './BodyPicker'".

- [ ] **Step 3: Create the wrapper component**

Path: `src/components/BodyPicker/BodyPicker.tsx`

```tsx
import { useState } from 'react'
import type { BodyLocation, BodyMuscle } from '../../types/hari'
import { BodyPickerSVG } from './BodyPickerSVG'
import { MuscleDrawer } from './MuscleDrawer'
import { MUSCLE_PATHS } from './data/muscles'
import { MUSCLE_TO_REGION, musclesForRegion } from './data/regions'
import styles from './BodyPicker.module.css'

const MUSCLE_LABELS: Record<string, string> = Object.fromEntries(
  MUSCLE_PATHS.map(m => [m.id, m.name])
)

export type FallbackId = 'spread_multiple' | 'whole_body' | 'not_sure'

export interface BodyPickerSelection {
  regions: BodyLocation[]
  muscles: BodyMuscle[]
  fallback: FallbackId | null
}

interface BodyPickerProps {
  selectedRegions: BodyLocation[]
  selectedMuscles: BodyMuscle[]
  fallback: FallbackId | null
  onChange: (next: BodyPickerSelection) => void
}

const FALLBACK_OPTIONS: { id: FallbackId; label: string }[] = [
  { id: 'spread_multiple', label: 'Spread / multiple' },
  { id: 'whole_body', label: 'Whole body' },
  { id: 'not_sure', label: 'Not sure' },
]

const REGION_LABELS: Record<string, string> = {
  head_temples: 'Head / temples', jaw_tmj_facial: 'Jaw / TMJ / facial', neck: 'Neck',
  shoulder_left: 'Shoulder (L)', shoulder_right: 'Shoulder (R)',
  chest_sternum: 'Chest / sternum', rib_side: 'Rib / side', hip_pelvis: 'Hip / pelvis',
  elbow_forearm_left: 'Elbow / forearm (L)', elbow_forearm_right: 'Elbow / forearm (R)',
  wrist_hand_left: 'Wrist / hand (L)', wrist_hand_right: 'Wrist / hand (R)',
  thigh_left: 'Thigh (L)', thigh_right: 'Thigh (R)',
  knee_left: 'Knee (L)', knee_right: 'Knee (R)',
  calf_shin_left: 'Calf / shin (L)', calf_shin_right: 'Calf / shin (R)',
  ankle_foot_left: 'Ankle / foot (L)', ankle_foot_right: 'Ankle / foot (R)',
  upper_back: 'Upper back', mid_back: 'Mid back', lower_back: 'Lower back', glute: 'Glute',
  spread_multiple: 'Spread / multiple', whole_body: 'Whole body', not_sure: 'Not sure',
}

export function BodyPicker({
  selectedRegions, selectedMuscles, fallback, onChange,
}: BodyPickerProps) {
  const [drawerRegion, setDrawerRegion] = useState<BodyLocation | null>(null)

  function emit(next: BodyPickerSelection) {
    onChange(next)
  }

  function handleRegionTap(region: BodyLocation) {
    // If a fallback was active, clear it
    if (fallback) emit({ regions: selectedRegions, muscles: selectedMuscles, fallback: null })

    const muscles = musclesForRegion(region)
    if (muscles.length <= 1) {
      // Single-muscle region — auto-tag without drawer
      const next = selectedRegions.includes(region)
        ? selectedRegions.filter(r => r !== region)
        : [...selectedRegions, region]
      const nextMuscles = selectedRegions.includes(region)
        ? selectedMuscles.filter(m => MUSCLE_TO_REGION[m] !== region)
        : selectedMuscles
      emit({ regions: next, muscles: nextMuscles, fallback: null })
      return
    }
    setDrawerRegion(region)
  }

  function handleToggleMuscle(muscle: BodyMuscle) {
    const region = MUSCLE_TO_REGION[muscle]
    const isSelected = selectedMuscles.includes(muscle)
    const nextMuscles = isSelected
      ? selectedMuscles.filter(m => m !== muscle)
      : [...selectedMuscles, muscle]
    const nextRegions = !isSelected && !selectedRegions.includes(region)
      ? [...selectedRegions, region]
      : selectedRegions
    emit({ regions: nextRegions, muscles: nextMuscles, fallback: null })
  }

  function handleDrawerClose() {
    if (drawerRegion) {
      const anyForRegion = selectedMuscles.some(m => MUSCLE_TO_REGION[m] === drawerRegion)
      if (!anyForRegion && !selectedRegions.includes(drawerRegion)) {
        emit({ regions: [...selectedRegions, drawerRegion], muscles: selectedMuscles, fallback: null })
      }
    }
    setDrawerRegion(null)
  }

  function handleFallback(id: FallbackId) {
    if (fallback === id) {
      emit({ regions: selectedRegions, muscles: selectedMuscles, fallback: null })
    } else {
      emit({ regions: [], muscles: [], fallback: id })
    }
  }

  function handleRemoveRegion(region: BodyLocation) {
    emit({
      regions: selectedRegions.filter(r => r !== region),
      muscles: selectedMuscles.filter(m => MUSCLE_TO_REGION[m] !== region),
      fallback,
    })
  }

  function handleRemoveMuscle(muscle: BodyMuscle) {
    emit({
      regions: selectedRegions,
      muscles: selectedMuscles.filter(m => m !== muscle),
      fallback,
    })
  }

  function muscleLabel(muscle: BodyMuscle): string {
    return MUSCLE_LABELS[muscle] ?? muscle
  }

  const totalSelected = selectedRegions.length + selectedMuscles.length + (fallback ? 1 : 0)

  return (
    <div className={styles.picker}>
      <div className={styles.stage}>
        <div className={styles.bodyWrap}>
          <span className={styles.bodyLabel}>Front</span>
          <BodyPickerSVG
            side="front"
            selectedRegions={selectedRegions}
            selectedMuscles={selectedMuscles}
            onRegionTap={handleRegionTap}
            onRegionHover={() => {}}
          />
        </div>
        <div className={styles.bodyWrap}>
          <span className={styles.bodyLabel}>Back</span>
          <BodyPickerSVG
            side="back"
            selectedRegions={selectedRegions}
            selectedMuscles={selectedMuscles}
            onRegionTap={handleRegionTap}
            onRegionHover={() => {}}
          />
        </div>

        <MuscleDrawer
          region={drawerRegion}
          selectedMuscles={selectedMuscles}
          onToggleMuscle={handleToggleMuscle}
          onClose={handleDrawerClose}
        />
      </div>

      <div className={styles.selectedCard}>
        <span className={styles.selectedLabel}>Selected</span>
        <div className={styles.chipRow}>
          {totalSelected === 0 && (
            <span className={styles.empty}>None yet — tap a region above</span>
          )}
          {selectedRegions.map(r => (
            <button
              key={`r:${r}`}
              type="button"
              className={styles.chip}
              onClick={() => handleRemoveRegion(r)}
            >
              {REGION_LABELS[r] ?? r}<span className={styles.chipX}>✕</span>
            </button>
          ))}
          {selectedMuscles.map(m => (
            <button
              key={`m:${m}`}
              type="button"
              className={styles.chip}
              onClick={() => handleRemoveMuscle(m)}
            >
              {muscleLabel(m)}
              <span className={styles.chipMeta}>· {REGION_LABELS[MUSCLE_TO_REGION[m]]}</span>
              <span className={styles.chipX}>✕</span>
            </button>
          ))}
          {fallback && (
            <button
              type="button"
              className={styles.chip}
              onClick={() => emit({ regions: [], muscles: [], fallback: null })}
            >
              {REGION_LABELS[fallback]}<span className={styles.chipX}>✕</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.fallbackRow}>
        {FALLBACK_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.fallback}${fallback === opt.id ? ' ' + styles.fallbackActive : ''}`}
            onClick={() => handleFallback(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create the wrapper styles**

Path: `src/components/BodyPicker/BodyPicker.module.css`

```css
.picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stage {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-2);
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  align-items: flex-start;
  position: relative;
  min-height: 400px;
}

.bodyWrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.bodyLabel {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.selectedCard {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  min-height: 60px;
}

.selectedLabel {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}

.chipRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip {
  font-size: var(--text-sm);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-accent-subtle);
  border: 1px solid var(--color-accent-border);
  color: var(--color-text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.chipMeta { opacity: 0.55; margin-left: 4px; font-size: var(--text-xs); }
.chipX { font-size: var(--text-base); color: var(--color-text-tertiary); line-height: 1; margin-left: 2px; }
.empty { font-size: var(--text-xs); color: var(--color-text-muted); font-style: italic; }

.fallbackRow {
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
}

.fallback {
  flex: 1;
  font-size: var(--text-xs);
  padding: var(--space-2);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  cursor: pointer;
  text-align: center;
  transition: all var(--transition-quick);
}

.fallback:hover { background: var(--color-bg-card-hover); border-color: var(--color-border-active); }

.fallbackActive {
  background: var(--color-accent-subtle);
  border-color: var(--color-accent-border);
  color: var(--color-text-primary);
}
```

- [ ] **Step 5: Create the barrel export**

Path: `src/components/BodyPicker/index.ts`

```ts
export { BodyPicker } from './BodyPicker'
export type { BodyPickerSelection, FallbackId } from './BodyPicker'
```

- [ ] **Step 6: Run all tests to verify they pass**

Run: `npm test -- --run src/components/BodyPicker/`
Expected: PASS, all BodyPicker + BodyPickerSVG + MuscleDrawer + data tests green.

- [ ] **Step 7: Commit**

```bash
git add src/components/BodyPicker/BodyPicker.tsx src/components/BodyPicker/BodyPicker.module.css src/components/BodyPicker/BodyPicker.test.tsx src/components/BodyPicker/index.ts
git commit -m "feat(body-picker): BodyPicker wrapper composing SVG + drawer + chips + fallbacks"
```

---

## Task 7: Replace SessionIntakeScreen Location chip-grid with `<BodyPicker>`

**Files:**
- Modify: `src/screens/SessionIntakeScreen.tsx`
- Modify: `src/screens/SessionIntakeScreen.module.css`

The current intake screen has 6 fields with a `LOCATION_GROUPS` chip-grid for the Location field. This task replaces only that one field with `<BodyPicker>`. Severity, Irritability, Sensitivity, Position, Length stay exactly as they are.

- [ ] **Step 1: Update the imports in SessionIntakeScreen.tsx**

In `src/screens/SessionIntakeScreen.tsx`, replace the import block at the top:

```tsx
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
  FlareSensitivity,
  BodyLocation,
  BodyMuscle,
} from '../types/hari'
import { useAppContext } from '../context/AppContext'
import { getEligibleHariHistory } from '../storage/sessionHistory'
import { getOrComputePatternSummary } from '../engine/hari/patternReader'
import { computeAdaptiveIntakeDefaults } from '../engine/hari/adaptiveIntakeDefaults'
import { interpretStates } from '../engine/hari/stateInterpretation'
import { branchToEmotionalStates } from '../engine/intakeTranslation'
import { BodyPicker, type FallbackId } from '../components/BodyPicker'
import styles from './SessionIntakeScreen.module.css'
```

- [ ] **Step 2: Remove the LOCATION_GROUPS constant**

Delete the entire `const LOCATION_GROUPS = [...]` array (around lines 50-105 in the current file). It's replaced by `<BodyPicker>`.

- [ ] **Step 3: Replace the `locations` state with picker state**

Find:
```tsx
const [locations, setLocations] = useState<BodyLocation[]>([])
```

Replace with:
```tsx
const [locationRegions, setLocationRegions] = useState<BodyLocation[]>([])
const [locationMuscles, setLocationMuscles] = useState<BodyMuscle[]>([])
const [locationFallback, setLocationFallback] = useState<FallbackId | null>(null)
```

- [ ] **Step 4: Update the `toggleLocation` function — delete it**

The old `toggleLocation` is no longer needed. Delete the function definition.

- [ ] **Step 5: Update the `allRequiredSet` derivation**

Find:
```tsx
const allRequiredSet =
  irritability !== null &&
  sensitivity !== null &&
  locations.length > 0 &&
  currentContext !== null &&
  sessionLength !== null
```

Replace with:
```tsx
const hasLocation = locationRegions.length > 0 || locationMuscles.length > 0 || locationFallback !== null
const allRequiredSet =
  irritability !== null &&
  sensitivity !== null &&
  hasLocation &&
  currentContext !== null &&
  sessionLength !== null
```

- [ ] **Step 6: Update `handleSubmit` to roll fallback into location array**

Find the intake construction in `handleSubmit`:
```tsx
const intake: HariSessionIntake = {
  branch,
  irritability,
  baseline_intensity: baselineIntensity,
  flare_sensitivity: sensitivity,
  location: locations,
  current_context: currentContext,
  ...
}
```

Replace `location: locations,` with:
```tsx
location: locationFallback ? [locationFallback] : locationRegions,
location_muscles: locationMuscles.length > 0 ? locationMuscles : undefined,
```

- [ ] **Step 7: Replace the Location field render block**

Find the JSX section that starts with:
```tsx
{/* 4. Location (multi-select, restored 2026-05-04) */}
<div className={styles.fieldGroup}>
  <span className={styles.fieldLabel}>Where in your body is it focused?</span>
  {LOCATION_GROUPS.map((group) => (
```

…and ends at the matching `</div>` after the closing `))}`. Replace the entire block (the field group, label, and grouped chip list) with:

```tsx
{/* 4. Location — visual body picker (replaces chip grid 2026-05-04) */}
<div className={styles.fieldGroup}>
  <span className={styles.fieldLabel}>Where in your body is it focused?</span>
  <BodyPicker
    selectedRegions={locationRegions}
    selectedMuscles={locationMuscles}
    fallback={locationFallback}
    onChange={(next) => {
      setLocationRegions(next.regions)
      setLocationMuscles(next.muscles)
      setLocationFallback(next.fallback)
    }}
  />
</div>
```

- [ ] **Step 8: Remove the now-unused chip styles from SessionIntakeScreen.module.css**

In `src/screens/SessionIntakeScreen.module.css`, find and delete the `.locationGroup` and `.locationGroupLabel` classes (added in commit 473a6f7) — they're no longer referenced.

- [ ] **Step 9: Run vitest and verify SessionIntakeScreen still type-checks**

Run: `npm test -- --run src/screens/SessionIntakeScreen.test.tsx`
Expected: Some pre-existing tests will FAIL because they were written for the chip-grid (e.g. `expect(screen.getByRole('button', { name: /^lower back$/i })).toBeInTheDocument()`). That's expected — Task 8 fixes the test file. Build (tsc) should still pass.

Run: `npx tsc --noEmit`
Expected: No new errors. Pre-existing errors in `feasibility.ts` / `setup.ts` may still appear; ignore those.

- [ ] **Step 10: Commit**

```bash
git add src/screens/SessionIntakeScreen.tsx src/screens/SessionIntakeScreen.module.css
git commit -m "feat(intake): replace Location chip-grid with visual BodyPicker"
```

---

## Task 8: Update SessionIntakeScreen unit tests

**Files:**
- Modify: `src/screens/SessionIntakeScreen.test.tsx`

The existing test file has assertions like `screen.getByRole('button', { name: /^lower back$/i })` and `screen.getByText(/where in your body is it focused/i)` that match against the old chip-grid. The label survives but the chip-grid does not. We need to drive the picker via SVG `<g>` clicks instead.

- [ ] **Step 1: Replace the existing location tests**

In `src/screens/SessionIntakeScreen.test.tsx`, find the two tests:

```tsx
it('renders the location prompt with multi-select chips and group labels', async () => { ... })
it('allows selecting multiple location chips', async () => { ... })
```

Replace both with these tests that drive the new picker:

```tsx
it('renders the location prompt and the body picker', async () => {
  renderWithBranch('tightness_or_pain')
  await waitFor(() => {
    expect(screen.getByText(/where in your body is it focused/i)).toBeInTheDocument()
  })
  // Two SVGs (front + back) inside the picker
  const svgs = document.querySelectorAll('svg[aria-label*="body picker" i]')
  expect(svgs.length).toBe(2)
})

it('allows selecting a body region via SVG group click', async () => {
  renderWithBranch('tightness_or_pain')
  await waitFor(() => {
    expect(screen.getByText(/where in your body is it focused/i)).toBeInTheDocument()
  })
  // ankle_foot_left has a single muscle path — single click auto-tags region
  const ankleGroup = document.querySelector('g[data-region="ankle_foot_left"]') as Element
  expect(ankleGroup).toBeTruthy()
  await userEvent.click(ankleGroup)
  // The chip below the picker should now display the region name
  expect(screen.getByText(/ankle \/ foot \(l\)/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Update the "Continue is disabled" test**

Find:
```tsx
it('Continue is disabled until all required fields are set', async () => {
  ...
  await userEvent.click(screen.getByRole('button', { name: /^lower back$/i })) // location
  ...
})
```

Replace the `^lower back$` line with:

```tsx
const ankleGroup = document.querySelector('g[data-region="ankle_foot_left"]') as Element
await userEvent.click(ankleGroup)
```

- [ ] **Step 3: Update the "Continue dispatches HARI intake" test**

Find:
```tsx
await userEvent.click(screen.getByRole('button', { name: /^lower back$/i }))
await userEvent.click(screen.getByRole('button', { name: /^neck$/i }))
```

Replace with two SVG group clicks against the new picker. Use ankle_foot_left (single-muscle, auto-tags) and a second multi-muscle region via the drawer:

```tsx
await userEvent.click(document.querySelector('g[data-region="ankle_foot_left"]') as Element)
// Open shoulder_left drawer and pick one muscle
await userEvent.click(document.querySelector('g[data-region="shoulder_left"]') as Element)
await userEvent.click(screen.getByRole('button', { name: /left shoulder \(front\)/i }))
await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
```

Then update the `expect(capturedIntake).toMatchObject(...)` assertion:

```tsx
expect(capturedIntake).toMatchObject({
  branch: 'tightness_or_pain',
  irritability: 'fast_onset_slow_resolution',
  flare_sensitivity: 'low',
  current_context: 'sitting',
  session_length_preference: 'long',
})
expect(capturedIntake.location).toEqual(expect.arrayContaining(['ankle_foot_left', 'shoulder_left']))
expect(capturedIntake.location_muscles).toEqual(['shoulder_front_left'])
```

Also remove the now-stale lines:
```tsx
expect(capturedIntake.location).toEqual(expect.arrayContaining(['lower_back', 'neck']))
expect(capturedIntake.location.length).toBe(2)
```

- [ ] **Step 4: Run the SessionIntakeScreen tests**

Run: `npm test -- --run src/screens/SessionIntakeScreen.test.tsx`
Expected: PASS, all 12+ cases.

- [ ] **Step 5: Commit**

```bash
git add src/screens/SessionIntakeScreen.test.tsx
git commit -m "test(intake): drive Location field via BodyPicker SVG clicks"
```

---

## Task 9: Update App.test.tsx integration tests

**Files:**
- Modify: `src/App.test.tsx`

`fillHariIntakeAndSubmit` and the inline body of the "walks the new branched intake flow" test reference the chip-grid `^lower back$` button. Both need to use the body picker.

- [ ] **Step 1: Update `fillHariIntakeAndSubmit`**

Find:
```tsx
async function fillHariIntakeAndSubmit() {
  await userEvent.click(screen.getByRole('button', { name: /comes on slowly, goes away quickly/i }))
  const sensitivityGroup = screen.getByRole('group', { name: /flare sensitivity/i })
  await userEvent.click(within(sensitivityGroup).getByRole('button', { name: /^moderate$/i }))
  await userEvent.click(screen.getByRole('button', { name: /^lower back$/i }))
  ...
}
```

Replace the `^lower back$` line with an SVG group click:

```tsx
const ankleGroup = document.querySelector('g[data-region="ankle_foot_left"]') as Element
await userEvent.click(ankleGroup)
```

- [ ] **Step 2: Update the "walks the new branched intake flow" inline test**

Same replacement: change the `^lower back$` click to:

```tsx
const ankleGroup = document.querySelector('g[data-region="ankle_foot_left"]') as Element
await userEvent.click(ankleGroup)
```

- [ ] **Step 3: Run App tests**

Run: `npm test -- --run src/App.test.tsx`
Expected: PASS, 4 cases.

- [ ] **Step 4: Run the full vitest suite**

Run: `npm test -- --run`
Expected: All tests pass — should be ~270 (existing 248 + ~22 new from BodyPicker tests).

- [ ] **Step 5: Commit**

```bash
git add src/App.test.tsx
git commit -m "test(app): integration helpers drive Location field via BodyPicker"
```

---

## Task 10: Update E2E baseline + regenerate snapshots

**Files:**
- Modify: `e2e/baseline-capture.spec.ts`

- [ ] **Step 1: Update the intake-fill helper across the e2e file**

Find every occurrence of:

```ts
await page.getByRole('button', { name: /^lower back$/i }).click()
```

There are 5 occurrences (test 12, test 13/14 helper, test 15, navigateToSession in tests 16/17, golden path). Replace each with:

```ts
await page.locator('g[data-region="ankle_foot_left"]').first().click()
```

- [ ] **Step 2: Update the test 12 description**

In test `12 — intake screen filled`, update the comment to reflect the new picker:

```ts
test('12 — intake screen filled', async ({ page }) => {
  // Fill 5 required fields (severity has default 5):
  //   irritability · sensitivity · body picker (≥1 region) · position · length
  await page.getByRole('button', { name: /comes on quickly, goes away slowly/i }).click()
  await page.getByRole('button', { name: /^moderate$/i }).click()
  await page.locator('g[data-region="ankle_foot_left"]').first().click()
  await page.getByRole('button', { name: /^sitting$/i }).click()
  await page.getByRole('button', { name: /^standard$/i }).click()
  await snap(page, '12_intake_filled')
})
```

- [ ] **Step 3: Add a new capture for the muscle drawer state**

After test 12, add test 12b to capture the drawer-open state:

```ts
test('12b — intake with muscle drawer open', async ({ page }) => {
  // Open shoulder_left drawer and capture
  await page.getByRole('button', { name: /comes on quickly, goes away slowly/i }).click()
  await page.getByRole('button', { name: /^moderate$/i }).click()
  await page.locator('g[data-region="shoulder_left"]').first().click()
  // Drawer should be visible
  await expect(page.getByText(/muscle group/i)).toBeVisible({ timeout: 3000 })
  await snap(page, '12b_intake_muscle_drawer')
})
```

- [ ] **Step 4: Run vitest one more time as a sanity check**

Run: `npm test -- --run`
Expected: All tests pass.

- [ ] **Step 5: Run the Playwright capture**

Run: `npm run capture`
Expected: All 19 (or 20 with the new 12b) tests pass; new and modified snapshots regenerated.

- [ ] **Step 6: Review the generated snapshots**

Open `snapshots/12_intake_filled.png` and `snapshots/12b_intake_muscle_drawer.png` (and any other modified PNGs) to confirm the body picker renders cleanly.

- [ ] **Step 7: Commit**

```bash
git add e2e/baseline-capture.spec.ts snapshots/
git commit -m "test(e2e): drive intake Location via body picker; add muscle drawer capture"
```

---

## Self-review checklist (run before declaring complete)

- [ ] All 10 tasks committed in order
- [ ] `npm test -- --run` passes (target: ~270 tests)
- [ ] `npm run capture` passes (target: 20 e2e tests)
- [ ] `npx tsc --noEmit` produces no new errors (pre-existing feasibility.ts / setup.ts noise OK)
- [ ] `src/components/BodyPicker/data/LICENSE-body-muscles` exists and is the verbatim Apache-2.0 text
- [ ] `src/components/BodyPicker/data/NOTICE-body-muscles` exists and credits Ivan Vulović
- [ ] Top of `src/components/BodyPicker/data/muscles.ts` has the attribution header comment
- [ ] No code in `src/engine/` was modified — engine pipeline is untouched
- [ ] `HariSessionIntake.location: BodyLocation[]` is still the canonical engine input
- [ ] `HariSessionIntake.location_muscles?: BodyMuscle[]` is captured but not consumed by the engine
- [ ] Live ngrok build: open the app, walk through the intake, verify body picker works visually

## Final commit notes

Each task is its own commit per the build order. After all 10 commits:

- Branch state: 10 new commits ahead of `origin/m5-6-architecture-pass`
- Push when ready: `git push origin m5-6-architecture-pass`
- The combined diff replaces a 23-button chip grid with an interactive anatomical SVG picker, adds 87 muscle paths under the body picker module, and changes one field in `SessionIntakeScreen` — every other intake field is untouched.
