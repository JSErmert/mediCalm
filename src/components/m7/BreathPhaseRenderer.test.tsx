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

  it('renders the phase closing cue', () => {
    render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
    expect(screen.getByText(/easing back/i)).toBeInTheDocument()
  })

  // Regression guard (smoke-test surfaced 2026-05-06): without a real breath
  // visualization, M7-routed sessions render the intro and closing transitions
  // but show nothing during the breath phase. Asserting the BreathingOrb
  // container is present catches the "minimal cue-text-only" implementation
  // before it can ship again.
  it('renders the BreathingOrb visualization (catches missing-orb regression)', () => {
    render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
    // BreathingOrb's outer container carries aria-label="Breathing: <phase>. Round X of Y."
    const orb = screen.getByLabelText(/^Breathing:/i)
    expect(orb).toBeInTheDocument()
    expect(orb.textContent).not.toBe('')
  })

  it('renders breath instruction text from BreathingOrb (entry / breathe state)', () => {
    render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
    // gentleLabels=true: entry phase shows "Settle"; subsequent inhale/exhale
    // phases show "Breathe in" / "Breathe out". Asserting one of these
    // instruction phrases proves the orb is actually wired up, not a stub.
    const container = screen.getByLabelText(/^Breathing:/i)
    expect(container.textContent).toMatch(/settle|breathe/i)
  })

  it('accepts protocolId as an optional prop without throwing', () => {
    render(
      <BreathPhaseRenderer
        phase={phase}
        onComplete={() => {}}
        protocolId="PROTO_REDUCED_EFFORT"
      />
    )
    expect(screen.getByLabelText(/^Breathing:/i)).toBeInTheDocument()
  })

  it('does not fire onComplete on initial render (regression guard)', () => {
    // Previous minimal implementation used setTimeout(onComplete, totalMs).
    // The current implementation delegates to BreathingOrb.onAllRoundsComplete,
    // which fires only after the orb completes its full lifecycle. onComplete
    // must not be invoked synchronously during mount.
    const onComplete = vi.fn()
    render(<BreathPhaseRenderer phase={phase} onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
