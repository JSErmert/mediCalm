import { describe, it, expect } from 'vitest'
import { GROUNDED_MESSAGES } from './groundedMessages'
import cache from './pmidVerification.json'

const CACHE = cache as Record<string, { title: string; authors: string; year: number }>

describe('PMID verification cache', () => {
  it('covers every PMID referenced by the message bank', () => {
    const verified = new Set(Object.keys(CACHE))
    for (const m of GROUNDED_MESSAGES) {
      expect(verified.has(m.citation.pmid), `unverified PMID ${m.citation.pmid}`).toBe(true)
    }
  })

  it('every cache entry has a non-empty title', () => {
    for (const [pmid, rec] of Object.entries(CACHE)) {
      expect(rec.title, `PMID ${pmid}`).toBeTruthy()
    }
  })
})
