import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App root', () => {
  beforeEach(() => localStorage.clear())

  it('renders HomeScreen on initial load', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /what level is your pain/i })
    ).toBeInTheDocument()
  })

  it('navigates to PainInputScreen when Start is clicked', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    expect(screen.getByRole('slider', { name: /pain level/i })).toBeInTheDocument()
  })

  it('navigates back to HomeScreen when Back is clicked', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }))
    expect(
      screen.getByRole('heading', { name: /what level is your pain/i })
    ).toBeInTheDocument()
  })

  it('reaches GuidedSessionScreen after completing pain input with safe input', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    // ribs + tightness → MECH_RIB_RESTRICTION → PROTO_RIB_EXPANSION_RESET
    await userEvent.click(screen.getByRole('button', { name: /^ribs$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^tightness$/i }))
    await userEvent.click(screen.getByRole('button', { name: /begin session/i }))
    // GuidedSessionScreen shows stop button
    expect(screen.getByRole('button', { name: /^stop session$/i })).toBeInTheDocument()
  })

  it('routes to SafetyStopScreen when coordination_change is selected', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    await userEvent.click(screen.getByRole('button', { name: /^ribs$/i }))
    await userEvent.click(screen.getByRole('button', { name: /coordination.change/i }))
    await userEvent.click(screen.getByRole('button', { name: /begin session/i }))
    expect(screen.getByText(/stop here\./i)).toBeInTheDocument()
  })
})
