/**
 * CustomPlayer — exact-execution player for a user-composed breathing session.
 * Authority: n4-screens custom experience (THE felt centerpiece)
 *
 * Runs the composed rules EXACTLY: the session's timing is re-validated through
 * validateCustomTiming (the single choke point — only the clamped result reaches
 * the orb, so no out-of-bounds timing can ever animate), the one-cycle phase order
 * is taken from buildCustomPhaseTimeline, and playback is driven by BreathingOrb,
 * which honors hold_after_inhale_seconds / hold_after_exhale_seconds.
 *
 * On completion (all cycles, or an early end) the honest CustomCompletion close
 * saves via customSessionToHistoryEntry + saveCustomHistoryEntry (validation-exempt).
 */
import { useEffect, useRef, useState } from 'react'
import type { TimingProfile } from '../types'
import { useAppContext } from '../context/AppContext'
import { validateCustomTiming } from '../engine/custom/validateCustomTiming'
import { buildCustomPhaseTimeline } from '../engine/custom/buildCustomPhaseTimeline'
import {
  customSessionToHistoryEntry,
  type CustomSessionResult,
} from '../engine/custom/customSessionToHistoryEntry'
import { saveCustomHistoryEntry } from '../storage/sessionHistory'
import { BreathingOrb } from './BreathingOrb'
import { CustomCompletion, type CustomCompletionResult } from './CustomCompletion'
import styles from './CustomPlayer.module.css'

type PlayerPhase = 'playing' | 'completion'

export function CustomPlayer() {
  const { state, dispatch } = useAppContext()
  const session = state.pendingCustomSession
  // n5-crosscut: movement (walking) mode — glanceable playback + abbreviated,
  // honest close. Isolated from HARI; still lands a CUSTOM HistoryEntry.
  const walkingMode = state.pendingWalkingMode

  const [phase, setPhase] = useState<PlayerPhase>('playing')
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [endedEarly, setEndedEarly] = useState(false)
  const startTimeRef = useRef(Date.now())

  // Guard: no queued session (e.g. deep link / refresh) → return home calmly.
  useEffect(() => {
    if (!session) {
      dispatch({ type: 'NAVIGATE', screen: 'home' })
    }
  }, [session, dispatch])

  if (!session) return null

  // ── The single validation choke point ────────────────────────────────────
  // Only the clamped profile is ever used for playback; a saved session with
  // out-of-bounds timing is silently brought back within safe bounds here.
  const { clamped } = validateCustomTiming(session.profile)
  const timeline = buildCustomPhaseTimeline(clamped)
  const perCycleSeconds = timeline.reduce((sum, p) => sum + p.seconds, 0)
  const estimatedSeconds = perCycleSeconds * clamped.cycles
  const estimatedMinutes = Math.max(1, Math.round(estimatedSeconds / 60))

  const timingProfile: TimingProfile = {
    inhale_seconds: clamped.inhale_seconds,
    exhale_seconds: clamped.exhale_seconds,
    rounds: clamped.cycles,
    hold_after_inhale_seconds: clamped.hold_after_inhale_seconds,
    hold_after_exhale_seconds: clamped.hold_after_exhale_seconds,
  }

  const currentCycle = Math.min(cyclesCompleted + 1, clamped.cycles)

  function handleRoundComplete(round: number) {
    setCyclesCompleted(round)
  }

  function handleAllRoundsComplete() {
    setEndedEarly(false)
    setPhase('completion')
  }

  function handleEndEarly() {
    setEndedEarly(true)
    setPhase('completion')
  }

  function finishAndHome() {
    dispatch({ type: 'CLEAR_PENDING_CUSTOM' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  function handleSave(completion: CustomCompletionResult) {
    const elapsed = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))
    const result: CustomSessionResult = {
      timestamp: new Date().toISOString(),
      cycles_completed: cyclesCompleted,
      session_duration_seconds: elapsed,
      ...(completion.note !== undefined && { user_note: completion.note }),
      // Movement sessions stamp walking_mode; the pace tag rides along only if the
      // user chose one. Standard custom runs carry neither.
      ...(walkingMode && {
        walking_mode: true,
        ...(completion.walkingSpeedTag !== undefined && {
          walking_speed_tag: completion.walkingSpeedTag,
        }),
      }),
    }
    saveCustomHistoryEntry(customSessionToHistoryEntry(session!, result))
    finishAndHome()
  }

  return (
    <main className={styles.screen}>
      {phase === 'playing' && (
        <div className={`${styles.playing} ${walkingMode ? styles.playingWalking : ''}`}>
          <header className={styles.topZone}>
            <p className={styles.sessionName}>{session.name}</p>
            <p className={styles.durationLabel}>
              {walkingMode ? 'Walk with your breath' : `About ${estimatedMinutes} minute${estimatedMinutes === 1 ? '' : 's'}`}
            </p>
          </header>

          <div className={styles.orbArea}>
            <BreathingOrb
              timingProfile={timingProfile}
              gentleLabels
              glanceable={walkingMode}
              preStartDelay={1200}
              onRoundComplete={handleRoundComplete}
              onAllRoundsComplete={handleAllRoundsComplete}
            />
          </div>

          <footer className={styles.footer}>
            <p className={styles.cycleLabel} aria-live="polite">
              Cycle {currentCycle} of {clamped.cycles}
            </p>
            <button
              type="button"
              className={styles.endButton}
              onClick={handleEndEarly}
              aria-label="End session early"
            >
              End session
            </button>
          </footer>
        </div>
      )}

      {phase === 'completion' && (
        <CustomCompletion
          sessionName={session.name}
          cyclesCompleted={cyclesCompleted}
          cyclesPlanned={clamped.cycles}
          endedEarly={endedEarly}
          walkingMode={walkingMode}
          onSave={handleSave}
          onDismiss={finishAndHome}
        />
      )}
    </main>
  )
}
