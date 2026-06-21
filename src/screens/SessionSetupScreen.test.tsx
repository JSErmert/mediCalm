/**
 * SessionSetupScreen — Scope A position-hint render test (2026-05-05).
 * Authority: docs/superpowers/specs/2026-05-05-scope-a-pt-cues-design.md
 */
import { useEffect } from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AppProvider } from '../context/AppProvider'
import { AppContext, useAppContext } from '../context/AppContext'
import { SessionSetupScreen } from './SessionSetupScreen'
import type { HariSessionIntake, LocationPattern, IntakeBranch, StateInterpretationResult } from '../types/hari'
import type { RuntimeSession, PainInputState, SafetyAssessment } from '../types'

function painInput(): PainInputState {
  return {
    pain_level: 4,
    location_tags: [],
    symptom_tags: [],
  }
}

function safety(): SafetyAssessment {
  return {
    mode: 'DIRECT_SESSION_MODE',
    safety_tags: [],
    stop_reason: null,
  }
}

function activeSession(): RuntimeSession {
  return {
    session_id: 'sess-test',
    created_at: '2026-05-05T00:00:00.000Z',
    protocol_id: 'PROTO_REDUCED_EFFORT',
    protocol_name: 'Gentle Reset',
    goal: 'Ease tension and settle the system.',
    display_mode: 'breath_only',
    timing_profile: { inhale_seconds: 3, exhale_seconds: 6, rounds: 8 },
    cue_sequence: [],
    estimated_length_seconds: 240,
    status: 'completed',
    stop_conditions: [],
    allowed_follow_up: [],
    provenance_tags: [],
    pain_input: painInput(),
    safety_assessment: safety(),
  }
}

function hariIntake(
  branch: IntakeBranch,
  pattern: LocationPattern | undefined
): HariSessionIntake {
  return {
    branch,
    irritability: 'symmetric',
    baseline_intensity: 4,
    flare_sensitivity: 'moderate',
    location: [],
    location_pattern: pattern,
    current_context: 'sitting',
    session_length_preference: 'standard',
    session_intent: 'quick_reset',
    symptom_focus: 'spread_tension',
  }
}

function Harness({
  branch,
  pattern,
}: {
  branch: IntakeBranch
  pattern: LocationPattern | undefined
}) {
  const { state, dispatch } = useAppContext()
  useEffect(() => {
    if (!state.activeSession) dispatch({ type: 'SET_ACTIVE_SESSION', session: activeSession() })
    if (!state.hariIntake) dispatch({ type: 'SET_HARI_INTAKE', intake: hariIntake(branch, pattern) })
  }, [state.activeSession, state.hariIntake, branch, pattern, dispatch])
  if (!state.activeSession || !state.hariIntake) return null
  return <SessionSetupScreen />
}

function renderSetup(branch: IntakeBranch, pattern: LocationPattern | undefined) {
  return render(
    <AppProvider>
      <Harness branch={branch} pattern={pattern} />
    </AppProvider>
  )
}

describe('SessionSetupScreen — Scope A position hint', () => {
  beforeEach(() => localStorage.clear())

  it("renders lying-down hint when branch=tightness_or_pain & pattern=connected", async () => {
    renderSetup('tightness_or_pain', 'connected')
    const note = await waitFor(() => screen.getByLabelText('Position note'))
    expect(note.textContent).toMatch(/lying down/i)
    expect(note.textContent).toMatch(/localized/i)
  })

  it("renders lying-down hint when branch=tightness_or_pain & pattern=single", async () => {
    renderSetup('tightness_or_pain', 'single')
    const note = await waitFor(() => screen.getByLabelText('Position note'))
    expect(note.textContent).toMatch(/lying down/i)
  })

  it("renders upright-spine hint when branch=tightness_or_pain & pattern=widespread", async () => {
    renderSetup('tightness_or_pain', 'widespread')
    const note = await waitFor(() => screen.getByLabelText('Position note'))
    expect(note.textContent).toMatch(/sitting tall/i)
  })

  it("renders upright-spine hint when branch=tightness_or_pain & pattern=multifocal", async () => {
    renderSetup('tightness_or_pain', 'multifocal')
    const note = await waitFor(() => screen.getByLabelText('Position note'))
    expect(note.textContent).toMatch(/sitting tall/i)
  })

  it("does not render hint when branch=tightness_or_pain & pattern=diffuse_unspecified", async () => {
    renderSetup('tightness_or_pain', 'diffuse_unspecified')
    // Wait for the screen itself to render before asserting absence
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.queryByLabelText('Position note')).not.toBeInTheDocument()
  })

  it("does not render hint when branch=anxious_or_overwhelmed", async () => {
    renderSetup('anxious_or_overwhelmed', 'single')
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.queryByLabelText('Position note')).not.toBeInTheDocument()
  })
})

// ── Grounded Guidance Layer 1: recommendation reveal ─────────────────────────

function revealSession(): RuntimeSession {
  return {
    session_id: 's',
    created_at: '2026-06-21T00:00:00.000Z',
    protocol_id: 'PROTO_REDUCED_EFFORT',
    protocol_name: 'Gentle Breath',
    goal: 'Ease pressure',
    display_mode: 'breath_only',
    timing_profile: { inhale_seconds: 3, exhale_seconds: 6, rounds: 20 },
    cue_sequence: [],
    estimated_length_seconds: 240,
    status: 'completed',
    stop_conditions: [],
    allowed_follow_up: [],
    provenance_tags: [],
    pain_input: { pain_level: 4, location_tags: [], symptom_tags: ['aching'] },
    safety_assessment: { mode: 'DIRECT_SESSION_MODE', safety_tags: [], stop_reason: null },
  } as unknown as RuntimeSession
}

function renderRevealSetup(stateInterpretationResult: StateInterpretationResult | null) {
  const value = {
    state: {
      activeSession: revealSession(),
      stateInterpretationResult,
      hariIntake: null,
      pendingPainInput: null,
      safetyAssessment: null,
      settings: {},
      interventionPackage: null,
      sessionFraming: null,
      pendingStateEntry: null,
      pendingBreathPrescription: null,
      activeScreen: 'session_setup' as const,
    },
    dispatch: () => {},
  } as unknown as React.ContextType<typeof AppContext>
  return render(<AppContext.Provider value={value}><SessionSetupScreen /></AppContext.Provider>)
}

describe('SessionSetupScreen — grounded recommendation reveal', () => {
  beforeEach(() => localStorage.clear())

  it('does not crash and shows no reveal when there is no interpretation result', () => {
    renderRevealSetup(null)
    expect(screen.queryByText(/why this for you/i)).not.toBeInTheDocument()
  })

  it('shows the reveal when interpretation yields decompress goal', async () => {
    const result: StateInterpretationResult = {
      overload: false,
      primary: 'pain',
      breath: '3/5',
      effort: 'standard',
      bias: 'protect_decompress',
    }
    renderRevealSetup(result)
    await waitFor(() => expect(screen.getByText(/why this for you/i)).toBeInTheDocument())
  })
})
