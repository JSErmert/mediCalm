/**
 * App — root component and screen router.
 * Authority: Guided Session UI Spec (doc 05) § v1 Session Flow
 *
 * Uses Framer Motion AnimatePresence for crossfade transitions (300ms, ease).
 * Screen routing is driven by AppContext state machine.
 *
 * Rules (from Guided Session UI Spec):
 * - crossfades only: no slides, no zoom, no bounce
 * - transitions must not feel delayed — 300ms is the target
 * - the experience should feel like one continuous environment
 */
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppProvider'
import { useAppContext } from './context/AppContext'
import { ScreenTransition } from './components/ScreenTransition'
import { HomeScreen } from './screens/HomeScreen'
import { PainInputScreen } from './screens/PainInputScreen'
import { SessionPlaceholder } from './screens/SessionPlaceholder'

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
      {activeScreen === 'session_placeholder' && (
        <ScreenTransition screenKey="session_placeholder">
          <SessionPlaceholder />
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
