import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
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

describe('SessionIntakeScreen — PT Clinical Pass 2 (refined 2026-05-04)', () => {
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

  it('renders the sensitivity prompt and 4 options', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.getByText(/how sensitive does your body feel right now/i)).toBeInTheDocument()
    })
    // Scope to the sensitivity chip group — Location group also contains a "Not sure" chip.
    const sensitivityGroup = screen.getByRole('group', { name: /flare sensitivity/i })
    expect(within(sensitivityGroup).getByRole('button', { name: /^low$/i })).toBeInTheDocument()
    expect(within(sensitivityGroup).getByRole('button', { name: /^moderate$/i })).toBeInTheDocument()
    expect(within(sensitivityGroup).getByRole('button', { name: /^high$/i })).toBeInTheDocument()
    expect(within(sensitivityGroup).getByRole('button', { name: /^not sure$/i })).toBeInTheDocument()
  })

  it('renders the location prompt and the body picker', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.getByText(/where in your body is it focused/i)).toBeInTheDocument()
    })
    // Two SVGs (front + back) inside the picker
    const svgs = document.querySelectorAll('svg[aria-label*="body picker" i]')
    expect(svgs.length).toBe(2)
  })

  it('allows selecting a body region via SVG group click', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.getByText(/where in your body is it focused/i)).toBeInTheDocument()
    })
    // ankle_foot_left has only front+back paths — single click auto-tags region (no drawer)
    const ankleGroup = document.querySelector('g[data-region="ankle_foot_left"]') as Element
    expect(ankleGroup).toBeTruthy()
    await userEvent.click(ankleGroup)
    // The chip below the picker should now display the region name
    expect(screen.getByText(/left ankle \/ foot/i)).toBeInTheDocument()
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

  it('renders length prompt with new label and 3 options (Short/Standard/Long)', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.getByText(/what session length feels right today/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^short$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^standard$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^long$/i })).toBeInTheDocument()
    // Old wording must be gone
    expect(screen.queryByText(/how long feels right today/i)).not.toBeInTheDocument()
  })

  it('does not render retired field labels', async () => {
    renderWithBranch('tightness_or_pain')
    await waitFor(() => {
      expect(screen.queryByText(/what is this session for/i)).not.toBeInTheDocument()
    })
    expect(screen.queryByText(/what best describes today's focus/i)).not.toBeInTheDocument()
  })

  it('Continue is disabled until all required fields are set', async () => {
    renderWithBranch('tightness_or_pain')
    let continueBtn: HTMLElement
    await waitFor(() => {
      continueBtn = screen.getByRole('button', { name: /^continue$/i })
      expect(continueBtn).toBeDisabled()
    })
    await userEvent.click(screen.getByRole('button', { name: /comes on quickly, goes away slowly/i }))
    expect(continueBtn!).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /^moderate$/i })) // sensitivity
    expect(continueBtn!).toBeDisabled()
    const ankleGroup = document.querySelector('g[data-region="ankle_foot_left"]') as Element
    await userEvent.click(ankleGroup)
    expect(continueBtn!).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    expect(continueBtn!).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
    expect(continueBtn!).toBeEnabled()
  })

  it('Continue dispatches HARI intake with explicit sensitivity, location[], and new length literal', async () => {
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
    // Pick sensitivity that does NOT match irritability's old derivation (fast→high) so we
    // can prove the explicit field overrides the previously-derived value.
    await userEvent.click(screen.getByRole('button', { name: /^low$/i }))
    // Pick two regions via the body picker:
    //  - ankle_foot_left auto-tags (single front+back pair)
    //  - shoulder_left opens drawer; pick one muscle then close
    await userEvent.click(document.querySelector('g[data-region="ankle_foot_left"]') as Element)
    await userEvent.click(document.querySelector('g[data-region="shoulder_left"]') as Element)
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(front\)/i }))
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^long$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => {
      expect(capturedScreen).toBe('hari_safety_gate')
      expect(capturedIntake).toMatchObject({
        branch: 'tightness_or_pain',
        irritability: 'fast_onset_slow_resolution',
        flare_sensitivity: 'low',          // explicit user input — NOT 'high' derived from irritability
        current_context: 'sitting',
        session_length_preference: 'long',
      })
      expect(capturedIntake.location).toEqual(expect.arrayContaining(['ankle_foot_left', 'shoulder_left']))
      expect(capturedIntake.location_muscles).toEqual(['shoulder_front_left'])
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
