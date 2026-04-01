// src/components/BreathingOrb.tsx
/**
 * Authority: M2.5.5 Two-Zone Layout
 *
 * BreathingOrb renders ONE text slot below the orb. That slot handles all
 * states: entry ("Prepare to begin"), inhale/exhale instruction, pause (empty).
 * No above-orb text zone. No competing guidance areas.
 *
 * Lifecycle:
 *   entry   — orb at scale_min (immobile), countdown 5→1, below: "Prepare to begin"
 *   pause   — 350ms at scale_min, countdown gone, below: empty
 *   inhale  — orb expands scale_min→scale_max over 4s, below: inhale instruction
 *   exhale  — orb contracts scale_max→scale_min over 7s, below: exhale instruction
 *   pause   — 300ms inter-breath at scale_min, below: empty, then next round
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { TimingProfile } from '../types'
import type { ExpressionProfile } from '../engine/expressionProfile'
import { getMicroGuidance } from '../engine/microGuidance'
import styles from './BreathingOrb.module.css'

interface Props {
  timingProfile: TimingProfile
  expressionProfile?: ExpressionProfile
  protocolId?: string
  onRoundComplete?: (roundNumber: number) => void
  onAllRoundsComplete?: () => void
}

type OrbPhase = 'entry' | 'inhale' | 'exhale' | 'pause'

const DEFAULT_EXPRESSION: Pick<
  ExpressionProfile,
  | 'orb_scale_min'
  | 'orb_scale_max'
  | 'glow_scale_min'
  | 'glow_scale_max'
  | 'glow_opacity_min'
  | 'glow_opacity_max'
  | 'show_microtext'
> = {
  orb_scale_min: 0.25,
  orb_scale_max: 1.00,
  glow_scale_min: 0.32,
  glow_scale_max: 1.30,
  glow_opacity_min: 0.16,
  glow_opacity_max: 0.44,
  show_microtext: true,
}

const ENTRY_SECONDS = 3
const ENTRY_POST_PAUSE_MS = 350
const INTER_BREATH_PAUSE_MS = 300

const INHALE_EASE = [0.4, 0.0, 0.6, 1.0] as const
const EXHALE_EASE = [0.25, 0.0, 0.5, 1.0] as const

export function BreathingOrb({
  timingProfile,
  expressionProfile,
  protocolId,
  onRoundComplete,
  onAllRoundsComplete,
}: Props) {
  const { inhale_seconds, exhale_seconds, rounds } = timingProfile
  const expr = expressionProfile ?? DEFAULT_EXPRESSION
  const prefersReducedMotion = useReducedMotion()

  const [phase, setPhase] = useState<OrbPhase>('entry')
  const [countdown, setCountdown] = useState(ENTRY_SECONDS)
  const [currentRound, setCurrentRound] = useState(1)

  const roundRef = useRef(1)
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return

    let interval: ReturnType<typeof setInterval>

    function startInhale() {
      setPhase('inhale')
      let remaining = inhale_seconds
      setCountdown(remaining)
      interval = setInterval(() => {
        remaining -= 1
        if (remaining >= 1) {
          setCountdown(remaining)
        } else {
          clearInterval(interval)
          startExhale()
        }
      }, 1000)
    }

    function startExhale() {
      setPhase('exhale')
      let remaining = exhale_seconds
      setCountdown(remaining)
      interval = setInterval(() => {
        remaining -= 1
        if (remaining >= 1) {
          setCountdown(remaining)
        } else {
          clearInterval(interval)
          startInterBreathPause()
        }
      }, 1000)
    }

    function startInterBreathPause() {
      setPhase('pause')
      const round = roundRef.current
      onRoundComplete?.(round)
      setTimeout(() => {
        if (round >= rounds) {
          doneRef.current = true
          onAllRoundsComplete?.()
          return
        }
        roundRef.current = round + 1
        setCurrentRound(roundRef.current)
        startInhale()
      }, INTER_BREATH_PAUSE_MS)
    }

    let entryRemaining = ENTRY_SECONDS
    setCountdown(entryRemaining)
    interval = setInterval(() => {
      entryRemaining -= 1
      if (entryRemaining >= 1) {
        setCountdown(entryRemaining)
      } else {
        clearInterval(interval)
        setTimeout(startInhale, ENTRY_POST_PAUSE_MS)
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Motion values ───────────────────────────────────────────────────────────
  const orbScale = phase === 'inhale' ? expr.orb_scale_max : expr.orb_scale_min
  const glowScale = phase === 'inhale' ? expr.glow_scale_max : expr.glow_scale_min
  const glowOpacity =
    phase === 'inhale' ? expr.glow_opacity_max
    : phase === 'entry' || phase === 'pause' ? expr.glow_opacity_min * 0.5
    : expr.glow_opacity_min

  const motionDuration =
    phase === 'inhale' ? inhale_seconds
    : phase === 'exhale' ? exhale_seconds
    : 0.3
  const motionEase = phase === 'inhale' ? INHALE_EASE : EXHALE_EASE

  // ── Single below-orb text slot ──────────────────────────────────────────────
  // "Prepare to begin" during entry. Phase instruction during breathing. Empty during pause.
  const line1 =
    phase === 'entry' ? 'Prepare to begin'
    : phase === 'inhale' ? `Inhale through nose — ${inhale_seconds} seconds`
    : phase === 'exhale' ? `Exhale slowly — ${exhale_seconds} seconds`
    : ''

  const line2 = expr.show_microtext
    ? getMicroGuidance(currentRound, phase, protocolId)
    : ''

  return (
    <div
      className={styles.container}
      aria-label={`Breathing: ${phase}. Round ${currentRound} of ${rounds}.`}
    >
      {/*
       * orbWrapper is a fixed-size positioning context.
       * The animated orb sphere and the countdown are siblings here —
       * countdown is NOT a child of the scaled orb, so it never inherits
       * the orb's transform. Text size is fully decoupled from orb scale.
       */}
      <div className={styles.orbWrapper}>
        {/* Ping rings — D4-B4 visual identity, continuous outward pulse */}
        <div className={styles.pingRing} aria-hidden="true" />
        <div className={styles.pingRing} aria-hidden="true" />
        <div className={styles.pingRing} aria-hidden="true" />
        <div className={styles.pingRing} aria-hidden="true" />

        <motion.div
          className={styles.glowRing}
          initial={{ scale: expr.glow_scale_min, opacity: expr.glow_opacity_min * 0.5 }}
          animate={
            prefersReducedMotion
              ? { opacity: phase === 'inhale' ? expr.glow_opacity_max * 0.85 : expr.glow_opacity_min * 0.5 }
              : { scale: glowScale, opacity: glowOpacity }
          }
          transition={
            prefersReducedMotion ? { duration: 0.04 }
            : { duration: motionDuration, ease: motionEase }
          }
        />

        {/* Orb sphere — scales only. No text children. */}
        <motion.div
          className={styles.orb}
          initial={{ scale: expr.orb_scale_min }}
          animate={prefersReducedMotion ? {} : { scale: orbScale }}
          transition={
            prefersReducedMotion ? { duration: 0.04 }
            : { duration: motionDuration, ease: motionEase }
          }
        />

        {/* Countdown — absolutely centred over orb, not a child of scaled element */}
        {phase !== 'pause' && (
          <motion.span
            key={`${phase}-${countdown}`}
            className={styles.countdown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.04 : 0.16 }}
            aria-live="off"
          >
            {countdown}
          </motion.span>
        )}
      </div>

      {/* Single text slot — fixed min-height, always in DOM, content changes only */}
      <div className={styles.instructionSlot} aria-live="polite">
        {line1 && <p className={styles.instructionPrimary}>{line1}</p>}
        {line2 && <p className={styles.instructionSecondary}>{line2}</p>}
      </div>
    </div>
  )
}
