import type { AppSettings } from '../types'
import { storageGet, storageSet } from './localStorage'

const KEY = 'app_settings'

export function getDefaultSettings(): AppSettings {
  return {
    audio_enabled: true,
    reduced_motion_enabled: false,
    haptics_enabled: false,
  }
}

export function loadSettings(): AppSettings {
  return storageGet<AppSettings>(KEY) ?? getDefaultSettings()
}

export function saveSettings(settings: AppSettings): void {
  storageSet(KEY, settings)
}
