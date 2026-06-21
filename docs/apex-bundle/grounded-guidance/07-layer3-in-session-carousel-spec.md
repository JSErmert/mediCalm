# 07 — Layer 3 Spec: In-Session Grounded Carousel

**Goal:** Replace the breathing screen's static cues with a deterministic, research-grounded
coaching system — a few setup cues on the "Ready to begin" screen (with citations) and a
calm rotating set of app-voice cues during the breath (no citation UI) — built once at
session start from the engine's derived goal + the user's inputs.

**Inherits:** all invariants in [`02-invariants.md`](02-invariants.md). Reads the engine
facts in [`03-context-engine-map.md`](03-context-engine-map.md). Consumes the grounded
corpus seeded in the-muscle-pt (research-001, research-010, research-011).

**Status:** design — awaiting operator review. This is Layer 3 of the Grounded Guidance
stack ([`01-vision-and-architecture.md`](01-vision-and-architecture.md)); it merges Layer 2's
carousel form onto the in-session surface.

---

## Locked decisions (from the 2026-06-21 brainstorm)

- **D1 — Two surfaces, one source.** A single deterministic engine builds the whole
  session's coaching once at start: `selectBreathingCues(goal, input) → { setupCues, inSessionCues }`.
- **D2 — Setup cues live on `SessionSetupScreen`** (reuse the "Ready to begin" beat), **with citations.**
- **D3 — In-breath cues live on `BreathPhaseRenderer`,** cycling every ~2 breaths,
  **app-voice only — no citation UI mid-breath** (INV-2; protects the calm).
- **D4 — Cue set = universal core + conditional/goal extras** (not strictly goal-gated, not universal-only).
- **D5 — Grounding model: coach-always, cite-when-attested.** A cue always shows its
  app-voice coaching text (sound, safe breath-form instruction). Its verbatim citation
  appears (setup surface only) when a `pt_advisor_passed` GroundedMessage backs its PMID.
- **D6 — Consolidation.** This replaces the existing static `positionCue` + `diaphragmaticCue`
  in `BreathPhaseRenderer`. No parallel cue systems.

---

## Architecture

### Cue model (data)

```ts
// src/types/breathingCue.ts
import type { LocationTag } from './taxonomy'
import type { RegulatoryGoal, LocationPattern } from './hari'

export type CuePhase = 'setup' | 'in_session'

export type BreathingCue = {
  id: string
  text: string                 // app-voice coaching — NEVER attributed to a paper (INV-2)
  phase: CuePhase
  core?: boolean               // true => shows for everyone in its phase
  condition?: {
    locationIncludes?: LocationTag[]
    goalIncludes?: RegulatoryGoal[]
    locationPatternIncludes?: LocationPattern[]
  }
  grounding?: { pmid: string; record_id?: string }   // provenance; citation resolved via the live message bank
}
```

### Cue bank (`src/data/breathingCues.ts`)

| id | phase | shows for | text (app-voice) | grounding |
|---|---|---|---|---|
| `setup_position_supine` | setup | locationPattern ∈ {single, connected} | "If you can, try this lying down." | 24835338 |
| `setup_hand_belly_chest` | setup | core | "One hand on your lower belly, one on your chest — let only the lower hand rise." | 31436595 |
| `setup_rib_expand` | setup | location includes `ribs` | "Rest a hand over the sore rib and breathe gently into it." | 24835338 |
| `breath_longer_exhale` | in_session | core | "Let the exhale be a little longer than the inhale." | 35623448 |
| `breath_soft_belly` | in_session | core | "Let the belly stay soft." | 31436595 |
| `breath_easy_shoulders` | in_session | core | "Let the shoulders be easy." | (none) |
| `breath_decompress_room` | in_session | goal includes `decompress` | "Give the sore area a little room with each breath." | 24835338 |

(Bank grows as the corpus grows; this is the Layer 3 seed.)

### Selection engine (`src/engine/groundedMessages/selectBreathingCues.ts`)

```ts
export type CueSessionInput = {
  location?: LocationTag[]
  locationPattern?: LocationPattern
  goal?: RegulatoryGoal | null
}
export type SessionCues = { setupCues: BreathingCue[]; inSessionCues: BreathingCue[] }

export function selectBreathingCues(input: CueSessionInput, bank?: BreathingCue[]): SessionCues
```

Pure (INV-1). A cue is included when: `core === true`, OR its `condition` matches `input`
(location overlap / goal match / pattern match). Partitioned by `phase`. Deterministic order
(bank order, then `id` asc). No clock, no randomness.

### Surfaces

- **`SessionSetupScreen`** renders `setupCues`. For each, if a live (`pt_advisor_passed`)
  GroundedMessage exists whose `citation.pmid === cue.grounding?.pmid`, render the citation
  via the shipped `GroundedTip` pattern (verbatim quote + linked PMID). Otherwise render the
  cue text alone (coach-always; D5).
- **`BreathPhaseRenderer`** receives `inSessionCues` + the running breath/round count and
  shows ONE cue at a time, text only, rotating: `index = floor(breathsCompleted / CUES_PER_ROTATION) % inSessionCues.length`, `CUES_PER_ROTATION = 2` (tunable const). Gentle crossfade. Replaces the old `positionCue`/`diaphragmaticCue` props (D6).

---

## Data dependency (precursor)

The setup citations resolve against mediCalm's `GROUNDED_MESSAGES` bank. Today only PMID
39818121 is in that bank. To surface citations for 24835338 / 31436595 / 35623448, add them
as `GroundedMessage` entries (sourced from the-muscle-pt research-001/010/011), shipping
`engineering_passed` (dark) until Zach attests — then each flips to `pt_advisor_passed` and
its citation lights up. The in-breath cues need no bank entry (text-only).

---

## Acceptance criteria

1. `selectBreathingCues` is pure and snapshot-stable (INV-1) — same input → same output.
2. Core cues always appear in their phase.
3. `setup_rib_expand` appears only when `input.location` includes `ribs`; never otherwise.
4. `breath_decompress_room` appears only when `input.goal === 'decompress'`.
5. `setup_position_supine` appears only for locationPattern single/connected.
6. Setup citation renders only when a `pt_advisor_passed` message matches the cue's PMID;
   otherwise the cue text shows with no citation (D5) — asserted by a component test.
7. In-breath cues render **text only, no citation/Learn-more UI** (INV-2) — asserted by test.
8. In-breath rotation indexes deterministically by breath count, loops, and uses no clock
   or randomness (INV-1) — asserted by test.
9. The old static `positionCue`/`diaphragmaticCue` path is removed; its existing
   `BreathPhaseRenderer` tests are updated to the rotating-cue model (D6) — no parallel system.
10. Full suite green + `tsc --noEmit` clean; `selectPreSessionTip` and Layer-1 reveal untouched.

## Out of scope (roadmap)
Post-session "what guided this" recap (optional future); Layer 4 build-time authoring
automation; capturing new PMIDs beyond research-001/010/011.
