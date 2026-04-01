/**
 * SessionCaseFile — M3.3.x
 *
 * Full-screen overlay showing the complete record for a single session.
 * Rendered by HomeScreen when "View case file" is selected from a history card.
 *
 * Sections:
 *   Intake      — pain level, locations, symptoms, position, context, note
 *   Session     — protocol, goal, timing, duration, rounds
 *   Outcome     — result, change markers
 *   Interpretation — re-derived at view time from stored intake fields
 */
import type { HistoryEntry, PainInputState } from '../types'
import { interpretSession } from '../engine/interpretationLayer'
import styles from './SessionCaseFile.module.css'

interface Props {
  entry: HistoryEntry
  onClose: () => void
}

const RESULT_LABELS: Record<HistoryEntry['result'], string> = {
  better:      'Helped',
  same:        'No clear change',
  worse:       'Worse',
  interrupted: 'Interrupted',
}

const STATUS_LABELS: Record<HistoryEntry['session_status'], string> = {
  completed:   'Completed',
  interrupted: 'Interrupted',
  user_stopped: 'Stopped early',
}

function fmt(tag: string): string {
  return tag.replace(/_/g, '\u00a0')
}

export function SessionCaseFile({ entry, onClose }: Props) {
  const date = new Date(entry.timestamp)
  const dateLabel = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Re-derive interpretation from stored intake fields
  const painInput: PainInputState = {
    pain_level: entry.pain_before,
    location_tags: entry.location_tags,
    symptom_tags: entry.symptom_tags,
    current_position: entry.current_position as PainInputState['current_position'],
    trigger_tag: entry.trigger_tag,
  }
  const { pattern, modifiers, focus, breathingHint } = interpretSession(painInput)

  const SAFETY_ADJACENT = new Set(['instability', 'coordination_change', 'weakness'])
  const mainSymptoms = entry.symptom_tags.filter((t) => !SAFETY_ADJACENT.has(t))
  const alsoPresent  = entry.symptom_tags.filter((t) => SAFETY_ADJACENT.has(t))

  const durationMin = entry.session_duration_seconds
    ? Math.round(entry.session_duration_seconds / 60)
    : null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Session case file">
      <div className={styles.sheet}>

        {/* Header */}
        <header className={styles.header}>
          <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
            ← Back
          </button>
          <div className={styles.headerMeta}>
            <span className={styles.headerDate}>{dateLabel} · {timeLabel}</span>
            <span className={`${styles.resultBadge} ${styles[entry.result]}`}>
              {RESULT_LABELS[entry.result]}
            </span>
          </div>
          <p className={styles.headerProtocol}>{entry.selected_protocol_name}</p>
        </header>

        <div className={styles.sections}>

          {/* Intake */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Intake</h2>
            <div className={styles.row}>
              <span className={styles.label}>Pain level</span>
              <span className={styles.value}>{entry.pain_before}</span>
            </div>
            {entry.location_tags.length > 0 && (
              <div className={styles.row}>
                <span className={styles.label}>Locations</span>
                <span className={styles.value}>{entry.location_tags.map(fmt).join(' · ')}</span>
              </div>
            )}
            {mainSymptoms.length > 0 && (
              <div className={styles.row}>
                <span className={styles.label}>Symptoms</span>
                <span className={styles.value}>{mainSymptoms.map(fmt).join(' · ')}</span>
              </div>
            )}
            {alsoPresent.length > 0 && (
              <div className={styles.row}>
                <span className={styles.label}>Also present</span>
                <span className={styles.value}>{alsoPresent.map(fmt).join(' · ')}</span>
              </div>
            )}
            {entry.current_position && (
              <div className={styles.row}>
                <span className={styles.label}>Position</span>
                <span className={styles.value}>{fmt(entry.current_position)}</span>
              </div>
            )}
            {entry.trigger_tag && (
              <div className={styles.row}>
                <span className={styles.label}>Context</span>
                <span className={styles.value}>{fmt(entry.trigger_tag)}</span>
              </div>
            )}
          </section>

          {/* Interpretation */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Interpretation</h2>
            <div className={styles.row}>
              <span className={styles.label}>Pattern</span>
              <span className={styles.value}>{fmt(pattern)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Severity</span>
              <span className={styles.value}>{modifiers.severity} · {modifiers.spread}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Focus</span>
              <span className={styles.value}>{focus}</span>
            </div>
            {breathingHint && (
              <div className={styles.row}>
                <span className={styles.label}>Approach</span>
                <span className={styles.value}>{breathingHint}</span>
              </div>
            )}
          </section>

          {/* Session */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Session</h2>
            <div className={styles.row}>
              <span className={styles.label}>Protocol</span>
              <span className={styles.value}>{entry.selected_protocol_name}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Status</span>
              <span className={styles.value}>{STATUS_LABELS[entry.session_status]}</span>
            </div>
            {entry.rounds_completed != null && (
              <div className={styles.row}>
                <span className={styles.label}>Rounds</span>
                <span className={styles.value}>{entry.rounds_completed}</span>
              </div>
            )}
            {durationMin !== null && (
              <div className={styles.row}>
                <span className={styles.label}>Duration</span>
                <span className={styles.value}>~{durationMin} min</span>
              </div>
            )}
          </section>

          {/* Outcome */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Outcome</h2>
            <div className={styles.row}>
              <span className={styles.label}>Pain after</span>
              <span className={styles.value}>
                {entry.pain_before} → {entry.pain_after}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Result</span>
              <span className={`${styles.value} ${styles[entry.result]}`}>
                {RESULT_LABELS[entry.result]}
              </span>
            </div>
            {entry.change_markers.length > 0 && (
              <div className={styles.row}>
                <span className={styles.label}>Changed</span>
                <span className={styles.value}>
                  {entry.change_markers.map(fmt).join(' · ')}
                </span>
              </div>
            )}
          </section>

          {/* Dev override notice */}
          {entry.safety_override_used && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>Dev</h2>
              <div className={styles.row}>
                <span className={styles.label}>Override</span>
                <span className={styles.value}>R&amp;D safety override used</span>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
