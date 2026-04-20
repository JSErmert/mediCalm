# MediCalm M2 Session Experience Spec

Status: Draft
Owner: Josh
Authority: This document is the authoritative reference for M2 guided session UI implementation.
Depends on: 05_mediCalm_guided_session_ui_spec.md (primary), 06_mediCalm_safety_reassurance_spec.md,
            07_mediCalm_visual_design_doctrine.md, 17_mediCalm_accessibility_-motion_fallbacks.md,
            04_mediCalm_execution_spec.md

---

## Conflict Resolution

When this document and the base markdown pack overlap:
- This document wins for M2-specific timing, motion values, and layout decisions
- The base markdown pack wins for safety behavior, claims language, and product identity
- Safety always outranks aesthetics, continuity, and motion quality

---

## What M2 Is

A single, deterministic, fully guided breathing session rendered from a `RuntimeSession` object
produced by the M2 execution engine.

The user follows. The app leads. That is the complete interaction model.

---

## Session Structure

```
Entry Transition
  → Guided Breathing Phase
      → 3-Step Emergence (runs during Guided Breathing)
  → Completion
```

These four phases are not separate screens.
They are states within one continuous visual environment.

---

## 1. Entry Transition

### Purpose
Move the user from the data-entry context (pain input) into the guided session context without
creating a perceptible loading moment or a hard visual break.

### Trigger
Begins immediately when the execution engine resolves a protocol and the session object is ready.
There must be no visible pause between pain input submission and session start.

### What exits
The pain input screen fades out entirely.

### What enters
The session environment fades in as a unified whole:
- background field
- breathing orb (begins in neutral/resting state, not already animating)
- protocol name and goal text
- first step text (held at zero opacity until the step emergence phase begins)

### Timing
- Exit duration: 200–280ms
- Entry duration: 280–350ms
- Total perceived transition: under 600ms
- Easing: `ease-in-out` for exit, `ease-out` for entry

### Entry feel
The entry should feel like settling — like a space becoming quieter rather than a new
screen appearing. The user's attention should land naturally at the center of the screen
where the orb is positioned.

### What must not happen
- No spinner, loader, or progress indicator
- No hard cut between screens
- No slide, scale, or directional movement
- The orb must not begin its breathing cycle during the entry crossfade
  (it starts animating only after entry is complete)

---

## 2. Guided Breathing Phase

### Purpose
Guide the user through one complete protocol using visual countdown pacing as the primary
instruction method. The user should be able to follow the session by looking only at the
orb and countdown numbers — no reading required after the first cycle.

### Duration
- Determined by `timing_profile` in the `RuntimeSession` object
- Default profile: 4s inhale × 8 rounds + 7s exhale × 8 rounds = 88 seconds
- The UI must honor whatever timing the engine provides — do not hard-code 4/7

---

### 2a. Breathing Model

**Cycle order (canonical, must be followed exactly):**
```
Inhale → (optional hold) → Exhale → (brief reset pause) → next cycle
```

**Default timings (from RuntimeSession.timing_profile):**
- Inhale: 4 seconds
- Hold: not used in v1 (duration = 0, phase is skipped entirely)
- Exhale: 7 seconds
- Reset pause between cycles: 0.4 seconds (visual only — orb settles; no countdown shown)

**Cycle count:**
- Driven by `timing_profile.rounds`
- Default: 8 rounds
- The UI tracks current round and total rounds internally; this is not displayed to the user

**Phase labels (internal state names only — not shown to user):**
- `INHALE`
- `EXHALE`
- `RESET`

---

### 2b. Countdown System

**Purpose:** Replace text instruction as the primary pacing signal. The user watches numbers
decrease and breathes accordingly. This removes the need to read during active pain states.

**Inhale countdown:**
```
4 → 3 → 2 → 1
```

**Exhale countdown:**
```
7 → 6 → 5 → 4 → 3 → 2 → 1
```

**Display rules:**
- The countdown number is shown inside or centered directly above the orb
- One number at a time — no current + next display
- Each number displays for exactly 1 second
- Transitions between numbers: opacity crossfade, 80–120ms, no movement
- Font: large, legible, tabular numerals
- Color: matches or closely tracks `--color-text-primary`; must contrast against orb background
- During the reset pause (0.4s between cycles): no countdown shown; orb holds contracted state

**What the countdown must not do:**
- Animate with motion (no slide, no scale change)
- Change size between numbers
- Show decimals or fractions
- Flash or pulse

---

### 2c. Breathing Orb — Visual Behavior

**Role:** The orb is the primary pacing instrument. It is not decorative.
Every visual change the orb makes communicates breath state.

**Structure (two-layer):**
- **Core:** filled circle, soft gradient center, carries the countdown number
- **Glow:** diffuse radial layer outside the core; lower opacity than core; responds
  to breath phase with slight intensity variation

