# Current M6–M10 State

---

## M6 — State-Aware Regulation System

**Status: Fully Implemented**

All M6 screens, engine layers, and routing are in place. Here's the breakdown:

| Phase | Spec | What It Does | Status |
|-------|------|-------------|--------|
| **M6.0** | Architecture Lock | System identity, conflict hierarchy, HARI role, breath engine (2/4, 3/5, 4/7) | LOCKED |
| **M6.1** | State Selection Screen | Multi-select entry (Pain, Anxious, Angry, Sad, Exhausted, Tight, Overwhelmed) | Done |
| **M6.1.1** | SAD Safety Screen | "Sad" triggers safety gate → escalation exit w/ 988 crisis line, or continue | Done |
| **M6.2** | Foundation Layer | EntryState types, AppContext additions, schema, routing (Home→State→SAD→Intake) | Done |
| **M6.3** | Dynamic Intake | State-dependent fields (location for Pain/Tight, sensitivity for Pain, intensity for all) | Done |
| **M6.4** | State Interpretation Engine | Deterministic multi-state → single session config. Priority hierarchy, overload protocol (5+ states) | Done |
| **M6.5** | Session Configuration Bridge | `buildSessionConfig()` — pure function, interpretation result → execution blueprint | Done |
| **M6.6** | Guided Session Runtime | Orb-based breathing session with progress, pause/resume, completion flow | Done |
| **M6.7** | Feasibility + HARI Context | Overwhelmed/sensitivity adjustments, 24hr recency context tracking. Environment constraints (e.g., Driving) enforced here | Done |
| **M6.8** | Input → Breathwork Pipeline | NeedProfile → FeasibilityProfile → BreathFamily → BreathPrescription (no counts, time-based only) | Done |
| **M6.8.1** | Breathwork Refinements | Corrected mappings (overwhelmed→downregulate), activation gating, exhale>inhale enforcement | Done |
| **M6.8.2** | Runtime Integrity + Patterns UI | Single authoritative clock, "Your Patterns" panel, subtle shift feedback (relaxed/open/steady/energized/no_change/tense_tight) | Done |
| **M6.8.3.1** | Controlled Adaptation | Memory-informed tweaks — one variable at a time, similarity-gated, deterministic | Done |
| **M6.8.3.2** | Continue What Helped | Routes to canonical guided screen (not separate UI), memory-informed prescription | Done |
| **M6.8.4** | Runtime Unification | Final cleanup/boundary pass | Done |
| **M6.9** | User Refinement Layer | Bounded post-prescription refinement (felt need bias, delivery intensity, start style). Optional single-screen surface, 0–2 selections, deterministic output. Environment moved to M6.7. Activation hidden when disallowed. Memory-informed sessions clamped to low influence | Locked — implementation after M7.3 |

**Key artifacts**: 8 screens, 7 engine modules, AppContext + router fully wired. All M6 code is production-level (no stubs).

---

## M7–M10 — The Roadmap Ahead

The milestones are **strictly layered** — each builds on the previous without collapsing responsibilities:

```
M6  (WHAT TO DO)     — determines need, feasibility, family, prescription
 ↓
M6.9 (USER REFINE)   — bounded refinement of delivery-relevant parameters
 ↓
M7  (HOW TO DELIVER) — guidance timing, cues, entry behavior
 ↓
M8  (LEARNING)       — TRI profile, adaptation over time
 ↓
M9  (ACCESS)         — fast entry leveraging learned patterns
 ↓
M10 (INTEGRATION)    — daily usage, widgets
```

---

## M7 — Adaptive Guidance Layer

**Purpose**: How the system *delivers* breathing guidance (not what it prescribes — that's M6).

| Step | What | Details |
|------|------|---------|
| **M7.0.1** | Entry Behavior Layer | 1.5–2s pre-start delay, optional first cue ("Nothing to figure out. Just follow the breath."), prevent immediate breathing pressure |
| **M7.1** | Timed Guidance System | Sparse scheduled cues — early cue at 1–2 breaths, optional mid/late, max 3 per session, visible ~2 breaths each |
| **M7.1.1** | Cue Writing System | Strict rules: <10 words, body/breath anchored, single focus. No emotional coaching, analysis, or encouragement |
| **M7.3** | Pattern-Informed Guidance | Adapt cue delivery from HARI patterns — reduce if sparse works, add early if disengagement, simplify if high effort worsens outcomes |

**Core principle**: Silence dominates. Cues are sparse, grounded, non-intrusive.

**Note**: M6.9 implementation is scheduled after M7.3.

---

## M8 — TRI Learning Layer

**Purpose**: Lightweight session learning and progressive adaptation over time.

| Step | What | Details |
|------|------|---------|
| **M8.0** | TRI Profile | Persistent storage of lightweight signals (breath pattern, effort, shift signal, completion). No heavy analytics, no UI exposure yet |
| **M8.2** | Session Adaptation Over Time | Adjust defaults from repeated outcomes. Require consistent signals across multiple sessions before changing anything. One variable at a time |

**Core principle**: Prefer stability over novelty. Only adapt strongly when states are similar.

---

## M9 — AlignFlow (Fast Entry)

**Purpose**: Reduce friction with intelligent, personalized session entry.

| Step | What | Details |
|------|------|---------|
| **M9.0** | AlignFlow Button | One-tap personalized session entry. Flow: Tap → preview → Begin. Must pass NeedProfile + Feasibility. No auto-start |
| **M9.2** | Quick Reset Mode | Ultra-fast 2–5 breath session. No intake, no explanation, minimal cues |

**Core principle**: Leverage learned TRI data. Preserve user control — never auto-start.

---

## M10 — Daily Integration

**Purpose**: Integrate into daily usage patterns beyond the app.

| Step | What | Details |
|------|------|---------|
| **M10.1** | Home Screen Widget | Widget for fast session access. Tap → preview → Begin. No auto-start, no analytics |

**Core principle**: Remove barriers to quick, contextual breathing support.

---

## Execution Order

1. M7.0.1 (Entry Behavior)
2. M7.1 (Timed Guidance)
3. M7.1.1 (Cue Writing)
4. M7.3 (Pattern-Informed Guidance)
5. **M6.9 (User Refinement Layer)**
6. M8.0 (TRI Profile)
7. M8.2 (Session Adaptation)
8. M9.0 (AlignFlow Core)
9. M9.2 (Quick Reset)
10. M10.1 (Widget)

---

## Architecture Guardrails

The M7-10 Architecture folder includes:

- **CLAUDE System Prompt** — discipline rules for implementers: one milestone per run, no architecture changes, no reintroducing counts, reuse canonical guided session UI
- **CLAUDE Evaluation Prompt** — post-implementation audit checklist covering layer integrity, runtime correctness, guidance quality, feasibility, adaptation behavior, and UX trust
