import type { HistoryEntry } from '../types'
import { storageGet, storageSet } from './localStorage'

const KEY = 'session_history'

export function loadHistory(): HistoryEntry[] {
  return storageGet<HistoryEntry[]>(KEY) ?? []
}

export function saveSession(entry: HistoryEntry): void {
  const history = loadHistory()
  storageSet(KEY, [entry, ...history])
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
