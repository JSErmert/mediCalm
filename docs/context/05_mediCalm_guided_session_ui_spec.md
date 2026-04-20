
# MediCalm Guided Session UI Spec
Version: v3
Status: Draft
Owner: Josh
Depends on: Product Vision, UX/UI Experience Report, Execution Spec, Safety + Reassurance Spec, Visual Design Doctrine

## Purpose

This document defines the authoritative v1 UI behavior for MediCalm guided sessions.

It translates the product's calm-medical UX doctrine into exact interface behavior for:
- session entry
- guided breath presentation
- step emergence
- screen transitions
- active session playback
- completion
- return-to-home history flow
- interruption handling

If another document is more conceptual or poetic, this file wins for guided-session UI behavior.

---

## Core UI Principle

The UI must feel:

- clinically grounded
- calm and reassuring
- low-overload
- modern and luminous
- fast in system response
- slow in user experience

The guided session should feel like one continuous environment, not a stack of disconnected screens.

---

## v1 Session Flow

```text
Home
  -> Pain Input
  -> Instant Session Resolution
  -> Guided Session
  -> Completion Check-Out
  -> Save Session
  -> Return to Home with New Entry Visible
```

### Core Runtime Rule
- after pain input is submitted, the user must not see a loading-style pause
- system response should feel immediate
- transitions may be smooth, but not delayed

---

## 1. Pain Input Screen

### Purpose
Collect the minimum state required to generate a safe first intervention.

### Required Inputs
- pain level (0-10)
- pain region(s)
- pain type(s)

### Optional Inputs
- trigger/context
- brief note

### UI Rules
- one main question at top:
  `What level is your pain right now?`
- primary focus is the pain level selector
- region and type selection must be simple, tappable, and legible
- avoid dense forms or scrolling-heavy layouts in v1
- screen must feel open, quiet, and immediately understandable

### Input Completion Behavior
When the user submits:
- fade the input state into the guided session state
- do not show a spinner unless runtime failure occurs
- keep ambient audio continuous if already active

---

## 2. Transition System

### Principle
Transitions should blend, not cut.

The UI should feel cinematic in continuity, but medically restrained in pace.

### v1 Transition Rules
- use crossfades, not hard cuts
- target duration: 200-400ms
- allow slight blur-to-clarity resolution on appearing content
- avoid bounce, springy playfulness, dramatic zooms, or slide-heavy navigation

### Focus-to-Clarity Pattern
For new session text:
- begin at slightly reduced opacity
- allow subtle soft-focus / blur
- resolve into sharp readable text
- total reveal should remain short and calm

### Persistent Elements
The following should persist visually across session transitions when possible:
- breathing orb
- ambient background field
- audio environment

This creates continuity and reduces cognitive load.

---

## 3. Guided Session Screen

### Structure
The guided session screen contains:
1. central breathing orb
2. countdown guidance
3. current step text
4. optional microtext
5. soft session status layer
6. stop / exit control

### Layout Priorities
- center first: breathing orb
- step text second
- all other controls visually minimized
- no clutter, no secondary panels, no noisy metrics during active guidance

### Visual Tone
- deep neutral base
- soft cyan / teal luminous accents
- warm low-intensity highlight
- clear typography
- generous spacing

The result should feel:
- modern
- open
- clean
- calm
- trustworthy

---

## 4. Breathing Orb

### Role
The breathing orb is the central anchor of the guided session.

It is not decorative.
It is the primary pacing instrument.

### Behavior
- expands on inhale
- contracts on exhale
- exhale motion should feel slightly longer and softer than inhale
- orb should remain smooth and organic, never robotic or jittery

### Continuity Rule
The breathing orb should remain present through:
- initial session reveal
- step progression
- completion transition
- follow-up transition, if allowed

### Visual Behavior
- luminous edge
- soft core gradient
- subtle opacity and glow variation with the breath cycle
- restrained motion only

---

## 5. Countdown-First Breathing Guidance

### Principle
The session should be guided primarily through visual countdown, not text-heavy instruction.

### v1 Countdown Pattern
Default breath pacing:
- inhale countdown: 4 -> 3 -> 2 -> 1
- exhale countdown: 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1

### UI Rules
- countdown should be clearly visible within or centered on the orb
- the user should understand pacing without needing full sentences
- text cues support the breathing pattern, but do not dominate it

### Optional Minimal Cue Examples
- `Expand ribs.`
- `Drop shoulders.`
- `Jaw loose.`

### v1 Constraint
Avoid simultaneous display of:
- long instruction blocks
- multiple paragraphs
- competing explanation panels

During active breathing, the user should only need to:
- look
- follow
- breathe

---

## 6. Step Emergence System

### Principle
The session presents exactly three primary steps in sequence.

The user should feel guided, not flooded.

### v1 Step Timing
- Step 1 appears immediately
- Step 2 appears 3 seconds later
- Step 3 appears 3 seconds later

### Step Language Rules
Each step should:
- contain about 5-7 words max
- end with a period
- use grounded, calm, direct wording
- avoid hype, metaphor, or explanation during active pain state

### Example Step Sequence
- `Inhale four. Expand ribs.`
- `Exhale seven. Drop shoulders.`
- `Jaw loose. Neck soft.`

### Reveal Behavior
Each new step:
- fades in softly
- may sharpen from slight blur to crisp clarity
- does not push prior content around aggressively
- should feel like the next instruction arriving at the right time

