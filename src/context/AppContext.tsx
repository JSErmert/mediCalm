import { createContext, useContext } from 'react'
import type { AppSettings, PainInputState, RuntimeSession, SafetyAssessment } from '../types'

/**
 * AppScreen — all screens the app can display in v1.
 * 'session_placeholder' removed in M2; replaced with 'guided_session' and 'safety_stop'.
 */
export type AppScreen = 'home' | 'pain_input' | 'guided_session' | 'safety_stop'

export interface AppState {
  activeScreen: AppScreen
  /** Set when the user submits pain input. Consumed by the session engine. */
  pendingPainInput: PainInputState | null
  /** Set when resolveSession returns a session. Consumed by GuidedSessionScreen. */
  activeSession: RuntimeSession | null
  /** Set when resolveSession returns a safety_stop. Consumed by SafetyStopScreen. */
  safetyAssessment: SafetyAssessment | null
  settings: AppSettings
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: AppScreen }
  | { type: 'SET_PAIN_INPUT'; input: PainInputState }
  | { type: 'CLEAR_PAIN_INPUT' }
  | { type: 'SET_ACTIVE_SESSION'; session: RuntimeSession }
  | { type: 'SET_SAFETY_STOP'; assessment: SafetyAssessment }
  | { type: 'CLEAR_SESSION' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }

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
