import type { UserProfile } from '../types'
import { storageGet, storageSet } from './localStorage'

const KEY = 'user_profile'

function generateUserId(): string {
  return 'user_' + Date.now().toString(36)
}

export function getDefaultProfile(): UserProfile {
  const now = new Date().toISOString()
  return {
    user_id: generateUserId(),
    created_at: now,
    last_opened_at: now,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export function loadProfile(): UserProfile {
  const stored = storageGet<UserProfile>(KEY)
  if (stored) {
    const updated: UserProfile = { ...stored, last_opened_at: new Date().toISOString() }
    storageSet(KEY, updated)
    return updated
  }
  const fresh = getDefaultProfile()
  storageSet(KEY, fresh)
  return fresh
}
