/**
 * M6GuidedSessionScreen — M6.6 Guided Session Runtime
 *
 * Reads stateInterpretationResult from app state, builds SessionConfig via M6.5,
 * and runs a deterministic breathing session.
 *
 * Authority: M6.6 Guided Session Runtime spec
 */
import { useEffect, useRef, useState } from 'react'
import type { AppAction } from '../context/AppContext'
import { useAppContext } from '../context/AppContext'
import { buildSessionConfig } from '../engine/hari/sessionConfig'
import type { BreathPrescription } from '../types/hari'
import styles from './M6GuidedSessionScreen.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type BreathPhase = 'inhale' | 'hold' | 'exhale'
type ScreenPhase = 'running' | 'paused' | 'complete'

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Session Runtime ───────────────────────────────────────────────────────────

function SessionRuntime({
  config,
  dispatch,
}: {
  config: BreathPrescription
  dispatch: React.Dispatch<AppAction>
}) {
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>('running')
  const [remainingSeconds, setRemainingSeconds] = useState(config.durationSeconds)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale')
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(config.inhaleSeconds)

  // Refs preserve values across interval ticks and pause/resume cycles
  const remainingRef = useRef(config.durationSeconds)
  const phaseRef = useRef<BreathPhase>('inhale')
  const phaseLeftRef = useRef(config.inhaleSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function getNextPhase(current: BreathPhase): BreathPhase {
    if (current === 'inhale') return config.holdSeconds > 0 ? 'hold' : 'exhale'
    if (current === 'hold') return 'exhale'
    return 'inhale'
  }

  function getPhaseDuration(phase: BreathPhase): number {
    if (phase === 'inhale') return config.inhaleSeconds
    if (phase === 'hold') return config.holdSeconds
    return config.exhaleSeconds
  }

  useEffect(() => {
    if (screenPhase !== 'running') return

    intervalRef.current = setInterval(() => {
      // Total session countdown
      remainingRef.current -= 1
      setRemainingSeconds(remainingRef.current)

      if (remainingRef.current <= 0) {
        clearInterval(intervalRef.current!)
        setScreenPhase('complete')
        return
      }

      // Breath phase countdown
      phaseLeftRef.current -= 1

      if (phaseLeftRef.current <= 0) {
        const next = getNextPhase(phaseRef.current)
        phaseRef.current = next
        phaseLeftRef.current = getPhaseDuration(next)
        setBreathPhase(next)
      }

      setPhaseSecondsLeft(phaseLeftRef.current)
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [screenPhase]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePauseResume() {
    setScreenPhase((p) => (p === 'running' ? 'paused' : 'running'))
  }

  function handleEndEarly() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setScreenPhase('complete')
  }

  function handleDone() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // ── Completion ──────────────────────────────────────────────────────────────

  if (screenPhase === 'complete') {
    return (
      <main className={styles.screen}>
        <div className={styles.completion}>
          <p className={styles.completionTitle}>Done.</p>
          {!config.overloadSafe && (
            <p className={styles.completionSub}>Session complete.</p>
          )}
          <button className={styles.homeButton} type="button" onClick={handleDone}>
            Return home
          </button>
        </div>
      </main>
    )
  }

  // ── Running / Paused ────────────────────────────────────────────────────────

  return (
    <main className={styles.screen}>
      <header className={styles.sessionHeader}>
        <p className={styles.sessionName}>{config.sessionName}</p>
        <p className={styles.openingPrompt}>{config.openingPrompt}</p>
      </header>

      <div className={styles.breathArea}>
        <p
          className={styles.phaseLabel}
          aria-live="polite"
          aria-atomic="true"
        >
          {screenPhase === 'paused' ? 'Paused' : PHASE_LABELS[breathPhase]}
        </p>
        <p className={styles.phaseCount} aria-hidden="true">
          {screenPhase !== 'paused' ? phaseSecondsLeft : '—'}
        </p>
      </div>

      <div className={styles.timer} aria-label={`${formatTime(remainingSeconds)} remaining`}>
        <span className={styles.timerValue}>{formatTime(remainingSeconds)}</span>
        <span className={styles.timerLabel}>remaining</span>
      </div>

      <div className={styles.progressBar} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{
            width: `${Math.min(100, Math.max(0,
              ((config.durationSeconds - remainingSeconds) / config.durationSeconds) * 100
            ))}%`,
          }}
        />
      </div>

      <footer className={styles.footer}>
        <button
          className={styles.pauseButton}
          type="button"
          onClick={handlePauseResume}
          aria-label={screenPhase === 'running' ? 'Pause session' : 'Resume session'}
        >
          {screenPhase === 'running' ? 'Pause' : 'Resume'}
        </button>
        <button
          className={styles.endButton}
          type="button"
          onClick={handleEndEarly}
          aria-label="End session early"
        >
          End session
        </button>
      </footer>
    </main>
  )
}

// ── Screen Entry ──────────────────────────────────────────────────────────────

export function M6GuidedSessionScreen() {
  const { state, dispatch } = useAppContext()

  // M6.8.3: pendingBreathPrescription is set by Continue What Helped flow.
  // It takes priority over stateInterpretationResult → buildSessionConfig path.
  const config: BreathPrescription | null = state.pendingBreathPrescription
    ?? (state.stateInterpretationResult
      ? buildSessionConfig(state.stateInterpretationResult)
      : null)

  if (!config) {
    dispatch({ type: 'NAVIGATE', screen: 'home' })
    return null
  }

  return <SessionRuntime config={config} dispatch={dispatch} />
}
