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
