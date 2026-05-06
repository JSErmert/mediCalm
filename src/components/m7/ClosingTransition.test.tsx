// src/components/m7/ClosingTransition.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClosingTransition } from './ClosingTransition'

describe('ClosingTransition — 5s completion narration', () => {
  it('renders the template copy', () => {
    render(<ClosingTransition copy="Session complete." subtitle={undefined} onComplete={() => {}} />)
    expect(screen.getByText(/session complete/i)).toBeInTheDocument()
  })

  it('invokes onComplete after 5 seconds', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ClosingTransition copy="Session complete." subtitle={undefined} onComplete={onComplete} />)
    vi.advanceTimersByTime(5000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
