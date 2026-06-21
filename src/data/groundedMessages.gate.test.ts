import { describe, it, expect } from 'vitest'
import { GROUNDED_MESSAGES } from './groundedMessages'
import { LOCATION_TAGS, SYMPTOM_TAGS, TRIGGER_TAGS } from '../types/taxonomy'

const PMID_RE = /^\d+$/
const SENTINEL = '⟦' // unfilled transcription marker — must never ship

describe('grounded message bank — structural gate', () => {
  it('has at least one message', () => {
    expect(GROUNDED_MESSAGES.length).toBeGreaterThan(0)
  })

  it('has unique message_ids', () => {
    const ids = GROUNDED_MESSAGES.map((m) => m.message_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const m of GROUNDED_MESSAGES) {
    describe(`message ${m.message_id}`, () => {
      it('has non-empty text and display_quote', () => {
        expect(m.text.trim()).not.toBe('')
        expect(m.display_quote.trim()).not.toBe('')
      })
      it('contains no unfilled transcription sentinel', () => {
        expect(m.text.includes(SENTINEL)).toBe(false)
        expect(m.display_quote.includes(SENTINEL)).toBe(false)
        expect(m.citation.exact_figure.includes(SENTINEL)).toBe(false)
        expect(m.citation.figure_units.includes(SENTINEL)).toBe(false)
      })
      it('has a numeric PMID inside its source_link', () => {
        expect(m.citation.pmid).toMatch(PMID_RE)
        expect(m.citation.source_link).toContain(m.citation.pmid)
      })
      it('has non-empty exact_figure and figure_units', () => {
        expect(m.citation.exact_figure.trim()).not.toBe('')
        expect(m.citation.figure_units.trim()).not.toBe('')
      })
      it('has ≥1 selector tag, all from canonical taxonomy', () => {
        const loc = m.selectors.location ?? []
        const sym = m.selectors.symptom ?? []
        const trg = m.selectors.trigger ?? []
        expect(loc.length + sym.length + trg.length).toBeGreaterThan(0)
        for (const t of loc) expect(LOCATION_TAGS).toContain(t)
        for (const t of sym) expect(SYMPTOM_TAGS).toContain(t)
        for (const t of trg) expect(TRIGGER_TAGS).toContain(t)
      })
    })
  }
})
