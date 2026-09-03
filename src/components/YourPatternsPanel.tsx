/**
 * YourPatternsPanel — M6.8.2 Part 3
 * Authority: M6.8.2_Finalize_Runtime_Integrity_HARI_UI.md
 *
 * Displays last session and simple HARI memory in calm, non-analytic language.
 *
 * NO SILENT BLANK (2026-09-02): this panel previously returned `null` before any
 * session existed, which left its card chrome on HomeScreen painting as an empty
 * box beside "Your State" — the second thing a first-time user saw. It now always
 * renders something readable: its own empty state first, the session summary after.
 * The guarantee lives here rather than in the caller so any future caller inherits it.
 *
 * Constraints:
 *   - No charts, no analytics, no percentages, no performance framing
 *   - Subtle shift language only (M6.8.2 Part 4)
 *   - Reads from session history; never writes
 */
import { useState } from 'react'
import type { HistoryEntry, ShiftOutcome } from '../types'
import { loadHistory } from '../storage/sessionHistory'
import styles from './YourPatternsPanel.module.css'

// ── Display helpers ───────────────────────────────────────────────────────────

function getRecencyLabel(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return 'A while back'
}

function getDurationLabel(seconds: number): string {
  if (seconds < 180) return 'Quick reset'
  if (seconds < 420) return 'Standard session'
  return 'Extended session'
}

function getSessionName(entry: HistoryEntry): string {
  if (entry.state_entry && entry.state_entry.length > 0) {
    const STATE_NAMES: Record<string, string> = {
      pain:        'Pain session',
      anxious:     'Anxiety reset',
      angry:       'Grounding session',
      sad:         'Calm session',
      exhausted:   'Recovery session',
      tight:       'Release session',
      overwhelmed: 'Reset session',
    }
    return STATE_NAMES[entry.state_entry[0]] ?? 'Session'
  }
  return entry.selected_protocol_name ?? 'Session'
}

const SHIFT_LABELS: Record<ShiftOutcome, string> = {
  relaxed:    'More relaxed',
  open:       'More open',
  steady:     'More steady',
  energized:  'More energized',
  no_change:  'No real change',
  tense_tight: 'More tense / tight',
}

function getShiftLabel(entry: HistoryEntry): string {
  if (entry.shift_outcome) return SHIFT_LABELS[entry.shift_outcome]
  const r = entry.outcome_primary ?? entry.result
  if (r === 'better') return 'More relaxed'
  if (r === 'worse') return 'More tense / tight'
  return 'No real change'
}

function getMemoryText(history: HistoryEntry[]): string {
  if (history.length < 2) return "We'll keep this simple"
  const recent = history.slice(0, 3)
  const shortCount = recent.filter(
    (e) => e.session_duration_seconds > 0 && e.session_duration_seconds < 240
  ).length
  const betterCount = recent.filter(
    (e) => e.result === 'better' || e.outcome_primary === 'better'
  ).length
  if (shortCount >= 2) return 'Short resets helped'
  if (betterCount >= 2) return 'Expansion felt better'
  return "We'll keep this simple"
}

// ── Component ─────────────────────────────────────────────────────────────────

export function YourPatternsPanel() {
  // Read synchronously on the first render. localStorage is synchronous, so an
  // effect-based load would paint the empty state for one frame before swapping
  // to a real session — a visible flicker on every return visit.
  const [history] = useState<HistoryEntry[]>(() =>
    [...loadHistory()].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  )
  const last = history[0] ?? null

  if (!last) {
    return (
      <div className={styles.panel}>
        <span className={styles.label}>Your Patterns</span>
        <span className={styles.empty}>
          What helps you will appear here after your first session.
        </span>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <span className={styles.label}>Your Patterns</span>
      <div className={styles.sessionRow}>
        <span className={styles.sessionName}>{getSessionName(last)}</span>
        <span className={styles.recency}>{getRecencyLabel(last.timestamp)}</span>
      </div>
      <span className={styles.duration}>{getDurationLabel(last.session_duration_seconds)}</span>
      <span className={styles.shift}>{getShiftLabel(last)}</span>
      <span className={styles.memory}>{getMemoryText(history)}</span>
    </div>
  )
}
