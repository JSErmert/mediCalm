import { describe, it, expect } from 'vitest'
import { selectBreathingCues } from './selectBreathingCues'

describe('selectBreathingCues', () => {
  it('always includes core cues in each phase', () => {
    const { setupCues, inSessionCues } = selectBreathingCues({})
    expect(setupCues.map((c) => c.id)).toContain('setup_hand_belly_chest')
    expect(inSessionCues.map((c) => c.id)).toEqual(
      expect.arrayContaining(['breath_longer_exhale', 'breath_soft_belly', 'breath_easy_shoulders']),
    )
  })
  it('includes the rib cue only when location includes ribs', () => {
    expect(selectBreathingCues({}).setupCues.map((c) => c.id)).not.toContain('setup_rib_expand')
    expect(selectBreathingCues({ location: ['ribs'] }).setupCues.map((c) => c.id)).toContain('setup_rib_expand')
  })
  it('includes the decompress cue only when goal is decompress', () => {
    expect(selectBreathingCues({ goal: 'restore' }).inSessionCues.map((c) => c.id)).not.toContain('breath_decompress_room')
    expect(selectBreathingCues({ goal: 'decompress' }).inSessionCues.map((c) => c.id)).toContain('breath_decompress_room')
  })
  it('includes the supine cue only for single/connected location patterns', () => {
    expect(selectBreathingCues({ locationPattern: 'widespread' }).setupCues.map((c) => c.id)).not.toContain('setup_position_supine')
    expect(selectBreathingCues({ locationPattern: 'single' }).setupCues.map((c) => c.id)).toContain('setup_position_supine')
  })
  it('is deterministic — identical input returns identical ids', () => {
    const a = selectBreathingCues({ location: ['ribs'], goal: 'decompress' })
    const b = selectBreathingCues({ location: ['ribs'], goal: 'decompress' })
    expect(a.inSessionCues.map((c) => c.id)).toEqual(b.inSessionCues.map((c) => c.id))
    expect(a.setupCues.map((c) => c.id)).toEqual(b.setupCues.map((c) => c.id))
  })
})