### Text Hierarchy
- current step: highest emphasis
- prior step(s): optionally softened or minimized
- microtext: lowest emphasis

---

## 7. Microtext Layer

### Purpose
Offer tiny supportive clarification without overwhelming the session.

### v1 Rules
- microtext is optional
- must never compete with primary step text
- must remain short
- should only appear when it improves confidence or form

### Example Uses
- `Let the jaw stay loose.`
- `Support your weight here.`
- `Do not force the stretch.`

### Do Not Use Microtext For
- long explanations
- source citations
- medical education blocks
- emotional coaching paragraphs

---

## 8. Active Controls

### Required Controls
- stop session
- back / exit
- audio toggle (if ambient audio is enabled)

### UI Rules
- controls must be accessible but visually quiet
- active guidance always remains the main focus
- accidental exits should be reduced with simple confirmation if progress is meaningful

### Stop Behavior
If user stops manually:
- session ends gracefully
- log as user-stopped, not completed
- offer calm return path to home

---

## 9. Safety Interruption UI

### Principle
If a stop condition occurs, the UI must shift from guidance mode to safety mode immediately.

### Safety UI Rules
- halt countdown
- freeze session progression
- stop step emergence
- replace normal step text with brief safety message
- suppress follow-up suggestions

### Tone
Safety text must be:
- calm
- clear
- non-dramatic
- direct

### Example Message Style
- `Stop here.`
- `Do not continue this session.`
- `Seek care now.`

### Prohibition
Do not keep ambient aesthetic behavior so strong that it masks urgency.
Safety mode must still feel calm, but more explicit.

---

## 10. Completion Screen

### Principle
Completion should feel respectful and quiet.

The user should feel:
- supported
- not pressured
- invited to notice change

### v1 Completion Flow
At session end:
1. active guidance fades down
2. orb remains or softens into completion state
3. completion prompt appears
4. user enters pain-after and result
5. session is saved
6. app returns home with latest entry visible

### Completion Prompts
Examples:
- `Session complete.`
- `Notice what changed.`
- `Save your response.`

### Required Inputs
- pain after
- better / same / worse

### Optional Inputs
- change markers
- note

---

## 11. Home Return + History Visibility

### Principle
The product loop should feel complete.

The user should be able to reference what just happened after the session.

### Home Return Rules
After save:
- transition back to home using a soft fade
- new session entry appears near the top of history
- avoid celebratory gamification, streaks, badges, or confetti

### History Card Fields
- time
- pain before -> after
- area
- type
- result
- selected protocol / sequence name

### Card Interaction
Tapping a previous session should allow the user to review:
- the sequence used
- the breath timing
- their recorded result
- any optional note

The home screen should feel like:
- a calm history of care
- not a dashboard of performance

---

## 12. Audio Environment

### Principle
Audio should support regulation, not call attention to itself.

### v1 Ambient Layers
- gentle water
- soft wind
- faint natural life ambience

### Audio Rules
- continuous across transitions
- no jarring resets between screens
- low intensity by default
- user can mute at any time

### Optional Cue Layer
- very subtle pulse at end of breath cycle
- must remain non-distracting

---

## 13. Motion and Restraint Rules

The UI may feel cinematic, but it must remain clinically restrained.

### Allowed
- crossfade
- soft blur-to-clarity
- gentle opacity changes
- smooth orb scaling
- subtle glow breathing

### Not Allowed
- dramatic zooms
- flashy visual effects
- rapid state switching
- excessive parallax
- ornamental animation unrelated to guidance

### Core Test
If an animation makes the app feel more like a luxury wellness product than a precise calming tool, remove or reduce it.

---

## 14. Tone Rules for On-Screen Language

All active session text should feel:
- medically grounded
- calm
- minimal
- steady
- non-judgmental

### Prefer
- `Start here.`
- `Follow this.`
- `Expand ribs.`
- `Drop shoulders.`
- `Good. Continue.`

### Avoid
- exaggerated reassurance
- mystical language
- overpromising
- motivational hype
- dense clinical jargon

---

## 15. Responsive Behavior

v1 must work on:
- iPhone portrait first
- desktop / laptop with centered session presentation

### Small Screen Rule
On mobile:
- prioritize orb, countdown, and current step
- secondary info must stay minimal
- no crowded layouts

### Large Screen Rule
On desktop:
- preserve the same centered calm hierarchy
- do not fill the screen with unnecessary panels just because space exists

---

## 16. Runtime UI Contract with Execution Layer

The execution layer must provide the UI:
- session_id
- protocol_id
- protocol_name
- display_mode
- timing_profile
- cue_sequence
- estimated_length_seconds
- stop_conditions
- feedback_prompt
- allowed_follow_up
- history_writeback

The UI layer is responsible for:
- rendering pacing
- step emergence timing
- transition behavior
- completion capture
- home return behavior

---

## v1 Non-Goals

The guided session UI should not:
- feel like a complex dashboard
- behave like a general meditation app
- overwhelm the user with explanation
- present protocol rationale during active pain state
- use visual drama to simulate effectiveness

---

## Implementation Note for Claude Code

Claude Code should treat this file as the authoritative guided-session UI behavior spec for v1.

If another document is more aspirational, this file wins for:
- breathing presentation
- countdown behavior
- step timing
- transition style
- completion behavior
- home/history return loop
