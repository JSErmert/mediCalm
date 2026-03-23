import { createContext, useContext } from 'react'
import type { AppSettings, PainInputState } from '../types'

/**
 * AppScreen — all screens the app can display in v1.
 * 'session_placeholder' is removed in M2 when the session engine is wired.
 */
export type AppScreen = 'home' | 'pain_input' | 'session_placeholder'

export interface AppState {
  activeScreen: AppScreen
  /** Set when the user submits pain input. Consumed by the session engine (M2). */
  pendingPainInput: PainInputState | null
  settings: AppSettings
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: AppScreen }
  | { type: 'SET_PAIN_INPUT'; input: PainInputState }
  | { type: 'CLEAR_PAIN_INPUT' }
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
