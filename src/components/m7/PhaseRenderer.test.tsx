// src/components/m7/PhaseRenderer.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import type { PTVariant } from '../../types/m7'

// Mock BreathPhaseRenderer so PhaseRenderer's state-machine logic can be
// tested independently of BreathingOrb's internal lifecycle (entry countdown,
// inter-phase pauses, etc., which are tested in BreathPhaseRenderer.test.tsx).
// The stub fires onComplete after a single 1s tick so fake timers can drive it
// deterministically. See `vi.advanceTimersByTime(1000)` below for the breath
// phase advance.
vi.mock('./BreathPhaseRenderer', () => ({
  BreathPhaseRenderer: ({ onComplete }: { onComplete: () => void }) => {
    setTimeout(onComplete, 1000)
    return <div role="region" aria-label="Breath phase (test stub)" />
  },
}))

import { PhaseRenderer } from './PhaseRenderer'

function variant(): PTVariant {
  return {
    variant_id: 'v', variant_version: '0.2.0',
    pathway_id: 'p', pathway_version: '0.2.0',
    conditioning: { irritability: 'symmetric', flare_sensitivity: 'moderate', baseline_intensity_band: 'moderate' },
    phases: [
      { type: 'transition', subtype: 'intro', template_id: 'standard_5_count', template_version: '1.0.0', duration_seconds: 5 },
      { type: 'breath', breath_family: 'calm_downregulate', num_cycles: 1, cue: { opening: 'Breath phase opening', closing: 'closing' } },
      { type: 'transition', subtype: 'closing', template_id: 'standard_completion', template_version: '1.0.0', duration_seconds: 5 },
    ],
    authored_by: 'x', authored_at: '2026-05-05T00:00:00.000Z',
    review_status: 'engineering_passed',
  }
}

describe('PhaseRenderer — multi-phase state machine', () => {
  it('starts on phase 0 (intro) and renders the intro', () => {
    render(<PhaseRenderer variant={variant()} onPhaseStart={() => {}} onPhaseEnd={() => {}} onSessionComplete={() => {}} />)
    expect(screen.getByLabelText('Session intro')).toBeInTheDocument()
  })

  it('advances through intro → breath → closing → onSessionComplete', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const onPhaseStart = vi.fn()
    const onPhaseEnd = vi.fn()
    render(<PhaseRenderer variant={variant()} onPhaseStart={onPhaseStart} onPhaseEnd={onPhaseEnd} onSessionComplete={onComplete} />)

    // intro 5s
    expect(onPhaseStart).toHaveBeenCalledWith(0, 'transition', 'intro')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(0)

    // breath phase: stub fires onComplete after 1s
    expect(onPhaseStart).toHaveBeenCalledWith(1, 'breath', undefined)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(1)

    // closing 5s
    expect(onPhaseStart).toHaveBeenCalledWith(2, 'transition', 'closing')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onPhaseEnd).toHaveBeenCalledWith(2)

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
