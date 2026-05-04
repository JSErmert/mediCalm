import { describe, it, expect } from 'vitest'
import { MUSCLE_PATHS } from './muscles'

describe('MUSCLE_PATHS — vendored from vulovix/body-muscles', () => {
  it('contains 89 entries (40 front + 49 back)', () => {
    expect(MUSCLE_PATHS.length).toBe(89)
    expect(MUSCLE_PATHS.filter(m => m.view === 'front').length).toBe(40)
    expect(MUSCLE_PATHS.filter(m => m.view === 'back').length).toBe(49)
  })

  it('every entry has a non-empty path string', () => {
    for (const m of MUSCLE_PATHS) {
      expect(m.path.length).toBeGreaterThan(10)
    }
  })

  it('every id is unique', () => {
    const ids = new Set(MUSCLE_PATHS.map(m => m.id))
    expect(ids.size).toBe(MUSCLE_PATHS.length)
  })

  it('every entry has a non-empty human-readable name', () => {
    for (const m of MUSCLE_PATHS) {
      expect(m.name.length).toBeGreaterThan(0)
    }
  })
})
