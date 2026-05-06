/**
 * M7 phase log API — writes I24–I32 invariants into PhaseLogEntry sequences.
 *
 * Discipline (Q11 Refinement 3): complete entries are Class 1 immutable;
 * incomplete entries (no completed_at) may be mutated exactly once by closure
 * helpers (completePhase, abortPhase, safetyStopPhase, systemErrorPhase) or by
 * the orphan sweep. After closure, no further mutation permitted.
 */
import type { PhaseLogEntry, TruthState } from '../../types/m7'
import type { HistoryEntry } from '../../types'

function nowISO(): string {
  return new Date().toISOString()
}

export function startPhase(
  log: PhaseLogEntry[],
  phase_index: number,
  phase_type: PhaseLogEntry['phase_type'],
  phase_subtype?: PhaseLogEntry['phase_subtype'],
): void {
  log.push({
    phase_index,
    phase_type,
    phase_subtype,
    started_at: nowISO(),
  })
}

function getOpenEntry(log: PhaseLogEntry[], phase_index: number): PhaseLogEntry {
  const entry = log[phase_index]
  if (!entry) throw new Error(`phaseLog: no entry at index ${phase_index}`)
  if (entry.completed_at) throw new Error(`phaseLog: entry ${phase_index} already closed`)
  return entry
}

function durationSeconds(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
}

export function completePhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'completed'
  e.drop_off_reason_source = 'explicit'
}

export function abortPhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'user_aborted'
  e.drop_off_reason_source = 'explicit'
}

export function safetyStopPhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'safety_stopped'
  e.drop_off_reason_source = 'explicit'
}

export function systemErrorPhase(log: PhaseLogEntry[], phase_index: number): void {
  const e = getOpenEntry(log, phase_index)
  const completed_at = nowISO()
  e.completed_at = completed_at
  e.duration_actual_seconds = durationSeconds(e.started_at, completed_at)
  e.drop_off_reason = 'system_error'
  e.drop_off_reason_source = 'inferred_from_session_end'
}

/**
 * Orphan sweep — idempotent backfill of incomplete phase_log entries.
 * Runs on app-load AND next-session-start. Touches only entries with no completed_at;
 * leaves complete entries unchanged. Per Q7 Refinement 3.
 */
export function sweepOrphans(history: HistoryEntry[]): void {
  const now = nowISO()
  for (const entry of history) {
    if (!entry.phase_log) continue
    for (const phaseEntry of entry.phase_log) {
      if (phaseEntry.completed_at) continue  // idempotent — skip closed
      phaseEntry.completed_at = now
      phaseEntry.duration_actual_seconds = durationSeconds(phaseEntry.started_at, now)
      phaseEntry.drop_off_reason = 'system_error'
      phaseEntry.drop_off_reason_source = 'inferred_from_orphan_sweep'
    }
  }
}

/**
 * Derive mechanical TruthState fields from phase_log + pain readings.
 * Authority: §3.10 I40, M7.1 Task 16 Sub-task B.
 *
 * - completion_status: 'safety_stopped' if any entry has safety_stopped;
 *   'aborted' if any has user_aborted; else 'complete'.
 * - completion_percentage: completed_count / total_count (0 if total === 0).
 * - pain_delta: pain_after - pain_before.
 * - state_coherence: always 'pending' at M7.1 (M6.9 territory at M7.3+).
 * - user_validation: pass-through of validation_status ?? 'pending'.
 */
export function deriveTruthState(
  phase_log: PhaseLogEntry[],
  pain_before: number,
  pain_after: number,
  validation_status?: 'validated' | 'invalidated' | 'pending',
): TruthState {
  const total = phase_log.length
  const completed_count = phase_log.filter((e) => e.drop_off_reason === 'completed').length
  const completion_percentage = total === 0 ? 0 : completed_count / total

  let completion_status: TruthState['completion_status'] = 'complete'
  if (phase_log.some((e) => e.drop_off_reason === 'safety_stopped')) {
    completion_status = 'safety_stopped'
  } else if (phase_log.some((e) => e.drop_off_reason === 'user_aborted')) {
    completion_status = 'aborted'
  }

  return {
    completion_status,
    completion_percentage,
    pain_delta: pain_after - pain_before,
    state_coherence: 'pending',
    user_validation: validation_status ?? 'pending',
  }
}
