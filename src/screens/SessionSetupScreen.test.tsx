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

describe('SessionSetupScreen — position setup cue (Layer 3)', () => {
  beforeEach(() => localStorage.clear())

  it('shows the short lying-down cue for connected pattern, and the old long note is gone', async () => {
    renderSetup('tightness_or_pain', 'connected')
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.getByText(/try this lying down/i)).toBeInTheDocument()
    expect(screen.queryByText(/localized/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Position note')).not.toBeInTheDocument()
  })

  it('shows the short lying-down cue for single pattern', async () => {
    renderSetup('tightness_or_pain', 'single')
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.getByText(/try this lying down/i)).toBeInTheDocument()
  })

  it('shows the upright cue for widespread pattern (not lying down)', async () => {
    renderSetup('tightness_or_pain', 'widespread')
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.getByText(/sit tall with your back/i)).toBeInTheDocument()
    expect(screen.queryByText(/try this lying down/i)).not.toBeInTheDocument()
  })

  it('shows the upright cue for multifocal pattern', async () => {
    renderSetup('tightness_or_pain', 'multifocal')
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.getByText(/sit tall with your back/i)).toBeInTheDocument()
  })

  it('shows no position cue for diffuse_unspecified pattern', async () => {
    renderSetup('tightness_or_pain', 'diffuse_unspecified')
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.queryByText(/try this lying down/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/sit tall with your back/i)).not.toBeInTheDocument()
  })

  it('shows no position cue for anxious branch (no location pattern)', async () => {
    renderSetup('anxious_or_overwhelmed', undefined)
    await waitFor(() => screen.getByLabelText('Session setup'))
    expect(screen.queryByText(/try this lying down/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/sit tall with your back/i)).not.toBeInTheDocument()
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

// ── Grounded Guidance Layer 3: setup cues ────────────────────────────────────

describe('SessionSetupScreen — Layer 3 setup cues', () => {
  beforeEach(() => localStorage.clear())

  it('renders the diaphragmatic setup cue text', () => {
    renderSetup('tightness_or_pain', 'single')
    expect(screen.getByText(/only the lower hand rise/i)).toBeInTheDocument()
  })
})

// ── Grounded Guidance Layer 1: recommendation reveal ─────────────────────────

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
