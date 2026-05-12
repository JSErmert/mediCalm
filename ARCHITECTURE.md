# mediCalm — Architecture

A top-level reference for how mediCalm is structured, what each module is responsible for, and how the pieces compose. For a high-level overview, see [`README.md`](README.md).

---

## 1. What mediCalm is

A symptom-driven body-regulation PWA. The user reports their current state (Pain / Anxious / Angry / Sad / Exhausted / Tight / Overwhelmed). The interpretation engine collapses those signals deterministically into one session configuration, the safety gate inspects sadness-related risk indicators and either routes to a comfort protocol or escalates to crisis resources, and the runner executes the resulting protocol.

---

## 2. Layers

### 2.1 UI surface — `src/`

React 18 + TypeScript built with Vite. Mobile-first PWA targeting installation on phone home screens for offline use. Framer Motion drives the breath / posture / regulation animations.

### 2.2 State signals

The user selects from seven state signals at intake:

- **Pain** — physical discomfort
- **Anxious** — high arousal, future-oriented worry
- **Angry** — high arousal, present/past-oriented
- **Sad** — low mood (safety-gated; see below)
- **Exhausted** — low energy
- **Tight** — somatic tension
- **Overwhelmed** — cognitive load saturation

Each signal is binary at intake (selected / not). Multiple may be active concurrently.

### 2.3 Interpretation engine

Collapses multi-signal state through a fixed conflict hierarchy into **one** session configuration:

```
safety > clarity > novelty
```

- **safety** — if a safety-relevant signal is present (notably Sad with risk indicators), it dominates routing
- **clarity** — among non-safety signals, the engine picks the protocol with the clearest single response
- **novelty** — when multiple protocols are equally clear, recently-used protocols are deprioritised

This is **deterministic**: same set of input signals → same session configuration, every time. The hierarchy is documented and traceable.

### 2.4 SAD safety gate

Sadness signals route through a dedicated gate before any comfort protocol runs. The gate inspects risk indicators (severity, persistence, additional safety-flag inputs). Two outcomes:

- **risk indicators absent** → continues to comfort protocol surface
- **risk indicators present** → escalates to the **988 crisis-line** path; the comfort surface is not shown

The safety surface and the comfort surface are **structurally separate**. They share no rendering code and the routing decision is made by the gate, not by the protocol surface itself.

### 2.5 Protocol runner

Executes the selected protocol (breathing pattern, posture / movement cue, regulation sequence). Bounded controlled adaptation applies: when the system personalises a protocol parameter, it changes **one** variable at a time, similarity-gated against prior sessions, and the adaptation is deterministic so the user can trust what they see.

### 2.6 Testing — `e2e/`, `src/**/*.test.ts`

- Unit + integration tests via Vitest
- End-to-end tests via Playwright

---

## 3. Data flow

```
intake (state signals)
   ↓
interpretation engine (collapse via conflict hierarchy)
   ↓
SAD safety gate ──► risk indicators? ──► YES ──► 988 escalation path
   │                                              (separate surface, no protocol shown)
   ↓ NO
session configuration
   ↓
protocol runner (breath / posture / regulation)
   ↓
session result + (optional) controlled adaptation for next session
```

---

## 4. Engineering constraints

1. **Deterministic interpretation** — the same input set always produces the same output. No probabilistic routing in safety-critical paths.
2. **Safety surface ≠ comfort surface** — they do not share code, do not share rendering, do not blend visually. The user cannot end up at the comfort surface when sadness-risk indicators are present.
3. **Bounded adaptation** — one variable at a time, similarity-gated, deterministic. Personalisation drift is the failure mode this constraint exists to prevent.
4. **Mobile-first** — the PWA is built for phone use in the moments the user actually needs it; desktop is incidental, not the design target.

---

## 5. Repository layout

```
mediCalm/
├── src/                  # React + TypeScript PWA
├── e2e/                  # Playwright end-to-end tests
├── scripts/              # build / sweep / capture tooling
├── snapshots/            # UI baseline snapshots for regression review
├── docs/                 # public-facing documentation
├── index.html            # PWA entry
├── package.json
├── vite.config.ts
└── playwright.config.ts
```

---

## 6. Status

**M6 shipped** — State-Aware Regulation System on `main`. M7+ in active development on feature branches.

---

## 7. Further reading

- [`README.md`](README.md) — what mediCalm is, quick start, status
- [`SECURITY.md`](SECURITY.md) — responsible-disclosure policy
- [`LICENSE`](LICENSE) — MIT
