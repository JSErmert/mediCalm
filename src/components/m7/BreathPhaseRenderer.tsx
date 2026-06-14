/**
 * BreathPhaseRenderer — renders an M7 BreathPhase using the legacy BreathingOrb
 * visualization, wrapped in the legacy two-zone clinical context layout.
 *
 * Render parity with main's GuidedSessionScreen breath-phase render path is
 * load-bearing per M7.2 discipline: "breath content within phases unchanged
 * from M7.1." Every numbered element from main's render is mirrored here.
 *
 * Mode signal:
 *   When `m6ProgressFraction` is defined → M6/sessionConfig mode:
 *     - mechanical round counter suppressed
 *     - subtle time-based progress bar rendered under the orb
 *     - callers should also pass gentleLabels=true and preStartDelay=1500
 *   When `m6ProgressFraction` is undefined → HARI/legacy mode:
 *     - round counter (RoundDots + numeric) rendered above the orb
 *     - no progress bar
 *     - callers should pass gentleLabels=false and preStartDelay=0
 *
 * Authority:
 *   docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.2
 *   M2.5.5 Two-Zone Layout (mirrored from GuidedSessionScreen.module.css)
 *   2026-05-05 Scope A — PT-grounded contextual position hint
 */
import { useState } from 'react'
import { BreathingOrb } from '../BreathingOrb'
import { RoundDots } from '../RoundDots'
import { BREATH_FAMILIES } from '../../engine/hari/breathFamily'
import type { BreathPhase } from '../../types/m7'
import type { ExpressionProfile } from '../../engine/presentation/expressionProfile'
import styles from './BreathPhaseRenderer.module.css'

type Props = {
  phase: BreathPhase
  onComplete: () => void
  /** Optional — falls back to BreathingOrb's DEFAULT_EXPRESSION when absent. */
  expressionProfile?: ExpressionProfile
  /** Optional — drives micro-guidance copy. */
  protocolId?: string
  /** Top-zone protocol/pathway name (e.g. sessionConfig.sessionName). */
  sessionName?: string
  /** Top-zone opening prompt — Scope A diaphragmatic / breath-mechanic cue. */
  diaphragmaticCue?: string
  /** Top-zone duration label (e.g. "About 3 minutes"). */
  durationLabel?: string
  /** Scope A contextual position hint, derived from intake branch + pattern. */
  positionCue?: string
  /** Mirrors GuidedSessionScreen `gentleLabels={!!sessionConfig}`. Default: true. */
  gentleLabels?: boolean
  /** Mirrors GuidedSessionScreen `preStartDelay={sessionConfig ? 1500 : 0}`. Default: 0. */
  preStartDelay?: number
  /**
   * When defined, suppresses the mechanical round counter and renders a
   * time-based progress bar (M6 mode). Mirrors `m6ProgressFraction` in
   * GuidedSessionScreen — value in [0, 1].
   */
  m6ProgressFraction?: number
  /** Mirrors GuidedSessionScreen orb force-remount key (used on HARI continue-rounds). */
  orbKey?: number
  /** Mirrors GuidedSessionScreen `orbRunning` gate. Default: true. */
  orbRunning?: boolean
}

export function BreathPhaseRenderer({
  phase,
  onComplete,
  expressionProfile,
  protocolId,
  sessionName,
  diaphragmaticCue,
  durationLabel,
  positionCue,
  gentleLabels = true,
  preStartDelay = 0,
  m6ProgressFraction,
  orbKey,
  orbRunning = true,
}: Props) {
  const family = BREATH_FAMILIES[phase.breath_family]
  const timingProfile = {
    inhale_seconds: family.inhaleSeconds,
    exhale_seconds: family.exhaleSeconds,
    rounds: phase.num_cycles,
  }
  const totalRounds = phase.num_cycles
  const [completedRounds, setCompletedRounds] = useState(0)
  const currentDisplayRound = Math.min(completedRounds + 1, totalRounds)

  const hasTopZone = !!(sessionName || diaphragmaticCue || durationLabel)
  const showTimeProgress = m6ProgressFraction !== undefined
  const showRoundCounter = !showTimeProgress

  return (
    <div className={styles.breathingPhase} role="region" aria-label="Breath phase">
      {hasTopZone && (
        <header className={styles.topZone} aria-label="Protocol context">
          {sessionName && <p className={styles.protocolName}>{sessionName}</p>}
          {diaphragmaticCue && <p className={styles.goalText}>{diaphragmaticCue}</p>}
          {durationLabel && <p className={styles.durationLabel}>{durationLabel}</p>}
        </header>
      )}

      <div className={styles.guidanceZone}>
        {showRoundCounter && (
          <div
            className={styles.progressRow}
            aria-label={`Round ${currentDisplayRound} of ${totalRounds}`}
          >
            <RoundDots
              totalRounds={totalRounds}
              completedRounds={completedRounds}
              currentRound={currentDisplayRound}
            />
            <span className={styles.roundCounter}>
              {currentDisplayRound} / {totalRounds}
            </span>
          </div>
        )}

        {phase.cue.opening && <p className={styles.cueText}>{phase.cue.opening}</p>}

        <div className={styles.orbArea}>
          {orbRunning && (
            <BreathingOrb
              key={orbKey}
              timingProfile={timingProfile}
              expressionProfile={expressionProfile}
              protocolId={protocolId}
              onRoundComplete={(n) => setCompletedRounds(n)}
              onAllRoundsComplete={onComplete}
              gentleLabels={gentleLabels}
              preStartDelay={preStartDelay}
            />
          )}
        </div>

        {phase.cue.closing && <p className={styles.cueText}>{phase.cue.closing}</p>}

        {showTimeProgress && (
          <div className={styles.timeProgress} aria-hidden="true">
            <div
              className={styles.timeProgressBar}
              style={{ width: `${m6ProgressFraction * 100}%` }}
            />
          </div>
        )}

        {positionCue && (
          <p className={styles.positionCue} aria-label="Position note">
            {positionCue}
          </p>
        )}
      </div>
    </div>
  )
}
