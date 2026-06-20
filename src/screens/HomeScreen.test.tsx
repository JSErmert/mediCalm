import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { HomeScreen } from './HomeScreen'
import { useAppContext } from '../context/AppContext'

vi.mock('../engine/groundedMessages/selectTip', () => ({
  selectPreSessionTip: () => ({
    message_id: 'demo',
    text: 'Slowing your exhale helps your nervous system settle.',
    selectors: { symptom: ['tightness'] },
    citation: {
      pmid: '33117119',
      source_link: 'https://pubmed.ncbi.nlm.nih.gov/33117119/',
      exact_figure: 'f',
      figure_units: 'u',
    },
    display_quote: 'Slow breathing increased HRV.',
    authored_by: 'test',
    authored_at: '2026-06-19T00:00:00.000Z',
    review_status: 'pt_advisor_passed',
  }),
}))

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

  it('Start button navigates to state_selection', async () => {
    let capturedScreen = ''
    function ScreenCapture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <ScreenCapture />
        <HomeScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    await waitFor(() => expect(capturedScreen).toBe('state_selection'))
  })

  it('renders revised hero copy with PT-approved terminology', () => {
    renderWithProvider()
    expect(screen.getByText(/ribcage compression/i)).toBeInTheDocument()
    expect(screen.getByText(/deviated breathing mechanics/i)).toBeInTheDocument()
    expect(screen.getByText(/neck, shoulder, and jaw tension/i)).toBeInTheDocument()
  })

  it('does not contain retired terminology in hero', () => {
    renderWithProvider()
    expect(screen.queryByText(/rib restriction/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/shallow breathing/i)).not.toBeInTheDocument()
  })

  it('renders the crisis support affordance', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /need crisis support/i })).toBeInTheDocument()
  })

  it('shows a grounded pre-session tip when the selection function returns one', async () => {
    renderWithProvider()
    expect(
      await screen.findByText('Slowing your exhale helps your nervous system settle.')
    ).toBeInTheDocument()
  })

  it('crisis support affordance navigates to sad_safety', async () => {
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <HomeScreen />
      </AppProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /need crisis support/i }))
    await waitFor(() => expect(capturedScreen).toBe('sad_safety'))
  })
})
