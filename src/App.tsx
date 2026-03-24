/**
 * App — root component and screen router.
 * Authority: Guided Session UI Spec (doc 05) § v1 Session Flow
 *
 * Uses Framer Motion AnimatePresence for crossfade transitions (300ms, ease).
 * Screen routing is driven by AppContext state machine.
 */
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppProvider'
import { useAppContext } from './context/AppContext'
import { ScreenTransition } from './components/ScreenTransition'
import { HomeScreen } from './screens/HomeScreen'
import { PainInputScreen } from './screens/PainInputScreen'
import { GuidedSessionScreen } from './screens/GuidedSessionScreen'
import { SafetyStopScreen } from './screens/SafetyStopScreen'

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
      {activeScreen === 'pain_input' && (
        <ScreenTransition screenKey="pain_input">
          <PainInputScreen />
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
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  )
}
