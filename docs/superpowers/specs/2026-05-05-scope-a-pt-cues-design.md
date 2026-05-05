# Scope A — PT-grounded cue refinements (no engine architecture change)

**Date:** 2026-05-05
**Author:** JSEer (with Claude Opus 4.7 1M)
**Status:** approved — implementing now
**Authority for upstream decisions:**
- `docs/superpowers/audits/intake-output-sweep-2026-05-05-postfix/findings.md` (sweep verdict)
- 2026-05-05 PMID literature review (kept inline below for traceability)

---

## Context

PT review identified three breath/cue refinements the live engine should adopt to match clinical practice:

| PT recommendation | Status after review |
|---|---|
| 3-in / 5-out for high-pain restrictive breathing | **No change** — PMID review (Shaffer & Meehan 2020 PMID 33117119, Laborde 2021 DOI 10.3390/su13147775, Meehan 2024 PMID 38507210) supports 3-in / 6-out (1:2 ratio, 6.7 bpm) as the better-anchored default; 6.7 bpm sits at edge of resonance-frequency window (4.5–6.5 bpm). 3/5 carries no superior evidence. Documented as a future "step-down option" but not the default. |
| 4-in / 6-out sitting for generalized tightness | **Already in engine** — `decompression_expand` family is 4/6, already selected for non-flare-downgraded `decompress` goal cohorts. No change. |
| Lying down for *specific / localized* tension | **Add** — derive a contextual position hint at SessionSetupScreen based on branch + location_pattern. |
| Diaphragmatic framing for stress / anxious branch | **Add** — refresh `calm_downregulate` openingPrompt with explicit diaphragmatic language. |
| Positional stretching for tightness / pain | **Deferred to Scope B** — requires a new `stretchPrescription` layer. |
| Phased rounds (5 cycles diaphragmatic + transition + 5 cycles bucket-handle expansion) | **Deferred to Scope B** — requires `BreathPrescription` to become `phases[]` and a new `bucket_handle_expansion` family. Out of scope here. |

Scope A is intentionally limited to **two copy / cue changes** that adopt PT framing without touching engine logic, types, or data flow. Engine output cohort distribution does not change; a confirmatory re-sweep is optional.

---

## Change 1 — diaphragmatic framing in anxious-branch cue

### Where it lives

`src/engine/hari/breathFamily.ts` — `BREATH_FAMILIES.calm_downregulate.openingPrompt`

### Current copy

> "Follow the breath. Each cycle helps your nervous system settle."

### New copy

> "Belly softens on the inhale, ribs settle on the exhale. Slow diaphragmatic breath — each cycle helps your nervous system release."

### Why this specific phrasing

- "Belly softens" cues the user toward diaphragmatic engagement (vs. upper-chest pattern that's common in anxiety)
- "Ribs settle on the exhale" cues passive exhalation, not forced
- "Diaphragmatic" is named explicitly so the user can connect the practice to the broader literature when curious
- Matches mediCalm's existing voice: bounded medical framing, no overpromise, calm and concrete

The other 7 breath families (`flare_safe_soft_exhale`, `decompression_expand`, `restorative`, `neutral_reset`, `lateral_expansion`, `grounding`, `gentle_activation`) keep their existing cues — diaphragmatic framing is specifically called out as the anxious-branch refinement; the pain-branch families have their own physiological framings already.

---

## Change 2 — contextual position hint at SessionSetupScreen

### Where it lives

- New helper `derivePositionHint(intake)` in `src/engine/presentation/interpretationLayer.ts`
- New display block in `src/screens/SessionSetupScreen.tsx` rendered between the existing `Position` block and the `Length` block when the helper returns a non-empty string

### Logic

```
derivePositionHint(intake):
  if branch === 'tightness_or_pain':
    if location_pattern === 'single' or 'connected':
      return "If you can, try this lying down — localized patterns respond well to gentle decompression in a supported horizontal position."
    if location_pattern === 'widespread' or 'multifocal':
      return "Sitting tall but easy works well — keep your spine long and supported."
    if location_pattern === 'diffuse_unspecified' or undefined:
      return undefined  // fall back to protocol-default support_mode only
  if branch === 'anxious_or_overwhelmed':
    return undefined  // no location-specific hint; protocol-default is sufficient
```

### Display

- The existing `Position` block (which shows the protocol's `support_mode` like "Lying down or supported recline") stays as-is
- When `derivePositionHint(intake)` returns a non-empty string, a new `Position note` block renders below it with the contextual hint
- Both blocks use the same calm visual style (existing `.supportBlock` styling) — no new design tokens

### Why a hint instead of overriding the protocol's `support_mode`

The protocol's `support_mode` is its safety-validated default. Replacing it would require re-validating the protocol catalog. A contextual hint adds clinical specificity without contradicting the protocol's own recommendation — the user sees both the safe default and the personalized advice.

---

## Test coverage

### Unit tests
- `src/engine/presentation/interpretationLayer.test.ts` (extended) — covers all 5 branch × location_pattern combinations of `derivePositionHint`
- `src/engine/hari/breathFamily.test.ts` (added if not present) — asserts `calm_downregulate.openingPrompt` contains the words "diaphragmatic" and "belly"

### Integration / visual
- SessionSetupScreen.test.tsx (extended) — when intake has `branch: 'tightness_or_pain'` and `location_pattern: 'connected'`, the position hint text appears in the rendered output
- Playwright capture refresh on `15_session_setup.png` to lock the new layout

---

## Out of scope (Scope B)

- `BreathPrescription` → `phases[]` re-architecture
- `bucket_handle_expansion` breath family + cue
- `stretchPrescription` layer for positional stretching
- Making `PROTO_STABILIZE_BALANCE` deliver its catalog-defined 5/5 coherent practice (today blocked because `'tight'` state is unreachable from the branch surface)
- Optional 3/5 step-down for users who can't sustain 9-second cycles