**Scale behavior:**

| Phase  | Core scale | Glow scale | Core opacity | Glow opacity |
|--------|-----------|------------|--------------|--------------|
| Resting (pre-start) | 0.72 | 0.55 | 1.0 | 0.35 |
| Inhale start → end  | 0.72 → 1.0 | 0.55 → 0.85 | 1.0 | 0.35 → 0.55 |
| Exhale start → end  | 1.0 → 0.72 | 0.85 → 0.55 | 1.0 | 0.55 → 0.35 |
| Reset pause         | 0.72 (hold) | 0.55 (hold) | 1.0 | 0.35 |

**Scale constraints:**
- Minimum core scale: 0.72 (must never disappear or become too small to read countdown)
- Maximum core scale: 1.0 (orb fills its container at full inhale; never overflows)
- The glow layer always scales proportionally larger than the core — never same size

**Motion character:**
- Expansion on inhale: begins with slight ease-in, settles with ease-out
- Contraction on exhale: begins at ease-in, finishes slightly more slowly than it started
  (the exhale should feel a fraction longer and softer than the inhale — this is intentional)
- Must feel organic and smooth, not mechanical or linear
- Must never jitter, snap, or reverse mid-phase

**Easing for orb scale animation:**
- Inhale: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — smooth ease-in-out weighted to ease-out
- Exhale: `cubic-bezier(0.33, 0.0, 0.67, 1.0)` — begins gently, longer softness at end

**What the orb must not do:**
- Bounce at the extremes of inhale or exhale
- Use spring physics
- Change color between phases
- Display text other than the countdown number
- Animate faster than its phase duration allows
- Pulsate at any frequency faster than the breath cycle

**Orb sizing:**
- Mobile (portrait): orb container = 52–56% of screen width
- Desktop (centered column): orb container = max 260px
- The orb must remain fully visible without scrolling at all viewport sizes in scope

---

### 2d. Reduced Motion Variant

When `prefers-reduced-motion: reduce` is active OR `AppSettings.reduced_motion_enabled` is true:

**What changes:**
- Remove orb scale animation entirely (orb stays at a fixed size — midpoint between min and max)
- Replace opacity changes with smaller, subtler opacity pulses (0.85 ↔ 1.0 range)
- Glow layer: reduce opacity range (0.2 ↔ 0.4 instead of 0.35 ↔ 0.55)
- All text transitions: opacity only, no blur
- Countdown crossfades: 40ms instead of 80–120ms (nearly instant)

**What must not change:**
- Countdown numbers and timing — these remain identical
- Phase durations — inhale/exhale timing is unchanged
- Step emergence timing — steps still appear at the correct intervals
- Step text content

**The reduced motion experience must still be fully usable.**
Pacing must be communicated through the countdown alone if animation is fully absent.

---

## 3. Guided Session Screen Layout

### Philosophy
One thing at a time. The center is the session. Everything else recedes.

### Element order (top to bottom, mobile portrait)

```
[top zone]      Protocol name (small, muted)
                Goal text (small, muted, below protocol name)

[center zone]   Breathing orb with countdown
                (occupies the visual center of gravity)

[lower zone]    Step text (current step, primary weight)
                Microtext (optional, beneath step text, lighter weight)

[bottom zone]   Stop / exit control (visually quiet, always accessible)
```

### Spacing philosophy
- Center zone takes priority — orb and countdown should never feel crowded
- Lower zone text is positioned to not compete with the orb visually
- Top zone text is minimal: small font, low contrast — provides context, not instruction
- No panels, no sidebars, no secondary data columns
- On desktop, the same layout is centered within the max-width column — empty space on sides
  is left empty; do not fill it

### What must not appear on the guided session screen
- Pain level number
- Protocol rationale or mechanism explanation
- Source citations or confidence labels
- Multiple simultaneous instruction blocks
- Progress bar or percentage complete indicator
- Round counter (e.g. "Round 3 of 8") — this adds cognitive load with no benefit in M2

---

## 4. 3-Step Emergence

### Purpose
Deliver three body-cue instructions spaced across the early session to reduce startup cognitive
load. The user should not receive all instructions at once. Instructions arrive when the user
is ready for them.

### Trigger
Step emergence begins when the entry transition completes and the first breath cycle starts.

### Timing

| Step | Appears at | Emergence behavior |
|------|-----------|-------------------|
| Step 1 | 0s (immediately on session start) | Fades in from zero opacity; slight blur resolves to crisp |
| Step 2 | +3 seconds after Step 1 | Same fade + blur-to-crisp |
| Step 3 | +3 seconds after Step 2 | Same fade + blur-to-crisp |

All three steps are visible simultaneously once Step 3 has appeared.

