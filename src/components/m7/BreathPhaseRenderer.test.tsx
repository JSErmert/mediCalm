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

  // Regression guard (smoke-test surfaced 2026-05-06, second iteration):
  // M7-routed sessions render the BreathingOrb correctly, but the surrounding
  // clinical context elements that legacy GuidedSessionScreen renders during
  // the breath phase were missing in M7's BreathPhaseRenderer. M7.2's locked
  // discipline says breath content within phases is unchanged from M7.1 —
  // so the legacy two-zone layout MUST render around the orb when M7 forwards
  // the appropriate context props.
  describe('clinical context wrapper (regression guard)', () => {
    it('renders sessionName when provided (top zone — protocol name)', () => {
      render(
        <BreathPhaseRenderer
          phase={phase}
          onComplete={() => {}}
          sessionName="Calm Downregulation"
        />
      )
      expect(screen.getByText(/calm downregulation/i)).toBeInTheDocument()
    })

    it('renders diaphragmaticCue when provided (top zone — opening prompt)', () => {
      render(
        <BreathPhaseRenderer
          phase={phase}
          onComplete={() => {}}
          diaphragmaticCue="Belly soft, breath low — let the diaphragm lead."
        />
      )
      expect(screen.getByText(/belly soft, breath low/i)).toBeInTheDocument()
    })

    it('renders durationLabel when provided (top zone — duration)', () => {
      render(
        <BreathPhaseRenderer
          phase={phase}
          onComplete={() => {}}
          durationLabel="About 3 minutes"
        />
      )
      expect(screen.getByText(/about 3 minutes/i)).toBeInTheDocument()
    })

    it('renders positionCue when provided (Scope A position note)', () => {
      render(
        <BreathPhaseRenderer
          phase={phase}
          onComplete={() => {}}
          positionCue="If you can, try this lying down — localized patterns respond well to gentle decompression."
        />
      )
      expect(
        screen.getByText(/try this lying down/i)
      ).toBeInTheDocument()
    })

    it('renders the round counter (Round X of Y) and total cycles', () => {
      // num_cycles = 4 in the test phase fixture; on initial render
      // completedRounds=0 so currentDisplayRound=1.
      render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
      const counter = screen.getByLabelText(/^Round 1 of 4$/i)
      expect(counter).toBeInTheDocument()
      expect(counter.textContent).toMatch(/1\s*\/\s*4/)
    })

    it('renders ALL clinical context elements together (smoke-equivalent)', () => {
      render(
        <BreathPhaseRenderer
          phase={phase}
          onComplete={() => {}}
          sessionName="Calm Downregulation"
          diaphragmaticCue="Belly soft, breath low."
          durationLabel="About 3 minutes"
          positionCue="If you can, try this lying down."
        />
      )
      // Top-zone context
      expect(screen.getByText(/calm downregulation/i)).toBeInTheDocument()
      expect(screen.getByText(/belly soft, breath low/i)).toBeInTheDocument()
      expect(screen.getByText(/about 3 minutes/i)).toBeInTheDocument()
      // Round counter
      expect(screen.getByLabelText(/^Round 1 of 4$/i)).toBeInTheDocument()
      // BreathingOrb (the visualization)
      expect(screen.getByLabelText(/^Breathing:/i)).toBeInTheDocument()
      // Position cue
      expect(screen.getByText(/try this lying down/i)).toBeInTheDocument()
    })

    it('omits clinical context elements when their props are absent', () => {
      // Backward-compatible: existing callers / tests pass only phase + onComplete.
      // The renderer must not invent placeholder copy when context isn't supplied.
      render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
      // No sessionName / diaphragmaticCue / durationLabel / positionCue rendered.
      // (cue.opening / cue.closing from the phase struct still render — those
      // are part of the variant's authored content, not external context.)
      expect(screen.queryByText(/calm downregulation/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/about 3 minutes/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/lying down/i)).not.toBeInTheDocument()
    })
  })
})
