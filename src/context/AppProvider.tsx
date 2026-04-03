import { useReducer, type ReactNode } from 'react'
import { AppContext, type AppState, type AppAction } from './AppContext'
import { loadSettings } from '../storage/settings'

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, activeScreen: action.screen }
    case 'SET_PAIN_INPUT':
      return { ...state, pendingPainInput: action.input }
    case 'CLEAR_PAIN_INPUT':
      return { ...state, pendingPainInput: null }
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.session }
    case 'SET_SAFETY_STOP':
      return { ...state, safetyAssessment: action.assessment }
    case 'CLEAR_SESSION':
      return {
        ...state,
        activeSession: null,
        safetyAssessment: null,
        pendingPainInput: null,
        hariIntake: null,
        interventionPackage: null,
        sessionFraming: null,
        pendingStateEntry: null,
      }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }
    case 'SET_HARI_INTAKE':
      return { ...state, hariIntake: action.intake }
    case 'CLEAR_HARI_INTAKE':
      return { ...state, hariIntake: null, interventionPackage: null, sessionFraming: null }
    case 'SET_INTERVENTION_PACKAGE':
      return { ...state, interventionPackage: action.pkg, sessionFraming: action.framing }
    case 'SET_STATE_ENTRY':
      return { ...state, pendingStateEntry: action.entry }
    case 'CLEAR_STATE_ENTRY':
      return { ...state, pendingStateEntry: null }
  }
}

function getInitialState(): AppState {
  return {
    activeScreen: 'home',
    pendingPainInput: null,
    activeSession: null,
    safetyAssessment: null,
    settings: loadSettings(),
    hariIntake: null,
    interventionPackage: null,
    sessionFraming: null,
    pendingStateEntry: null,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
