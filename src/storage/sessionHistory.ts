import type { HistoryEntry } from '../types'
import { storageGet, storageSet } from './localStorage'
import { markSessionPendingValidation } from './bodyContext'

// ── Read mode separation (M4.7.M1) ───────────────────────────────────────────
//
// Two distinct read modes per M4.7.M1 §8:
//
//   Audit / Display  →  loadHistory()           — all sessions, all statuses
//   Adaptive Decision → getEligibleHariHistory() — validated HARI sessions only
//
// Future adaptive layers (M5+) MUST use getEligibleHariHistory(), never loadHistory().

const KEY = 'session_history'

export function loadHistory(): HistoryEntry[] {
  return storageGet<HistoryEntry[]>(KEY) ?? []
}

/**
 * Persist a full history array (e.g. after orphan sweep or bulk mutation).
 * Uses the same key as loadHistory / saveSession — KEY = 'session_history'.
 * Authority: M7.1 Task 16 Sub-task C (orphan sweep on app-load).
 */
export function saveHistory(history: HistoryEntry[]): void {
  storageSet(KEY, history)
}

export function saveSession(entry: HistoryEntry): void {
  const history = loadHistory()
  // M4.1 §18: New sessions start as 'pending' and require validation before the next session.
  const withValidation: HistoryEntry = {
    ...entry,
    validation_status: 'pending',
  }
  storageSet(KEY, [withValidation, ...history])
  markSessionPendingValidation(entry.session_id)
}

/**
 * Resolve the validation status of a session.
 * Authority: M4.1 §18 (validation gate), §19 (deletion horizon)
 * Only the most recent 1-back session may be invalidated via this path.
 */
export function resolveSessionValidation(
  sessionId: string,
  status: 'validated' | 'invalidated'
): void {
  const history = loadHistory()
  const updated = history.map((entry) =>
    entry.session_id === sessionId ? { ...entry, validation_status: status } : entry
  )
  storageSet(KEY, updated)
}

/**
 * Get the most recent session that is pending validation, if any.
 * Returns null if all sessions are resolved or no sessions exist.
 */
export function getPendingValidationEntry(): HistoryEntry | null {
  const history = loadHistory()
  if (history.length === 0) return null
  const latest = history[0]
  if (latest.validation_status === 'pending') return latest
  return null
}

/**
 * Eligibility predicate for adaptive history reads.
 * Authority: M4.7.M1 §4–§5
 *
 * A session is eligible only if ALL of the following hold:
 *   - session_type is 'HARI'            (not a legacy session)
 *   - validation_status is 'validated'  (not pending, not invalidated, not absent)
 *   - hari_metadata is present          (not malformed)
 *
 * Must not be used for display/audit — use loadHistory() for that.
 */
export function isEligibleHariSession(entry: HistoryEntry): boolean {
  return (
    entry.session_type === 'HARI' &&
    entry.validation_status === 'validated' &&
    entry.hari_metadata !== undefined
  )
}

/**
 * Adaptive decision read helper — returns only validated, eligible HARI sessions.
 * Authority: M4.7.M1 §3, §6, §8-B
 *
 * MUST be the default source for any future personalization, pattern learning,
 * or adaptive weighting logic. Never pass raw loadHistory() to adaptive layers.
 *
 * Excludes: invalidated, pending, legacy, and malformed entries automatically.
 */
export function getEligibleHariHistory(): HistoryEntry[] {
  return loadHistory().filter(isEligibleHariSession)
}

export function deleteSession(sessionId: string): void {
  const history = loadHistory()
  storageSet(KEY, history.filter((e) => e.session_id !== sessionId))
}

/**
 * Update the editable post-session fields for an existing history entry.
 * Only pain_after, result, change_markers, and note are editable — intake and
 * protocol data are permanent.
 */
export function updateSessionFeedback(
  sessionId: string,
  patch: Pick<Partial<HistoryEntry>, 'pain_after' | 'result' | 'change_markers'> & { note?: string }
): void {
  const history = loadHistory()
  const updated = history.map((entry) =>
    entry.session_id === sessionId ? { ...entry, ...patch } : entry
  )
  storageSet(KEY, updated)
}
