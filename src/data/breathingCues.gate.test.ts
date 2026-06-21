import { describe, it, expect } from 'vitest'
import { BREATHING_CUES } from './breathingCues'

const SENTINEL = '⟦'

describe('breathing cue bank — structural gate', () => {
  it('has unique ids', () => {
    const ids = BREATHING_CUES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('has at least one core cue per phase', () => {
    expect(BREATHING_CUES.some((c) => c.phase === 'setup' && c.core)).toBe(true)
    expect(BREATHING_CUES.some((c) => c.phase === 'in_session' && c.core)).toBe(true)
  })
  for (const c of BREATHING_CUES) {
    describe(`cue ${c.id}`, () => {
      it('has non-empty text with no sentinel', () => {
        expect(c.text.trim()).not.toBe('')
        expect(c.text.includes(SENTINEL)).toBe(false)
      })
      it('has a valid phase', () => {
        expect(['setup', 'in_session']).toContain(c.phase)
      })
      it('grounding pmid, if present, is numeric', () => {
        if (c.grounding) expect(c.grounding.pmid).toMatch(/^\d+$/)
      })
    })
  }
})
