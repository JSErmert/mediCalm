import { describe, it, expect } from 'vitest'
import { MUSCLE_TO_REGION, musclesForRegion } from './regions'
import { MUSCLE_PATHS } from './muscles'

describe('MUSCLE_TO_REGION', () => {
  it('every muscle in MUSCLE_PATHS appears in MUSCLE_TO_REGION', () => {
    for (const m of MUSCLE_PATHS) {
      expect(MUSCLE_TO_REGION[m.id]).toBeDefined()
    }
  })

  it('every entry in MUSCLE_TO_REGION matches the muscles.ts region', () => {
    for (const m of MUSCLE_PATHS) {
      expect(MUSCLE_TO_REGION[m.id]).toBe(m.region)
    }
  })
})

describe('musclesForRegion', () => {
  it('returns all muscles whose region matches', () => {
    const shoulderL = musclesForRegion('shoulder_left')
    expect(shoulderL.length).toBeGreaterThan(0)
    expect(shoulderL.every(m => m.region === 'shoulder_left')).toBe(true)
  })

  it('returns empty array for region with no muscles (e.g. fallback)', () => {
    expect(musclesForRegion('whole_body')).toEqual([])
  })

  it('shoulder_left aggregates anterior + posterior (front shoulder + traps + rear delt)', () => {
    const ids = musclesForRegion('shoulder_left').map(m => m.id)
    expect(ids).toContain('shoulder_front_left')
    expect(ids).toContain('shoulder_side_left')
    expect(ids).toContain('traps_upper_left')
    expect(ids).toContain('deltoid_rear_left')
  })
})

describe('Region invariants', () => {
  it('every MUSCLE_PATHS region is a valid BodyLocation', () => {
    // Hardcoded list mirrors the BodyLocation union in src/types/hari.ts
    const VALID_REGIONS = new Set([
      'head_temples', 'jaw_tmj_facial', 'neck',
      'shoulder_left', 'shoulder_right',
      'upper_back', 'mid_back', 'chest_sternum', 'rib_side',
      'elbow_forearm_left', 'elbow_forearm_right',
      'wrist_hand_left', 'wrist_hand_right',
      'lower_back', 'hip_pelvis', 'glute',
      'thigh_left', 'thigh_right',
      'knee_left', 'knee_right',
      'calf_shin_left', 'calf_shin_right',
      'ankle_foot_left', 'ankle_foot_right',
      'spread_multiple', 'whole_body', 'not_sure',
    ])
    for (const m of MUSCLE_PATHS) {
      expect(VALID_REGIONS.has(m.region)).toBe(true)
    }
  })

  it('every BodyMuscle id has the expected snake_case shape', () => {
    for (const m of MUSCLE_PATHS) {
      expect(m.id).toMatch(/^[a-z]+(_[a-z]+)*$/)
    }
  })
})
