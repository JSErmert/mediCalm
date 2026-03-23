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

  it('reaches SessionPlaceholder after completing pain input', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    // Select required inputs
    await userEvent.click(screen.getByRole('button', { name: /front\s*neck/i }))
    await userEvent.click(screen.getByRole('button', { name: /burning/i }))
    await userEvent.click(screen.getByRole('button', { name: /begin session/i }))
    expect(screen.getByText(/milestone 1 complete/i)).toBeInTheDocument()
  })
})
