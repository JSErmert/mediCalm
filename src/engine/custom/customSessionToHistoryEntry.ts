import type { CustomSession } from '../../types/custom'
import type { HistoryEntry } from '../../types'

export interface CustomSessionResult {
  /** ISO 8601 timestamp when the session completed */
  timestamp: string
  cycles_completed: number
  session_duration_seconds: number
  user_note?: string
}

/**
 * Maps a completed custom session to a HistoryEntry for persistence.
 *
 * MOVEMENT-HONESTY: carries only timestamp, cycles completed, and optional user
 * note. No efficacy claim, no pain delta. pain_before/after are 0 (no intake).
 */
export function customSessionToHistoryEntry(
  session: CustomSession,
  result: CustomSessionResult,
): HistoryEntry {
  const entry: HistoryEntry = {
    session_id: `${session.id}_${result.timestamp}`,
    timestamp: result.timestamp,
    pain_before: 0,
    pain_after: 0,
    location_tags: [],
    symptom_tags: [],
    selected_protocol_id: 'CUSTOM',
    selected_protocol_name: session.name,
    result: 'same',
    change_markers: [],
    session_status: 'completed',
    session_duration_seconds: result.session_duration_seconds,
    rounds_completed: result.cycles_completed,
    session_type: 'CUSTOM',
    custom_session_id: session.id,
  }

  if (result.user_note !== undefined) {
    entry.movement_note = result.user_note
  }

  return entry
}
