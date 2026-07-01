import { describe, it, expect } from 'vitest'
import { customSessionToHistoryEntry } from './customSessionToHistoryEntry'
import type { CustomSession } from '../../types/custom'
import type { CustomSessionResult } from './customSessionToHistoryEntry'

const SESSION: CustomSession = {
  id: 'sess_abc123',
  name: 'My 4-7-8 Pattern',
  profile: {
    inhale_seconds: 4,
    hold_after_inhale_seconds: 7,
    exhale_seconds: 8,
    hold_after_exhale_seconds: 0,
    cycles: 6,
  },
  created_at: '2026-06-30T10:00:00Z',
  updated_at: '2026-06-30T10:00:00Z',
}

const RESULT: CustomSessionResult = {
  timestamp: '2026-06-30T10:05:00Z',
  cycles_completed: 6,
  session_duration_seconds: 114,
}

describe('customSessionToHistoryEntry — session_type and custom_session_id', () => {
  it('sets session_type to CUSTOM', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.session_type).toBe('CUSTOM')
  })

  it('sets custom_session_id to session.id', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.custom_session_id).toBe(SESSION.id)
  })
})

describe('customSessionToHistoryEntry — honest fields only (MOVEMENT-HONESTY)', () => {
  it('does not include an efficacy field', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT) as unknown as Record<string, unknown>
    expect(entry).not.toHaveProperty('efficacy')
  })

  it('does not include a pain_reduced_by field', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT) as unknown as Record<string, unknown>
    expect(entry).not.toHaveProperty('pain_reduced_by')
  })

  it('does not include outcome_primary', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.outcome_primary).toBeUndefined()
  })

  it('does not include shift_outcome', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.shift_outcome).toBeUndefined()
  })

  it('sets pain_before and pain_after to 0 — no pain delta claimed', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.pain_before).toBe(0)
    expect(entry.pain_after).toBe(0)
  })

  it('sets result to same — no improvement claimed', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.result).toBe('same')
  })
})

describe('customSessionToHistoryEntry — cycle count mapping', () => {
  it('maps cycles_completed to rounds_completed', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.rounds_completed).toBe(6)
  })

  it('maps cycles_completed correctly after exactly N cycles', () => {
    const entry = customSessionToHistoryEntry(SESSION, { ...RESULT, cycles_completed: 3 })
    expect(entry.rounds_completed).toBe(3)
  })
})

describe('customSessionToHistoryEntry — timestamp and duration', () => {
  it('carries the result timestamp through', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.timestamp).toBe(RESULT.timestamp)
  })

  it('carries session_duration_seconds through', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.session_duration_seconds).toBe(114)
  })
})

describe('customSessionToHistoryEntry — optional user_note', () => {
  it('omits movement_note when user_note is not provided', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.movement_note).toBeUndefined()
  })

  it('sets movement_note when user_note is provided', () => {
    const entry = customSessionToHistoryEntry(SESSION, { ...RESULT, user_note: 'Felt calm after' })
    expect(entry.movement_note).toBe('Felt calm after')
  })
})

describe('customSessionToHistoryEntry — required HistoryEntry fields', () => {
  it('sets session_status to completed', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.session_status).toBe('completed')
  })

  it('sets selected_protocol_id to CUSTOM', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.selected_protocol_id).toBe('CUSTOM')
  })

  it('sets selected_protocol_name to session.name', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.selected_protocol_name).toBe(SESSION.name)
  })

  it('sets empty location_tags and symptom_tags', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.location_tags).toEqual([])
    expect(entry.symptom_tags).toEqual([])
  })

  it('produces a unique session_id that includes the session id and timestamp', () => {
    const entry = customSessionToHistoryEntry(SESSION, RESULT)
    expect(entry.session_id).toContain(SESSION.id)
    expect(entry.session_id).toContain(RESULT.timestamp)
  })
})
