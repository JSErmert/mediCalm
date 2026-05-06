// src/components/m7/IntroTransition.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IntroTransition } from './IntroTransition'

describe('IntroTransition — 5-count countdown', () => {
  it('renders the template copy', () => {
    render(<IntroTransition copy="Take a moment." subtitle={undefined} onComplete={() => {}} />)
    expect(screen.getByText(/take a moment/i)).toBeInTheDocument()
  })

  it('renders the subtitle when provided', () => {
    render(<IntroTransition copy="Take a moment." subtitle="Diaphragmatic onboarding" onComplete={() => {}} />)
    expect(screen.getByText(/diaphragmatic onboarding/i)).toBeInTheDocument()
  })

  it('counts down from 5 to 1 over 5 seconds, then invokes onComplete', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<IntroTransition copy="Take a moment." subtitle={undefined} onComplete={onComplete} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    vi.advanceTimersByTime(1000)
    expect(screen.getByText('4')).toBeInTheDocument()
    vi.advanceTimersByTime(3000)
    expect(screen.getByText('1')).toBeInTheDocument()
    vi.advanceTimersByTime(1000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
