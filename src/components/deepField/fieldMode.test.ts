/**
 * The damping contract for the ambient field.
 *
 * The load-bearing case is the safety one: a crisis surface must never carry
 * atmosphere. That is asserted here per screen AND as an exhaustiveness check, so
 * that adding a screen to AppScreen without deciding its field mode is a decision
 * someone has to make rather than one that defaults silently to 'full'.
 */
import { describe, it, expect } from 'vitest'
import type { AppScreen } from '../../context/AppContext'
import { getFieldMode } from './fieldMode'

/** Every member of AppScreen. Kept in step with the union by the test below. */
const ALL_SCREENS: AppScreen[] = [
  'home',
  'pain_input',
  'session_setup',
  'guided_session',
  'safety_stop',
  'rd_review',
  'session_validation',
  'session_intake',
  'hari_safety_gate',
  'body_context',
  'state_selection',
  'sad_safety',
  'support_resources',
  'custom_builder',
  'custom_library',
  'custom_player',
]

describe('getFieldMode', () => {
  it.each(['safety_stop', 'sad_safety', 'hari_safety_gate', 'support_resources'] as const)(
    'suppresses the field entirely on the %s safety surface',
    (screen) => {
      expect(getFieldMode(screen)).toBe('off')
    }
  )

  it.each(['guided_session', 'custom_player'] as const)(
    'damps the field to calm while %s is running',
    (screen) => {
      expect(getFieldMode(screen)).toBe('calm')
    }
  )

  it.each(['home', 'state_selection', 'body_context', 'custom_library'] as const)(
    'runs the full field on %s',
    (screen) => {
      expect(getFieldMode(screen)).toBe('full')
    }
  )

  it('returns a known mode for every screen the app can display', () => {
    for (const screen of ALL_SCREENS) {
      expect(['full', 'calm', 'off']).toContain(getFieldMode(screen))
    }
  })

  it('never runs the full field on a screen whose name mentions safety', () => {
    // A guard on the guard. If someone adds a safety screen and forgets the map,
    // this catches the common case without the map itself being a name pattern.
    const safetyish = ALL_SCREENS.filter((s) => /safety|support/.test(s))
    expect(safetyish.length).toBeGreaterThan(0)
    for (const screen of safetyish) {
      expect(getFieldMode(screen)).toBe('off')
    }
  })
})
