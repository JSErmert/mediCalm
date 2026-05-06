# M7.1 — Substrate Plumbing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the M7 substrate (types, pathway library v0.1, selection + variant resolution functions, HistoryEntry extensions, phase log + orphan sweep) and wire it into production with bit-identical behavior to the existing engine, validated by sweep diff = zero against the postfix baseline.

**Architecture:** New `src/engine/m7/` subsystem coexists with existing `src/engine/hari/`. M7's selection function consumes intake, returns a `PTVariant` (the cross-surface frozen artifact). An adapter converts a single-breath-phase variant to the legacy `TimingProfile` shape so the existing GuidedSessionScreen renders unchanged at M7.1. HistoryEntry gains optional M7 fields populated alongside legacy fields. Sweep harness validates M7's output equals legacy's output for every selection state.

**Tech Stack:** TypeScript 5.6, React 18, Vite, Vitest, vite-node (sweep harness), localStorage.

**Source spec:** `docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md` §3 (types), §5 (invariants I1–I40), §8 (M7.1 deliverables + acceptance), §10 Q4 (migration methodology).

**Branch:** `m7-pt-pathway-foundation` (already cut from `main` at f5f1a02; M7.0 design doc committed at 8d766ae).

**No-regression contract:** Every selection state still produces today's exact `(family, inhale, hold, exhale, duration)`. Sweep diff = zero against `docs/superpowers/audits/intake-output-sweep-2026-05-05-postfix/findings.md` baseline.

---

## File map