### Emergence animation (standard motion)
- Duration: 350–420ms
- Starting state: opacity 0, slight blur (2–3px)
- Ending state: opacity 1.0, blur 0
- Easing: `ease-out`
- Steps do not push other elements — they fade into already-reserved space

### Emergence animation (reduced motion)
- Duration: 120ms
- Starting state: opacity 0 (no blur)
- Ending state: opacity 1.0
- No blur applied at any point

### Step text rules

**Length:** 5–7 words maximum per step. This is a hard limit.

**Tone:**
- Grounded, direct, calm
- Ends with a period
- No metaphor, no hype, no motivational language
- Present tense imperative ("Expand ribs." not "Try to expand your ribs.")

**Example steps (from protocol PROTO_RIB_EXPANSION_RESET):**
- Step 1: `Inhale four. Expand ribs.`
- Step 2: `Exhale seven. Drop shoulders.`
- Step 3: `Jaw loose. Neck soft.`

**Typography:**
- Step text: `--text-lg` or `--text-xl`, `--weight-medium`, `--color-text-primary`
- Step 2 and Step 3 (before they appear): reserved space but invisible — do not collapse layout

### Visual hierarchy after all steps are visible

| Element | Weight |
|---------|--------|
| Current step (most recent) | Highest: full opacity, primary weight |
| Prior steps | Reduced: 50–60% opacity, same weight |
| Microtext (if present) | Lowest: small size, secondary color |

**Microtext rules:**
- Optional — only rendered if `RuntimeSession.cue_sequence` includes a microtext field
- Max one microtext element visible at a time
- Max length: 6–8 words
- Must not compete visually with current step text
- Examples: `Let the back ribs widen.` / `Do not force the breath.`
- Must never contain source citations, medical claims, or explanation paragraphs

---

## 5. Completion Phase

### Trigger
Completion begins when the final breath cycle finishes (all rounds complete without interruption).

### Transition into completion
- Guidance fades down gently: step text and microtext reduce to zero opacity over 400ms
- Orb remains present but transitions to a neutral resting state (scale 0.72, reduced glow)
- Orb does not disappear — it anchors the screen through completion
- Completion content fades in over 350ms once guidance content is fully faded

### Purpose
Let the user notice what changed. Collect feedback. Save the session. Return home.

### Required structure

```
[orb, in resting state — persistent]

"Session complete."

[pain after prompt]   0–10 slider (same component as pain input)

[result prompt]       Three choices, equal visual weight:
                        Better
                        Same
                        Worse

[change markers]      Optional multi-select chips (same TagSelector component):
                        Less tight / Less burning / Easier breathing /
                        More control / Less jaw tension / Less pressure / No change

[note]                Optional textarea (same as pain input)

[Save and finish]     Primary action button
```

### Completion tone rules (from Safety + Reassurance Spec)

**Use:**
- `Session complete.`
- `Notice what changed.`
- `Save your response.`

**Do not use:**
- `Great work.`
- `You did it.`
- `You're healing.`
- Anything that evaluates the user's performance
- Anything that implies the session fixed or cured anything

### Pain-after input
- Uses the same `PainSlider` component from M1
- Label: `How do you feel now?` (not "pain level" — the framing is different at completion)
- Pre-populated at the same value as pain-before (user adjusts down or up as appropriate)
- Required field

### Result input
- Three buttons: `Better` / `Same` / `Worse`
- Equal visual weight — no button is styled as the "correct" answer
- Required — Save is disabled until one is selected

### Save behavior
- On save: write `HistoryEntry` to localStorage (`medicaLm_session_history`)
- Transition back to HomeScreen via soft crossfade (300ms)
- New session entry appears at top of history list
- No animation celebrating the save
- No confetti, streak notification, or achievement language

---

## 6. Early Exit / Interruption

### User-initiated exit (Stop button)
- Session ends immediately
- `session_status` is set to `user_stopped`
- A brief confirmation is shown only if the session has been running for more than 20 seconds
  (below that threshold, exit is immediate and silent)
- Brief confirmation text: `Stop this session?` with `Stop` and `Continue` options
- If stopped: route to a minimal completion screen where only Pain After and Result are captured
  (no change markers, no note in this path — keep it short)
- `HistoryEntry` is saved with `session_status: 'user_stopped'`

### Safety interruption (in-session stop trigger reported)
- Handled per Safety + Reassurance Spec (doc 06) § 2. Active Session Safety Interrupts
- Countdown halts immediately
- Step text is replaced with safety copy — this is not animated; it appears immediately
- Safety copy is displayed at higher contrast and prominence than normal step text
- Follow-up is suppressed
- See safety spec for exact copy — it is not defined in this document

### No pause feature in M2
- There is no pause/resume in M2
- The stop button exits the session; it does not pause it
- This reduces implementation complexity and keeps the session a single coherent arc

---

## 7. Motion Principles (Global)

