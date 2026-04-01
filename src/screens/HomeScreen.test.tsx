import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { HomeScreen } from './HomeScreen'

function renderWithProvider() {
  return render(
    <AppProvider>
      <HomeScreen />
    </AppProvider>
  )
}

describe('HomeScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the primary headline', () => {
    renderWithProvider()
    expect(
      screen.getByRole('heading', { name: /just breathe/i })
    ).toBeInTheDocument()
  })

  it('renders the app wordmark', () => {
    renderWithProvider()
    expect(screen.getByText('mediCalm')).toBeInTheDocument()
  })

  it('renders a labelled Start session button', () => {
    renderWithProvider()
    expect(
      screen.getByRole('button', { name: /start a new guided session/i })
    ).toBeInTheDocument()
  })

  it('shows the empty-state message when no history exists', () => {
    renderWithProvider()
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument()
  })

  it('renders the history section label', () => {
    renderWithProvider()
    expect(screen.getByRole('region', { name: /session history/i })).toBeInTheDocument()
  })

  it('Start button is clickable without error', async () => {
    renderWithProvider()
    const btn = screen.getByRole('button', { name: /start a new guided session/i })
    await userEvent.click(btn)
    // Navigation is handled by AppContext; this confirms no error is thrown
  })
})
