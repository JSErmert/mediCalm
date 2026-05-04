import { createContext, useContext } from 'react'
import type { AppSettings, PainInputState, RuntimeSession, SafetyAssessment } from '../types'
import type { HariSessionIntake, InterventionPackage, StateInterpretationResult, BreathPrescription, IntakeBranch } from '../types/hari'

/**
 * AppScreen — all screens the app can display.
 * M4 adds: session_validation, session_intake, hari_safety_gate
 * M6.2 adds: state_selection, sad_safety, support_resources
 */
export type AppScreen =
  | 'home'
  | 'pain_input'             // DEPRECATED (M4.8.1) — unreachable in M4 production flow; retained for AppContext.test.tsx
  | 'session_setup'
  | 'guided_session'
  | 'safety_stop'
  | 'rd_review'
  | 'session_validation'   // M4.1 §18 — validate previous session before starting new
  | 'session_intake'       // M4.2 MVP — HARI 5-field intake
  | 'hari_safety_gate'     // C4 — pre-engine safety eligibility gate
  | 'body_context'         // M4.7.1 — user-managed persistent Body Context
  | 'state_selection'      // M6.1 — M6 state-aware entry point
  | 'sad_safety'           // M6.1.1 — SAD pre-intake safety gate
  | 'support_resources'    // M6.1.1 — escalation exit support references
  // 'm6_guided_session' retired in M6.8.4 — all sessions route through 'guided_session'

export interface AppState {
  activeScreen: AppScreen
  /** Set when the user submits pain input. Consumed by the session engine. */
  pendingPainInput: PainInputState | null
  /** Set when resolveSession returns a session. Consumed by GuidedSessionScreen. */
  activeSession: RuntimeSession | null
  /** Set when resolveSession returns a safety_stop. Consumed by SafetyStopScreen. */
  safetyAssessment: SafetyAssessment | null
  settings: AppSettings
  /** M4.2 MVP: HARI intake collected from SessionIntakeScreen */
  hariIntake: HariSessionIntake | null
  /** M4.5: Resolved intervention package — used to augment session framing */
  interventionPackage: InterventionPackage | null
  /** M4.5: Pre-session framing text for the session setup screen */
  sessionFraming: string | null
  /**
   * PT Clinical Pass 2: Selected intake branch from StateSelectionScreen.
   * Single value (not array) — branched intent replaces multi-state selection.
   * Cleared on session save, escalation exit, or home reset.
   */
  pendingStateEntry: IntakeBranch | null
  /**
   * M6.4: Output of interpretStates — computed in SessionIntakeScreen on submit.
   * Feeds breath pattern, effort level, and session bias into session configuration.
   * Cleared on CLEAR_SESSION.
   */
  stateInterpretationResult: StateInterpretationResult | null
  /**
   * M6.8.3: Pre-built BreathPrescription for Continue What Helped flow.
   * When set, GuidedSessionScreen uses it as sessionConfig, bypassing buildDeliveryConfig.
   * Cleared on CLEAR_SESSION.
   */
  pendingBreathPrescription: BreathPrescription | null
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: AppScreen }
  | { type: 'SET_PAIN_INPUT'; input: PainInputState }
  | { type: 'CLEAR_PAIN_INPUT' }
  | { type: 'SET_ACTIVE_SESSION'; session: RuntimeSession }
  | { type: 'SET_SAFETY_STOP'; assessment: SafetyAssessment }
  | { type: 'CLEAR_SESSION' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'SET_HARI_INTAKE'; intake: HariSessionIntake }
  | { type: 'CLEAR_HARI_INTAKE' }
  | { type: 'SET_INTERVENTION_PACKAGE'; pkg: InterventionPackage; framing: string }
  | { type: 'SET_STATE_ENTRY'; entry: IntakeBranch }              // PT pass 2
  | { type: 'CLEAR_STATE_ENTRY' }                                 // M6.2
  | { type: 'SET_STATE_INTERPRETATION'; result: StateInterpretationResult } // M6.4
  | { type: 'SET_BREATH_PRESCRIPTION'; prescription: BreathPrescription }  // M6.8.3

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
