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
    const chain: ReasoningChain = {
      claim: '4-7 breath ratio supports vagal activation',
      reasoning: 'Slower exhale than inhale shifts autonomic balance toward parasympathetic.',
      terminating_citations: ['33117119'],
    }
    const g: GroundingSummary = {
      tier_A_citations: [{
        pmid: '33117119',
        source_link: 'https://pubmed.ncbi.nlm.nih.gov/33117119/',
        exact_figure: '6 breaths/min',
        figure_units: 'breaths/min',
      }],
      tier_B_reasoning_chains: [chain],
    }
    expect(g.tier_A_citations.length).toBe(1)
    expect(g.tier_B_reasoning_chains[0].terminating_citations).toContain('33117119')
  })
})

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

  it('IntakeSensorState carries all selection + variant-feeding dims (§3.10)', () => {
    const s: IntakeSensorState = {
      branch: 'anxious_or_overwhelmed',
      current_context: 'sitting',
      session_intent: 'quick_reset',
      session_length_preference: 'standard',
      flare_sensitivity: 'moderate',
      baseline_intensity: 4,
      irritability: 'symmetric',
    }
    expect(s.branch).toBe('anxious_or_overwhelmed')
  })

  it('EffectiveIntakeState is Partial<IntakeSensorState> — only refined fields present', () => {
    const e: EffectiveIntakeState = { flare_sensitivity: 'high' }
    expect(e.flare_sensitivity).toBe('high')
  })

  it('AggregateTruthState carries generation_version + generated_at (M6.9 artifact stub)', () => {
    const a: AggregateTruthState = {
      generation_version: '0.0.0',
      generated_at: '2026-05-05T00:00:00.000Z',
    }
    expect(a.generation_version).toBe('0.0.0')
  })
})
