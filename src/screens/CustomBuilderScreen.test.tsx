import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { useAppContext } from '../context/AppContext'
import { CustomBuilderScreen } from './CustomBuilderScreen'
import { loadCustomSessions } from '../storage/customSessions'

let captured: { screen: string; pendingName: string | null } = { screen: '', pendingName: null }
function Capture() {
  const { state } = useAppContext()
  captured = {
    screen: state.activeScreen,
    pendingName: state.pendingCustomSession?.name ?? null,
  }
  return null
}

function renderBuilder() {
  return render(
    <AppProvider>
      <Capture />
      <CustomBuilderScreen />
    </AppProvider>
  )
}

describe('CustomBuilderScreen — presets', () => {
  beforeEach(() => {
    localStorage.clear()
    captured = { screen: '', pendingName: null }
  })

  it('offers gentle presets first', () => {
    renderBuilder()
    expect(screen.getByRole('button', { name: /use box breathing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /use 4-7-8/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /physiological sigh/i })).toBeInTheDocument()
  })

  it('loading a preset moves to review with its exact pattern and name', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.click(screen.getByRole('button', { name: /use box breathing/i }))

    // Review shows the composed pattern — box is 4/4/4/4 × 6.
    expect(screen.getByRole('heading', { name: /your session/i })).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/name this session/i) as HTMLInputElement
    expect(nameInput.value).toBe('Box breathing')
    // Four phase rows all read 4s; cycles row reads 6.
    expect(screen.getAllByText('4s').length).toBe(4)
    expect(screen.getByText('6')).toBeInTheDocument()
  })
})

describe('CustomBuilderScreen — save round-trip', () => {
  beforeEach(() => {
    localStorage.clear()
    captured = { screen: '', pendingName: null }
  })

  it('Save to library round-trips the composed session into storage', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.click(screen.getByRole('button', { name: /use 4-7-8/i }))
    await user.click(screen.getByRole('button', { name: /save to library/i }))

    const sessions = loadCustomSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].name).toBe('4-7-8')
    expect(sessions[0].profile).toEqual({
      inhale_seconds: 4,
      hold_after_inhale_seconds: 7,
      exhale_seconds: 8,
      hold_after_exhale_seconds: 0,
      cycles: 4,
    })
    expect(captured.screen).toBe('custom_library')
  })

  it('Begin saves to the library and queues the session for the player', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.click(screen.getByRole('button', { name: /use box breathing/i }))
    await user.click(screen.getByRole('button', { name: /begin session/i }))

    expect(loadCustomSessions()).toHaveLength(1)
    expect(captured.pendingName).toBe('Box breathing')
    expect(captured.screen).toBe('custom_player')
  })
})

describe('CustomBuilderScreen — build your own (paced, one value at a time)', () => {
  beforeEach(() => {
    localStorage.clear()
    captured = { screen: '', pendingName: null }
  })

  it('walks one value at a time and saves a clamped in-bounds profile', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.click(screen.getByRole('button', { name: /build your own/i }))

    // Step 1 — Inhale. Raise it by 2 (4 → 6).
    expect(screen.getByRole('heading', { name: 'Inhale' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /increase inhale/i }))
    await user.click(screen.getByRole('button', { name: /increase inhale/i }))

    // Advance through the remaining four steps (5 total: inhale → cycles).
    await user.click(screen.getByRole('button', { name: 'Next' }))   // → Hold in
    await user.click(screen.getByRole('button', { name: 'Next' }))   // → Exhale
    await user.click(screen.getByRole('button', { name: 'Next' }))   // → Hold out
    await user.click(screen.getByRole('button', { name: 'Next' }))   // → Cycles
    await user.click(screen.getByRole('button', { name: 'Review' })) // → review

    await user.click(screen.getByRole('button', { name: /save to library/i }))

    const sessions = loadCustomSessions()
    expect(sessions).toHaveLength(1)
    const p = sessions[0].profile
    expect(p.inhale_seconds).toBe(6)
    // Every saved value sits within the validateCustomTiming bounds.
    expect(p.inhale_seconds).toBeGreaterThanOrEqual(2)
    expect(p.inhale_seconds).toBeLessThanOrEqual(10)
    expect(p.exhale_seconds).toBeGreaterThanOrEqual(2)
  })

  it('the inhale stepper cannot go below the safe floor', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.click(screen.getByRole('button', { name: /build your own/i }))

    const decrease = screen.getByRole('button', { name: /decrease inhale/i })
    // Default inhale is 4; floor is 2. Two clicks reaches the floor, then it disables.
    await user.click(decrease)
    await user.click(decrease)
    expect(decrease).toBeDisabled()
  })
})
