// src/components/m7/BetweenTransition.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BetweenTransition } from './BetweenTransition'

describe('BetweenTransition — 5s narrated transition', () => {
  it('renders the template copy', () => {
    render(<BetweenTransition copy="Easing into the next phase." subtitle={undefined} onComplete={() => {}} />)
    expect(screen.getByText(/easing into the next phase/i)).toBeInTheDocument()
  })

  it('invokes onComplete after 5 seconds', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<BetweenTransition copy="Easing into the next phase." subtitle={undefined} onComplete={onComplete} />)
    vi.advanceTimersByTime(4999)
    expect(onComplete).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
