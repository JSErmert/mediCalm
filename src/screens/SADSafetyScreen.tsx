/**
 * SADSafetyScreen — M6.1.1 SAD Safety Gate (STUB)
 *
 * Full implementation: M6.1.1
 * Authority: M6.1.1 SAD Safety Screen spec (v2.1)
 */
import { useAppContext } from '../context/AppContext'

export function SADSafetyScreen() {
  const { dispatch } = useAppContext()

  function handleNo() {
    dispatch({ type: 'NAVIGATE', screen: 'session_intake' })
  }

  function handleYes() {
    dispatch({ type: 'CLEAR_STATE_ENTRY' })
    dispatch({ type: 'NAVIGATE', screen: 'support_resources' })
  }

  function handleBack() {
    dispatch({ type: 'NAVIGATE', screen: 'state_selection' })
  }

  return (
    <main aria-label="SAD safety check">
      <h1>Before we continue, a quick check</h1>
      <button type="button" onClick={handleNo} aria-label="No, continue">
        No, continue
      </button>
      <button type="button" onClick={handleYes} aria-label="Yes">
        Yes
      </button>
      <button type="button" onClick={handleBack} aria-label="Back to state selection">
        Back
      </button>
    </main>
  )
}
