import { describe, it, expect, beforeEach } from 'vitest'
import {
  startPhase,
  completePhase,
  abortPhase,
  safetyStopPhase,
  systemErrorPhase,
  sweepOrphans,
  deriveTruthState,
} from './phaseLog'
import type { PhaseLogEntry } from '../../types/m7'
import type { HistoryEntry } from '../../types'

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

describe('M7 sweepOrphans — backfill incomplete phase_log entries (I26, I32)', () => {
  it('backfills entry with no completed_at as system_error from orphan sweep', () => {
    const history: HistoryEntry[] = [{
      session_id: 's1',
      timestamp: '2026-05-05T00:00:00.000Z',
      pain_before: 5, pain_after: 5,
      location_tags: [], symptom_tags: [],
      selected_protocol_id: 'x', selected_protocol_name: 'x',
      result: 'completed' as never,
      change_markers: [],
      session_status: 'completed' as never,
      session_duration_seconds: 0,
      phase_log: [{
        phase_index: 0,
        phase_type: 'breath',
        started_at: '2026-05-05T00:00:00.000Z',
      }],
    }] as HistoryEntry[]

    sweepOrphans(history)

    expect(history[0].phase_log![0].completed_at).toBeTruthy()
    expect(history[0].phase_log![0].drop_off_reason).toBe('system_error')
    expect(history[0].phase_log![0].drop_off_reason_source).toBe('inferred_from_orphan_sweep')
  })

  it('is idempotent — running sweep twice does not re-mutate closed entries', () => {
    const history: HistoryEntry[] = [{
      session_id: 's1',
      timestamp: '2026-05-05T00:00:00.000Z',
      pain_before: 5, pain_after: 5,
      location_tags: [], symptom_tags: [],
      selected_protocol_id: 'x', selected_protocol_name: 'x',
      result: 'completed' as never,
      change_markers: [],
      session_status: 'completed' as never,
      session_duration_seconds: 0,
      phase_log: [{
        phase_index: 0,
        phase_type: 'breath',
        started_at: '2026-05-05T00:00:00.000Z',
      }],
    }] as HistoryEntry[]

    sweepOrphans(history)
    const firstClose = history[0].phase_log![0].completed_at
    sweepOrphans(history)
    expect(history[0].phase_log![0].completed_at).toBe(firstClose)
  })

  it('does not modify entries already closed', () => {
    const history: HistoryEntry[] = [{
      session_id: 's1',
      timestamp: '2026-05-05T00:00:00.000Z',
      pain_before: 5, pain_after: 5,
      location_tags: [], symptom_tags: [],
      selected_protocol_id: 'x', selected_protocol_name: 'x',
      result: 'completed' as never,
      change_markers: [],
      session_status: 'completed' as never,
      session_duration_seconds: 0,
      phase_log: [{
        phase_index: 0,
        phase_type: 'breath',
        started_at: '2026-05-05T00:00:00.000Z',
        completed_at: '2026-05-05T00:01:00.000Z',
        drop_off_reason: 'completed',
        drop_off_reason_source: 'explicit',
      }],
    }] as HistoryEntry[]

    sweepOrphans(history)
    expect(history[0].phase_log![0].drop_off_reason).toBe('completed')
  })
})

describe('deriveTruthState — mechanical TruthState fields (M7.1 Task 16 Sub-task B)', () => {
  it('returns completion_status="complete" when all phases completed', () => {
    const log: PhaseLogEntry[] = []
    startPhase(log, 0, 'breath')
    completePhase(log, 0)
    const result = deriveTruthState(log, 6, 4, 'pending')
    expect(result.completion_status).toBe('complete')
  })

  it('returns completion_status="aborted" when any phase is user_aborted', () => {
    const log: PhaseLogEntry[] = []
    startPhase(log, 0, 'breath')
    abortPhase(log, 0)
    const result = deriveTruthState(log, 6, 4, 'pending')
    expect(result.completion_status).toBe('aborted')
  })

  it('returns completion_status="safety_stopped" when any phase is safety_stopped (takes precedence over aborted)', () => {
    const log: PhaseLogEntry[] = []
    startPhase(log, 0, 'breath')
    safetyStopPhase(log, 0)
    const result = deriveTruthState(log, 6, 4, 'pending')
    expect(result.completion_status).toBe('safety_stopped')
  })

  it('completion_percentage is 1 when all phases completed', () => {
    const log: PhaseLogEntry[] = []
    startPhase(log, 0, 'breath')
    completePhase(log, 0)
    const result = deriveTruthState(log, 5, 3, undefined)
    expect(result.completion_percentage).toBe(1)
  })

  it('completion_percentage is 0 when no phases completed', () => {
    const log: PhaseLogEntry[] = []
    startPhase(log, 0, 'breath')
    abortPhase(log, 0)
    const result = deriveTruthState(log, 5, 5, undefined)
    expect(result.completion_percentage).toBe(0)
  })

  it('completion_percentage is 0 for empty log', () => {
    const result = deriveTruthState([], 5, 5, undefined)
    expect(result.completion_percentage).toBe(0)
  })

  it('pain_delta is pain_after - pain_before', () => {
    const log: PhaseLogEntry[] = []
    startPhase(log, 0, 'breath')
    completePhase(log, 0)
    const result = deriveTruthState(log, 7, 4, 'pending')
    expect(result.pain_delta).toBe(-3)
  })

  it('pain_delta is positive when pain increases', () => {
    const result = deriveTruthState([], 3, 6, undefined)
    expect(result.pain_delta).toBe(3)
  })

  it('state_coherence is always "pending" at M7.1', () => {
    const result = deriveTruthState([], 5, 5, undefined)
    expect(result.state_coherence).toBe('pending')
  })

  it('user_validation passes through provided validation_status', () => {
    const result = deriveTruthState([], 5, 5, 'validated')
    expect(result.user_validation).toBe('validated')
  })

  it('user_validation defaults to "pending" when not provided', () => {
    const result = deriveTruthState([], 5, 5, undefined)
    expect(result.user_validation).toBe('pending')
  })
})
