import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Helper: navigate through StateSelectionScreen by selecting Tightness or pain then Continue.
// PT Pass 2: Single branch selection replaces multi-select.
async function navigatePastStateSelection() {
  await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
  await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
  await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
}

// Helper: fill all 5 required HARI intake fields and submit (severity has default 5).
// PT Pass 2 refined 2026-05-04: 6 fields total — irritability, sensitivity, location (≥1), position, length.
// Navigates from session_intake → hari_safety_gate.
async function fillHariIntakeAndSubmit() {
  await userEvent.click(screen.getByRole('button', { name: /comes on slowly, goes away quickly/i }))
  // Sensitivity is scoped to its own group to avoid colliding with the Location "Not sure" chip.
  const sensitivityGroup = screen.getByRole('group', { name: /flare sensitivity/i })
  await userEvent.click(within(sensitivityGroup).getByRole('button', { name: /^moderate$/i }))
  await userEvent.click(screen.getByRole('button', { name: /^lower back$/i }))
  await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
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

  it('walks the new branched intake flow from state_selection through hari_safety_gate', async () => {
    render(<App />)

    // Start at home
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    await waitFor(() => expect(screen.getByRole('main', { name: /state selection/i })).toBeInTheDocument())

    // Pick branch on StateSelectionScreen
    await userEvent.click(screen.getByRole('button', { name: /tightness or pain/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    // SessionIntakeScreen has "Irritability pattern" chip group
    await waitFor(() => expect(screen.getByRole('group', { name: /irritability pattern/i })).toBeInTheDocument())

    // Fill the 5 required fields on SessionIntakeScreen
    await userEvent.click(screen.getByRole('button', { name: /comes on slowly, goes away quickly/i }))
    const sensitivityGroup = screen.getByRole('group', { name: /flare sensitivity/i })
    await userEvent.click(within(sensitivityGroup).getByRole('button', { name: /^moderate$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^lower back$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^sitting$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^standard$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /before we begin/i })).toBeInTheDocument())
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
