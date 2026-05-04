import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { SessionIntakeScreen } from './SessionIntakeScreen'
import { useAppContext } from '../context/AppContext'
import type { IntakeBranch } from '../types/hari'

function Setup({ branch }: { branch: IntakeBranch }) {
  const { dispatch, state } = useAppContext()
  if (state.pendingStateEntry !== branch) {
    dispatch({ type: 'SET_STATE_ENTRY', entry: branch })
  }
  return null
}

function renderWithBranch(branch: IntakeBranch) {
  return render(
    <AppProvider>
      <Setup branch={branch} />
      <SessionIntakeScreen />
    </AppProvider>
  )
}

describe('SessionIntakeScreen — PT Clinical Pass 2', () => {
  beforeEach(() => localStorage.clear())

  it('renders branch-aware severity copy for tightness_or_pain', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(
        screen.getByText(/how severe is your tightness or pain right now/i)
      ).toBeInTheDocument()
    })
  })

  it('renders branch-aware severity copy for anxious_or_overwhelmed', async () => {
    renderWithBranch('anxious_or_overwhelmed')
    await waitFor(() => {
      expect(
        screen.getByText(/how intense is it right now/i)
      ).toBeInTheDocument()
    })
  })

  it('renders the irritability prompt and 3 options', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.getByText(/how would you describe it/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comes on slowly, goes away quickly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comes on and goes away about the same/i })).toBeInTheDocument()
  })

  it('renders all 5 position options', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.getByText(/where are you right now/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^sitting$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^standing$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /driving \/ in vehicle/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lying down/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /after strain or overuse/i })).toBeInTheDocument()
  })

  it('renders 3 length options matching PT spec', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.getByText(/how long feels right today/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^short$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^standard$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^longer$/i })).toBeInTheDocument()
  })

  it('does not render retired field labels', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.queryByText(/what is this session for/i)).not.toBeInTheDocument()
    })
    expect(screen.queryByText(/what best describes today's focus/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/how sensitive does your body feel/i)).not.toBeInTheDocument()
  })

  it('Continue button is disabled until irritability, position, and length are set', async () => {
    renderWithBranch('tightness_or_pain')
    let continueBtn: HTMLElement
    await waitFor(() => {
      continueBtn = screen.getByRole('button', { name: /^continue$/i })
      expect(continueBtn).toBeDisabled()
    })
    await userEvent.click(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i }))
    expect(continueBtn!).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    expect(continueBtn!).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
    expect(continueBtn!).toBeEnabled()
  })

  it('Continue dispatches HARI intake with branch + irritability and navigates to safety gate', async () => {
    let capturedIntake: any = null
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedIntake = state.hariIntake
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <Setup branch="tightness_or_pain" />
        <SessionIntakeScreen />
      </AppProvider>
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i }))
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('hari_safety_gate')
      expect(capturedIntake).toMatchObject({
        branch: 'tightness_or_pain',
        irritability: 'fast_onset_slow_resolution',
        current_context: 'sitting',
        session_length_preference: 'standard',
        flare_sensitivity: 'high',  // derived via translation
      })
    })
  })

  it('Back via breadcrumb returns to state_selection', async () => {
    let capturedScreen = ''
    function Capture() {
      const { state } = useAppContext()
      capturedScreen = state.activeScreen
      return null
    }
    render(
      <AppProvider>
        <Capture />
        <Setup branch="tightness_or_pain" />
        <SessionIntakeScreen />
      </AppProvider>
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tightness or pain/i })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    await waitFor(() => expect(capturedScreen).toBe('state_selection'))
  })
})
