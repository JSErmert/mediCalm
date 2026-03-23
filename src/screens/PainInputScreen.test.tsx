import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppProvider'
import { PainInputScreen } from './PainInputScreen'

function renderWithProvider() {
  return render(
    <AppProvider>
      <PainInputScreen />
    </AppProvider>
  )
}

describe('PainInputScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the pain level slider', () => {
    renderWithProvider()
    expect(screen.getByRole('slider', { name: /pain level/i })).toBeInTheDocument()
  })

  it('renders the region selector', () => {
    renderWithProvider()
    expect(screen.getByText(/where do you feel it/i)).toBeInTheDocument()
  })

  it('renders the symptom selector', () => {
    renderWithProvider()
    expect(screen.getByText(/what does it feel like/i)).toBeInTheDocument()
  })

  it('renders the context (trigger) selector', () => {
    renderWithProvider()
    expect(screen.getByText(/context/i)).toBeInTheDocument()
  })

  it('Begin session button is disabled when no region is selected', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /begin session/i })).toBeDisabled()
  })

  it('Begin session button is disabled when region selected but no symptom', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /front\s*neck/i }))
    expect(screen.getByRole('button', { name: /begin session/i })).toBeDisabled()
  })

  it('Begin session button is enabled when region AND symptom are selected', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /front\s*neck/i }))
    await userEvent.click(screen.getByRole('button', { name: /burning/i }))
    expect(screen.getByRole('button', { name: /begin session/i })).not.toBeDisabled()
  })

  it('shows validation message when inputs are incomplete', () => {
    renderWithProvider()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders a Back to home button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument()
  })

  it('trigger tags are single-select: selecting same tag deselects it', async () => {
    renderWithProvider()
    const sittingBtn = screen.getByRole('button', { name: /sitting/i })
    await userEvent.click(sittingBtn)
    expect(sittingBtn).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(sittingBtn)
    expect(sittingBtn).toHaveAttribute('aria-pressed', 'false')
  })
})
