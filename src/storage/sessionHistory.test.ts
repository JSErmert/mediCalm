import { describe, it, expect, beforeEach } from 'vitest'
import { saveSession, loadHistory } from './sessionHistory'
import type { HistoryEntry } from '../types'

const entry: HistoryEntry = {
  session_id: 'sess_001',
  timestamp: '2026-03-23T12:00:00.000Z',
  pain_before: 6,
  pain_after: 3,
  location_tags: ['ribs'],
  symptom_tags: ['tightness'],
  selected_protocol_id: 'PROTO_RIB_EXPANSION_RESET',
  selected_protocol_name: 'Rib Expansion Reset',
  result: 'better',
  change_markers: ['less_tight'],
  session_status: 'completed',
  session_duration_seconds: 91,
}

describe('sessionHistory', () => {
  beforeEach(() => localStorage.clear())

  it('loadHistory returns empty array when nothing saved', () => {
    expect(loadHistory()).toEqual([])
  })

  it('saveSession persists an entry that loadHistory returns', () => {
    saveSession(entry)
    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0].session_id).toBe('sess_001')
  })

  it('saveSession prepends new entries (most recent first)', () => {
    const older: HistoryEntry = { ...entry, session_id: 'sess_000', timestamp: '2026-03-23T11:00:00.000Z' }
    saveSession(older)
    saveSession(entry)
    const history = loadHistory()
    expect(history[0].session_id).toBe('sess_001')
    expect(history[1].session_id).toBe('sess_000')
  })

  it('saveSession preserves existing entries', () => {
    saveSession(entry)
    const second: HistoryEntry = { ...entry, session_id: 'sess_002' }
    saveSession(second)
    expect(loadHistory()).toHaveLength(2)
  })

  it('loadHistory returns empty array on corrupted storage', () => {
    localStorage.setItem('medicaLm_session_history', 'not-json')
    expect(loadHistory()).toEqual([])
  })
})
