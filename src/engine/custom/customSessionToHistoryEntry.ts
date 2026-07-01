import type { CustomSession, WalkingSpeedTag } from '../../types/custom'
import type { HistoryEntry } from '../../types'

export interface CustomSessionResult {
  /** ISO 8601 timestamp when the session completed */
  timestamp: string
  cycles_completed: number
  session_duration_seconds: number
  user_note?: string
  /**
   * n5-crosscut: true when this custom session was run paired with walking.
   * When set, the entry records walking_mode (and the optional pace tag below).
   */
  walking_mode?: boolean
  /** n5-crosscut: optional walking pace, only meaningful when walking_mode is true. */
  walking_speed_tag?: WalkingSpeedTag
}

/**
 * Maps a completed custom session to a HistoryEntry for persistence.
 *
 * MOVEMENT-HONESTY: carries only timestamp, cycles completed, optional user
 * note, and — for movement sessions — the walking_mode flag with an optional
 * self-reported pace. No efficacy claim, no pain delta, no pain_reduced_by.
 * pain_before/after are 0 (no intake). The walking pace is the user's own
 * observation, never an outcome the app asserts.
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

  // Movement sessions record the walking_mode flag; the pace tag is optional and
  // omitted when the user did not choose one (kept off the entry entirely, not null).
  if (result.walking_mode) {
    entry.walking_mode = true
    if (result.walking_speed_tag !== undefined) {
      entry.walking_speed_tag = result.walking_speed_tag
    }
  }

  return entry
}
