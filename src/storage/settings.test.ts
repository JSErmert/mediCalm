import { describe, it, expect, beforeEach } from 'vitest'
import { loadSettings, saveSettings, getDefaultSettings } from './settings'

describe('settings storage', () => {
  beforeEach(() => localStorage.clear())

  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(getDefaultSettings())
  })

  it('round-trips settings correctly', () => {
    const custom = { audio_enabled: false, reduced_motion_enabled: true, haptics_enabled: false }
    saveSettings(custom)
    expect(loadSettings()).toEqual(custom)
  })

  it('defaults have audio enabled and haptics disabled', () => {
    const d = getDefaultSettings()
    expect(d.audio_enabled).toBe(true)
    expect(d.haptics_enabled).toBe(false)
  })
})
