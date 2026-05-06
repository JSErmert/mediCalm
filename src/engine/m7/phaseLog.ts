/**
 * M7 phase log API — writes I24–I32 invariants into PhaseLogEntry sequences.
 *
 * Discipline (Q11 Refinement 3): complete entries are Class 1 immutable;
 * incomplete entries (no completed_at) may be mutated exactly once by closure
 * helpers (completePhase, abortPhase, safetyStopPhase, systemErrorPhase) or by
 * the orphan sweep. After closure, no further mutation permitted.
 */
import type { PhaseLogEntry } from '../../types/m7'

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
