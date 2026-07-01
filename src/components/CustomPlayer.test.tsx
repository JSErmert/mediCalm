import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { AppProvider } from '../context/AppProvider'
import { useAppContext } from '../context/AppContext'
import { CustomPlayer } from './CustomPlayer'
import { loadHistory } from '../storage/sessionHistory'
import type { CustomSession } from '../types'

// Mock BreathingOrb: capture the timing profile it receives and expose its
// lifecycle callbacks as buttons so the test can drive completion deterministically.
vi.mock('./BreathingOrb', () => ({
  BreathingOrb: (props: {
    timingProfile: unknown
    onRoundComplete?: (n: number) => void
    onAllRoundsComplete?: () => void
  }) => (
    <div>
      <div data-testid="orb-timing">{JSON.stringify(props.timingProfile)}</div>
      <button type="button" onClick={() => props.onRoundComplete?.(2)}>
        orb-round-2
      </button>
      <button type="button" onClick={() => props.onAllRoundsComplete?.()}>
        orb-complete
      </button>
    </div>
  ),
}))

function Seeder({ session }: { session: CustomSession }) {
  const { dispatch } = useAppContext()
  useEffect(() => {
    dispatch({ type: 'SET_PENDING_CUSTOM', session })
    dispatch({ type: 'NAVIGATE', screen: 'custom_player' })
  }, [dispatch, session])
  return null
}

function renderPlayer(session: CustomSession) {
  return render(
    <AppProvider>
      <Seeder session={session} />
      <CustomPlayer />
    </AppProvider>
  )
}

const outOfBounds: CustomSession = {
  id: 'cs_oob',
  name: 'Out of bounds',
  profile: {
    inhale_seconds: 999,
    hold_after_inhale_seconds: 999,
    exhale_seconds: 999,
    hold_after_exhale_seconds: 999,
    cycles: 999,
  },
  created_at: '2026-06-30T00:00:00.000Z',
  updated_at: '2026-06-30T00:00:00.000Z',
}

const inBounds: CustomSession = {
  id: 'cs_ok',
  name: 'Evening calm',
  profile: {
    inhale_seconds: 4,
    hold_after_inhale_seconds: 0,
    exhale_seconds: 6,
    hold_after_exhale_seconds: 0,
    cycles: 5,
  },
  created_at: '2026-06-30T00:00:00.000Z',
  updated_at: '2026-06-30T00:00:00.000Z',
}

describe('CustomPlayer — validation choke point', () => {
  beforeEach(() => localStorage.clear())

  it('only clamped timing reaches the orb (no out-of-bounds value plays)', async () => {
    renderPlayer(outOfBounds)
    const timing = JSON.parse(
      (await screen.findByTestId('orb-timing')).textContent as string
    )
    // Clamped ceilings from validateCustomTiming: inhale 10, exhale 12,
    // hold_in 7, hold_out 4, cycles 30.
    expect(timing.inhale_seconds).toBe(10)
    expect(timing.exhale_seconds).toBe(12)
    expect(timing.hold_after_inhale_seconds).toBe(7)
    expect(timing.hold_after_exhale_seconds).toBe(4)
    expect(timing.rounds).toBe(30)
  })

  it('passes the composed timing straight through when already in bounds', async () => {
    renderPlayer(inBounds)
    const timing = JSON.parse(
      (await screen.findByTestId('orb-timing')).textContent as string
    )
    expect(timing.inhale_seconds).toBe(4)
    expect(timing.exhale_seconds).toBe(6)
    expect(timing.rounds).toBe(5)
  })
})

describe('CustomPlayer — completion save', () => {
  beforeEach(() => localStorage.clear())

  it('saves to history via saveCustomHistoryEntry with no pending validation', async () => {
    const user = userEvent.setup()
    renderPlayer(inBounds)

    await user.click(await screen.findByText('orb-round-2'))
    await user.click(screen.getByText('orb-complete'))

    await user.click(await screen.findByRole('button', { name: /save to history/i }))

    await waitFor(() => expect(loadHistory()).toHaveLength(1))
    const entry = loadHistory()[0]
    expect(entry.session_type).toBe('CUSTOM')
    expect(entry.custom_session_id).toBe('cs_ok')
    expect(entry.selected_protocol_name).toBe('Evening calm')
    expect(entry.rounds_completed).toBe(2)
    // Custom sessions are validation-exempt — never persisted as 'pending'.
    expect(entry.validation_status).toBeUndefined()
  })

  it('dismissing completion does not write to history', async () => {
    const user = userEvent.setup()
    renderPlayer(inBounds)

    await user.click(await screen.findByText('orb-complete'))
    await user.click(await screen.findByRole('button', { name: /done without saving/i }))

    expect(loadHistory()).toHaveLength(0)
  })
})
