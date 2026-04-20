// src/screens/SADSafetyScreen.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { SADSafetyScreen } from './SADSafetyScreen'
import { useAppContext } from '../context/AppContext'

function renderWithProvider() {
  return render(
    <AppProvider>
      <SADSafetyScreen />
    </AppProvider>
  )
}

describe('SADSafetyScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /before we continue/i })
    ).toBeInTheDocument()
  })

  it('renders the safety body copy', () => {
    renderWithProvider()
    expect(screen.getByText(/persistently low/i)).toBeInTheDocument()
  })

  it('renders No and Yes action buttons', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /no, continue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^yes$/i })).toBeInTheDocument()
  })

  it('renders a Back button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('"No, continue" navigates to session_intake', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <SADSafetyScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /no, continue/i }))
    await waitFor(() => expect(capturedScreen).toBe('session_intake'))
  })

  it('"Yes" dispatches CLEAR_STATE_ENTRY and navigates to support_resources', async () => {
    let capturedScreen = ''
    let capturedEntry: unknown = 'INITIAL'
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      capturedEntry = state.pendingStateEntry
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <SADSafetyScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /^yes$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('support_resources')
      expect(capturedEntry).toBeNull()
    })
  })

  it('Back button navigates to state_selection', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <SADSafetyScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    await waitFor(() => expect(capturedScreen).toBe('state_selection'))
  })
})
