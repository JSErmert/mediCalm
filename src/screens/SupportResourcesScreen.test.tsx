// src/screens/SupportResourcesScreen.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { SupportResourcesScreen } from './SupportResourcesScreen'
import { useAppContext } from '../context/AppContext'

function renderWithProvider() {
  return render(
    <AppProvider>
      <SupportResourcesScreen />
    </AppProvider>
  )
}

describe('SupportResourcesScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the escalation exit heading', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /pause here for a moment/i })
    ).toBeInTheDocument()
  })

  it('renders the short-term regulation body copy', () => {
    renderWithProvider()
    expect(screen.getByText(/short-term regulation/i)).toBeInTheDocument()
  })

  it('renders the 988 crisis line reference', () => {
    renderWithProvider()
    expect(screen.getByText(/988/)).toBeInTheDocument()
  })

  it('renders the Support Resources heading', () => {
    renderWithProvider()
    expect(screen.getByText(/support resources/i)).toBeInTheDocument()
  })

  it('renders a Return Home button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /return home/i })).toBeInTheDocument()
  })

  it('Return Home dispatches CLEAR_STATE_ENTRY and navigates to home', async () => {
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
        <SupportResourcesScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /return home/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('home')
      expect(capturedEntry).toBeNull()
    })
  })
})
