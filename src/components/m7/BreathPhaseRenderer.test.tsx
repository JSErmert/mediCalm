// src/components/m7/BreathPhaseRenderer.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BreathPhaseRenderer } from './BreathPhaseRenderer'
import type { BreathPhase } from '../../types/m7'

const phase: BreathPhase = {
  type: 'breath',
  breath_family: 'calm_downregulate',
  num_cycles: 4,
  cue: { opening: 'Settle into the breath', closing: 'Easing back' },
}

describe('BreathPhaseRenderer', () => {
  it('renders the phase opening cue', () => {
    render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
    expect(screen.getByText(/settle into the breath/i)).toBeInTheDocument()
  })

  it('invokes onComplete after num_cycles × (inhale + exhale) seconds', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<BreathPhaseRenderer phase={phase} onComplete={onComplete} />)
    // calm_downregulate is 4/0/7 = 11s × 4 cycles = 44s
    vi.advanceTimersByTime(44_000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
