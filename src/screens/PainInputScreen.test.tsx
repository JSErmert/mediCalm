import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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

// Helper: complete step 1 (select neck, continue to step 2)
async function completeStep1() {
  await userEvent.click(screen.getByRole('button', { name: /front\s*neck/i }))
  await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
}

// Helper: complete step 2 (select burning, continue to step 3)
async function completeStep2() {
  await userEvent.click(screen.getByRole('button', { name: /^burning$/i }))
  await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
}

describe('PainInputScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renders the pain level slider', () => {
    renderWithProvider()
    expect(screen.getByRole('slider', { name: /pain level/i })).toBeInTheDocument()
  })

  it('renders the region selector on step 1', () => {
    renderWithProvider()
    expect(screen.getByText(/where do you feel it/i)).toBeInTheDocument()
  })

  it('renders a Back to home button on step 1', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument()
  })

  it('Continue button is disabled when no region is selected', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeDisabled()
  })

  it('Continue button is enabled when a region is selected', async () => {
    renderWithProvider()
    await userEvent.click(screen.getByRole('button', { name: /front\s*neck/i }))
    expect(screen.getByRole('button', { name: /^continue$/i })).not.toBeDisabled()
  })

  it('renders the symptom step after completing step 1', async () => {
    renderWithProvider()
    await completeStep1()
    expect(screen.getByRole('heading', { name: /what does it feel like/i })).toBeInTheDocument()
  })

  it('Continue button is disabled on step 2 when no symptom selected', async () => {
    renderWithProvider()
    await completeStep1()
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeDisabled()
  })

  it('renders the context and trigger step after completing steps 1 and 2', async () => {
    renderWithProvider()
    await completeStep1()
    await completeStep2()
    expect(screen.getByRole('heading', { name: /current state and context/i })).toBeInTheDocument()
  })

  it('Begin session button is disabled until position AND trigger are both selected', async () => {
    renderWithProvider()
    await completeStep1()
    await completeStep2()
    // No position or trigger selected yet
    expect(screen.getByRole('button', { name: /begin session/i })).toBeDisabled()
  })

  it('trigger tags are single-select: selecting same tag deselects it', async () => {
    renderWithProvider()
    await completeStep1()
    await completeStep2()
    // "sitting" exists in both position and trigger groups — scope to Activity context group
    const activityGroup = screen.getByRole('group', { name: /activity context/i })
    const sittingBtn = within(activityGroup).getByRole('button', { name: /^sitting$/i })
    await userEvent.click(sittingBtn)
    expect(sittingBtn).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(sittingBtn)
    expect(sittingBtn).toHaveAttribute('aria-pressed', 'false')
  })
})
