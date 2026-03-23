/**
 * MediCalm localStorage Helpers
 * Generic typed wrappers with JSON safety. Never throws — returns null on error.
 * All keys are namespaced under the 'medicaLm_' prefix.
 */

const PREFIX = 'medicaLm_'

export function storageGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private browsing — silently degrade
    console.warn('[MediCalm] localStorage write failed for key:', key)
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
