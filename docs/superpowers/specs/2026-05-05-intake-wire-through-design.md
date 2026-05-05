# Intake Wire-Through — Design

**Date:** 2026-05-05
**Author:** JSEer (with Claude Opus 4.7 1M)
**Status:** approved — implementing now
**Authority for findings:** `docs/superpowers/audits/intake-output-sweep-2026-05-05/findings.md`

---

## Problem

The intake-output sweep identified three intake fields the user is asked to pick that have zero effect on the breathing technique selected:

| Field | Driver in N outputs | Inert in N outputs | Sweep-confirmed status |
|---|---:|---:|---|
| `irritability` | 0 / 9 | 9 / 9 | fully inert |
| `session_length_preference` | 0 / 9 | 9 / 9 | fully inert |
| `intake.location` (incl. `location_muscles`, `location_pattern`) | not swept | not swept | confirmed inert by inspection of `synthesizePainInput` |

All three follow the same architectural pattern: **the user picks an explicit value, but a silent / adaptive field downstream takes the steering wheel and ignores the explicit pick.** The fix shape is identical in each case — let the user's explicit pick *derive* the silent field, falling back to adaptive default only when the explicit pick is absent.

This spec covers all three wire-throughs in one coordinated change so they can be re-swept against the same baseline.

---

## Goal

After this change, picking different values for `irritability`, `session_length_preference`, or anatomical regions in the body picker must produce different breathing-technique outputs in observable, sweep-detectable ways. Specifically:

