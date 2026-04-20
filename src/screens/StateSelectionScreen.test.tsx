// src/screens/StateSelectionScreen.test.tsx
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

describe('StateSelectionScreen', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('renders the heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /what are you feeling right now/i })
    ).toBeInTheDocument()
  })

  it('renders the wordmark', () => {
    renderWithProvider()
    expect(screen.getByText('mediCalm')).toBeInTheDocument()
  })

  it('renders all 5 primary chips', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /^pain$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^anxious$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^exhausted$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^tight$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^heavy$/i })).toBeInTheDocument()
  })

  it('does not expose subcategory chips to assistive tech when collapsed', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^angry$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^overwhelmed$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^sad$/i })).not.toBeInTheDocument()
  })

  it('Continue button is absent before any selection', () => {
    renderWithProvider()
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('Continue button appears after selecting a primary chip', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /^pain$/i }))
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
  })

  it('Continue button disappears if selection is cleared by deselecting', async () => {
    renderWithProvider()
    const pain = screen.getByRole('button', { name: /^pain$/i })
    await userEvent.click(pain)
    await userEvent.click(pain)
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('tapping Heavy reveals subcategory chips via aria-hidden removal', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /^heavy$/i }))
    expect(screen.getByRole('button', { name: /^angry$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^overwhelmed$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sad$/i })).toBeInTheDocument()
  })

  it('tapping Heavy twice collapses subcategories again', async () => {
    renderWithProvider()
    const heavy = screen.getByRole('button', { name: /^heavy$/i })
    await userEvent.click(heavy)
    await userEvent.click(heavy)
    expect(screen.queryByRole('button', { name: /^angry$/i })).not.toBeInTheDocument()
  })

  it('collapsing Heavy clears selected subcategories', async () => {
    renderWithProvider()
    const heavy = screen.getByRole('button', { name: /^heavy$/i })
    await userEvent.click(heavy)
    await userEvent.click(screen.getByRole('button', { name: /^angry$/i }))
    // Angry selected → Continue visible
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
    // Collapse Heavy
    await userEvent.click(heavy)
    // Continue gone because no selection remains
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
  })

  it('Continue without Sad navigates to session_intake', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /^pain$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => expect(capturedScreen).toBe('session_intake'))
  })

  it('Continue with Sad navigates to sad_safety', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <StateSelectionScreen />
      </AppProvider>
    )
    const heavy = screen.getByRole('button', { name: /^heavy$/i })
    await userEvent.click(heavy)
    await userEvent.click(screen.getByRole('button', { name: /^sad$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => expect(capturedScreen).toBe('sad_safety'))
  })

  it('Continue dispatches SET_STATE_ENTRY with selected states', async () => {
    let capturedEntry: string[] | null = null
    function StateCapture() {
      const { state } = useAppContext()
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <StateCapture />
        <StateSelectionScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /^pain$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^exhausted$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedEntry).not.toBeNull()
      expect(capturedEntry).toContain('pain')
      expect(capturedEntry).toContain('exhausted')
    })
  })
})
