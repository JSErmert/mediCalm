// src/components/m7/BreathPhaseRenderer.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { BreathPhaseRenderer } from './BreathPhaseRenderer'
import styles from './BreathPhaseRenderer.module.css'
import type { BreathPhase } from '../../types/m7'
import type { BreathingCue } from '../../types/breathingCue'

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

    it('shows the first in-session cue at round 0 (Layer 3 rotation)', () => {
      const cues: BreathingCue[] = [
        { id: 'a', text: 'First cue', phase: 'in_session', core: true },
        { id: 'b', text: 'Second cue', phase: 'in_session', core: true },
      ]
      render(
        <BreathPhaseRenderer phase={phase} onComplete={() => {}} inSessionCues={cues} />,
      )
      expect(screen.getByText('First cue')).toBeInTheDocument()
      expect(screen.queryByText(/PMID/i)).not.toBeInTheDocument() // no citation UI mid-breath (INV-2)
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
          durationLabel="About 3 minutes"
        />
      )
      // Top-zone context
      expect(screen.getByText(/calm downregulation/i)).toBeInTheDocument()
      expect(screen.getByText(/about 3 minutes/i)).toBeInTheDocument()
      // Round counter
      expect(screen.getByLabelText(/^Round 1 of 4$/i)).toBeInTheDocument()
      // BreathingOrb (the visualization)
      expect(screen.getByLabelText(/^Breathing:/i)).toBeInTheDocument()
    })

    it('omits clinical context elements when their props are absent', () => {
      // Backward-compatible: existing callers / tests pass only phase + onComplete.
      // The renderer must not invent placeholder copy when context isn't supplied.
      render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
      // No sessionName / durationLabel / inSessionCues rendered.
      // (cue.opening / cue.closing from the phase struct still render — those
      // are part of the variant's authored content, not external context.)
      expect(screen.queryByText(/calm downregulation/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/about 3 minutes/i)).not.toBeInTheDocument()
    })
  })

  // Mode-parity regression guard (smoke-test surfaced 2026-05-06, third
  // iteration). The diff against main's GuidedSessionScreen breath-phase
  // render path identified six elements; these tests assert each is correctly
  // present-or-suppressed for both M6 and HARI/legacy modes.
  //
  // Diff items covered:
  //   1. Time progress bar — rendered iff m6ProgressFraction !== undefined
  //   2. gentleLabels — drives BreathingOrb entry copy ("Settle" vs "Prepare to begin")
  //   3. preStartDelay — delays start of entry countdown
  //   4. Round counter — suppressed iff m6ProgressFraction !== undefined
  //   5. orbKey — forwarded to BreathingOrb's React key (force-remount)
  //   6. orbRunning — gates the orb's mount (false → orb not in DOM)
  describe('mode parity with main GuidedSessionScreen breath render', () => {
    describe('M6 mode (sessionConfig truthy → m6ProgressFraction defined)', () => {
      it('[diff #1] renders the time progress bar with width tied to m6ProgressFraction', () => {
        const { container } = render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            m6ProgressFraction={0.42}
          />
        )
        const progress = container.getElementsByClassName(styles.timeProgress)[0]
        expect(progress).toBeTruthy()
        expect(progress.getAttribute('aria-hidden')).toBe('true')
        const bar = container.getElementsByClassName(styles.timeProgressBar)[0] as HTMLElement
        expect(bar).toBeTruthy()
        expect(bar.style.width).toBe('42%')
      })

      it('[diff #4] suppresses the mechanical round counter', () => {
        render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            m6ProgressFraction={0.5}
          />
        )
        // Round counter row's aria-label: `Round X of Y` (anchored).
        // BreathingOrb's container also has "Round X of Y" inside its aria-label,
        // but as part of a longer "Breathing: <phase>. Round X of Y." label —
        // anchoring with ^...$ excludes the orb's combined label.
        expect(screen.queryByLabelText(/^Round \d+ of \d+$/i)).not.toBeInTheDocument()
      })

      it('[diff #2] forwards gentleLabels=true so orb shows "Settle" in entry', () => {
        render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            gentleLabels={true}
          />
        )
        expect(screen.getByText(/^Settle$/)).toBeInTheDocument()
        expect(screen.queryByText(/Prepare to begin/i)).not.toBeInTheDocument()
      })

      it('[diff #3] forwards preStartDelay=1500 — orb still in entry at t=3500ms', () => {
        // With preStartDelay=0, the orb finishes the 3s entry countdown +
        // 350ms post-pause and transitions to inhale by t=3350ms. With
        // preStartDelay=1500, the entry interval doesn't begin until t=1500,
        // so at t=3500ms the orb is still in entry phase.
        vi.useFakeTimers()
        render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            preStartDelay={1500}
          />
        )
        act(() => { vi.advanceTimersByTime(3500) })
        expect(screen.getByLabelText(/^Breathing: entry\./i)).toBeInTheDocument()
        // Advance past 1500 + 3000 + 350 = 4850 → orb in inhale
        act(() => { vi.advanceTimersByTime(1500) })
        expect(screen.getByLabelText(/^Breathing: inhale\./i)).toBeInTheDocument()
        vi.useRealTimers()
      })
    })

    describe('HARI/legacy mode (sessionConfig falsy → m6ProgressFraction undefined)', () => {
      it('[diff #1] does NOT render the time progress bar', () => {
        const { container } = render(
          <BreathPhaseRenderer phase={phase} onComplete={() => {}} />
        )
        expect(container.getElementsByClassName(styles.timeProgress)[0]).toBeFalsy()
        expect(container.getElementsByClassName(styles.timeProgressBar)[0]).toBeFalsy()
      })

      it('[diff #4] renders the mechanical round counter (Round X of Y, RoundDots)', () => {
        const { container } = render(
          <BreathPhaseRenderer phase={phase} onComplete={() => {}} />
        )
        const counter = screen.getByLabelText(/^Round 1 of 4$/)
        expect(counter).toBeInTheDocument()
        expect(counter.textContent).toMatch(/1\s*\/\s*4/)
        // RoundDots is a sibling inside the progressRow
        expect(container.getElementsByClassName(styles.progressRow)[0]).toBeTruthy()
      })

      it('[diff #2] honors gentleLabels=false so orb shows "Prepare to begin" in entry', () => {
        render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            gentleLabels={false}
          />
        )
        expect(screen.getByText(/^Prepare to begin$/)).toBeInTheDocument()
        expect(screen.queryByText(/^Settle$/)).not.toBeInTheDocument()
      })

      it('[diff #3] preStartDelay=0 (default) — orb in inhale by t=3500ms', () => {
        vi.useFakeTimers()
        render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
        // Without preStartDelay: entry runs at t=0, finishes at t=3000, post-pause
        // 350ms → inhale by t=3350. So at t=3500 we're in inhale.
        act(() => { vi.advanceTimersByTime(3500) })
        expect(screen.getByLabelText(/^Breathing: inhale\./i)).toBeInTheDocument()
        vi.useRealTimers()
      })
    })

    describe('orb gate + remount key', () => {
      it('[diff #6] hides the orb when orbRunning=false', () => {
        render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            orbRunning={false}
          />
        )
        expect(screen.queryByLabelText(/^Breathing:/i)).not.toBeInTheDocument()
      })

      it('[diff #6] shows the orb when orbRunning=true (default)', () => {
        render(<BreathPhaseRenderer phase={phase} onComplete={() => {}} />)
        expect(screen.getByLabelText(/^Breathing:/i)).toBeInTheDocument()
      })

      it('[diff #5] forwarding orbKey forces a remount (entry countdown resets)', () => {
        // Verify by advancing past entry (so countdown decrements), then
        // changing orbKey — the orb's countdown should reset to ENTRY_SECONDS.
        vi.useFakeTimers()
        const { rerender } = render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            orbKey={0}
          />
        )
        // After 1.5s the entry countdown has ticked from 3 → 2 (interval at 1s).
        act(() => { vi.advanceTimersByTime(1500) })
        // Change key → new orb instance, fresh entry countdown
        rerender(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            orbKey={1}
          />
        )
        // Newly mounted orb is in entry phase (label includes "Breathing: entry.")
        expect(screen.getByLabelText(/^Breathing: entry\./i)).toBeInTheDocument()
        vi.useRealTimers()
      })
    })

    describe('full-render smoke equivalent (M6 mode, all elements together)', () => {
      it('renders sessionName + durationLabel + orb + time progress (round counter suppressed)', () => {
        const { container } = render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            sessionName="Calm Downregulation"
            durationLabel="About 3 minutes"
            gentleLabels={true}
            preStartDelay={1500}
            m6ProgressFraction={0.25}
            orbKey={0}
            orbRunning={true}
          />
        )
        // Top zone
        expect(screen.getByText(/calm downregulation/i)).toBeInTheDocument()
        expect(screen.getByText(/about 3 minutes/i)).toBeInTheDocument()
        // Orb
        expect(screen.getByLabelText(/^Breathing:/i)).toBeInTheDocument()
        // Time progress (rendered, round counter suppressed)
        expect(container.getElementsByClassName(styles.timeProgress)[0]).toBeTruthy()
        expect(screen.queryByLabelText(/^Round \d+ of \d+$/)).not.toBeInTheDocument()
        // M7-additive cue copy still rendered
        expect(screen.getByText(/settle into the breath/i)).toBeInTheDocument()
        expect(screen.getByText(/easing back/i)).toBeInTheDocument()
      })

      it('renders sessionName + durationLabel + orb + round counter (no time progress) — HARI/legacy mode', () => {
        const { container } = render(
          <BreathPhaseRenderer
            phase={phase}
            onComplete={() => {}}
            sessionName="HARI Session"
            durationLabel="About 2 minutes"
            gentleLabels={false}
            preStartDelay={0}
            // m6ProgressFraction intentionally undefined → HARI/legacy mode
            orbRunning={true}
          />
        )
        // Top zone
        expect(screen.getByText(/hari session/i)).toBeInTheDocument()
        expect(screen.getByText(/about 2 minutes/i)).toBeInTheDocument()
        // Orb
        expect(screen.getByLabelText(/^Breathing:/i)).toBeInTheDocument()
        // Round counter (rendered, time progress NOT rendered)
        expect(screen.getByLabelText(/^Round 1 of 4$/)).toBeInTheDocument()
        expect(container.getElementsByClassName(styles.timeProgress)[0]).toBeFalsy()
      })
    })
  })
})