1. The differentiation map in the post-fix sweep should show non-zero driver counts for `irritability`, `session_length_preference`, and either `intake.location` (if added as a swept dim) or `symptom_focus` (which now reflects the user's location pick).
2. The `'standard'` (8-minute) effort level — currently never reached — must be reachable when the user picks `session_length_preference: 'long'` *and* safety conditions permit.
3. Distinct anatomical regions must produce distinct breathing techniques where the existing protocol/family palette supports it (ribs vs calves, neck vs lower back, etc.).

---

## Wire-through 1 — Irritability as a safety modifier on `flare_sensitivity`

### Current state

`intake.irritability` is captured but unused. `irritabilityToFlareSensitivity()` exists in `src/engine/intakeTranslation.ts` but is no longer called — PT pass 2 made `flare_sensitivity` its own explicit user field.

### Proposed change

Keep both fields explicit (current UX) but use irritability as a **one-way safety escalator** on `flare_sensitivity`:

```
irritability='fast_onset_slow_resolution' (most irritable) →
  effective_flare_sensitivity = max(user_pick, 'high')

irritability='symmetric' (mid) →
  no change

irritability='slow_onset_fast_resolution' (least irritable) →
  no change   (irritability never DOWNGRADES the safety dial)
```

### Why one-way

Matches the engine's existing "softness first" philosophy (already documented in `interventionSelector.ts`). Irritability is a *clinical caution dial* — fast-onset/slow-resolution patterns are higher-risk for flare-up, so the engine should be at-least-as-conservative as the user's explicit `flare_sensitivity` pick, never less.

### Where it lives

`src/engine/intakeTranslation.ts` — add `applyIrritabilityEscalation(flare_sensitivity, irritability): FlareSensitivity`.

`src/screens/SessionIntakeScreen.tsx` — at submit, replace `flare_sensitivity: sensitivity` with `flare_sensitivity: applyIrritabilityEscalation(sensitivity, irritability)`. The user's explicit pick becomes the floor; irritability can raise it.

### Test coverage

Unit tests in `src/engine/intakeTranslation.test.ts`:
- `'low' + 'fast_onset_slow_resolution' → 'high'` (escalation)
- `'high' + 'slow_onset_fast_resolution' → 'high'` (no-op preserves user pick)
- `'moderate' + 'symmetric' → 'moderate'` (no-op)
- `'not_sure' + 'fast_onset_slow_resolution' → 'high'` (escalation from uncertain)

---

## Wire-through 2 — Location → `symptom_focus` derivation

### Current state

`synthesizePainInput()` derives `location_tags` and `symptom_tags` from `intake.symptom_focus`. `symptom_focus` is set silently by `computeAdaptiveIntakeDefaults()` based on history, defaulting to `'spread_tension'` for fresh users. The user's explicit body-picker selection (`intake.location`, `intake.location_muscles`, `intake.location_pattern`) never feeds in.

### Proposed change

At intake submit time, derive `symptom_focus` from `intake.location` and `intake.location_pattern`. Fall back to the adaptive default *only* when the user has provided no anatomical input (anxious branch with empty location).

### Mapping rules (in priority order)

```
1. location_pattern === 'diffuse_unspecified' → keep adaptive fallback
2. location_pattern === 'widespread'          → 'spread_tension'
3. Bucket each region:
     jaw_tmj_facial                                          → 'jaw_facial' bucket
     head_temples, neck, shoulder_*, upper_back              → 'neck_upper' bucket
     rib_side, mid_back, chest_sternum                       → 'rib_side_back' bucket
     all other regions (lumbo-pelvic, lower limb,
       upper limb except shoulder, glute, etc.)              → 'spread_tension' bucket
4. If buckets.size > 1   → 'mixed'
5. If buckets.size === 1 → that single bucket
6. If location is empty (anxious branch)   → keep adaptive fallback
```

### Why this mapping

`symptom_focus` is a 6-bucket coarse classifier. It cannot capture every region distinctly without an engine refactor (out of scope for this round). The mapping above preserves the existing classifier's clinical intent:

- Cervical / upper-crossed pattern → `'neck_upper'` (engine's existing path for upper-region work)
- TMJ / facial → `'jaw_facial'`
- Thoracic / chest / rib → `'rib_side_back'`
- Lower body and limbs → `'spread_tension'` (engine's general path; lossy but accurate-direction)
- Anything spanning multiple → `'mixed'`
- Diffuse → adaptive fallback

The lossy mapping for lower limbs is documented as a known limitation; PMID validation may inform whether new buckets are warranted in a later iteration.

### Where it lives

`src/engine/intakeTranslation.ts` — add `deriveSymptomFocusFromLocation(intake, fallback): SymptomFocus`.

`src/screens/SessionIntakeScreen.tsx` — at submit, replace `symptom_focus: silentFocus` with the derived value, using `silentFocus` only as the fallback for empty/diffuse cases.

### Test coverage

Unit tests in `src/engine/intakeTranslation.test.ts`:
- `location: ['rib_side']` → `'rib_side_back'`
- `location: ['neck', 'shoulder_left']` → `'neck_upper'` (single bucket)
- `location: ['neck', 'rib_side']` → `'mixed'` (two buckets)
- `location: ['lower_back']` → `'spread_tension'` (lower-body bucket)
- `location_pattern: 'widespread'` → `'spread_tension'` regardless of regions
- `location_pattern: 'diffuse_unspecified'` → fallback (e.g. `'mixed'`)
- `location: []` → fallback

---

## Wire-through 3 — `session_length_preference` → effort/duration influence

### Current state

`intake.session_length_preference` is captured but never used. The duration the user experiences is fully derived from `EffortLevel` in `buildFeasibilityProfile()` (240s / 360s / 480s) without consulting the user's preference. The sweep confirmed `'standard'` (480s / 8 min) is never reached, so `'long'` is structurally unreachable today.

### Proposed change

Let `session_length_preference` adjust the `EffortLevel` derivation as a **bounded preference** — never escalating past safety, never overriding overload or minimal-effort caps.

The cleanest implementation is a one-step bump in either direction within safety bounds:

```
short    → cap effortCapacity at 'reduced' (max 360s / 6min)
standard → no change to derivation
long     → bump effortCapacity by one step IF safety allows
            (e.g. 'reduced' → 'standard' allowed; 'minimal' stays 'minimal')
```

Safety guard rails (unchanged, applied AFTER the preference adjustment):
- overload → still caps at 180s
- effortCapacity === 'minimal' (high flare/intensity) → still caps at 240s, length=long has NO effect here
- secondaryGoal present → still caps at 360s

So `'long'` only unlocks 480s for low-flare, low-intensity, no-overload, no-secondary-goal cohorts — clinically appropriate.

### Where it lives

`src/engine/hari/needProfile.ts` — modify `classifyNeedProfile()` to accept the user's `session_length_preference` and apply the bump before returning.

OR (cleaner): keep `classifyNeedProfile` pure and add a new `applyLengthPreference(need, preference): NeedProfile` step in `buildSessionConfig`/`buildDeliveryConfig`.

I'll choose the second — keeps existing modules pure and easy to test.

### Test coverage

Unit tests in `src/engine/hari/sessionConfig.test.ts` (or a new `lengthPreference.test.ts`):
- `effortCapacity='reduced'` + `'long'` → effortCapacity becomes `'standard'` (480s reachable)
- `effortCapacity='minimal'` + `'long'` → effortCapacity stays `'minimal'` (safety cap holds)
- `effortCapacity='standard'` + `'short'` → effortCapacity becomes `'reduced'`
- `effortCapacity='minimal'` + `'short'` → effortCapacity stays `'minimal'` (already at floor)
- `'standard'` preference → no change in any case

Integration: a re-sweep after this change must show 480s outputs in the cohort distribution for `session_length_preference='long'` cohorts.

---

## Order of operations

The three wire-throughs are independent in code but all need to be present for the post-fix sweep to be meaningful. I'll implement them in this order to keep diffs reviewable:

1. **Irritability escalation** — smallest change, single function added in `intakeTranslation.ts`, single line changed in `SessionIntakeScreen.handleSubmit`. Tests added.
2. **Location → symptom_focus** — second function added in `intakeTranslation.ts`, single line changed in `SessionIntakeScreen.handleSubmit`. Tests added.
3. **Session-length influence** — new module `applyLengthPreference()` or inline in `sessionConfig.ts`, single call site updated. Tests added.
4. **Re-sweep** — re-run `npm run sweep` and produce a fresh audit at `docs/superpowers/audits/intake-output-sweep-2026-05-05-postfix/`. The audit doc compares cohort sizes before/after.

All steps gated by full vitest pass.

---

## Re-sweep expectations

After the wire-through, the post-fix sweep should reveal:

- **More distinct outputs** — likely 12+ instead of 9, because location now differentiates within branches
- **`irritability` non-inert** — at minimum partially driving `'high'` flare-sensitivity cohorts
- **`session_length_preference` non-inert** — driving the effort/duration axis for low-flare cohorts; 480s outputs appear
- **`symptom_focus` driven by location** — but now correlates with `intake.location` selections rather than the silent default
- **Reachability gap closed** — `'standard'` effort level appears in at least one cohort

If post-fix sweep does NOT show these, that's a signal the wire-through has a bug or the engine has another silent-override path I haven't found yet — the audit will catch it.

---

## Out of scope for this round

- Adding new `symptom_focus` buckets for lumbo-pelvic / lower limb / upper limb (would require engine refactor + new mechanism mappings; revisit after PMID validation)
- Wiring `intake.location_muscles` into the engine separately from `intake.location` (the body picker rolls muscles to regions at submit; engine sees regions only)
- Wiring `intake.location_pattern` directly as an engine input (currently consumed only via the symptom_focus derivation)
- PMID validation of the resulting cohort/technique pairs (separate pass after the post-fix sweep)
