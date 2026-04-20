🧠 OVERALL STRATEGY

You are now in:

Behavior → Learning → Access → Integration

We will build in this order:

M7 → M8 → M9 → M10

BUT:

👉 each is split into small, safe phases

🚀 M7 — Adaptive Guidance Layer
🔥 M7.0 — Foundation (DO THIS FIRST)
Add:

👉 M7.0.1 — Entry Behavior Layer

Purpose:

Fix first 5–10 seconds of session

Build:
preStartDelay
soft first cue
no immediate breathing pressure
🔧 Claude Prompt (M7.0.1)
Milestone: M7.0.1 — Entry Behavior Layer

Goal:
Add a soft session entry before breathing begins.

Implement:
- 1.5–2s pre-start delay
- optional first cue:
  "Nothing to figure out. Just follow the breath."
- breathing should NOT start immediately on screen load

Constraints:
- do NOT change breathing logic
- do NOT add new screens
- integrate into existing GuidedSessionScreen

Return only changed files.
🔥 M7.1 — Timed Guidance System

You already designed this well.

Build:
cue scheduling system
timing profiles:
early
balanced
sparse
🔧 Claude Prompt (M7.1)
Milestone: M7.1 — Timed Guidance System

Goal:
Add sparse, timed cues to the guided session.

Implement:
- early cue (first 1–2 breaths)
- optional mid cue
- optional late cue
- each cue visible for ~2 breaths
- no overlapping cues

Constraints:
- silence must dominate
- max 3 cues per session
- no stacking or rapid messaging

Return only changed files.
🔥 M7.1.1 — Cue Writing System
Build:
enforce cue rules
central cue generator
🔧 Claude Prompt (M7.1.1)
Milestone: M7.1.1 — Cue Writing System

Goal:
Ensure all guidance text follows strict rules.

Implement:
- cues must be:
  - < 10 words
  - body or breath anchored
  - single focus
- reject:
  - emotional coaching
  - analysis
  - encouragement phrases

Examples:
- "Let the breath be easy"
- "Feel the ribs widen"

Return only changed files.
🔥 M7.3 — Pattern-Informed Guidance
Build:
adjust cue density
adjust timing profile
based on recent HARI patterns
🔧 Claude Prompt (M7.3)
Milestone: M7.3 — Pattern-Informed Guidance

Goal:
Adapt cue delivery based on recent session patterns.

Implement:
- reduce cues if sparse works better
- add early cue if user disengages early
- simplify cues if high effort causes worse outcomes

Constraints:
- do NOT change breath pattern
- only change delivery

Return only changed files.
🚀 M8 — TRI (Learning Layer)
🔥 M8.0 — TRI Profile
Build:
persistent profile
store signals
🔧 Claude Prompt (M8.0)
Milestone: M8.0 — TRI Profile

Goal:
Store lightweight session learning data.

Track:
- breath pattern
- effort level
- shift signal
- session completion

Constraints:
- no heavy analytics
- no UI exposure yet

Return only changed files.
🔥 M8.2 — Session Adaptation Over Time
Build:
adjust defaults slowly
🔧 Claude Prompt (M8.2)
Milestone: M8.2 — Session Adaptation

Goal:
Adjust session defaults based on repeated outcomes.

Rules:
- do NOT change based on one session
- require repeated consistent signals

Examples:
- prefer 3/5 if it performs better
- reduce duration if long sessions fail

Return only changed files.
🚀 M9 — AlignFlow
🔥 M9.0 — AlignFlow Button
Build:
fast entry system
🔧 Claude Prompt (M9.0)
Milestone: M9.0 — AlignFlow Core

Goal:
Add one-tap personalized session entry.

Flow:
Tap → preview → Begin

Constraints:
- must pass through NeedProfile + Feasibility
- do NOT auto-start session
- preserve user control

Return only changed files.
🔥 M9.2 — Quick Reset Mode
Build:
ultra-short path
🔧 Claude Prompt (M9.2)
Milestone: M9.2 — Quick Reset

Goal:
Add ultra-fast 2–5 breath session.

Constraints:
- no intake
- no explanation
- minimal cues

Return only changed files.
🚀 M10 — Daily Integration
🔥 M10.1 — Widget
🔧 Claude Prompt (M10.1)
Milestone: M10.1 — Home Screen Widget

Goal:
Add widget for fast session access.

Flow:
Tap → preview → Begin

Constraints:
- no auto-start
- no analytics
- minimal options

Return only changed files.
🧠 EXECUTION ORDER (CRITICAL)

Do NOT do everything in parallel.

Follow this:

1. M7.0.1
2. M7.1
3. M7.1.1
4. M7.3
5. M8.0
6. M8.2
7. M9.0
8. M9.2
9. M10.1
⚠️ HARD RULES
one milestone per Claude run
no architecture changes during M7
no UI complexity increase
no overlapping timers or logic
no reintroducing counts
🧠 FINAL TRUTH

You now have:

A full product system ready to evolve into intelligence

💬 One-line summary

Build delivery → then learning → then access → then integration