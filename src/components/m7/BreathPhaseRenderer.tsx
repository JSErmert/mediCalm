/**
 * BreathPhaseRenderer — renders an M7 BreathPhase using the legacy BreathingOrb
 * visualization, wrapped in the legacy two-zone clinical context layout
 * (sessionName, diaphragmaticCue, durationLabel, round counter, position cue).
 *
 * Visually identical to a pre-M7 breath session: the orb scale animation,
 * countdown, instruction text, and round tracking flow through BreathingOrb;
 * the surrounding clinical context (top zone + round counter + Scope A
 * position note) mirrors what GuidedSessionScreen renders on the legacy path.
 *
 * M7.2's contribution is wrapping it in the multi-phase state machine — the
 * orb itself is unchanged.
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

        {phase.cue.opening && <p className={styles.cueText}>{phase.cue.opening}</p>}

        <div className={styles.orbArea}>
          <BreathingOrb
            timingProfile={timingProfile}
            expressionProfile={expressionProfile}
            protocolId={protocolId}
            onRoundComplete={(n) => setCompletedRounds(n)}
            onAllRoundsComplete={onComplete}
            gentleLabels
          />
        </div>

        {phase.cue.closing && <p className={styles.cueText}>{phase.cue.closing}</p>}

        {positionCue && (
          <p className={styles.positionCue} aria-label="Position note">
            {positionCue}
          </p>
        )}
      </div>
    </div>
  )
}
