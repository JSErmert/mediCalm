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
