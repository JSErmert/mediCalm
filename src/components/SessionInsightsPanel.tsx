/**
 * M5.4 — Session Insights Panel
 * Authority: M5.4_Session_Insights_Surface_Contract.md
 *
 * Displays non-diagnostic, optional pattern-derived insights.
 *
 * Rules:
 *   - Secondary UI element only — never blocking, never required (M5.4 §8)
 *   - 'candidate' insights labeled as early signal (M5.4 §4)
 *   - 'suspended' insights labeled as paused (M5.4 §4)
 *   - Renders nothing when no insights are available (M5.4 §12)
 *   - Does not influence system behavior (M5.4 §13)
 */
import type { SessionInsight } from '../types/patterns'
import styles from './SessionInsightsPanel.module.css'

interface Props {
  insights: SessionInsight[]
}

export function SessionInsightsPanel({ insights }: Props) {
  if (insights.length === 0) return null

  return (
    <section className={styles.panel} aria-label="Session insights based on recent sessions">
      <span className={styles.label}>Based on recent sessions</span>
      <ul className={styles.list}>
        {insights.map((insight, i) => (
          <li key={`${insight.dimension}-${i}`} className={styles.item}>
            <span className={styles.bullet} aria-hidden="true">•</span>
            <span className={styles.summary}>{insight.summary}</span>
            {insight.is_suspended && (
              <span className={styles.pausedNote} aria-label="This pattern is currently paused">
                (paused)
              </span>
            )}
            {!insight.is_suspended && insight.confidence === 'low' && (
              <span className={styles.earlySignal}>
                (early signal)
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
