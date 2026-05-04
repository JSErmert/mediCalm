import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { StateSelectionScreen } from './StateSelectionScreen'
import { useAppContext } from '../context/AppContext'

function renderWithProvider() {
  return render(
    <AppProvider>
      <StateSelectionScreen />
    </AppProvider>
  )
}

describe('StateSelectionScreen — PT Clinical Pass 2', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
  })

  it('renders the PT-spec heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /why are you using the app today/i })
    ).toBeInTheDocument()
  })

  it('renders both branch options', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /tightness or pain/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anxious or overwhelmed/i })).toBeInTheDocument()
  })

  it('does not render any of the retired multi-select chips', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^heavy$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^exhausted$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^tight$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^sad$/i })).not.toBeInTheDocument()
  })

  it('Continue button is absent before any selection', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('Continue button appears after selecting a branch', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
  })

  it('selecting one branch deselects the other (single-select)', async () => {
    renderWithProvider()
    const tightness = screen.getByRole('button', { name: /tightness or pain/i })
    const anxious = screen.getByRole('button', { name: /anxious or overwhelmed/i })
    await userEvent.click(tightness)
    expect(tightness).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(anxious)
    expect(anxious).toHaveAttribute('aria-pressed', 'true')
    expect(tightness).toHaveAttribute('aria-pressed', 'false')
  })

  it('Continue with tightness_or_pain dispatches branch and routes to session_intake', async () => {
    let capturedScreen = ''
    let capturedEntry: unknown = 'INITIAL'
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('session_intake')
      expect(capturedEntry).toBe('tightness_or_pain')
    })
  })

  it('Continue with anxious_or_overwhelmed dispatches branch and routes to session_intake', async () => {
    let capturedScreen = ''
    let capturedEntry: unknown = 'INITIAL'
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /anxious or overwhelmed/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('session_intake')
      expect(capturedEntry).toBe('anxious_or_overwhelmed')
    })
  })

  it('Back button navigates to home', async () => {
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    await waitFor(() => expect(capturedScreen).toBe('home'))
  })
})
