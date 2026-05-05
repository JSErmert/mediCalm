# Location Pattern Inference — Design

**Date:** 2026-05-04
**Author:** JSEer (with Claude Opus 4.7 1M)
**Status:** approved — implementing alongside body picker visual refinements

---

## Problem

The body picker currently surfaces 3 fallback buttons — *Spread / multiple*, *Whole body*, *Not sure* — when the user can't or won't pick specific regions. These labels are self-report bins: the user is asked to classify their own pain distribution, which is exactly the assessment a PT is supposed to be doing. They also live alongside specific region selections, so a user who has already picked 4 regions across their lower body could in theory also tap *Whole body*, producing incoherent state.

More importantly, the **clinical purpose of the location field is to identify whether painful areas are anatomically related** — a kinetic chain, a fascial line, a referred pattern, central sensitization. That relationship can be inferred from the regions the user has already selected; we don't have to ask.

---

## Goals

1. Replace self-report fallback buttons with a derived clinical descriptor.
2. Surface the inferred pattern as a calm, read-only badge so the user sees how their selection is being interpreted.
3. Preserve a single escape hatch for the genuine "I can't pinpoint it" case.
4. Keep `intake.location: BodyLocation[]` populated only with real anatomical regions — fallback IDs (`spread_multiple`, `whole_body`, `not_sure`) drop out of the data model.
5. Maintain engine compatibility — the engine sources `location_tags` from `intake.symptom_focus`, so this change is data-clean rather than engine-breaking.

---

## Data model

### New type

```ts
// src/types/hari.ts (additive)
export type LocationPattern =
  | 'single'              // 1 anatomical region
  | 'connected'           // 2+ regions, all within one anatomical chain
  | 'multifocal'          // 2+ regions across different chains, but bounded
  | 'widespread'          // 4+ regions spanning 3+ chains (suggests central sensitization)
  | 'diffuse_unspecified' // user explicitly tapped "I can't pinpoint it"
```

### `HariSessionIntake` extension

```ts
interface HariSessionIntake {
  // ... existing fields
  location: BodyLocation[]              // unchanged — real anatomical regions only
  location_muscles?: BodyMuscle[]       // unchanged
  location_pattern?: LocationPattern    // NEW — inferred at submit, or 'diffuse_unspecified' if escape hatch
}
```

The field is optional so existing HARI history records continue to validate.

### `FallbackId` deprecation

`FallbackId = 'spread_multiple' | 'whole_body' | 'not_sure'` is removed from `BodyPicker.tsx`. The picker no longer emits fallback values into `selectedRegions`. The single escape hatch is a UI-only concept that translates directly to `location_pattern: 'diffuse_unspecified'` at submit time.

---

## Anatomical chains

Defined in `src/engine/hari/locationPatterns.ts`. These reflect standard PT kinetic-chain and fascial-line groupings:

| Chain | Regions |
|---|---|
| Cervical / upper crossed | `head_temples`, `neck`, `upper_back`, `shoulder_left`, `shoulder_right`, `jaw_tmj_facial` |
| Thoracic / rib | `mid_back`, `rib_side`, `chest_sternum` |
| Lumbo-pelvic | `lower_back`, `hip_pelvis`, `glute` |
| Posterior chain (left) | `lower_back`, `hip_pelvis`, `glute`, `thigh_left`, `knee_left`, `calf_shin_left`, `ankle_foot_left` |
| Posterior chain (right) | `lower_back`, `hip_pelvis`, `glute`, `thigh_right`, `knee_right`, `calf_shin_right`, `ankle_foot_right` |
| Upper limb (left) | `shoulder_left`, `elbow_forearm_left`, `wrist_hand_left` |
| Upper limb (right) | `shoulder_right`, `elbow_forearm_right`, `wrist_hand_right` |

Chains intentionally overlap (e.g. `shoulder_left` appears in both *Cervical* and *Upper limb (L)*) — a user's selection may fit one, both, or neither.

---

## Inference algorithm

Pseudocode for `inferLocationPattern(regions: BodyLocation[]): LocationPattern`:

```
n = regions.length
if n === 0: return 'single'   // shouldn't be called; safe default
if n === 1: return 'single'

fittingChains = chains where every user-region is in chain.regions
chainsContainingAtLeastOne = chains where ANY user-region is in chain.regions

if n >= 4 AND chainsContainingAtLeastOne >= 3: return 'widespread'
if fittingChains.length >= 1: return 'connected'
return 'multifocal'
```

Edge cases:
- `n === 2` with regions in different chains → `multifocal`
- `n === 2` with both regions in one chain → `connected`
- `n === 5` all in one big chain (e.g. full posterior left) → `connected` (still a coherent kinetic pattern)
- `n === 5` across 3+ chains → `widespread`

When the user taps the escape hatch button, the picker emits `regions: [], muscles: []`. `SessionIntakeScreen.handleSubmit` then bypasses the inference and sets `location_pattern: 'diffuse_unspecified'` directly.

---

## UI changes

### Removed
- The 3-button `.fallbackRow` (`Spread / multiple` / `Whole body` / `Not sure`)
- The `fallback` prop chain on `<BodyPicker>` (no longer relevant)

### Added
- **Pattern badge** — small read-only chip-style element rendered above the *Selected* card when `regions.length >= 1`. Format: `Pattern · {label}` where label is "Single region" / "Connected" / "Multifocal" / "Widespread". The badge uses the existing accent token palette and is non-interactive.
- **One escape hatch button** — beneath the *Selected* card, full-width or right-aligned: *"I can't pinpoint where it is"*. When tapped, clears all regions/muscles and emits a special signal that maps to `location_pattern: 'diffuse_unspecified'` at submit. The button has a pressed/active visual state to indicate the escape hatch is currently in effect.

### Picker prop shape change

```ts
// before
interface BodyPickerProps {
  selectedRegions: BodyLocation[]
  selectedMuscles: BodyMuscle[]
  fallback: FallbackId | null
  onChange: (next: BodyPickerSelection) => void
}

// after
interface BodyPickerProps {
  selectedRegions: BodyLocation[]
  selectedMuscles: BodyMuscle[]
  diffuseUnspecified: boolean             // true when escape hatch is active
  onChange: (next: BodyPickerSelection) => void
}

interface BodyPickerSelection {
  regions: BodyLocation[]
  muscles: BodyMuscle[]
  diffuseUnspecified: boolean
}
```

`SessionIntakeScreen` retains the parent state and decides how to compose `intake.location_pattern` at submit.

---

## Engine impact

None. The HARI engine sources `location_tags` from `intake.symptom_focus` (a silent/derived field). `intake.location` is used only by HARI history and future personalization. The new `location_pattern` field is captured but not consumed by mechanism scoring.

---

## Out of scope for this iteration

- Visual highlight of the inferred chain on the SVG body (could come later as M6.9 enhancement)
- Engine usage of `location_pattern` to influence mechanism selection
- Surfacing the chain name to the user (e.g. "Connected — Posterior chain (L)") — for now we show only the category to avoid overstating confidence
