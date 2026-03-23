import { describe, it, expect } from 'vitest'
import {
  LOCATION_TAGS,
  SYMPTOM_TAGS,
  TRIGGER_TAGS,
  IMMEDIATE_ESCALATION_TAGS,
  SEVERITY_BANDS,
  getSeverityBand,
} from './taxonomy'

describe('taxonomy', () => {
  it('LOCATION_TAGS is non-empty array of strings', () => {
    expect(LOCATION_TAGS.length).toBeGreaterThan(0)
    LOCATION_TAGS.forEach((t) => expect(typeof t).toBe('string'))
  })

  it('SYMPTOM_TAGS is non-empty array of strings', () => {
    expect(SYMPTOM_TAGS.length).toBeGreaterThan(0)
    SYMPTOM_TAGS.forEach((t) => expect(typeof t).toBe('string'))
  })

  it('TRIGGER_TAGS is non-empty array of strings', () => {
    expect(TRIGGER_TAGS.length).toBeGreaterThan(0)
    TRIGGER_TAGS.forEach((t) => expect(typeof t).toBe('string'))
  })

  it('IMMEDIATE_ESCALATION_TAGS includes critical safety signals', () => {
    expect(IMMEDIATE_ESCALATION_TAGS).toContain('chest_pain')
    expect(IMMEDIATE_ESCALATION_TAGS).toContain('fainting')
    expect(IMMEDIATE_ESCALATION_TAGS).toContain('progressive_weakness')
  })

  it('SEVERITY_BANDS covers 0–10 range with correct boundaries', () => {
    expect(SEVERITY_BANDS.low).toEqual([0, 3])
    expect(SEVERITY_BANDS.moderate).toEqual([4, 6])
    expect(SEVERITY_BANDS.high).toEqual([7, 8])
    expect(SEVERITY_BANDS.very_high).toEqual([9, 10])
  })

  it('getSeverityBand classifies all boundary values correctly', () => {
    expect(getSeverityBand(0)).toBe('low')
    expect(getSeverityBand(3)).toBe('low')
    expect(getSeverityBand(4)).toBe('moderate')
    expect(getSeverityBand(6)).toBe('moderate')
    expect(getSeverityBand(7)).toBe('high')
    expect(getSeverityBand(8)).toBe('high')
    expect(getSeverityBand(9)).toBe('very_high')
    expect(getSeverityBand(10)).toBe('very_high')
  })
})
