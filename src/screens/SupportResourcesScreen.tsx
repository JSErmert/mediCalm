/**
 * SupportResourcesScreen — M6.1.1 Escalation Exit (STUB)
 *
 * Full implementation: M6.1.1
 * Authority: M6.1.1 SAD Safety Screen spec (v2.1) § Support Resources Screen
 */
import { useAppContext } from '../context/AppContext'

export function SupportResourcesScreen() {
  const { dispatch } = useAppContext()

  function handleReturnHome() {
    dispatch({ type: 'CLEAR_STATE_ENTRY' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main aria-label="Support resources">
      <h1>Support Resources</h1>
      <button type="button" onClick={handleReturnHome} aria-label="Return home">
        Return Home
      </button>
    </main>
  )
}