### Allowed motion

| Type | Duration range | Easing |
|------|---------------|--------|
| Screen crossfade (enter/exit) | 200–350ms | ease-in-out / ease-out |
| Orb scale animation | Matches phase duration (4s or 7s) | Custom cubic-bezier per phase |
| Text fade-in (step emergence) | 350–420ms | ease-out |
| Countdown number crossfade | 80–120ms | ease |
| Completion content fade-in | 300–400ms | ease-out |
| Orb settle (reset pause) | 200–280ms | ease-in-out |

### Forbidden motion

- **Bounce:** any animation that overshoots its target and returns
- **Spring physics:** no spring-based easing for any visible element
- **Sharp cuts:** no zero-duration opacity or position change (except safety interrupt copy)
- **Rapid pulsing:** no animation completing faster than 80ms for any user-visible element
- **Slide transitions:** no horizontal or vertical movement for screen changes
- **Zoom:** no scale changes used as screen transitions
- **Parallax:** no depth-layered motion
- **Ornamental animation:** any motion that exists purely for visual interest unrelated to
  breathing guidance

### Scale limits (non-orb elements)
- No element on the session screen should use scale animation except the orb
- Text does not scale — it fades only

---

## 8. M2 Scope Boundaries

### Included in M2

- Entry transition from session_placeholder → guided session
- Breathing orb with countdown (standard + reduced motion variants)
- 4s inhale / 7s exhale cycle, 8 rounds (driven by RuntimeSession.timing_profile)
- 3-step emergence system with blur-to-clarity reveal
- Protocol name and goal display (top zone, minimal)
- Optional microtext layer
- Stop/exit control
- Basic safety interrupt UI (halt + display safety copy from safety spec)
- Completion screen: pain after, result (better/same/worse), optional change markers, note
- Save to localStorage (HistoryEntry)
- Return to HomeScreen with new entry visible
- Reduced motion support for all animated elements

### Excluded from M2 — do not implement

- Audio playback of any kind (M3)
- Haptic feedback (post-M2)
- Follow-up session flow (M4)
- Protocol selection UI (users do not choose — the engine chooses)
- Multiple simultaneous protocol variants in the UI
- Round counter or progress indicator
- Breathing hold phase (inhale/exhale only in M2)
- Personalization influence on session rendering
- Session review screen (card detail view from history — M3)
- Network requests of any kind
- Session sharing or export
- Onboarding or tutorial overlay

---

## 9. Rendering Contract with the Engine

The session UI receives a `RuntimeSession` object and must render exactly what it specifies.
The UI does not modify, filter, or supplement the session content.

**Fields the UI must consume:**

| Field | Used for |
|-------|---------|
| `protocol_name` | Top zone label |
| `goal` | Top zone sub-label |
| `timing_profile.inhale_seconds` | Orb inhale duration + countdown length |
| `timing_profile.exhale_seconds` | Orb exhale duration + countdown length |
| `timing_profile.rounds` | Total cycle count |
| `cue_sequence[0..2]` | Step 1, Step 2, Step 3 text |
| `estimated_length_seconds` | (internal tracking only — not displayed) |
| `stop_conditions` | Trigger check during active session |
| `pain_input.pain_level` | Pre-populate pain-after slider at completion |

**Fields the UI must not alter:**
- Timing values — do not round, adjust, or override
- Cue sequence — display verbatim; do not truncate or reformat
- Stop conditions — check all of them; do not skip any

---

## 10. On-Screen Language Reference

### Active session (permitted)

```
Start here.
Follow this.
Expand ribs.
Drop shoulders.
Jaw loose. Neck soft.
Good. Continue.
Let the back ribs widen.
Do not force the breath.
```

### Completion (permitted)

```
Session complete.
Notice what changed.
How do you feel now?
Save your response.
```

### Forbidden language (anywhere in M2 session UI)

```
You're doing great.
Well done.
You're healing.
This will fix it.
You are safe.          ← unless specifically validated per safety spec
Amazing work.
Keep it up.
[Any streak language]
[Any numerical score]
[Any diagnosis or cause statement]
```

---

## 11. Accessibility Checklist (M2 Required)

- [ ] All interactive elements have visible focus rings (`--color-accent-primary` outline)
- [ ] Stop/exit button is reachable by keyboard
- [ ] Countdown region is labelled for screen readers (`aria-live="polite"` or equivalent)
- [ ] Orb animation does not rely on motion to convey required information
      (countdown always present as text)
- [ ] Completion form inputs have associated labels
- [ ] Result buttons (`Better` / `Same` / `Worse`) have `aria-pressed` state
- [ ] Safety interrupt copy becomes the dominant readable element when safety mode activates
- [ ] Reduced motion variant tested: session is fully operable without any animation

---

*End of M2 Session Experience Spec*
