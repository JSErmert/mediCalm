/**
 * HistoryCard — single session history entry.
 * Authority: Guided Session UI Spec (doc 05) § 11. Home Return + History Visibility
 *            Safety + Reassurance Spec (doc 06) § 9. Home / History Safety Behavior
 *
 * Safety rule: worse/interrupted results must NOT use celebratory styling.
 * History is a record of care, not a performance dashboard.
 *
 * M1 STATUS: Component is typed and styled. History list is empty in M1.
 * History write-back is implemented in M3.
 */
import type { HistoryEntry } from '../types'
import styles from './HistoryCard.module.css'

interface HistoryCardProps {
  entry: HistoryEntry
}

const RESULT_LABELS: Record<HistoryEntry['result'], string> = {
  better:      'Helped',
  same:        'No clear change',
  worse:       'Worse',
  interrupted: 'Interrupted',
}

export function HistoryCard({ entry }: HistoryCardProps) {
  const date = new Date(entry.timestamp)
  const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <article
      className={styles.card}
      aria-label={`Session from ${dateLabel} at ${timeLabel}`}
    >
      <header className={styles.header}>
        <span className={styles.time}>{dateLabel} · {timeLabel}</span>
        <span className={`${styles.result} ${styles[entry.result]}`}>
          {RESULT_LABELS[entry.result]}
        </span>
      </header>

      <div className={styles.body}>
        <span className={styles.pain} aria-label={`Pain ${entry.pain_before} before, ${entry.pain_after} after`}>
          {entry.pain_before} → {entry.pain_after}
        </span>
        <span className={styles.protocol}>{entry.selected_protocol_name}</span>
      </div>

      <footer className={styles.tags}>
        {[...entry.location_tags.slice(0, 2), ...entry.symptom_tags.slice(0, 2)].map((t) => (
          <span key={t} className={styles.tag}>
            {t.replace(/_/g, ' ')}
          </span>
        ))}
      </footer>
    </article>
  )
}