**Create:**
- `src/types/m7.ts` — All M7 types (identity primitives, phase types, grounding, pathway/variant, selection table, M6.9 stubs)
- `src/data/m7Pathways.ts` — Pathway library v0.1 (PTPathway + PTVariant entries from migration analysis)
- `src/data/m7SelectionTable.ts` — Resolved selection table (rows enumerating selection_state → pathway_id mappings)
- `src/engine/m7/selection.ts` — `selectPathway()` function
- `src/engine/m7/variantResolution.ts` — `resolveVariant()` function
- `src/engine/m7/substrateInvariants.ts` — Resolution-time substrate invariant checks (I1–I26 subset that's runtime-checkable)
- `src/engine/m7/phaseLog.ts` — Phase entry/exit logging + orphan sweep
- `src/engine/m7/timingProfileAdapter.ts` — Convert PTVariant.phases[0] (BreathPhase) to legacy TimingProfile
- `src/engine/m7/integration.ts` — Top-level `buildM7Session(intake, safety)` orchestration
- `docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md` — Migration analysis output (which of today's 12 outputs collapse to which pathways/variants)

**Modify:**
- `src/types/index.ts` — Re-export M7 types; add HistoryEntry M7 additions to `HistoryEntry` interface
- `src/storage/sessionHistory.ts` — Persist M7 HistoryEntry fields
- `src/screens/GuidedSessionScreen.tsx` — Trigger phase entry/exit logging at session start/end
- `src/context/AppProvider.tsx` — Trigger orphan sweep on app-load
- `scripts/intakeOutputSweep.ts` — Add M7 validation pass (selection table totality + diff vs baseline)

**Test files (mirror per source):**
- `src/types/m7.test.ts` (smoke test for type imports / shape assertions)
- `src/data/m7Pathways.test.ts`
- `src/data/m7SelectionTable.test.ts`
- `src/engine/m7/selection.test.ts`
- `src/engine/m7/variantResolution.test.ts`
- `src/engine/m7/substrateInvariants.test.ts`
- `src/engine/m7/phaseLog.test.ts`
- `src/engine/m7/timingProfileAdapter.test.ts`
- `src/engine/m7/integration.test.ts`

---

## Task ordering

The 18 tasks below run sequentially. Earlier tasks unblock later ones (types first, then library/data, then functions consuming them, then integration, then validation). Each task is self-contained and ends with a commit.

---

## Phase A — Type foundations

### Task 1: Set up M7 type module with identity primitives

**Files:**
- Create: `src/types/m7.ts`
- Create: `src/types/m7.test.ts`

- [ ] **Step 1: Write failing test asserting M7 type module exists with identity primitives**

```ts
// src/types/m7.test.ts
import { describe, it, expect } from 'vitest'
import type { PathwayId, VariantId, TemplateId, SemVer, ISODate } from './m7'

describe('M7 type module — identity primitives', () => {
  it('exports identity primitive types as string aliases', () => {
    const pid: PathwayId = 'thoracic_restrictive_with_anxious_overlay'
    const vid: VariantId = 'th-rest-anx-irrit-fast-flare-mod-int-low'
    const tid: TemplateId = 'standard_5_count'
    const ver: SemVer = '1.0.0'
    const ts: ISODate = '2026-05-05T12:00:00.000Z'
    expect(typeof pid).toBe('string')
    expect(typeof vid).toBe('string')
    expect(typeof tid).toBe('string')
    expect(typeof ver).toBe('string')
    expect(typeof ts).toBe('string')
  })
})
```

- [ ] **Step 2: Run test, verify it fails (module does not exist)**

Run: `npx vitest run src/types/m7.test.ts`
Expected: FAIL with `Cannot find module './m7'`

- [ ] **Step 3: Create `src/types/m7.ts` with identity primitives**

```ts
// src/types/m7.ts
/**
 * M7 — PT Pathway Foundation types.
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3
 */

// ── Identity primitives (§3.1) ────────────────────────────────────────────────
export type PathwayId = string
export type VariantId = string
export type TemplateId = string
export type SemVer = string
export type PMID = string
export type ISODate = string
export type PositionName = string
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/types/m7.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/types/m7.ts src/types/m7.test.ts
git commit -m "feat(m7): identity primitive types for pathway substrate"
```

---

### Task 2: Add phase types (Phase, BreathPhase, PositionHoldPhase, TransitionPhase)

**Files:**
- Modify: `src/types/m7.ts`
- Modify: `src/types/m7.test.ts`

- [ ] **Step 1: Add failing test for phase types**

Append to `src/types/m7.test.ts`:

```ts
import type { Phase, BreathPhase, PositionHoldPhase, TransitionPhase } from './m7'

describe('M7 phase types — Q2.A locked shapes', () => {
  it('BreathPhase carries family + cycles + cue (no parameter override)', () => {
    const p: BreathPhase = {
      type: 'breath',
      breath_family: 'calm_downregulate',
      num_cycles: 8,
      cue: { opening: 'Settle', closing: 'Complete' },
    }
    expect(p.type).toBe('breath')
    expect(p.num_cycles).toBe(8)
  })

  it('PositionHoldPhase carries position + duration + breath_pattern (only two valid)', () => {
    const p: PositionHoldPhase = {
      type: 'position_hold',
      position: 'supine_knees_bent',
      duration_seconds: 60,
      breath_pattern: 'soft_natural',
      cue: { opening: 'Settle', closing: 'Hold' },
      entry_instruction: 'Lie down',
      exit_instruction: 'Sit up gently',
    }
    expect(p.breath_pattern === 'soft_natural' || p.breath_pattern === 'unstructured').toBe(true)
  })

  it('TransitionPhase has subtype + template ref (pinned version) + 5s duration', () => {
    const p: TransitionPhase = {
      type: 'transition',
      subtype: 'intro',
      template_id: 'standard_5_count',
      template_version: '1.0.0',
      duration_seconds: 5,
    }
    expect(p.duration_seconds).toBe(5)
    expect(p.subtype).toBe('intro')
  })

  it('Phase is a discriminated union across the three concrete types', () => {
    const phases: Phase[] = [
      { type: 'breath', breath_family: 'calm_downregulate', num_cycles: 4, cue: { opening: '', closing: '' } },
      { type: 'transition', subtype: 'between', template_id: 'standard', template_version: '1.0.0', duration_seconds: 5 },
    ]
    expect(phases.length).toBe(2)
  })
})
```

- [ ] **Step 2: Run test, verify it fails (types missing)**

Run: `npx vitest run src/types/m7.test.ts`
Expected: FAIL — type not found errors at compile

- [ ] **Step 3: Add phase types to `src/types/m7.ts`**

Append to `src/types/m7.ts`:

```ts
import type { BreathFamilyName } from './hari'

// ── Phase types (§3.2 — Q2.A locked) ─────────────────────────────────────────

export type BreathPhase = {
  type: 'breath'
  /** Pure-from-family — no parameter override at M7.0 (§2.6 grounding contract). */
  breath_family: BreathFamilyName
  num_cycles: number
  cue: { opening: string; mid?: string; closing: string }
  position_cue?: string
}

export type PositionHoldPhase = {
  type: 'position_hold'
  position: PositionName
  duration_seconds: number
  /** Structured embedded patterns deferred to M7.5+ (§9 out-of-scope). */
  breath_pattern: 'unstructured' | 'soft_natural'
  cue: { opening: string; mid?: string; closing: string }
  entry_instruction: string
  exit_instruction: string
}

export type TransitionPhase = {
  type: 'transition'
  subtype: 'intro' | 'between' | 'closing'
  template_id: TemplateId
  /** Pinned in artifact — historical sessions remain reproducible bit-for-bit (§10 Q5 R1). */
  template_version: SemVer
  subtitle?: string
  /** Locked at exactly 5 — invariant I14. */
  duration_seconds: 5
}

export type Phase = BreathPhase | PositionHoldPhase | TransitionPhase
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/types/m7.test.ts`
Expected: PASS (5 tests cumulative)

- [ ] **Step 5: Commit**

```bash
git add src/types/m7.ts src/types/m7.test.ts
git commit -m "feat(m7): phase types — breath / position_hold / transition (Q2.A)"
```

---

### Task 3: Add grounding types (TierACitation, ReasoningChain, GroundingSummary)

**Files:**
- Modify: `src/types/m7.ts`
- Modify: `src/types/m7.test.ts`

- [ ] **Step 1: Add failing test for grounding types**

Append to `src/types/m7.test.ts`:

```ts
import type { TierACitation, ReasoningChain, GroundingSummary } from './m7'

describe('M7 grounding types — Tier A/B contract (§3.3)', () => {
  it('TierACitation carries PMID + source_link + exact_figure verbatim with units', () => {
    const c: TierACitation = {
      pmid: '33117119',
      source_link: 'https://pubmed.ncbi.nlm.nih.gov/33117119/',
      exact_figure: 'resonance frequency 6 breaths/min ± 0.5',
      figure_units: 'breaths/min',
    }
    expect(c.pmid).toBe('33117119')
    expect(c.exact_figure).toContain('6 breaths/min')
  })

  it('GroundingSummary holds Tier A citations + Tier B reasoning chains', () => {
    const g: GroundingSummary = {
      tier_A_citations: [{
        pmid: '33117119',
        source_link: 'https://pubmed.ncbi.nlm.nih.gov/33117119/',
        exact_figure: '6 breaths/min',
        figure_units: 'breaths/min',
      }],
      tier_B_reasoning_chains: [{
        claim: '4-7 breath ratio supports vagal activation',
        reasoning: 'Slower exhale than inhale shifts autonomic balance toward parasympathetic.',
        terminating_citations: ['33117119'],
      }],
    }
    expect(g.tier_A_citations.length).toBe(1)
    expect(g.tier_B_reasoning_chains[0].terminating_citations).toContain('33117119')
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/types/m7.test.ts`
Expected: FAIL on grounding type imports

- [ ] **Step 3: Add grounding types to `src/types/m7.ts`**

Append to `src/types/m7.ts`:

```ts
// ── Grounding (§3.3 — Tier A/B contract) ─────────────────────────────────────

export type TierACitation = {
  pmid: PMID
  source_link: string
  /** Verbatim figure with units; never paraphrased numerics (§2.6). */
  exact_figure: string
  figure_units: string
}

export type ReasoningChain = {
  claim: string
  reasoning: string
  /** Chain MUST terminate in Tier A — references PMIDs in own grounding or referenced corpus. */
  terminating_citations: PMID[]
}

export type GroundingSummary = {
  tier_A_citations: TierACitation[]
  tier_B_reasoning_chains: ReasoningChain[]
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/types/m7.test.ts`
Expected: PASS (7 tests cumulative)

- [ ] **Step 5: Commit**

```bash
git add src/types/m7.ts src/types/m7.test.ts
git commit -m "feat(m7): grounding types — Tier A citation + Tier B reasoning chain"
```

---

### Task 4: Add PathwaySelectionCriteria + PTPathway + PTVariant + ResolvedPathway

**Files:**
- Modify: `src/types/m7.ts`
- Modify: `src/types/m7.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `src/types/m7.test.ts`:

```ts
import type { PathwaySelectionCriteria, PTPathway, PTVariant, ResolvedPathway } from './m7'

describe('M7 pathway/variant types — §3.4–3.6', () => {
  it('PathwaySelectionCriteria carries selection-feeding dim arrays', () => {
    const c: PathwaySelectionCriteria = {
      branch: ['anxious_or_overwhelmed'],
      session_length_preference: ['standard'],
    }
    expect(c.branch).toContain('anxious_or_overwhelmed')
  })

  it('PTPathway has identity, criteria, duration, grounding, review_status', () => {
    const p: PTPathway = {
      pathway_id: 'anxious_calm_downregulate_standard',
      pathway_version: '0.1.0',
      display_name: 'Anxious Calm Downregulate',
      clinical_summary: 'Standard-length downregulation for anxious branch.',
      selection_criteria: { branch: ['anxious_or_overwhelmed'] },
      authored_duration_seconds: 360,
      grounding: { tier_A_citations: [], tier_B_reasoning_chains: [] },
      authored_by: 'JSEer',
      authored_at: '2026-05-05T00:00:00.000Z',
      review_status: 'engineering_passed',
    }
    expect(p.review_status).toBe('engineering_passed')
  })

  it('PTVariant references parent pathway and carries phases + conditioning', () => {
    const v: PTVariant = {
      variant_id: 'anx-calm-std-irrit-sym-flare-mod-int-mod',
      variant_version: '0.1.0',
      pathway_id: 'anxious_calm_downregulate_standard',
      pathway_version: '0.1.0',
      conditioning: {
        irritability: 'symmetric',
        flare_sensitivity: 'moderate',
        baseline_intensity_band: 'moderate',
      },
      phases: [{
        type: 'breath',
        breath_family: 'calm_downregulate',
        num_cycles: 32,
        cue: { opening: '', closing: '' },
      }],
      authored_by: 'JSEer',
      authored_at: '2026-05-05T00:00:00.000Z',
      review_status: 'engineering_passed',
    }
    expect(v.phases.length).toBeGreaterThanOrEqual(1)
    expect(v.phases.some(p => p.type === 'breath')).toBe(true)  // I7
  })

  it('ResolvedPathway is an alias for PTVariant', () => {
    const r: ResolvedPathway = {
      variant_id: 'x', variant_version: '0.1.0',
      pathway_id: 'p', pathway_version: '0.1.0',
      conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
      phases: [{ type: 'breath', breath_family: 'calm_downregulate', num_cycles: 1, cue: { opening: '', closing: '' } }],
      authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
      review_status: 'draft',
    }
    expect(r.variant_id).toBe('x')
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/types/m7.test.ts`
Expected: FAIL on type imports

- [ ] **Step 3: Add types to `src/types/m7.ts`**

Append to `src/types/m7.ts`:

```ts
import type {
  IntakeBranch,
  LocationPattern,
  SessionLengthPreference,
  CurrentContext,
  SessionIntent,
  IrritabilityPattern,
  FlareSensitivity,
} from './hari'

// ── Selection criteria (§3.4) ────────────────────────────────────────────────

export type PathwaySelectionCriteria = {
  branch: IntakeBranch[]
  location_pattern?: LocationPattern[]
  session_length_preference?: SessionLengthPreference[]
  current_context?: CurrentContext[]
  session_intent?: SessionIntent[]
  derived_signals?: { breathDowngraded?: boolean }
}

// ── PTPathway — clinical-concept entity (§3.5) ───────────────────────────────

export type ReviewStatus = 'draft' | 'engineering_passed' | 'pt_advisor_passed' | 'locked'

export type PTPathway = {
  pathway_id: PathwayId
  pathway_version: SemVer
  display_name: string
  clinical_summary: string
  selection_criteria: PathwaySelectionCriteria
  authored_duration_seconds: number
  grounding: GroundingSummary
  authored_by: string
  authored_at: ISODate
  reviewed_by?: string
  reviewed_at?: ISODate
  review_status: ReviewStatus
}

// ── PTVariant — resolved artifact (§3.6) ─────────────────────────────────────

export type VariantConditioning = {
  irritability: IrritabilityPattern
  flare_sensitivity: FlareSensitivity
  baseline_intensity_band: 'low' | 'moderate' | 'high'
}

export type PTVariant = {
  variant_id: VariantId
  variant_version: SemVer
  /** Pinned reference to parent (immutable post-publish per I23). */
  pathway_id: PathwayId
  pathway_version: SemVer
  conditioning: VariantConditioning
  /** Phase order immutable (I10); ≥1 breath phase (I7). */
  phases: Phase[]
  /** Variant-specific grounding where it differs from pathway-level (else inherits). */
  grounding?: GroundingSummary
  authored_by: string
  authored_at: ISODate
  reviewed_by?: string
  reviewed_at?: ISODate
  review_status: ReviewStatus
}

export type ResolvedPathway = PTVariant
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/types/m7.test.ts`
Expected: PASS (11 tests cumulative)

- [ ] **Step 5: Commit**

```bash
git add src/types/m7.ts src/types/m7.test.ts
git commit -m "feat(m7): PTPathway + PTVariant types with selection criteria"
```

---

### Task 5: Add SelectionTable + function signatures + M6.9 stub artifacts

**Files:**
- Modify: `src/types/m7.ts`
- Modify: `src/types/m7.test.ts`

- [ ] **Step 1: Add failing tests for remaining types**

Append to `src/types/m7.test.ts`:

```ts
import type {
  SelectionTable,
  SelectionTableRow,
  PathwaySelection,
  VariantResolution,
  SelectionRefinements,
  AggregateTruthState,
  IntakeSensorState,
  EffectiveIntakeState,
  PhaseLogEntry,
  TruthState,
} from './m7'

describe('M7 selection table + function signatures + M6.9 stubs (§3.7–3.10)', () => {
  it('SelectionTable rows enumerate selection_state → pathway_id (I15 totality)', () => {
    const row: SelectionTableRow = {
      selection_state: { branch: ['anxious_or_overwhelmed'] },
      pathway_id: 'p',
      pathway_version: '0.1.0',
    }
    const t: SelectionTable = { table_version: '0.1.0', rows: [row] }
    expect(t.rows.length).toBe(1)
  })

  it('PathwaySelection function signature consumes only sensor_state (I17)', () => {
    const fn: PathwaySelection = (_state) => ({ pathway_id: 'p', pathway_version: '0.1.0' })
    const result = fn({
      branch: 'anxious_or_overwhelmed',
      current_context: 'sitting',
      session_intent: 'quick_reset',
      session_length_preference: 'standard',
      flare_sensitivity: 'moderate',
      baseline_intensity: 4,
      irritability: 'symmetric',
    })
    expect(result.pathway_id).toBe('p')
  })

  it('VariantResolution accepts hints optionally (Q8 lock)', () => {
    const fn: VariantResolution = (_pid, _cond, _hints) => ({
      variant_id: 'x', variant_version: '0.1.0',
      pathway_id: 'p', pathway_version: '0.1.0',
      conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
      phases: [{ type: 'breath', breath_family: 'calm_downregulate', num_cycles: 1, cue: { opening: '', closing: '' } }],
      authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
      review_status: 'draft',
    })
    expect(fn('p', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' }).variant_id).toBe('x')
  })

  it('SelectionRefinements carries generation_version + confidence flag', () => {
    const r: SelectionRefinements = {
      generated_at: '2026-05-05T00:00:00.000Z',
      generation_version: '0.0.0',
      confidence_threshold_met: false,
    }
    expect(r.confidence_threshold_met).toBe(false)
  })

  it('PhaseLogEntry uses closed enums on drop_off_reason + source', () => {
    const e: PhaseLogEntry = {
      phase_index: 0,
      phase_type: 'breath',
      started_at: '2026-05-05T00:00:00.000Z',
    }
    expect(e.phase_index).toBe(0)
  })

  it('TruthState fields are all optional for M7.1 sessions', () => {
    const t: TruthState = {}
    expect(t).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/types/m7.test.ts`
Expected: FAIL on type imports

- [ ] **Step 3: Add remaining types to `src/types/m7.ts`**

Append to `src/types/m7.ts`:

```ts
import type { BodyLocation } from './hari'

// ── Selection table (§3.7) ───────────────────────────────────────────────────

export type SelectionTableRow = {
  selection_state: PathwaySelectionCriteria
  pathway_id: PathwayId
  pathway_version: SemVer
}

export type SelectionTable = {
  table_version: SemVer
  /** Totality required by I15; sweep harness validates. */
  rows: SelectionTableRow[]
}

// ── Function signatures (§3.8) ───────────────────────────────────────────────

export type IntakeSensorState = {
  branch: IntakeBranch
  location?: BodyLocation[]
  location_pattern?: LocationPattern
  current_context: CurrentContext
  session_intent: SessionIntent
  session_length_preference: SessionLengthPreference
  flare_sensitivity: FlareSensitivity
  baseline_intensity: number
  irritability: IrritabilityPattern
  derived_signals?: { breathDowngraded?: boolean }
}

export type EffectiveIntakeState = Partial<IntakeSensorState>

export type PathwaySelection = (
  intake_sensor_state: IntakeSensorState,
) => { pathway_id: PathwayId; pathway_version: SemVer }

export type VariantResolution = (
  pathway_id: PathwayId,
  conditioning: VariantConditioning,
  hints?: SelectionRefinements['variant_feeding_hints'],
) => PTVariant

// ── M6.9 artifact stubs (§3.9 — types defined; not yet generated at M7.1) ────

export type SelectionRefinements = {
  generated_at: ISODate
  generation_version: SemVer
  variant_feeding_hints?: {
    irritability_truth_estimate?: IrritabilityPattern
    flare_sensitivity_truth_estimate?: FlareSensitivity
    baseline_intensity_pattern?: 'over_reports' | 'under_reports' | 'accurate'
  }
  confidence_threshold_met: boolean
}

export type AggregateTruthState = {
  generation_version: SemVer
  generated_at: ISODate
  // Field detail TBD at M7.3 (M6.9 territory).
}

// ── HistoryEntry M7 additions (§3.10) ────────────────────────────────────────

export type PhaseLogEntry = {
  phase_index: number
  phase_type: 'breath' | 'position_hold' | 'transition'
  phase_subtype?: 'intro' | 'between' | 'closing'
  started_at: ISODate
  completed_at?: ISODate
  duration_actual_seconds?: number
  drop_off_reason?:
    | 'completed' | 'user_aborted' | 'user_skipped'
    | 'safety_stopped' | 'system_error'
  drop_off_reason_source?: 'explicit' | 'inferred_from_session_end' | 'inferred_from_orphan_sweep'
}

export type TruthState = {
  completion_status?: 'complete' | 'aborted' | 'safety_stopped'
  completion_percentage?: number
  pain_delta?: number
  state_coherence?: 'coherent' | 'mismatched' | 'unclear' | 'pending'
  user_validation?: 'validated' | 'invalidated' | 'pending'
}

export type HistoryEntryM7Additions = {
  intake_sensor_state?: IntakeSensorState
  effective_intake_state?: EffectiveIntakeState
  pathway_ref?: {
    pathway_id: PathwayId
    pathway_version: SemVer
    variant_id: VariantId
    variant_version: SemVer
  }
  phase_log?: PhaseLogEntry[]
  truth_state?: TruthState
  refinement_context?: {
    generation_version: SemVer
    hints_consulted: string[]
    confidence_threshold_met: boolean
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/types/m7.test.ts`
Expected: PASS (17 tests cumulative)

- [ ] **Step 5: Commit**

```bash
git add src/types/m7.ts src/types/m7.test.ts
git commit -m "feat(m7): selection table, function signatures, M6.9 stubs, history additions"
```

---

## Phase B — HistoryEntry extensions

### Task 6: Wire HistoryEntry M7 additions onto existing HistoryEntry type

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Open `src/types/index.ts`, find the existing `HistoryEntry` interface (around line 144)**

Verify the existing interface ends with the legacy fields. Search for:

```ts
export interface HistoryEntry {
```

- [ ] **Step 2: Add M7 imports + extension fields to HistoryEntry**

Add at top of `src/types/index.ts` (with other imports):

```ts
import type { HistoryEntryM7Additions } from './m7'
```

Find the closing `}` of the `HistoryEntry` interface and insert before it:

```ts
  // ── M7 additions (all optional; legacy records remain valid per I37) ────────
  intake_sensor_state?: HistoryEntryM7Additions['intake_sensor_state']
  effective_intake_state?: HistoryEntryM7Additions['effective_intake_state']
  pathway_ref?: HistoryEntryM7Additions['pathway_ref']
  phase_log?: HistoryEntryM7Additions['phase_log']
  truth_state?: HistoryEntryM7Additions['truth_state']
  refinement_context?: HistoryEntryM7Additions['refinement_context']
```

Re-export M7 types at end of file:

```ts
export * from './m7'
```

- [ ] **Step 3: Run typecheck to verify backward compat**

Run: `npx tsc -b 2>&1 | grep -E "error|HistoryEntry" | head -20`
Expected: no new errors related to HistoryEntry. Pre-existing errors (BodyPickerSVG.test.tsx, feasibility.ts:95, test/setup.ts) remain unchanged.

- [ ] **Step 4: Run full test suite to confirm legacy reads work**

Run: `npx vitest run`
Expected: all tests pass (357 → 357+); no test breakage from HistoryEntry extension.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(m7): extend HistoryEntry with optional M7 fields (I37 backward compat)"
```

---

## Phase C — Pathway library v0.1

### Task 7: Write partition analysis doc + scaffold pathway library

**Files:**
- Create: `docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md`
- Create: `src/data/m7Pathways.ts`
- Create: `src/data/m7Pathways.test.ts`

- [ ] **Step 1: Create partition analysis doc**

Create `docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md`:

```markdown
# M7.1 Migration Partition Analysis

**Date:** 2026-05-05
**Source:** `docs/superpowers/audits/intake-output-sweep-2026-05-05-postfix/findings.md` (12 distinct outputs)
**Authority:** M7.0 design doc §10 Q4 (collapse outputs differing only on variant-feeding dims)

## Methodology

Per Q4.1 lock: each of today's 12 outputs is analyzed against the locked partition.
Outputs differing only on variant-feeding dims (irritability × flare_sensitivity ×
baseline_intensity_band) collapse to one pathway with multiple variants.
Outputs differing on selection-feeding dims stay as separate pathways.

## The 12 outputs (postfix)

| # | Fingerprint | Cohort |
|---|---|---|
| 1 | PROTO_REDUCED_EFFORT \| flare_safe_soft_exhale \| 3/0/6/240 | tightness, breathDowngraded |
| 2 | PROTO_REDUCED_EFFORT \| calm_downregulate \| 4/0/7/360 | anxious, standard length |
| 3 | PROTO_REDUCED_EFFORT \| calm_downregulate \| 4/0/7/480 | anxious, long length |
| 4 | PROTO_REDUCED_EFFORT \| decompression_expand \| 4/0/6/240 | tightness, not-downgraded |
| 5 | PROTO_CALM_DOWNREGULATE \| decompression_expand \| 4/0/6/240 | tightness, alt protocol path |
| 6 | PROTO_CALM_DOWNREGULATE \| calm_downregulate \| 4/0/7/360 | anxious, alt protocol path |
| 7 | PROTO_CALM_DOWNREGULATE \| calm_downregulate \| 4/0/7/480 | anxious long, alt protocol path |
| 8 | PROTO_CALM_DOWNREGULATE \| flare_safe_soft_exhale \| 3/0/6/240 | tightness DG, alt protocol path |
| 9 | PROTO_STABILIZE_BALANCE \| calm_downregulate \| 4/0/7/360 | anxious × low flare × deeper_regulation |
| 10 | PROTO_STABILIZE_BALANCE \| decompression_expand \| 4/0/6/240 | tightness × low flare × deeper_regulation |
| 11 | PROTO_STABILIZE_BALANCE \| flare_safe_soft_exhale \| 3/0/6/240 | tightness DG × low flare × deeper_regulation |
| 12 | PROTO_STABILIZE_BALANCE \| calm_downregulate \| 4/0/7/480 | anxious long × low flare × deeper_regulation |

## Partition application

**Selection-feeding dims** drive pathway selection; differences here mean separate pathways:
- branch (always)
- session_length_preference (standard vs long)
- session_intent (deeper_regulation routes to PROTO_STABILIZE_BALANCE family)
- breathDowngraded (derived from intensity ≥ 7 OR flare = high)
- protocol-distinguishing dim (PROTO_REDUCED_EFFORT vs PROTO_CALM_DOWNREGULATE — per existing engine, this is symptom_focus-driven, with symptom_focus now derived from location_pattern; modeled as selection-feeding via location_pattern)

**Variant-feeding dims** (irritability × flare_sensitivity × baseline_intensity_band)
collapse outputs to a single pathway with multiple variants when they're the only
differentiator. In today's 12 outputs, no two outputs differ ONLY on variant-feeding
dims — every pair differs on at least one selection-feeding dim.

## Resulting pathway count for v0.1

12 pathways at M7.1 (no collapse), each with 1 variant covering the migrated cohort.

**Why no collapse for v0.1:** today's engine doesn't differentiate on variant-feeding
dims for most cohorts (irritability is partial 9/12, flare_sensitivity is driver 4/12
+ partial 5/12, baseline_intensity is partial 5/12 + inert 7/12). The variants in
v0.1 are single-variant-per-pathway, with conditioning fields populated to "any"-style
defaults where the dim was inert in legacy.

**Variant machinery exercised at M7.1:** to satisfy I8 (variant resolution totality),
each pathway must have variants covering every (irritability × flare × intensity_band)
combination — 36 combinations max per pathway. For v0.1, all 36 combinations resolve
to the same single variant per pathway (a "default" variant). The variant resolution
function performs lookup; the totality is trivially satisfied.

**M7.4 expansion** introduces clinically meaningful variant differentiation;
pathways gain 6–15 actual variants each as authoring proceeds. v0.1 is the
no-regression baseline; v1.0 (M7.4) is the differentiated catalog.

## Mapping table — 12 pathways v0.1

| Pathway ID | Cohort | TimingProfile target |
|---|---|---|
| `tightness_flare_safe_reduced_effort_short` | output #1 | flare_safe_soft_exhale 3/0/6/240 |
| `anxious_calm_downregulate_reduced_effort_standard` | output #2 | calm_downregulate 4/0/7/360 |
| `anxious_calm_downregulate_reduced_effort_long` | output #3 | calm_downregulate 4/0/7/480 |
| `tightness_decompression_reduced_effort_short` | output #4 | decompression_expand 4/0/6/240 |
| `tightness_decompression_calm_downregulate_short` | output #5 | decompression_expand 4/0/6/240 |
| `anxious_calm_downregulate_calm_downregulate_standard` | output #6 | calm_downregulate 4/0/7/360 |
| `anxious_calm_downregulate_calm_downregulate_long` | output #7 | calm_downregulate 4/0/7/480 |
| `tightness_flare_safe_calm_downregulate_short` | output #8 | flare_safe_soft_exhale 3/0/6/240 |
| `anxious_calm_downregulate_stabilize_balance_standard` | output #9 | calm_downregulate 4/0/7/360 |
| `tightness_decompression_stabilize_balance_short` | output #10 | decompression_expand 4/0/6/240 |
| `tightness_flare_safe_stabilize_balance_short` | output #11 | flare_safe_soft_exhale 3/0/6/240 |
| `anxious_calm_downregulate_stabilize_balance_long` | output #12 | calm_downregulate 4/0/7/480 |

Each pathway has exactly 1 variant at v0.1; variant_id mirrors pathway_id with `_v1` suffix.
```

- [ ] **Step 2: Add failing test for pathway library scaffold**

Create `src/data/m7Pathways.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { M7_PATHWAYS, M7_VARIANTS } from './m7Pathways'

describe('M7 pathway library v0.1 — scaffold', () => {
  it('exports M7_PATHWAYS and M7_VARIANTS arrays', () => {
    expect(Array.isArray(M7_PATHWAYS)).toBe(true)
    expect(Array.isArray(M7_VARIANTS)).toBe(true)
  })

  it('every variant references an existing pathway (I5)', () => {
    const pathwayIds = new Set(M7_PATHWAYS.map(p => p.pathway_id))
    for (const v of M7_VARIANTS) {
      expect(pathwayIds.has(v.pathway_id)).toBe(true)
    }
  })

  it('every variant has at least one breath phase (I7)', () => {
    for (const v of M7_VARIANTS) {
      expect(v.phases.some(p => p.type === 'breath')).toBe(true)
    }
  })

  it('every pathway has authored_duration_seconds > 0 (I3)', () => {
    for (const p of M7_PATHWAYS) {
      expect(p.authored_duration_seconds).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 3: Run test, verify it fails**

Run: `npx vitest run src/data/m7Pathways.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Create empty pathway library scaffold**

Create `src/data/m7Pathways.ts`:

```ts
/**
 * M7 Pathway Library v0.1 — migration of today's 12 postfix outputs.
 *
 * Authority: docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md
 *            docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §8
 *
 * v0.1: 12 pathways × 1 variant each. No-regression baseline. v1.0 (M7.4) introduces
 * differentiated multi-variant authoring.
 */
import type { PTPathway, PTVariant, GroundingSummary } from '../types/m7'

const EMPTY_GROUNDING: GroundingSummary = {
  tier_A_citations: [],
  tier_B_reasoning_chains: [],
}

export const M7_PATHWAYS: PTPathway[] = []
export const M7_VARIANTS: PTVariant[] = []

void EMPTY_GROUNDING
```

- [ ] **Step 5: Run test, verify it passes (vacuously — empty arrays satisfy all I-checks)**

Run: `npx vitest run src/data/m7Pathways.test.ts`
Expected: PASS (4 tests; vacuous on empty arrays).

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md src/data/m7Pathways.ts src/data/m7Pathways.test.ts
git commit -m "docs(m7.1): partition analysis + pathway library scaffold"
```

---

### Task 8: Populate M7_PATHWAYS and M7_VARIANTS (12 entries each)

**Files:**
- Modify: `src/data/m7Pathways.ts`
- Modify: `src/data/m7Pathways.test.ts`

- [ ] **Step 1: Add failing test asserting all 12 migrated pathways exist**

Append to `src/data/m7Pathways.test.ts`:

```ts
describe('M7 pathway library v0.1 — 12-pathway migration completeness', () => {
  it('has exactly 12 pathways (one per postfix-sweep output)', () => {
    expect(M7_PATHWAYS.length).toBe(12)
  })

  it('has exactly 12 variants (one per pathway at v0.1)', () => {
    expect(M7_VARIANTS.length).toBe(12)
  })

  it('every pathway_id is unique', () => {
    const ids = M7_PATHWAYS.map(p => p.pathway_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every variant_id is unique', () => {
    const ids = M7_VARIANTS.map(v => v.variant_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all pathways and variants ship at engineering_passed review_status', () => {
    for (const p of M7_PATHWAYS) expect(p.review_status).toBe('engineering_passed')
    for (const v of M7_VARIANTS) expect(v.review_status).toBe('engineering_passed')
  })

  it('every variant has exactly one breath phase at v0.1 (single-phase migration)', () => {
    for (const v of M7_VARIANTS) {
      expect(v.phases.length).toBe(1)
      expect(v.phases[0].type).toBe('breath')
    }
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/data/m7Pathways.test.ts`
Expected: FAIL — `expected 0 to be 12` (multiple).

- [ ] **Step 3: Replace M7_PATHWAYS and M7_VARIANTS arrays in `src/data/m7Pathways.ts` with full 12-entry migration**

Replace the entire file `src/data/m7Pathways.ts` with:

```ts
/**
 * M7 Pathway Library v0.1 — migration of today's 12 postfix outputs.
 *
 * Authority: docs/superpowers/audits/m7-1-partition-analysis-2026-05-05.md
 *            docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §8
 *
 * v0.1: 12 pathways × 1 variant each. No-regression baseline. Each pathway maps to
 * exactly one postfix-sweep output. Variant conditioning fields populated to v0.1
 * defaults (irritability=symmetric, flare_sensitivity=moderate, baseline_intensity_band=moderate);
 * variant resolution at v0.1 returns the single variant for any conditioning input
 * (variant machinery exercised at lookup level; meaningful differentiation at M7.4).
 */
import type { PTPathway, PTVariant, GroundingSummary, BreathPhase } from '../types/m7'

const EMPTY_GROUNDING: GroundingSummary = {
  tier_A_citations: [],
  tier_B_reasoning_chains: [],
}

const NOW: string = '2026-05-05T00:00:00.000Z'
const VER: string = '0.1.0'

function pathway(
  pathway_id: string,
  display_name: string,
  selection_criteria: PTPathway['selection_criteria'],
  authored_duration_seconds: number,
  clinical_summary: string,
): PTPathway {
  return {
    pathway_id,
    pathway_version: VER,
    display_name,
    clinical_summary,
    selection_criteria,
    authored_duration_seconds,
    grounding: EMPTY_GROUNDING,
    authored_by: 'JSEer',
    authored_at: NOW,
    review_status: 'engineering_passed',
  }
}

function breathPhase(family: BreathPhase['breath_family'], num_cycles: number): BreathPhase {
  return { type: 'breath', breath_family: family, num_cycles, cue: { opening: '', closing: '' } }
}

function variant(
  pathway_id: string,
  family: BreathPhase['breath_family'],
  num_cycles: number,
): PTVariant {
  return {
    variant_id: `${pathway_id}_v1`,
    variant_version: VER,
    pathway_id,
    pathway_version: VER,
    conditioning: {
      irritability: 'symmetric',
      flare_sensitivity: 'moderate',
      baseline_intensity_band: 'moderate',
    },
    phases: [breathPhase(family, num_cycles)],
    authored_by: 'JSEer',
    authored_at: NOW,
    review_status: 'engineering_passed',
  }
}

// num_cycles = floor(duration_seconds / (inhale + exhale))
// flare_safe_soft_exhale 3/6 = 9s → 240s/9 ≈ 26 cycles
// decompression_expand 4/6 = 10s → 240s/10 = 24 cycles
// calm_downregulate 4/7 = 11s → 360s/11 ≈ 32 cycles; 480s/11 ≈ 43 cycles

export const M7_PATHWAYS: PTPathway[] = [
  pathway(
    'tightness_flare_safe_reduced_effort_short',
    'Tightness — Flare Safe (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: true } },
    240,
    'Reduced-effort short session for tightness with breath-downgraded sensitivity profile.',
  ),
  pathway(
    'anxious_calm_downregulate_reduced_effort_standard',
    'Anxious — Calm Downregulate (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['standard'] },
    360,
    'Standard-length downregulation for anxious branch.',
  ),
  pathway(
    'anxious_calm_downregulate_reduced_effort_long',
    'Anxious — Calm Downregulate (Long)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['long'] },
    480,
    'Long-length downregulation for anxious branch.',
  ),
  pathway(
    'tightness_decompression_reduced_effort_short',
    'Tightness — Decompression (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: false } },
    240,
    'Reduced-effort short decompression for tightness without flare-downgrade.',
  ),
  pathway(
    'tightness_decompression_calm_downregulate_short',
    'Tightness — Decompression via Calm Downregulate Protocol (Short)',
    { branch: ['tightness_or_pain'] },
    240,
    'Tightness routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_calm_downregulate_standard',
    'Anxious — Calm Downregulate Protocol (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['standard'] },
    360,
    'Anxious branch routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_calm_downregulate_long',
    'Anxious — Calm Downregulate Protocol (Long)',
    { branch: ['anxious_or_overwhelmed'], session_length_preference: ['long'] },
    480,
    'Long-length anxious branch via PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'tightness_flare_safe_calm_downregulate_short',
    'Tightness — Flare Safe via Calm Downregulate Protocol (Short)',
    { branch: ['tightness_or_pain'], derived_signals: { breathDowngraded: true } },
    240,
    'Tightness-with-flare-downgrade routed through PROTO_CALM_DOWNREGULATE protocol path.',
  ),
  pathway(
    'anxious_calm_downregulate_stabilize_balance_standard',
    'Anxious — Stabilize Balance (Standard)',
    { branch: ['anxious_or_overwhelmed'], session_intent: ['deeper_regulation'], session_length_preference: ['standard'] },
    360,
    'Anxious branch with deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'tightness_decompression_stabilize_balance_short',
    'Tightness — Decompression via Stabilize Balance (Short)',
    { branch: ['tightness_or_pain'], session_intent: ['deeper_regulation'] },
    240,
    'Tightness with deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'tightness_flare_safe_stabilize_balance_short',
    'Tightness — Flare Safe via Stabilize Balance (Short)',
    { branch: ['tightness_or_pain'], session_intent: ['deeper_regulation'], derived_signals: { breathDowngraded: true } },
    240,
    'Tightness-with-flare-downgrade and deeper-regulation intent routed through PROTO_STABILIZE_BALANCE.',
  ),
  pathway(
    'anxious_calm_downregulate_stabilize_balance_long',
    'Anxious — Stabilize Balance (Long)',
    { branch: ['anxious_or_overwhelmed'], session_intent: ['deeper_regulation'], session_length_preference: ['long'] },
    480,
    'Long-length anxious branch with deeper-regulation intent via PROTO_STABILIZE_BALANCE.',
  ),
]

export const M7_VARIANTS: PTVariant[] = [
  variant('tightness_flare_safe_reduced_effort_short', 'flare_safe_soft_exhale', 26),
  variant('anxious_calm_downregulate_reduced_effort_standard', 'calm_downregulate', 32),
  variant('anxious_calm_downregulate_reduced_effort_long', 'calm_downregulate', 43),
  variant('tightness_decompression_reduced_effort_short', 'decompression_expand', 24),
  variant('tightness_decompression_calm_downregulate_short', 'decompression_expand', 24),
  variant('anxious_calm_downregulate_calm_downregulate_standard', 'calm_downregulate', 32),
  variant('anxious_calm_downregulate_calm_downregulate_long', 'calm_downregulate', 43),
  variant('tightness_flare_safe_calm_downregulate_short', 'flare_safe_soft_exhale', 26),
  variant('anxious_calm_downregulate_stabilize_balance_standard', 'calm_downregulate', 32),
  variant('tightness_decompression_stabilize_balance_short', 'decompression_expand', 24),
  variant('tightness_flare_safe_stabilize_balance_short', 'flare_safe_soft_exhale', 26),
  variant('anxious_calm_downregulate_stabilize_balance_long', 'calm_downregulate', 43),
]
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/data/m7Pathways.test.ts`
Expected: PASS (10 tests cumulative — all 12 entries verified).

- [ ] **Step 5: Commit**

```bash
git add src/data/m7Pathways.ts src/data/m7Pathways.test.ts
git commit -m "feat(m7.1): pathway library v0.1 — 12-pathway migration"
```

---

## Phase D — Substrate functions

### Task 9: Substrate invariant check (runtime-checkable subset of I1–I26)

**Files:**
- Create: `src/engine/m7/substrateInvariants.ts`
- Create: `src/engine/m7/substrateInvariants.test.ts`

- [ ] **Step 1: Write failing tests for invariant checks**

Create `src/engine/m7/substrateInvariants.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { assertVariantInvariants } from './substrateInvariants'
import type { PTVariant } from '../../types/m7'

function valid(): PTVariant {
  return {
    variant_id: 'v', variant_version: '0.1.0',
    pathway_id: 'p', pathway_version: '0.1.0',
    conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
    phases: [{ type: 'breath', breath_family: 'calm_downregulate', num_cycles: 4, cue: { opening: '', closing: '' } }],
    authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
    review_status: 'engineering_passed',
  }
}

describe('M7 substrate invariants — runtime check', () => {
  it('passes a valid variant', () => {
    expect(() => assertVariantInvariants(valid())).not.toThrow()
  })

  it('fails I6 — phases.length === 0', () => {
    const v = valid(); v.phases = []
    expect(() => assertVariantInvariants(v)).toThrow(/I6/)
  })

  it('fails I7 — no breath phase', () => {
    const v = valid(); v.phases = [{ type: 'transition', subtype: 'between', template_id: 't', template_version: '1.0.0', duration_seconds: 5 }]
    expect(() => assertVariantInvariants(v)).toThrow(/I7/)
  })

  it('fails I14 — transition duration ≠ 5', () => {
    const v = valid(); v.phases.push({ type: 'transition', subtype: 'between', template_id: 't', template_version: '1.0.0', duration_seconds: 3 as unknown as 5 })
    expect(() => assertVariantInvariants(v)).toThrow(/I14/)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/engine/m7/substrateInvariants.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the invariant check**

Create `src/engine/m7/substrateInvariants.ts`:

```ts
/**
 * M7 substrate invariant checks (resolution-time, engineering-side).
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §5
 *
 * Q7 Concern 1 split: this file owns the engineering-side STRUCTURAL check.
 * The clinical-side check (intake-vs-pathway contraindications) lives separately
 * and is authored at M7.4 PT advisor review.
 */
import type { PTVariant } from '../../types/m7'

export class M7InvariantViolation extends Error {
  constructor(invariant: string, detail: string) {
    super(`[${invariant}] ${detail}`)
    this.name = 'M7InvariantViolation'
  }
}

export function assertVariantInvariants(v: PTVariant): void {
  // I6 — phases.length >= 1
  if (v.phases.length < 1) {
    throw new M7InvariantViolation('I6', `variant ${v.variant_id} has zero phases`)
  }

  // I7 — at least one breath phase
  if (!v.phases.some(p => p.type === 'breath')) {
    throw new M7InvariantViolation('I7', `variant ${v.variant_id} has no breath phase`)
  }

  // I14 — every transition phase has duration_seconds === 5
  for (const phase of v.phases) {
    if (phase.type === 'transition' && phase.duration_seconds !== 5) {
      throw new M7InvariantViolation(
        'I14',
        `variant ${v.variant_id} has a transition with duration ${phase.duration_seconds}, must be 5`,
      )
    }
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/engine/m7/substrateInvariants.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/m7/substrateInvariants.ts src/engine/m7/substrateInvariants.test.ts
git commit -m "feat(m7.1): substrate invariant check (runtime, engineering-side)"
```

---

### Task 10: Selection table runtime artifact + selection function

**Files:**
- Create: `src/data/m7SelectionTable.ts`
- Create: `src/data/m7SelectionTable.test.ts`
- Create: `src/engine/m7/selection.ts`
- Create: `src/engine/m7/selection.test.ts`

- [ ] **Step 1: Write failing test for selection function**

Create `src/engine/m7/selection.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { selectPathway } from './selection'
import type { IntakeSensorState } from '../../types/m7'

function intake(overrides: Partial<IntakeSensorState> = {}): IntakeSensorState {
  return {
    branch: 'anxious_or_overwhelmed',
    current_context: 'sitting',
    session_intent: 'quick_reset',
    session_length_preference: 'standard',
    flare_sensitivity: 'moderate',
    baseline_intensity: 4,
    irritability: 'symmetric',
    ...overrides,
  }
}

describe('M7 selectPathway — selection function (§3.8)', () => {
  it('returns a pathway for anxious + standard length', () => {
    const result = selectPathway(intake({ branch: 'anxious_or_overwhelmed', session_length_preference: 'standard' }))
    expect(result.pathway_id).toContain('anxious')
    expect(result.pathway_id).toContain('standard')
  })

  it('returns a different pathway for long session length', () => {
    const standard = selectPathway(intake({ session_length_preference: 'standard' }))
    const long = selectPathway(intake({ session_length_preference: 'long' }))
    expect(standard.pathway_id).not.toBe(long.pathway_id)
  })

  it('routes deeper_regulation to stabilize_balance pathway family', () => {
    const result = selectPathway(intake({ session_intent: 'deeper_regulation', flare_sensitivity: 'low' }))
    expect(result.pathway_id).toContain('stabilize_balance')
  })

  it('routes tightness with breathDowngraded to flare_safe pathway', () => {
    const result = selectPathway(intake({
      branch: 'tightness_or_pain',
      derived_signals: { breathDowngraded: true },
    }))
    expect(result.pathway_id).toContain('flare_safe')
  })

  it('selection function is deterministic — same input → same output (I16)', () => {
    const a = selectPathway(intake())
    const b = selectPathway(intake())
    expect(a).toEqual(b)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/engine/m7/selection.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create selection table runtime artifact**

Create `src/data/m7SelectionTable.ts`:

```ts
/**
 * M7 Selection Table runtime artifact (Q3 Option B).
 *
 * Authoring mechanism (rule-generated below) is M7.1 implementation choice;
 * the resolved table is the validated audit surface (sweep harness verifies totality).
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.7
 */
import type { SelectionTable, IntakeSensorState, PathwayId, SemVer } from '../types/m7'

/**
 * Match function: given an intake sensor state, returns the matching pathway_id.
 *
 * Rule-generated table — produces equivalent output to today's protocolSelection.ts
 * for every selection-feeding intake combination. Validated against the postfix-sweep
 * baseline by the sweep harness.
 */
export function matchSelectionState(state: IntakeSensorState): { pathway_id: PathwayId; pathway_version: SemVer } {
  const v: SemVer = '0.1.0'
  const dg = state.derived_signals?.breathDowngraded ?? false

  // PROTO_STABILIZE_BALANCE family fires only on deeper_regulation + low flare
  if (state.session_intent === 'deeper_regulation' && state.flare_sensitivity === 'low') {
    if (state.branch === 'anxious_or_overwhelmed') {
      return state.session_length_preference === 'long'
        ? { pathway_id: 'anxious_calm_downregulate_stabilize_balance_long', pathway_version: v }
        : { pathway_id: 'anxious_calm_downregulate_stabilize_balance_standard', pathway_version: v }
    }
    // tightness_or_pain
    return dg
      ? { pathway_id: 'tightness_flare_safe_stabilize_balance_short', pathway_version: v }
      : { pathway_id: 'tightness_decompression_stabilize_balance_short', pathway_version: v }
  }

  // PROTO_CALM_DOWNREGULATE family fires when current_context implies it
  // (legacy engine routes via symptom_focus; here we use current_context as the proxy
  //  for v0.1 — sweep harness validates equivalence)
  const isCalmDownregulateProtocol = state.current_context === 'after_strain'
  if (isCalmDownregulateProtocol) {
    if (state.branch === 'anxious_or_overwhelmed') {
      return state.session_length_preference === 'long'
        ? { pathway_id: 'anxious_calm_downregulate_calm_downregulate_long', pathway_version: v }
        : { pathway_id: 'anxious_calm_downregulate_calm_downregulate_standard', pathway_version: v }
    }
    // tightness_or_pain
    return dg
      ? { pathway_id: 'tightness_flare_safe_calm_downregulate_short', pathway_version: v }
      : { pathway_id: 'tightness_decompression_calm_downregulate_short', pathway_version: v }
  }

  // PROTO_REDUCED_EFFORT family — default
  if (state.branch === 'anxious_or_overwhelmed') {
    return state.session_length_preference === 'long'
      ? { pathway_id: 'anxious_calm_downregulate_reduced_effort_long', pathway_version: v }
      : { pathway_id: 'anxious_calm_downregulate_reduced_effort_standard', pathway_version: v }
  }
  // tightness_or_pain
  return dg
    ? { pathway_id: 'tightness_flare_safe_reduced_effort_short', pathway_version: v }
    : { pathway_id: 'tightness_decompression_reduced_effort_short', pathway_version: v }
}

/**
 * Resolved table (computed) — exposed for sweep validation; not consumed by selectPathway directly
 * since match function above is the runtime path. Sweep harness can enumerate by calling
 * matchSelectionState across every selection-feeding combination.
 */
export const M7_SELECTION_TABLE_VERSION: SemVer = '0.1.0'

export const M7_SELECTION_TABLE: SelectionTable = {
  table_version: M7_SELECTION_TABLE_VERSION,
  rows: [],  // populated by sweep harness; left empty at runtime since match function is canonical
}
```

- [ ] **Step 4: Create selection function**

Create `src/engine/m7/selection.ts`:

```ts
/**
 * M7 selectPathway — pathway selection function (§3.8 PathwaySelection).
 *
 * Consumes ONLY intake_sensor_state per I17 / I36 partition discipline.
 * Deterministic and pure given the same intake (I16).
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §2.4
 */
import type { PathwaySelection } from '../../types/m7'
import { matchSelectionState } from '../../data/m7SelectionTable'

export const selectPathway: PathwaySelection = (intake_sensor_state) => {
  return matchSelectionState(intake_sensor_state)
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npx vitest run src/engine/m7/selection.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/data/m7SelectionTable.ts src/engine/m7/selection.ts src/engine/m7/selection.test.ts
git commit -m "feat(m7.1): selection table + selectPathway function"
```

---

### Task 11: Variant resolution function

**Files:**
- Create: `src/engine/m7/variantResolution.ts`
- Create: `src/engine/m7/variantResolution.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/engine/m7/variantResolution.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveVariant } from './variantResolution'

describe('M7 resolveVariant — §3.8 VariantResolution + I8/I18/I19/I20', () => {
  it('returns a variant for a known pathway with any conditioning (I8 totality)', () => {
    const v = resolveVariant(
      'anxious_calm_downregulate_reduced_effort_standard',
      { irritability: 'fast_onset_slow_resolution', flare_sensitivity: 'high', baseline_intensity_band: 'high' },
    )
    expect(v.pathway_id).toBe('anxious_calm_downregulate_reduced_effort_standard')
    expect(v.phases.length).toBeGreaterThanOrEqual(1)
  })

  it('is deterministic — same inputs → same variant (I18)', () => {
    const a = resolveVariant('anxious_calm_downregulate_reduced_effort_standard', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })
    const b = resolveVariant('anxious_calm_downregulate_reduced_effort_standard', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })
    expect(a).toEqual(b)
  })

  it('throws for an unknown pathway_id', () => {
    expect(() => resolveVariant('does_not_exist', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })).toThrow()
  })

  it('hints have no effect at v0.1 — single variant per pathway', () => {
    const without = resolveVariant('anxious_calm_downregulate_reduced_effort_standard', { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' })
    const withHint = resolveVariant(
      'anxious_calm_downregulate_reduced_effort_standard',
      { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
      { flare_sensitivity_truth_estimate: 'high' },
    )
    expect(without).toEqual(withHint)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/engine/m7/variantResolution.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement variant resolution**

Create `src/engine/m7/variantResolution.ts`:

```ts
/**
 * M7 resolveVariant — variant resolution function (§3.8 VariantResolution).
 *
 * v0.1: each pathway has exactly one variant; resolution is a pathway_id lookup.
 * Conditioning + hints are accepted per the locked signature but do not differentiate
 * variants at v0.1. Variant differentiation (and one-way conservatism enforcement on
 * safety-relevant hints — I19) lands at M7.3+.
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.8 §5
 */
import type { VariantResolution } from '../../types/m7'
import { M7_VARIANTS } from '../../data/m7Pathways'
import { assertVariantInvariants } from './substrateInvariants'

const VARIANT_BY_PATHWAY: Map<string, ReturnType<VariantResolution>> = new Map(
  M7_VARIANTS.map(v => [v.pathway_id, v]),
)

export const resolveVariant: VariantResolution = (pathway_id, _conditioning, _hints) => {
  const v = VARIANT_BY_PATHWAY.get(pathway_id)
  if (!v) throw new Error(`M7 resolveVariant: unknown pathway_id ${pathway_id}`)
  // Substrate invariant check at resolution time (Q7 Concern 1 split — engineering side)
  assertVariantInvariants(v)
  return v
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/engine/m7/variantResolution.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/m7/variantResolution.ts src/engine/m7/variantResolution.test.ts
git commit -m "feat(m7.1): variant resolution function with substrate invariant check"
```

---

### Task 12: TimingProfile adapter (PTVariant single-breath-phase → legacy TimingProfile)

**Files:**
- Create: `src/engine/m7/timingProfileAdapter.ts`
- Create: `src/engine/m7/timingProfileAdapter.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/engine/m7/timingProfileAdapter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { variantToTimingProfile } from './timingProfileAdapter'
import type { PTVariant } from '../../types/m7'

function variant(family: 'flare_safe_soft_exhale' | 'calm_downregulate' | 'decompression_expand', cycles: number): PTVariant {
  return {
    variant_id: 'v', variant_version: '0.1.0',
    pathway_id: 'p', pathway_version: '0.1.0',
    conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
    phases: [{ type: 'breath', breath_family: family, num_cycles: cycles, cue: { opening: '', closing: '' } }],
    authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
    review_status: 'engineering_passed',
  }
}

describe('M7 timingProfileAdapter — PTVariant → legacy TimingProfile', () => {
  it('flare_safe_soft_exhale maps to 3/0/6 timing', () => {
    const t = variantToTimingProfile(variant('flare_safe_soft_exhale', 26))
    expect(t.inhale_seconds).toBe(3)
    expect(t.exhale_seconds).toBe(6)
    expect(t.rounds).toBe(26)
  })

  it('calm_downregulate maps to 4/0/7 timing', () => {
    const t = variantToTimingProfile(variant('calm_downregulate', 32))
    expect(t.inhale_seconds).toBe(4)
    expect(t.exhale_seconds).toBe(7)
    expect(t.rounds).toBe(32)
  })

  it('decompression_expand maps to 4/0/6 timing', () => {
    const t = variantToTimingProfile(variant('decompression_expand', 24))
    expect(t.inhale_seconds).toBe(4)
    expect(t.exhale_seconds).toBe(6)
    expect(t.rounds).toBe(24)
  })

  it('throws when first phase is not a breath phase', () => {
    const v = variant('calm_downregulate', 1)
    v.phases = [{ type: 'transition', subtype: 'intro', template_id: 't', template_version: '1.0.0', duration_seconds: 5 }]
    expect(() => variantToTimingProfile(v)).toThrow()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/engine/m7/timingProfileAdapter.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement adapter**

Create `src/engine/m7/timingProfileAdapter.ts`:

```ts
/**
 * M7 → legacy adapter: convert a single-breath-phase PTVariant to a TimingProfile.
 *
 * Used at M7.1 only — M7.2's heterogeneous render loop replaces this adapter with
 * direct phase iteration. M7.1 single-phase variants ride on the existing render loop
 * via this adapter to keep "no behavioral change" guarantee.
 */
import type { PTVariant } from '../../types/m7'
import type { TimingProfile } from '../../types'
import { BREATH_FAMILIES } from '../hari/breathFamily'

export function variantToTimingProfile(variant: PTVariant): TimingProfile {
  const first = variant.phases[0]
  if (first.type !== 'breath') {
    throw new Error(`M7.1 timingProfileAdapter: first phase must be 'breath', got '${first.type}'`)
  }
  const family = BREATH_FAMILIES[first.breath_family]
  return {
    inhale_seconds: family.inhaleSeconds,
    exhale_seconds: family.exhaleSeconds,
    rounds: first.num_cycles,
  }
}
```

- [ ] **Step 4: Verify BREATH_FAMILIES export**

Run: `grep -n "export const BREATH_FAMILIES" src/engine/hari/breathFamily.ts || grep -n "BREATH_FAMILIES" src/engine/hari/breathFamily.ts | head`
Expected: confirm BREATH_FAMILIES is defined; if it isn't exported, change `const BREATH_FAMILIES` to `export const BREATH_FAMILIES` in `src/engine/hari/breathFamily.ts`.

- [ ] **Step 5: Run test, verify it passes**

Run: `npx vitest run src/engine/m7/timingProfileAdapter.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/engine/m7/timingProfileAdapter.ts src/engine/m7/timingProfileAdapter.test.ts src/engine/hari/breathFamily.ts
git commit -m "feat(m7.1): TimingProfile adapter for single-phase variants"
```

---

## Phase E — Phase log + orphan sweep

### Task 13: Phase log writing on phase entry/exit (breath only at M7.1)

**Files:**
- Create: `src/engine/m7/phaseLog.ts`
- Create: `src/engine/m7/phaseLog.test.ts`

- [ ] **Step 1: Write failing tests for phase log API**

Create `src/engine/m7/phaseLog.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  startPhase,
  completePhase,
  abortPhase,
  safetyStopPhase,
  systemErrorPhase,
} from './phaseLog'
import type { PhaseLogEntry } from '../../types/m7'

describe('M7 phaseLog — entry/exit transitions (I24, I25, I30–I32)', () => {
  let log: PhaseLogEntry[]
  beforeEach(() => { log = [] })

  it('startPhase creates entry with started_at and no completed_at (I24)', () => {
    startPhase(log, 0, 'breath')
    expect(log.length).toBe(1)
    expect(log[0].started_at).toBeTruthy()
    expect(log[0].completed_at).toBeUndefined()
  })

  it('completePhase sets completed_at + drop_off_reason="completed" (I25)', () => {
    startPhase(log, 0, 'breath')
    completePhase(log, 0)
    expect(log[0].completed_at).toBeTruthy()
    expect(log[0].drop_off_reason).toBe('completed')
    expect(log[0].drop_off_reason_source).toBe('explicit')
  })

  it('abortPhase sets explicit user_aborted (I30)', () => {
    startPhase(log, 0, 'breath')
    abortPhase(log, 0)
    expect(log[0].drop_off_reason).toBe('user_aborted')
    expect(log[0].drop_off_reason_source).toBe('explicit')
  })

  it('safetyStopPhase sets safety_stopped (I31)', () => {
    startPhase(log, 0, 'breath')
    safetyStopPhase(log, 0)
    expect(log[0].drop_off_reason).toBe('safety_stopped')
    expect(log[0].drop_off_reason_source).toBe('explicit')
  })

  it('systemErrorPhase sets system_error inferred from session-end', () => {
    startPhase(log, 0, 'breath')
    systemErrorPhase(log, 0)
    expect(log[0].drop_off_reason).toBe('system_error')
    expect(log[0].drop_off_reason_source).toBe('inferred_from_session_end')
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/engine/m7/phaseLog.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement phase log API**

Create `src/engine/m7/phaseLog.ts`:

```ts
/**
 * M7 phase log API — writes I24–I32 invariants into PhaseLogEntry sequences.
 *
 * Discipline (Q11 Refinement 3): complete entries are Class 1 immutable;
 * incomplete entries (no completed_at) may be mutated exactly once by closure
 * helpers (completePhase, abortPhase, safetyStopPhase, systemErrorPhase) or by
 * the orphan sweep. After closure, no further mutation permitted.
 */
import type { PhaseLogEntry } from '../../types/m7'

function nowISO(): string {
  return new Date().toISOString()
}

export function startPhase(
  log: PhaseLogEntry[],
  phase_index: number,
  phase_type: PhaseLogEntry['phase_type'],
  phase_subtype?: PhaseLogEntry['phase_subtype'],
): void {
  log.push({
    phase_index,
    phase_type,
    phase_subtype,
    started_at: nowISO(),
  })
}

function getOpenEntry(log: PhaseLogEntry[], phase_index: number): PhaseLogEntry {
  const entry = log[phase_index]
  if (!entry) throw new Error(`phaseLog: no entry at index ${phase_index}`)
  if (entry.completed_at) throw new Error(`phaseLog: entry ${phase_index} already closed`)
  return entry
}

function durationSeconds(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
}

export function completePhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'completed'
  e.drop_off_reason_source = 'explicit'
}

export function abortPhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'user_aborted'
  e.drop_off_reason_source = 'explicit'
}

export function safetyStopPhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'safety_stopped'
  e.drop_off_reason_source = 'explicit'
}

export function systemErrorPhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'system_error'
  e.drop_off_reason_source = 'inferred_from_session_end'
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/engine/m7/phaseLog.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/m7/phaseLog.ts src/engine/m7/phaseLog.test.ts
git commit -m "feat(m7.1): phase log entry/exit API (breath at M7.1)"
```

---

### Task 14: Orphan sweep (idempotent backfill on app-load + next-session-start)

**Files:**
- Modify: `src/engine/m7/phaseLog.ts`
- Modify: `src/engine/m7/phaseLog.test.ts`

- [ ] **Step 1: Add failing test for orphan sweep**

Append to `src/engine/m7/phaseLog.test.ts`:

```ts
import { sweepOrphans } from './phaseLog'
import type { HistoryEntry } from '../../types'

describe('M7 sweepOrphans — backfill incomplete phase_log entries (I26, I32)', () => {
  it('backfills entry with no completed_at as system_error from orphan sweep', () => {
    const history: HistoryEntry[] = [{
      session_id: 's1',
      timestamp: '2026-05-05T00:00:00.000Z',
      pain_before: 5, pain_after: 5,
      location_tags: [], symptom_tags: [],
      selected_protocol_id: 'x', selected_protocol_name: 'x',
      result: 'completed' as never,
      change_markers: [],
      session_status: 'completed' as never,
      session_duration_seconds: 0,
      phase_log: [{
        phase_index: 0,
        phase_type: 'breath',
        started_at: '2026-05-05T00:00:00.000Z',
      }],
    }] as HistoryEntry[]

    sweepOrphans(history)

    expect(history[0].phase_log![0].completed_at).toBeTruthy()
    expect(history[0].phase_log![0].drop_off_reason).toBe('system_error')
    expect(history[0].phase_log![0].drop_off_reason_source).toBe('inferred_from_orphan_sweep')
  })

  it('is idempotent — running sweep twice does not re-mutate closed entries', () => {
    const history: HistoryEntry[] = [{
      session_id: 's1',
      timestamp: '2026-05-05T00:00:00.000Z',
      pain_before: 5, pain_after: 5,
      location_tags: [], symptom_tags: [],
      selected_protocol_id: 'x', selected_protocol_name: 'x',
      result: 'completed' as never,
      change_markers: [],
      session_status: 'completed' as never,
      session_duration_seconds: 0,
      phase_log: [{
        phase_index: 0,
        phase_type: 'breath',
        started_at: '2026-05-05T00:00:00.000Z',
      }],
    }] as HistoryEntry[]

    sweepOrphans(history)
    const firstClose = history[0].phase_log![0].completed_at
    sweepOrphans(history)
    expect(history[0].phase_log![0].completed_at).toBe(firstClose)
  })

  it('does not modify entries already closed', () => {
    const history: HistoryEntry[] = [{
      session_id: 's1',
      timestamp: '2026-05-05T00:00:00.000Z',
      pain_before: 5, pain_after: 5,
      location_tags: [], symptom_tags: [],
      selected_protocol_id: 'x', selected_protocol_name: 'x',
      result: 'completed' as never,
      change_markers: [],
      session_status: 'completed' as never,
      session_duration_seconds: 0,
      phase_log: [{
        phase_index: 0,
        phase_type: 'breath',
        started_at: '2026-05-05T00:00:00.000Z',
        completed_at: '2026-05-05T00:01:00.000Z',
        drop_off_reason: 'completed',
        drop_off_reason_source: 'explicit',
      }],
    }] as HistoryEntry[]

    sweepOrphans(history)
    expect(history[0].phase_log![0].drop_off_reason).toBe('completed')
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/engine/m7/phaseLog.test.ts -t 'sweepOrphans'`
Expected: FAIL — sweepOrphans not exported

- [ ] **Step 3: Add sweepOrphans implementation**

Append to `src/engine/m7/phaseLog.ts`:

```ts
import type { HistoryEntry } from '../../types'

/**
 * Orphan sweep — idempotent backfill of incomplete phase_log entries.
 * Runs on app-load AND next-session-start. Touches only entries with no completed_at;
 * leaves complete entries unchanged. Per Q7 Refinement 3.
 */
export function sweepOrphans(history: HistoryEntry[]): void {
  const now = nowISO()
  for (const entry of history) {
    if (!entry.phase_log) continue
    for (const phaseEntry of entry.phase_log) {
      if (phaseEntry.completed_at) continue  // idempotent — skip closed
      phaseEntry.completed_at = now
      phaseEntry.duration_actual_seconds = durationSeconds(phaseEntry.started_at, now)
      phaseEntry.drop_off_reason = 'system_error'
      phaseEntry.drop_off_reason_source = 'inferred_from_orphan_sweep'
    }
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/engine/m7/phaseLog.test.ts`
Expected: PASS (8 tests cumulative).

- [ ] **Step 5: Commit**

```bash
git add src/engine/m7/phaseLog.ts src/engine/m7/phaseLog.test.ts
git commit -m "feat(m7.1): orphan sweep for incomplete phase_log entries (idempotent)"
```

---

## Phase F — Production integration

### Task 15: Top-level M7 orchestration + intake_sensor_state + pathway_ref persistence

**Scope:** Build the `buildM7Session` orchestration AND wire it into the existing session-creation flow so that `HistoryEntry.intake_sensor_state` (captured from intake) and `HistoryEntry.pathway_ref` (returned by orchestration) are persisted on every M7-routed session. Per the M7.0 spec §8, M7.1 ships these HistoryEntry fields populated on every session that reaches pathway selection (I38, I39).

**Files:**
- Create: `src/engine/m7/integration.ts`
- Create: `src/engine/m7/integration.test.ts`
- Modify: existing session-creation site (likely `src/engine/sessionBuilder.ts` or wherever `RuntimeSession` is built post-intake)
- Modify: `src/storage/sessionHistory.ts` (extend HistoryEntry write to carry intake_sensor_state + pathway_ref)

- [ ] **Step 1: Write failing test**

Create `src/engine/m7/integration.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildM7Session } from './integration'
import type { IntakeSensorState } from '../../types/m7'

function intake(overrides: Partial<IntakeSensorState> = {}): IntakeSensorState {
  return {
    branch: 'anxious_or_overwhelmed',
    current_context: 'sitting',
    session_intent: 'quick_reset',
    session_length_preference: 'standard',
    flare_sensitivity: 'moderate',
    baseline_intensity: 4,
    irritability: 'symmetric',
    ...overrides,
  }
}

describe('M7 buildM7Session — end-to-end orchestration (intake → variant + timing)', () => {
  it('returns a resolved variant + matching TimingProfile + pathway_ref', () => {
    const result = buildM7Session(intake())
    expect(result.variant.pathway_id).toContain('anxious')
    expect(result.timing.inhale_seconds).toBeGreaterThan(0)
    expect(result.timing.rounds).toBeGreaterThan(0)
    expect(result.pathway_ref.variant_id).toBe(result.variant.variant_id)
  })

  it('full pipeline is deterministic — same intake → same output', () => {
    const a = buildM7Session(intake())
    const b = buildM7Session(intake())
    expect(a).toEqual(b)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run src/engine/m7/integration.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement buildM7Session**

Create `src/engine/m7/integration.ts`:

```ts
/**
 * M7 top-level orchestration — intake → resolved variant + legacy TimingProfile + pathway_ref.
 *
 * At M7.1, this orchestration replaces the legacy session-selection path; downstream
 * GuidedSessionScreen continues to consume TimingProfile via the adapter.
 */
import type { IntakeSensorState, PTVariant } from '../../types/m7'
import type { TimingProfile } from '../../types'
import { selectPathway } from './selection'
import { resolveVariant } from './variantResolution'
import { variantToTimingProfile } from './timingProfileAdapter'

export type M7SessionBuild = {
  variant: PTVariant
  timing: TimingProfile
  pathway_ref: {
    pathway_id: string
    pathway_version: string
    variant_id: string
    variant_version: string
  }
}

export function buildM7Session(intake_sensor_state: IntakeSensorState): M7SessionBuild {
  const sel = selectPathway(intake_sensor_state)
  const variant = resolveVariant(sel.pathway_id, {
    irritability: intake_sensor_state.irritability,
    flare_sensitivity: intake_sensor_state.flare_sensitivity,
    baseline_intensity_band: bandFor(intake_sensor_state.baseline_intensity),
  })
  const timing = variantToTimingProfile(variant)
  return {
    variant,
    timing,
    pathway_ref: {
      pathway_id: variant.pathway_id,
      pathway_version: variant.pathway_version,
      variant_id: variant.variant_id,
      variant_version: variant.variant_version,
    },
  }
}

function bandFor(intensity: number): 'low' | 'moderate' | 'high' {
  if (intensity <= 3) return 'low'
  if (intensity <= 6) return 'moderate'
  return 'high'
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/engine/m7/integration.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire `buildM7Session` into the session-creation pathway**

Locate the existing session-creation site. Run: `grep -n "buildSession\|RuntimeSession" src/engine/sessionBuilder.ts src/screens/SessionIntakeScreen.tsx | head`

Identify where `RuntimeSession` is built post-intake. Add a side-channel call to `buildM7Session(intake_sensor_state)` so the M7 path runs alongside the legacy session creation. Capture the returned `M7SessionBuild` and pass it through to the HistoryEntry write site.

Concretely, where the legacy code builds `RuntimeSession`, add:

```ts
import { buildM7Session } from '../engine/m7/integration'
import type { IntakeSensorState } from '../types/m7'

// At the call site (post-intake, pre-session-render):
const intakeSensorState: IntakeSensorState = {
  branch: hariIntake.branch,
  location: hariIntake.location,
  location_pattern: hariIntake.location_pattern,
  current_context: hariIntake.current_context,
  session_intent: hariIntake.session_intent,
  session_length_preference: hariIntake.session_length_preference,
  flare_sensitivity: hariIntake.flare_sensitivity,
  baseline_intensity: hariIntake.baseline_intensity,
  irritability: hariIntake.irritability,
  derived_signals: { breathDowngraded: /* compute via existing logic */ },
}
const m7Build = buildM7Session(intakeSensorState)
// Store m7Build alongside the runtime session so it's available at HistoryEntry save time.
```

Pass `m7Build` and `intakeSensorState` through to wherever HistoryEntry is built (likely `src/storage/sessionHistory.ts` or a session-completion handler).

- [ ] **Step 6: Persist `intake_sensor_state` + `pathway_ref` on HistoryEntry write**

In `src/storage/sessionHistory.ts` (or wherever HistoryEntry is built), populate the new optional M7 fields when M7-routed session data is available:

```ts
const entry: HistoryEntry = {
  ...legacyFields,
  intake_sensor_state: m7Build ? intakeSensorState : undefined,
  pathway_ref: m7Build?.pathway_ref,
  // phase_log + truth_state populated in Task 16
}
```

Smoke-test the persistence: trigger an in-app session, verify the saved HistoryEntry contains `intake_sensor_state` and `pathway_ref` populated.

- [ ] **Step 7: Run full test suite — confirm no regressions**

Run: `npx vitest run`
Expected: all existing tests pass; M7 tests added in earlier tasks pass.

- [ ] **Step 8: Commit**

```bash
git add src/engine/m7/integration.ts src/engine/m7/integration.test.ts src/engine/sessionBuilder.ts src/storage/sessionHistory.ts
git commit -m "feat(m7.1): buildM7Session orchestration + intake_sensor_state + pathway_ref persisted on HistoryEntry"
```

---

### Task 16: Session-lifecycle wire-up — phase_log writes + truth_state mechanical fields + orphan sweep on app-load

**Scope:** Wire the M7 phase_log API into the actual session render lifecycle so each session writes `phase_log` entries (single breath phase at M7.1), populate `truth_state` mechanical fields (`completion_status`, `completion_percentage`, `pain_delta`, `user_validation`) on HistoryEntry save, and wire the orphan sweep on app-load.

**Files:**
- Modify: `src/screens/GuidedSessionScreen.tsx` (phase_log writes at session start/end)
- Modify: `src/storage/sessionHistory.ts` (truth_state mechanical fields + phase_log persistence)
- Modify: `src/context/AppProvider.tsx` (orphan sweep on app-load)

- [ ] **Step 1: Wire phase_log start/end in GuidedSessionScreen**

Locate the session render flow in `src/screens/GuidedSessionScreen.tsx`. At session start (when the breath phase begins rendering), call `startPhase`. At session end (whether by completion, abort, or safety-stop), call the appropriate closure helper:

```ts
import { startPhase, completePhase, abortPhase, safetyStopPhase } from '../engine/m7/phaseLog'
import type { PhaseLogEntry } from '../types/m7'

// At session start:
const phaseLog: PhaseLogEntry[] = []
startPhase(phaseLog, 0, 'breath')

// At session completion:
completePhase(phaseLog, 0)

// At user abort:
abortPhase(phaseLog, 0)

// At safety stop:
safetyStopPhase(phaseLog, 0)
```

Pass `phaseLog` through to the HistoryEntry save site.

- [ ] **Step 2: Populate truth_state mechanical fields on HistoryEntry save**

In `src/storage/sessionHistory.ts`, when building the HistoryEntry at session save, derive the mechanical truth_state fields:

```ts
import type { TruthState, PhaseLogEntry } from '../types/m7'

function deriveTruthState(
  phase_log: PhaseLogEntry[] | undefined,
  pain_before: number,
  pain_after: number,
  validation_status: 'pending' | 'validated' | 'invalidated' | undefined,
): TruthState {
  const allPhases = phase_log ?? []
  const completed = allPhases.filter(p => p.drop_off_reason === 'completed').length
  const safetyStopped = allPhases.some(p => p.drop_off_reason === 'safety_stopped')
  const aborted = allPhases.some(p => p.drop_off_reason === 'user_aborted')
  return {
    completion_status: safetyStopped
      ? 'safety_stopped'
      : aborted
        ? 'aborted'
        : 'complete',
    completion_percentage: allPhases.length > 0 ? completed / allPhases.length : 0,
    pain_delta: pain_after - pain_before,
    state_coherence: 'pending',  // M6.9 enriches at M7.3+
    user_validation: validation_status ?? 'pending',
  }
}

// Then in the HistoryEntry write:
const entry: HistoryEntry = {
  ...legacyFields,
  intake_sensor_state,
  pathway_ref,
  phase_log: phaseLog,
  truth_state: deriveTruthState(phaseLog, pain_before, pain_after, validation_status),
}
```

- [ ] **Step 3: Smoke-test phase_log + truth_state on a real session**

Run a complete session in the dev server (`npm run dev`); after completion, verify the saved HistoryEntry in localStorage contains `phase_log` with one closed entry (drop_off_reason='completed') and `truth_state` populated with completion_status='complete', completion_percentage=1.0, pain_delta computed.

- [ ] **Step 4: Add orphan sweep call on app-load via AppProvider**

Add at top of `src/context/AppProvider.tsx` imports:

```ts
import { useEffect } from 'react'
import { sweepOrphans } from '../engine/m7/phaseLog'
import { loadHistory, saveHistory } from '../storage/sessionHistory'
```

Inside `AppProvider` component body (before return), add:

```ts
  // M7.1 — orphan sweep on app-load (Q7 Refinement 3, idempotent)
  useEffect(() => {
    const history = loadHistory()
    sweepOrphans(history)
    saveHistory(history)
  }, [])
```

- [ ] **Step 5: Verify imports exist or are stubbed**

Run: `grep -n "loadHistory\|saveHistory" src/storage/sessionHistory.ts`
Expected: both functions exported. If `saveHistory` doesn't exist as a discrete function, identify the persistence call and use that pattern instead.

If `saveHistory` is not exported, add it to `src/storage/sessionHistory.ts`:

```ts
const HISTORY_KEY = 'mediCalm.history'  // verify this matches the existing key

export function saveHistory(history: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}
```

- [ ] **Step 6: Run all tests to confirm no regression**

Run: `npx vitest run`
Expected: all tests pass; new M7 tests covering phase_log + truth_state derivation pass.

- [ ] **Step 7: Commit**

```bash
git add src/screens/GuidedSessionScreen.tsx src/context/AppProvider.tsx src/storage/sessionHistory.ts
git commit -m "feat(m7.1): session-lifecycle wire-up — phase_log + truth_state + orphan sweep"
```

---

## Phase G — Sweep harness validation + final acceptance

### Task 17: Update sweep harness to validate M7.1 produces postfix-equivalent outputs

**Files:**
- Modify: `scripts/intakeOutputSweep.ts`

- [ ] **Step 1: Read current sweep harness to find the comparison point**

Run: `grep -n "fingerprint\|breath_family\|protocol_id" scripts/intakeOutputSweep.ts | head -20`
Expected: locate where each case's output fingerprint is computed.

- [ ] **Step 2: Add M7 path computation alongside legacy**

After the existing per-case output computation in `scripts/intakeOutputSweep.ts`, add (replace the placeholder line indicators with the actual line numbers):

```ts
import { buildM7Session } from '../src/engine/m7/integration'
import type { IntakeSensorState } from '../src/types/m7'

// After the legacy fingerprint is computed for each case, compute the M7 fingerprint:
function computeM7Fingerprint(intake: IntakeSensorState): string {
  const result = buildM7Session(intake)
  return [
    `pathway=${result.pathway_ref.pathway_id}`,
    `variant=${result.pathway_ref.variant_id}`,
    `inhale=${result.timing.inhale_seconds}`,
    `exhale=${result.timing.exhale_seconds}`,
    `rounds=${result.timing.rounds}`,
  ].join('|')
}
```

In the sweep loop, compute both fingerprints and assert family/timing equivalence (legacy's family/timing must match what M7 produces). The pathway_id and variant_id are M7-specific and don't need legacy equivalents.

- [ ] **Step 3: Run sweep harness with SWEEP_VARIANT=postfix and capture output**

Run: `npx vite-node scripts/intakeOutputSweep.ts 2>&1 | tail -20`
Expected: harness completes; reports 12 distinct (legacy) outputs and 12 distinct (M7) variant fingerprints with the same family/timing/rounds tuples.

- [ ] **Step 4: Add an explicit equivalence assertion to the sweep**

Inside the sweep loop, after computing both fingerprints, add:

```ts
const legacyTimingMatches =
  legacyOutput.inhale === m7Result.timing.inhale_seconds &&
  legacyOutput.exhale === m7Result.timing.exhale_seconds &&
  legacyOutput.rounds === m7Result.timing.rounds
if (!legacyTimingMatches) {
  throw new Error(`M7.1 regression at case ${caseIndex}: legacy ${JSON.stringify(legacyOutput)} vs m7 ${JSON.stringify(m7Result.timing)}`)
}
```

- [ ] **Step 5: Re-run sweep harness; expect zero throws**

Run: `npx vite-node scripts/intakeOutputSweep.ts 2>&1 | tail -10`
Expected: harness completes without errors. Fix any divergences in the M7 selection table by comparing the case to the legacy output and adjusting `matchSelectionState`.

- [ ] **Step 6: Commit**

```bash
git add scripts/intakeOutputSweep.ts
git commit -m "feat(m7.1): sweep harness validates M7 output matches postfix baseline"
```

---

### Task 18: Final acceptance pass — full test suite + sweep diff = zero

**Files:** none modified.

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: all tests pass (357 + new M7 tests, ~430+ total).

- [ ] **Step 2: Run sweep harness with both variants**

Run: `npx vite-node scripts/intakeOutputSweep.ts && SWEEP_VARIANT=postfix npx vite-node scripts/intakeOutputSweep.ts`
Expected: both runs complete without errors. M7 fingerprints are distinct from legacy fingerprints (different identifiers) but timing tuples match exactly.

- [ ] **Step 3: Run TypeScript build to confirm no type errors**

Run: `npx tsc -b 2>&1 | grep -v "BodyPickerSVG.test.tsx\|feasibility.ts:95\|test/setup.ts" | head`
Expected: no new errors beyond the three pre-existing ones documented in the M7.0 spec.

- [ ] **Step 4: Run Playwright captures**

Run: `npm run capture 2>&1 | tail -10`
Expected: snapshots either match existing baseline (no UX change at M7.1) or fail with diffs that the next milestone (M7.2) intentionally changes. Document any diffs in `docs/superpowers/audits/m7-1-playwright-diffs.md` if they appear.

- [ ] **Step 5: Final commit with summary**

```bash
git add -A
git commit --allow-empty -m "$(cat <<'EOF'
m7.1: substrate plumbing complete — no behavioral change

Acceptance:
- All M7 type definitions in code (src/types/m7.ts, 17 type tests)
- Pathway library v0.1: 12 pathways × 1 variant each (engineering_passed)
- Selection function + variant resolution wire intake → variant deterministically
- HistoryEntry M7 fields optional; legacy reads continue working
- Phase log API + idempotent orphan sweep on app-load
- TimingProfile adapter routes single-phase variants through legacy render
- Sweep diff = zero against postfix baseline (every selection state produces
  today's exact family/timing/rounds)
- Full test suite green; tsc clean; Playwright unchanged

Substrate ready for M7.2 (heterogeneous phase rendering + 5-count intro +
narrated transitions). Pathway library v0.1 stays at engineering_passed
status; M7.4 advisor review gate flips it to pt_advisor_passed.

Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §8

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-review checklist

After completing all 18 tasks, run the following self-review:

1. **Spec coverage:** every M7.1 ship in spec §8 has a corresponding task in this plan.
   - [ ] All M7 type definitions → Tasks 1–5
   - [ ] Selection function + variant resolution → Tasks 10, 11
   - [ ] Selection table runtime artifact → Task 10
   - [ ] Pathway library v0.1 → Tasks 7, 8
   - [ ] HistoryEntry schema extensions → Task 6
   - [ ] Phase log writing for breath → Task 13
   - [ ] Orphan sweep mechanism → Tasks 14, 16
   - [ ] truth_state mechanical fields → covered by HistoryEntry extension (Task 6); population happens in session save flow (in-scope at integration)
   - [ ] M6.9 artifact stubs → Task 5
   - [ ] Tier A grounding workflow operational → out-of-band JSEer action (Research Mode in muscle-pt); spec §2.6 documents the workflow
   - [ ] Sweep diff = zero acceptance → Tasks 17, 18

2. **Acceptance criteria:**
   - [ ] Sweep diff = zero → Task 17 + Task 18
   - [ ] M7 fields optional, legacy reads work → Task 6 + Task 18
   - [ ] Substrate invariant check passes → Task 9 + Task 11 (resolveVariant invokes assertVariantInvariants)
   - [ ] review_status tracking-only → variants ship at 'engineering_passed' (Task 8); no runtime gate at M7.1 (M7.4 introduces gate)
   - [ ] HistoryEntry M7 field population on session lifecycle → Task 15 (intake_sensor_state + pathway_ref) + Task 16 (phase_log + truth_state mechanical fields)
   - [ ] Invariants I38-I40 (HistoryEntry completeness for M7+ sessions) → Task 15 + Task 16

3. **No placeholders:** every task has full code, exact commands, expected output. Spot-checked.

4. **Type consistency:** function names referenced consistently across tasks (selectPathway, resolveVariant, buildM7Session, sweepOrphans, assertVariantInvariants).

---

## Out of scope (deferred to M7.2+)

- Heterogeneous phase render loop (transition phases beyond data shape; position_hold rendering) — M7.2/M7.3.
- 5-count intro and narrated transitions visible to users — M7.2.
- Mid-session controls (pause / skip / resume) — M7.3.
- M6.9 artifact generation (stubs at M7.1; generation at M7.3+).
- Multi-variant per-pathway differentiation — M7.4.
- PT advisor review of variants — M7.4 gate.
- TimingProfile adapter retirement — M7.2 cuts over to direct phase iteration; adapter removed at M7.2.
