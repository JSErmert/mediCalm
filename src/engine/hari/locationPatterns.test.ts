import { describe, it, expect } from 'vitest'
import { inferLocationPattern, ANATOMICAL_CHAINS } from './locationPatterns'
import type { BodyLocation } from '../../types/hari'

describe('inferLocationPattern', () => {
  describe('trivial cases', () => {
    it('returns "single" for empty selection (defensive default)', () => {
      expect(inferLocationPattern([])).toBe('single')
    })

    it('returns "single" for one region', () => {
      expect(inferLocationPattern(['lower_back'])).toBe('single')
    })
  })

  describe('connected (within one chain)', () => {
    it('returns "connected" for 2 regions in the same lumbo-pelvic chain', () => {
      expect(inferLocationPattern(['lower_back', 'glute'])).toBe('connected')
    })

    it('returns "connected" for full posterior left chain', () => {
      expect(inferLocationPattern([
        'lower_back', 'hip_pelvis', 'glute', 'thigh_left', 'knee_left', 'calf_shin_left',
      ])).toBe('connected')
    })

    it('returns "connected" for cervical / upper crossed pattern', () => {
      expect(inferLocationPattern(['neck', 'upper_back', 'shoulder_left'])).toBe('connected')
    })

    it('returns "connected" for ipsilateral upper limb', () => {
      expect(inferLocationPattern([
        'shoulder_left', 'elbow_forearm_left', 'wrist_hand_left',
      ])).toBe('connected')
    })
  })

  describe('multifocal (multiple chains, bounded)', () => {
    it('returns "multifocal" for unrelated regions in 2 chains', () => {
      expect(inferLocationPattern(['neck', 'ankle_foot_right'])).toBe('multifocal')
    })

    it('returns "multifocal" for 3 regions across 2 chains (no widespread)', () => {
      expect(inferLocationPattern([
        'lower_back', 'shoulder_right', 'wrist_hand_right',
      ])).toBe('multifocal')
    })
  })

  describe('widespread (4+ regions across 3+ chains)', () => {
    it('returns "widespread" for 4 regions in 3 distinct chains', () => {
      expect(inferLocationPattern([
        'neck', 'lower_back', 'shoulder_left', 'ankle_foot_right',
      ])).toBe('widespread')
    })

    it('returns "widespread" for 5+ scattered regions', () => {
      expect(inferLocationPattern([
        'jaw_tmj_facial', 'mid_back', 'lower_back', 'wrist_hand_left', 'ankle_foot_right',
      ])).toBe('widespread')
    })

    it('does NOT return "widespread" when 4 regions fit one big chain', () => {
      // Full posterior left chain — anatomically coherent even at 6 regions
      expect(inferLocationPattern([
        'lower_back', 'glute', 'thigh_left', 'knee_left', 'calf_shin_left', 'ankle_foot_left',
      ])).toBe('connected')
    })
  })

  describe('chain definitions', () => {
    it('exposes ANATOMICAL_CHAINS as a readable list', () => {
      expect(ANATOMICAL_CHAINS.length).toBeGreaterThanOrEqual(5)
      ANATOMICAL_CHAINS.forEach(c => {
        expect(c.id).toBeTruthy()
        expect(c.name).toBeTruthy()
        expect(c.regions.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('every BodyLocation in chains is a valid mediCalm region', () => {
      const validRegions: BodyLocation[] = [
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
      ]
      ANATOMICAL_CHAINS.forEach(chain => {
        chain.regions.forEach(r => {
          expect(validRegions).toContain(r)
        })
      })
    })
  })
})
