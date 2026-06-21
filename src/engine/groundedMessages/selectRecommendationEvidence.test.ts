import { describe, it, expect } from 'vitest'
import { selectRecommendationEvidence } from './selectRecommendationEvidence'
import type { GroundedMessage } from '../../types/groundedMessage'

function msg(over: Partial<GroundedMessage> & Pick<GroundedMessage, 'message_id'>): GroundedMessage {
  return {
    message_id: over.message_id,
    text: over.text ?? 'text',
    selectors: over.selectors ?? {},
    citation: over.citation ?? {
      pmid: '1', source_link: 'https://pubmed.ncbi.nlm.nih.gov/1/',
      exact_figure: 'f', figure_units: 'u',
    },
    display_quote: over.display_quote ?? 'quote',
    authored_by: over.authored_by ?? 't',
    authored_at: over.authored_at ?? '2026-06-20T00:00:00.000Z',
    review_status: over.review_status ?? 'pt_advisor_passed',
  }
}

describe('selectRecommendationEvidence', () => {
  it('returns null when no live message is bound to the derived goal', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['restore'] } })]
    expect(selectRecommendationEvidence('decompress', {}, bank)).toBeNull()
  })

  it('returns a live message bound to the derived goal', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['decompress'] } })]
    expect(selectRecommendationEvidence('decompress', {}, bank)?.message_id).toBe('a')
  })

  it('never returns a message NOT bound to the goal, even with perfect tag overlap', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['restore'], symptom: ['aching'] } })]
    expect(selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)).toBeNull()
  })

  it('ranks same-goal messages by tag overlap, highest wins', () => {
    const bank = [
      msg({ message_id: 'low', selectors: { goal: ['decompress'] } }),
      msg({ message_id: 'high', selectors: { goal: ['decompress'], symptom: ['aching'] } }),
    ]
    expect(selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)?.message_id).toBe('high')
  })

  it('breaks ties by message_id ascending', () => {
    const bank = [
      msg({ message_id: 'zzz', selectors: { goal: ['decompress'] } }),
      msg({ message_id: 'aaa', selectors: { goal: ['decompress'] } }),
    ]
    expect(selectRecommendationEvidence('decompress', {}, bank)?.message_id).toBe('aaa')
  })

  it('excludes non-attested messages (two-lock liveness)', () => {
    const bank = [msg({ message_id: 'a', selectors: { goal: ['decompress'] }, review_status: 'engineering_passed' })]
    expect(selectRecommendationEvidence('decompress', {}, bank)).toBeNull()
  })

  it('is deterministic — identical inputs return identical output across calls', () => {
    const bank = [
      msg({ message_id: 'a', selectors: { goal: ['decompress'], symptom: ['aching'] } }),
      msg({ message_id: 'b', selectors: { goal: ['decompress'], symptom: ['aching'] } }),
    ]
    const r1 = selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)
    const r2 = selectRecommendationEvidence('decompress', { symptom: ['aching'] }, bank)
    expect(r1?.message_id).toBe(r2?.message_id)
  })
})

describe('selectRecommendationEvidence — real bank', () => {
  it('surfaces the live message for its bound goal (decompress)', () => {
    const r = selectRecommendationEvidence('decompress', { symptom: ['aching'] })
    expect(r?.message_id).toBe('gentle_exercise_eases_sensitization')
  })
  it('returns null for a goal with no bound live message (expand)', () => {
    expect(selectRecommendationEvidence('expand', {})).toBeNull()
  })
})
