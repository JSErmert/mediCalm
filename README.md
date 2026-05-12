# mediCalm

**Symptom-driven body-regulation PWA — deterministic protocol selection with an explicit safety gate.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5-blue.svg)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/react-18-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-5-646cff.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-mobile--first-orange.svg)](#)

Built solo by [Joshua Ermert](https://www.linkedin.com/in/josh-ermert-79496b176/) (B.S. Management Information Systems + double minor in Computer Science and Interdisciplinary Studies, SDSU Weber Honors College, May 2026).

---

## What mediCalm is

A mobile-first Progressive Web App that delivers symptom-driven breathing, posture, and self-regulation protocols. The user reports which body / emotion states they're in right now; the app collapses those signals through a deterministic conflict hierarchy into one session configuration, then runs the resulting protocol with the appropriate safety gating.

The design constraint: in moments of acute distress, the answer to *"what do I do right now?"* should be **one clear protocol**, not a list of options. The system makes the decision deterministically, traces the decision path, and routes safety-critical paths separately from comfort paths.

---

## Why it exists

Wellness apps tend to fail in two ways: (1) they offer many options at the moment when the user has least capacity to choose, and (2) they blend safety-critical surfaces with comfort surfaces, which can be dangerous when the user is reporting acute distress signals. mediCalm addresses both by enforcing **deterministic state interpretation** and a **routed safety gate** — sadness signals that indicate risk trigger a 988-crisis-line escalation path that is structurally separate from the comfort protocol surface.

---

## Core design rules

1. **Deterministic state interpretation** — seven concurrent state signals (Pain, Anxious, Angry, Sad, Exhausted, Tight, Overwhelmed) collapse through a fixed conflict hierarchy (**safety > clarity > novelty**) into exactly one session configuration. The same inputs always produce the same configuration.
2. **Explicit safety gate** — sadness signals route through a SAD safety gate. If risk indicators are present, the session does not start; the user is escalated to the **988 crisis line** instead. The safety surface and the comfort surface never blend.
3. **Bounded controlled adaptation** — when the system personalises, it adapts **one variable at a time**, similarity-gated, deterministic. This prevents the personalisation-drift failure mode common in wellness apps.

---

## Quick start

```bash
npm install
npm run dev
```

Opens Vite at <http://localhost:5173>. The PWA can be installed to a phone home screen for offline use.

### Test suites

```bash
npm run test:run    # unit + integration tests (Vitest)
npm run e2e         # end-to-end tests (Playwright)
```

---

## Status

**Milestone M6 shipped** — State-Aware Regulation System. The deterministic interpretation engine, conflict-hierarchy resolver, SAD safety gate, and bounded controlled adaptation are in place. Subsequent milestones (M7+) are in active development on feature branches and not reflected on `main`.

---

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the component layout, data flow, and engineering constraints.

---

## Repository

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — component layout, state model, safety gating
- [`SECURITY.md`](SECURITY.md) — responsible-disclosure policy
- [`LICENSE`](LICENSE) — MIT

---

## Author

Joshua Ermert — [linkedin.com/in/josh-ermert-79496b176](https://www.linkedin.com/in/josh-ermert-79496b176/) · [github.com/JSErmert](https://github.com/JSErmert)
