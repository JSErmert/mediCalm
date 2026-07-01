/**
 * n5-crosscut — movement mode integration smoke.
 *
 * Exercises the two custom flows end-to-end through the REAL wiring
 * (AppProvider reducer → CustomLibraryScreen → CustomPlayer → CustomCompletion →
 * customSessionToHistoryEntry → saveCustomHistoryEntry → sessionHistory storage):
 *
 *   1. Standard custom run:   library → Run  → complete → save
 *   2. Movement (walking) run: library → Walk → glanceable play → abbreviated,
 *                              honest close (pace + note) → save
 *
 * Both must land CUSTOM HistoryEntry records that isEligibleHariSession EXCLUDES,
 * and the movement record must carry walking_mode / walking_speed_tag /
 * movement_note. BreathingOrb is mocked to expose its lifecycle callbacks so the
 * orb animation timers don't drive the smoke (everything else is real).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { AppProvider } from '../context/AppProvider'
import { useAppContext } from '../context/AppContext'
import { CustomLibraryScreen } from '../screens/CustomLibraryScreen'
import { CustomPlayer } from './CustomPlayer'
import { saveCustomSession } from '../storage/customSessions'
import { loadHistory, isEligibleHariSession } from '../storage/sessionHistory'
import type { CustomSession } from '../types'

// Mock BreathingOrb: expose round + complete callbacks as buttons; also surface
// the glanceable flag so the movement layout can be asserted deterministically.
vi.mock('./BreathingOrb', () => ({
  BreathingOrb: (props: {
    glanceable?: boolean
    onRoundComplete?: (n: number) => void
    onAllRoundsComplete?: () => void
  }) => (
    <div>
      <div data-testid="orb-glanceable">{String(!!props.glanceable)}</div>
      <button type="button" onClick={() => props.onRoundComplete?.(3)}>
        orb-round-3
      </button>
      <button type="button" onClick={() => props.onAllRoundsComplete?.()}>
        orb-complete
      </button>
    </div>
  ),
}))

// Minimal router harness: renders the current screen from context (no
// AnimatePresence — keeps the smoke free of exit-transition timing).
function Harness() {
  const { state, dispatch } = useAppContext()
  useEffect(() => {
    dispatch({ type: 'NAVIGATE', screen: 'custom_library' })
  }, [dispatch])
  if (state.activeScreen === 'custom_library') return <CustomLibraryScreen />
  if (state.activeScreen === 'custom_player') return <CustomPlayer />
  return <div>home</div>
}

function renderApp() {
  return render(
    <AppProvider>
      <Harness />
    </AppProvider>
  )
}

const SESSION: CustomSession = {
  id: 'cs_morning',
  name: 'Morning',
  profile: {
    inhale_seconds: 4,
    hold_after_inhale_seconds: 0,
    exhale_seconds: 6,
    hold_after_exhale_seconds: 0,
    cycles: 5,
  },
  created_at: '2026-06-30T12:00:00.000Z',
  updated_at: '2026-06-30T12:00:00.000Z',
}

describe('movement flow integration — standard custom run', () => {
  beforeEach(() => localStorage.clear())

  it('library → Run → complete → save lands a CUSTOM entry excluded from HARI eligibility', async () => {
    saveCustomSession(SESSION)
    const user = userEvent.setup()
    renderApp()

    await user.click(await screen.findByRole('button', { name: /run morning/i }))

    // Standard playback is not glanceable.
    expect((await screen.findByTestId('orb-glanceable')).textContent).toBe('false')

    await user.click(await screen.findByText('orb-round-3'))
    await user.click(screen.getByText('orb-complete'))
    await user.click(await screen.findByRole('button', { name: /save to history/i }))

    await waitFor(() => expect(loadHistory()).toHaveLength(1))
    const entry = loadHistory()[0]
    expect(entry.session_type).toBe('CUSTOM')
    expect(entry.custom_session_id).toBe('cs_morning')
    expect(entry.rounds_completed).toBe(3)
    // No movement metadata on a standard run.
    expect(entry.walking_mode).toBeUndefined()
    expect(entry.walking_speed_tag).toBeUndefined()
    // Validation-exempt and never HARI-eligible.
    expect(entry.validation_status).toBeUndefined()
    expect(isEligibleHariSession(entry)).toBe(false)
  })
})

describe('movement flow integration — walking run', () => {
  beforeEach(() => localStorage.clear())

  it('library → Walk → glanceable play → honest close lands a CUSTOM movement entry', async () => {
    saveCustomSession(SESSION)
    const user = userEvent.setup()
    renderApp()

    await user.click(await screen.findByRole('button', { name: /walk with morning/i }))

    // Glanceable, hands-free playback with the movement duration label.
    expect((await screen.findByTestId('orb-glanceable')).textContent).toBe('true')
    expect(screen.getByText(/walk with your breath/i)).toBeInTheDocument()

    await user.click(await screen.findByText('orb-round-3'))
    await user.click(screen.getByText('orb-complete'))

    // Abbreviated, honest close: personal observation only, optional pace chip
    // (token-styled, not a native select), optional movement note, one-tap save.
    expect(await screen.findByText(/how did it feel for you/i)).toBeInTheDocument()
    const moderate = screen.getByRole('button', { name: 'Moderate' })
    await user.click(moderate)
    expect(moderate).toHaveAttribute('aria-pressed', 'true')

    await user.type(
      screen.getByLabelText(/optional note about how the movement felt/i),
      'Legs felt loose on the treadmill'
    )
    await user.click(screen.getByRole('button', { name: /save to history/i }))

    await waitFor(() => expect(loadHistory()).toHaveLength(1))
    const entry = loadHistory()[0]
    expect(entry.session_type).toBe('CUSTOM')
    expect(entry.custom_session_id).toBe('cs_morning')
    expect(entry.walking_mode).toBe(true)
    expect(entry.walking_speed_tag).toBe('moderate')
    expect(entry.movement_note).toBe('Legs felt loose on the treadmill')
    // MOVEMENT-HONESTY: no efficacy / pain-delta claim.
    expect(entry).not.toHaveProperty('pain_reduced_by')
    expect(entry.pain_before).toBe(0)
    expect(entry.pain_after).toBe(0)
    expect(entry.result).toBe('same')
    // Never HARI-eligible.
    expect(isEligibleHariSession(entry)).toBe(false)
  })

  it('tapping a selected pace clears it — the pace tag stays optional', async () => {
    saveCustomSession(SESSION)
    const user = userEvent.setup()
    renderApp()

    await user.click(await screen.findByRole('button', { name: /walk with morning/i }))
    await user.click(await screen.findByText('orb-complete'))

    const brisk = await screen.findByRole('button', { name: 'Brisk' })
    await user.click(brisk)
    expect(brisk).toHaveAttribute('aria-pressed', 'true')
    await user.click(brisk)
    expect(brisk).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: /save to history/i }))

    await waitFor(() => expect(loadHistory()).toHaveLength(1))
    const entry = loadHistory()[0]
    expect(entry.walking_mode).toBe(true)
    // No pace chosen → the field is omitted entirely (not null).
    expect(entry.walking_speed_tag).toBeUndefined()
  })
})
