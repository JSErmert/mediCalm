import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { useAppContext } from '../context/AppContext'
import { CustomLibraryScreen } from './CustomLibraryScreen'
import { saveCustomSession, loadCustomSessions } from '../storage/customSessions'
import type { CustomSession } from '../types'

let captured: { screen: string; pendingId: string | null } = { screen: '', pendingId: null }
function Capture() {
  const { state } = useAppContext()
  captured = {
    screen: state.activeScreen,
    pendingId: state.pendingCustomSession?.id ?? null,
  }
  return null
}

function renderLibrary() {
  return render(
    <AppProvider>
      <Capture />
      <CustomLibraryScreen />
    </AppProvider>
  )
}

const make = (id: string, name: string): CustomSession => ({
  id,
  name,
  profile: {
    inhale_seconds: 4,
    hold_after_inhale_seconds: 4,
    exhale_seconds: 4,
    hold_after_exhale_seconds: 4,
    cycles: 6,
  },
  created_at: '2026-06-30T12:00:00.000Z',
  updated_at: '2026-06-30T12:00:00.000Z',
})

describe('CustomLibraryScreen — empty + navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    captured = { screen: '', pendingId: null }
  })

  it('shows the empty state when no sessions are saved', () => {
    renderLibrary()
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument()
  })

  it('compose button navigates to the builder', async () => {
    const user = userEvent.setup()
    renderLibrary()
    await user.click(screen.getByRole('button', { name: /compose a new session/i }))
    expect(captured.screen).toBe('custom_builder')
  })

  it('Run queues the session and navigates to the player', async () => {
    saveCustomSession(make('cs_run', 'Morning'))
    const user = userEvent.setup()
    renderLibrary()
    await user.click(screen.getByRole('button', { name: /run morning/i }))
    expect(captured.pendingId).toBe('cs_run')
    expect(captured.screen).toBe('custom_player')
  })
})

describe('CustomLibraryScreen — rename / duplicate', () => {
  beforeEach(() => localStorage.clear())

  it('renames a session and persists the new name', async () => {
    saveCustomSession(make('cs_1', 'Old Name'))
    const user = userEvent.setup()
    renderLibrary()

    await user.click(screen.getByRole('button', { name: /rename old name/i }))
    const input = screen.getByLabelText(/rename session/i)
    await user.clear(input)
    await user.type(input, 'Evening Wind Down')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Evening Wind Down')).toBeInTheDocument()
    expect(loadCustomSessions()[0].name).toBe('Evening Wind Down')
  })

  it('duplicates a session, adding a copy to the library', async () => {
    saveCustomSession(make('cs_1', 'Box'))
    const user = userEvent.setup()
    renderLibrary()

    await user.click(screen.getByRole('button', { name: /duplicate box/i }))

    expect(loadCustomSessions()).toHaveLength(2)
    expect(screen.getByText('Box copy')).toBeInTheDocument()
  })
})

describe('CustomLibraryScreen — delete with pre-confirm summary', () => {
  beforeEach(() => localStorage.clear())

  it('shows a session summary before confirming a delete', async () => {
    saveCustomSession(make('cs_1', 'To Remove'))
    const user = userEvent.setup()
    renderLibrary()

    await user.click(screen.getByRole('button', { name: /delete to remove/i }))

    const dialog = screen.getByRole('dialog', { name: /confirm delete session/i })
    // Summary shows the name and the composed pattern before any destructive action.
    expect(within(dialog).getByText('To Remove')).toBeInTheDocument()
    expect(within(dialog).getByText(/inhale 4s/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/6 cycles/i)).toBeInTheDocument()

    // Session still present until confirmed.
    expect(loadCustomSessions()).toHaveLength(1)
  })

  it('confirming the summary deletes the session', async () => {
    saveCustomSession(make('cs_1', 'To Remove'))
    const user = userEvent.setup()
    renderLibrary()

    await user.click(screen.getByRole('button', { name: /delete to remove/i }))
    const dialog = screen.getByRole('dialog', { name: /confirm delete session/i })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(loadCustomSessions()).toHaveLength(0)
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument()
  })

  it('keeping the session cancels the delete', async () => {
    saveCustomSession(make('cs_1', 'To Remove'))
    const user = userEvent.setup()
    renderLibrary()

    await user.click(screen.getByRole('button', { name: /delete to remove/i }))
    await user.click(screen.getByRole('button', { name: /keep it/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(loadCustomSessions()).toHaveLength(1)
  })
})

describe('CustomLibraryScreen — soft limit', () => {
  beforeEach(() => localStorage.clear())

  it('warns (never blocks) past the soft session limit', () => {
    for (let i = 0; i <= 51; i++) {
      saveCustomSession(make(`cs_${i}`, `Session ${i}`))
    }
    renderLibrary()
    expect(screen.getByRole('status')).toHaveTextContent(/quite a few sessions/i)
  })
})
