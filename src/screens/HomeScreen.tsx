/**
 * HomeScreen — entry point and session history.
 * Authority: Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 *            UX/UI Experience Report (doc 12)
 *            Safety + Reassurance Spec (doc 06) § 9. Home / History Safety Behavior
 *
 * "The home screen should feel like a calm history of care, not a dashboard of performance."
 * No streaks. No badges. No gamification. Worse/interrupted outcomes are labelled accurately.
 */
import { useEffect, useState } from 'react'
import type { HistoryEntry } from '../types'
import { loadHistory, deleteSession, updateSessionFeedback } from '../storage/sessionHistory'
import { useAppContext } from '../context/AppContext'
import { HistoryCard } from '../components/HistoryCard'
import styles from './HomeScreen.module.css'

export function HomeScreen() {
  const { dispatch } = useAppContext()
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const stored = loadHistory()
    setHistory([...stored].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  }, [])

  function handleStart() {
    dispatch({ type: 'NAVIGATE', screen: 'pain_input' })
  }

  function handleDelete(sessionId: string) {
    deleteSession(sessionId)
    setHistory((prev) => prev.filter((e) => e.session_id !== sessionId))
  }

  function handleUpdate(
    sessionId: string,
    patch: Pick<Partial<HistoryEntry>, 'pain_after' | 'result' | 'change_markers'>
  ) {
    updateSessionFeedback(sessionId, patch)
    setHistory((prev) =>
      prev.map((e) => e.session_id === sessionId ? { ...e, ...patch } : e)
    )
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <p className={styles.appName}>MediCalm</p>
        <h1 className={styles.question}>What level is your pain right now?</h1>
      </header>

      <div className={styles.cta}>
        <button
          className={styles.startButton}
          onClick={handleStart}
          type="button"
          aria-label="Start a new guided session"
        >
          Start session
        </button>
      </div>

      <section className={styles.history} aria-label="Session history">
        <h2 className={styles.historyHeading}>Recent sessions</h2>

        {history.length === 0 ? (
          <p className={styles.emptyState}>
            No sessions yet. Start your first session above.
          </p>
        ) : (
          <ul className={styles.historyList} aria-label="Past sessions">
            {history.map((entry) => (
              <li key={entry.session_id}>
                <HistoryCard
                  entry={entry}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
