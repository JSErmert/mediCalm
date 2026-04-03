import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Helper: navigate through StateSelectionScreen stub by selecting Pain.
// M6.2: Start now routes to StateSelectionScreen. Pain button → session_intake.
async function navigatePastStateSelection() {
  await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
  // Selects Pain (any valid state would work — Pain chosen as the most-tested path)
  await userEvent.click(screen.getByRole('button', { name: /select pain state/i }))
}

// Helper: fill all 5 HARI intake fields and submit.
// Navigates from session_intake → hari_safety_gate.
async function fillHariIntakeAndSubmit() {
  await userEvent.click(screen.getByRole('button', { name: /quick reset/i }))
  await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
  await userEvent.click(screen.getByRole('button', { name: /neck \/ upper region/i }))
  await userEvent.click(screen.getByRole('button', { name: /^low$/i }))
  await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
  await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
}

describe('App root', () => {
  beforeEach(() => localStorage.clear())

  it('renders HomeScreen on initial load', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /just breathe/i })
    ).toBeInTheDocument()
  })

  it('navigates to StateSelectionScreen when Start is clicked', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    expect(screen.getByRole('main', { name: /state selection/i })).toBeInTheDocument()
  })

  it('navigates back to HomeScreen when Back is clicked from StateSelection', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }))
    expect(
      screen.getByRole('heading', { name: /just breathe/i })
    ).toBeInTheDocument()
  })

  it('reaches SessionSetupScreen after completing HARI intake with safe input', async () => {
    render(<App />)
    await navigatePastStateSelection()
    await fillHariIntakeAndSubmit()
    // Safety gate: no concerns → CLEAR → session_setup
    await userEvent.click(screen.getByRole('button', { name: /no, none of these/i }))
    expect(screen.getByRole('main', { name: /session setup/i })).toBeInTheDocument()
  })

  it('routes to safety stop when coordination_change is selected', async () => {
    render(<App />)
    await navigatePastStateSelection()
    await fillHariIntakeAndSubmit()
    // Safety gate: yes → step 2 → coordination flag → STOP
    await userEvent.click(screen.getByRole('button', { name: /yes, at least one applies/i }))
    await userEvent.click(screen.getByRole('button', { name: /coordination trouble/i }))
    await userEvent.click(screen.getByRole('button', { name: /^confirm$/i }))
    expect(screen.getByRole('heading', { name: /not the right moment/i })).toBeInTheDocument()
  })
})
