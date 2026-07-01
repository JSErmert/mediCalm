import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadCustomSessions,
  saveCustomSession,
  getCustomSession,
  deleteCustomSession,
  renameCustomSession,
  duplicateCustomSession,
  customSessionCount,
  SOFT_SESSION_WARN_LIMIT,
} from './customSessions'
import { saveCustomHistoryEntry, loadHistory } from './sessionHistory'
import type { CustomSession, HistoryEntry } from '../types'

const makeSession = (id: string, name = 'Test Session'): CustomSession => ({
  id,
  name,
  profile: {
    inhale_seconds: 4,
    hold_after_inhale_seconds: 0,
    exhale_seconds: 6,
    hold_after_exhale_seconds: 0,
    cycles: 5,
  },
  created_at: '2026-06-30T12:00:00.000Z',
  updated_at: '2026-06-30T12:00:00.000Z',
})

const baseHistoryEntry: HistoryEntry = {
  session_id: 'custom_sess_001',
  timestamp: '2026-06-30T12:00:00.000Z',
  pain_before: 5,
  pain_after: 3,
  location_tags: ['shoulder'],
  symptom_tags: ['tightness'],
  selected_protocol_id: 'CUSTOM',
  selected_protocol_name: 'Custom Breath',
  result: 'better',
  change_markers: ['more_relaxed'],
  session_status: 'completed',
  session_duration_seconds: 120,
  session_type: 'CUSTOM',
}

describe('customSessions — CRUD', () => {
  beforeEach(() => localStorage.clear())

  it('loadCustomSessions returns empty array when nothing saved', () => {
    expect(loadCustomSessions()).toEqual([])
  })

  it('loadCustomSessions returns empty array on malformed storage', () => {
    localStorage.setItem('medicaLm_custom_sessions', 'not-json')
    expect(loadCustomSessions()).toEqual([])
  })

  it('saveCustomSession persists a session retrievable by loadCustomSessions', () => {
    const session = makeSession('cs_001')
    saveCustomSession(session)
    const sessions = loadCustomSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(session)
  })

  it('saveCustomSession upserts by id — updates existing, no duplicate created', () => {
    saveCustomSession(makeSession('cs_001', 'Original'))
    saveCustomSession({ ...makeSession('cs_001'), name: 'Renamed' })
    const sessions = loadCustomSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].name).toBe('Renamed')
  })

  it('saveCustomSession inserts a new session when id does not exist', () => {
    saveCustomSession(makeSession('cs_001'))
    saveCustomSession(makeSession('cs_002'))
    expect(loadCustomSessions()).toHaveLength(2)
  })

  it('getCustomSession returns the session by id', () => {
    const session = makeSession('cs_001')
    saveCustomSession(session)
    expect(getCustomSession('cs_001')).toEqual(session)
  })

  it('getCustomSession returns null when id not found', () => {
    expect(getCustomSession('nonexistent')).toBeNull()
  })

  it('deleteCustomSession removes the session', () => {
    saveCustomSession(makeSession('cs_001'))
    saveCustomSession(makeSession('cs_002'))
    deleteCustomSession('cs_001')
    const sessions = loadCustomSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].id).toBe('cs_002')
  })

  it('deleteCustomSession is a no-op for an unknown id', () => {
    saveCustomSession(makeSession('cs_001'))
    deleteCustomSession('nonexistent')
    expect(loadCustomSessions()).toHaveLength(1)
  })

  it('renameCustomSession updates the name', () => {
    saveCustomSession(makeSession('cs_001', 'Old Name'))
    renameCustomSession('cs_001', 'New Name')
    expect(getCustomSession('cs_001')?.name).toBe('New Name')
  })
})

describe('customSessions — duplicate', () => {
  beforeEach(() => localStorage.clear())

  it('duplicateCustomSession returns a new session with a distinct id', () => {
    saveCustomSession(makeSession('cs_001', 'My Session'))
    const copy = duplicateCustomSession('cs_001')
    expect(copy.id).not.toBe('cs_001')
    expect(copy.name).toBe('My Session copy')
  })

  it('duplicateCustomSession saves the copy to storage', () => {
    saveCustomSession(makeSession('cs_001'))
    const copy = duplicateCustomSession('cs_001')
    expect(getCustomSession(copy.id)).toEqual(copy)
    expect(loadCustomSessions()).toHaveLength(2)
  })

  it('duplicateCustomSession throws when id not found', () => {
    expect(() => duplicateCustomSession('nonexistent')).toThrow()
  })
})

describe('customSessions — count and soft limit', () => {
  beforeEach(() => localStorage.clear())

  it('customSessionCount returns 0 when nothing saved', () => {
    expect(customSessionCount()).toBe(0)
  })

  it('customSessionCount returns the number of stored sessions', () => {
    saveCustomSession(makeSession('cs_001'))
    saveCustomSession(makeSession('cs_002'))
    expect(customSessionCount()).toBe(2)
  })

  it('SOFT_SESSION_WARN_LIMIT equals 50', () => {
    expect(SOFT_SESSION_WARN_LIMIT).toBe(50)
  })

  it('saveCustomSession warns past the soft limit but does not block', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (let i = 0; i <= SOFT_SESSION_WARN_LIMIT; i++) {
      saveCustomSession(makeSession(`cs_${i}`))
    }
    expect(warnSpy).toHaveBeenCalled()
    expect(customSessionCount()).toBe(SOFT_SESSION_WARN_LIMIT + 1)
    warnSpy.mockRestore()
  })

  it('saveCustomSession does not warn below the soft limit', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (let i = 0; i < SOFT_SESSION_WARN_LIMIT; i++) {
      saveCustomSession(makeSession(`cs_${i}`))
    }
    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

describe('saveCustomHistoryEntry — M4.1 validation exemption', () => {
  beforeEach(() => localStorage.clear())

  it('prepends the entry to session history', () => {
    saveCustomHistoryEntry(baseHistoryEntry)
    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0].session_id).toBe('custom_sess_001')
  })

  it('does NOT set validation_status to pending', () => {
    saveCustomHistoryEntry(baseHistoryEntry)
    expect(loadHistory()[0].validation_status).not.toBe('pending')
  })

  it('does NOT set validation_status when entry has none', () => {
    saveCustomHistoryEntry(baseHistoryEntry)
    expect(loadHistory()[0].validation_status).toBeUndefined()
  })

  it('preserves an existing validation_status on the entry unchanged', () => {
    const entry: HistoryEntry = { ...baseHistoryEntry, validation_status: 'validated' }
    saveCustomHistoryEntry(entry)
    expect(loadHistory()[0].validation_status).toBe('validated')
  })

  it('prepends to existing history without affecting other entries', () => {
    saveCustomHistoryEntry(baseHistoryEntry)
    const second: HistoryEntry = { ...baseHistoryEntry, session_id: 'custom_sess_002' }
    saveCustomHistoryEntry(second)
    const history = loadHistory()
    expect(history).toHaveLength(2)
    expect(history[0].session_id).toBe('custom_sess_002')
    expect(history[1].session_id).toBe('custom_sess_001')
  })
})
