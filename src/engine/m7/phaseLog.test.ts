import { describe, it, expect, beforeEach } from 'vitest'
import {
  startPhase,
  completePhase,
  abortPhase,
  safetyStopPhase,
  systemErrorPhase,
} from './phaseLog'
import type { PhaseLogEntry } from '../../types/m7'

describe('M7 phaseLog — entry/exit transitions (I24, I25, I30–I32)', () => {
  let log: PhaseLogEntry[]
  beforeEach(() => { log = [] })

  it('startPhase creates entry with started_at and no completed_at (I24)', () => {
    startPhase(log, 0, 'breath')
    expect(log.length).toBe(1)
    expect(log[0].started_at).toBeTruthy()
    expect(log[0].completed_at).toBeUndefined()
  })

  it('completePhase sets completed_at + drop_off_reason="completed" (I25)', () => {
    startPhase(log, 0, 'breath')
    completePhase(log, 0)
    expect(log[0].completed_at).toBeTruthy()
    expect(log[0].drop_off_reason).toBe('completed')
    expect(log[0].drop_off_reason_source).toBe('explicit')
  })

  it('abortPhase sets explicit user_aborted (I30)', () => {
    startPhase(log, 0, 'breath')
    abortPhase(log, 0)
    expect(log[0].drop_off_reason).toBe('user_aborted')
    expect(log[0].drop_off_reason_source).toBe('explicit')
  })

  it('safetyStopPhase sets safety_stopped (I31)', () => {
    startPhase(log, 0, 'breath')
    safetyStopPhase(log, 0)
    expect(log[0].drop_off_reason).toBe('safety_stopped')
    expect(log[0].drop_off_reason_source).toBe('explicit')
  })

  it('systemErrorPhase sets system_error inferred from session-end', () => {
    startPhase(log, 0, 'breath')
    systemErrorPhase(log, 0)
    expect(log[0].drop_off_reason).toBe('system_error')
    expect(log[0].drop_off_reason_source).toBe('inferred_from_session_end')
  })
})
