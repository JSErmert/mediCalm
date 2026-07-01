import type { CustomSession } from '../types'
import { storageGet, storageSet } from './localStorage'

const KEY = 'custom_sessions'

export const SOFT_SESSION_WARN_LIMIT = 50

function load(): CustomSession[] {
  const data = storageGet<CustomSession[]>(KEY)
  return Array.isArray(data) ? data : []
}

export function loadCustomSessions(): CustomSession[] {
  return load()
}

export function saveCustomSession(session: CustomSession): void {
  const sessions = load()
  const idx = sessions.findIndex((s) => s.id === session.id)
  let updated: CustomSession[]
  if (idx >= 0) {
    updated = [...sessions]
    updated[idx] = session
  } else {
    updated = [session, ...sessions]
  }
  storageSet(KEY, updated)
  if (updated.length > SOFT_SESSION_WARN_LIMIT) {
    console.warn(`[MediCalm] customSessions soft limit reached (${updated.length} sessions)`)
  }
}

export function getCustomSession(id: string): CustomSession | null {
  return load().find((s) => s.id === id) ?? null
}

export function deleteCustomSession(id: string): void {
  storageSet(KEY, load().filter((s) => s.id !== id))
}

export function renameCustomSession(id: string, name: string): void {
  const updated = load().map((s) =>
    s.id === id ? { ...s, name, updated_at: new Date().toISOString() } : s
  )
  storageSet(KEY, updated)
}

export function duplicateCustomSession(id: string): CustomSession {
  const original = getCustomSession(id)
  if (!original) throw new Error(`[MediCalm] duplicateCustomSession: session "${id}" not found`)
  const now = new Date().toISOString()
  const copy: CustomSession = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} copy`,
    created_at: now,
    updated_at: now,
  }
  saveCustomSession(copy)
  return copy
}

export function customSessionCount(): number {
  return load().length
}
