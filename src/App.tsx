/**
 * App — root component and screen router.
 * Authority: Guided Session UI Spec (doc 05) § v1 Session Flow
 *
 * Uses Framer Motion AnimatePresence for crossfade transitions (300ms, ease).
 * Screen routing is driven by AppContext state machine.
 *
 * M6.2: adds state_selection, sad_safety, support_resources routing.
 */
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppProvider'
import { useAppContext } from './context/AppContext'
import { ScreenTransition } from './components/ScreenTransition'
import { HomeScreen } from './screens/HomeScreen'
import { PainInputScreen } from './screens/PainInputScreen'
import { SessionSetupScreen } from './screens/SessionSetupScreen'
import { GuidedSessionScreen } from './screens/GuidedSessionScreen'
import { SafetyStopScreen } from './screens/SafetyStopScreen'
import { RDReviewScreen } from './screens/RDReviewScreen'
import { SessionValidationScreen } from './screens/SessionValidationScreen'
import { SessionIntakeScreen } from './screens/SessionIntakeScreen'
import { HariSafetyGateScreen } from './screens/HariSafetyGateScreen'
import { BodyContextScreen } from './screens/BodyContextScreen'
import { StateSelectionScreen } from './screens/StateSelectionScreen'
import { SADSafetyScreen } from './screens/SADSafetyScreen'
import { SupportResourcesScreen } from './screens/SupportResourcesScreen'
import styles from './App.module.css'

function ScreenRouter() {
  const { state } = useAppContext()
  const { activeScreen } = state

  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeScreen === 'home' && (
        <ScreenTransition screenKey="home">
          <HomeScreen />
        </ScreenTransition>
      )}
      {/* DEPRECATED (M4.8.1) — pain_input unreachable in M4 production flow */}
      {activeScreen === 'pain_input' && (
        <ScreenTransition screenKey="pain_input">
          <PainInputScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'session_setup' && (
        <ScreenTransition screenKey="session_setup">
          <SessionSetupScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'guided_session' && (
        <ScreenTransition screenKey="guided_session">
          <GuidedSessionScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'safety_stop' && (
        <ScreenTransition screenKey="safety_stop">
          <SafetyStopScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'rd_review' && (
        <ScreenTransition screenKey="rd_review">
          <RDReviewScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'session_validation' && (
        <ScreenTransition screenKey="session_validation">
          <SessionValidationScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'session_intake' && (
        <ScreenTransition screenKey="session_intake">
          <SessionIntakeScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'hari_safety_gate' && (
        <ScreenTransition screenKey="hari_safety_gate">
          <HariSafetyGateScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'body_context' && (
        <ScreenTransition screenKey="body_context">
          <BodyContextScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'state_selection' && (
        <ScreenTransition screenKey="state_selection">
          <StateSelectionScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'sad_safety' && (
        <ScreenTransition screenKey="sad_safety">
          <SADSafetyScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'support_resources' && (
        <ScreenTransition screenKey="support_resources">
          <SupportResourcesScreen />
        </ScreenTransition>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <div className={styles.appRoot}>
        {/* D4-B4 Deep Current background — persistent across all screen transitions */}
        <div className={styles.bgField} aria-hidden="true">
          <div className={styles.bgBase} />
          <div className={styles.bgFilterRadial} />
          <div className={styles.bgFilterCross} />
        </div>
        <ScreenRouter />
      </div>
    </AppProvider>
  )
}
