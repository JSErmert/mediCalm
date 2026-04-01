import { useAppContext } from '../context/AppContext'
import styles from './SafetyStopScreen.module.css'

/**
 * Pre-session safety stop — production only.
 * Authority: Safety + Reassurance Spec (doc 06) § Pre-Session Safety Stop Copy
 * Shown when resolveSession() returns kind: 'safety_stop' AND dev override is off.
 *
 * In developer mode (localStorage.dev_override === 'true') this screen is never
 * reached — PainInputScreen routes to RDReviewScreen instead.
 */
export function SafetyStopScreen() {
  const { dispatch } = useAppContext()

  function handleReturnHome() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen} role="alert" aria-live="assertive">
      <div className={styles.content}>
        <h1 className={styles.heading}>Stop here.</h1>
        <p className={styles.body}>Do not start this session.</p>
        <p className={styles.subtext}>
          This needs clinical attention before guided movement.
        </p>
        <p className={styles.subtext}>
          Seek appropriate medical care before continuing.
        </p>
      </div>
      <footer className={styles.footer}>
        <button
          className={styles.returnButton}
          onClick={handleReturnHome}
          type="button"
        >
          Return home
        </button>
      </footer>
    </main>
  )
}
