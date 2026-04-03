/**
 * StateSelectionScreen — M6.1 State Selection (STUB)
 *
 * Full implementation: M6.1
 * Stub routes Pain → session_intake to preserve existing HARI flow tests.
 * Authority: M6.1 State Selection Screen spec
 */
import { useAppContext } from '../context/AppContext'

export function StateSelectionScreen() {
  const { dispatch } = useAppContext()

  return (
    <main aria-label="State selection">
      <h1>What are you feeling right now?</h1>
      <button
        type="button"
        onClick={() => dispatch({ type: 'NAVIGATE', screen: 'session_intake' })}
        aria-label="Select pain state"
      >
        Pain
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
        aria-label="Back to home"
      >
        Back
      </button>
    </main>
  )
}
