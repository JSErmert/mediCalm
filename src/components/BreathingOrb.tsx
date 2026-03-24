// src/components/BreathingOrb.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { TimingProfile } from '../types'
import type { ExpressionProfile } from '../engine/expressionProfile'
import styles from './BreathingOrb.module.css'

interface Props {
  timingProfile: TimingProfile
  expressionProfile?: ExpressionProfile
  onRoundComplete?: (roundNumber: number) => void
  onAllRoundsComplete?: () => void
  cueText?: string
}

type Phase = 'inhale' | 'exhale' | 'reset'

// Default expression matches the M2 baseline (moderate profile values)
const DEFAULT_EXPRESSION: Pick<
  ExpressionProfile,
  'orb_scale_min' | 'orb_scale_max' | 'glow_scale_min' | 'glow_scale_max' | 'glow_opacity_min' | 'glow_opacity_max'
> = {
  orb_scale_min: 0.72,
  orb_scale_max: 1.0,
  glow_scale_min: 0.55,
  glow_scale_max: 0.85,
  glow_opacity_min: 0.35,
  glow_opacity_max: 0.55,
}

export function BreathingOrb({
  timingProfile,
  expressionProfile,
  onRoundComplete,
  onAllRoundsComplete,
  cueText,
}: Props) {
  const { inhale_seconds, exhale_seconds, rounds } = timingProfile
  const expr = expressionProfile ?? DEFAULT_EXPRESSION
  const prefersReducedMotion = useReducedMotion()

  const [phase, setPhase] = useState<Phase>('inhale')
  const [countdown, setCountdown] = useState(inhale_seconds)
  const [currentRound, setCurrentRound] = useState(1)
  const [showCountdown, setShowCountdown] = useState(true)

  const roundRef = useRef(1)
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return

    let interval: ReturnType<typeof setInterval>
    let remaining = inhale_seconds

    function startInhale() {
      setPhase('inhale')
      remaining = inhale_seconds
      setCountdown(remaining)
      setShowCountdown(true)

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
      remaining = exhale_seconds
      setCountdown(remaining)
      setShowCountdown(true)

      interval = setInterval(() => {
        remaining -= 1
        if (remaining >= 1) {
          setCountdown(remaining)
        } else {
          clearInterval(interval)
          startReset()
        }
      }, 1000)
    }

    function startReset() {
      setPhase('reset')
      setShowCountdown(false)
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
      }, 400)
    }

    startInhale()
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derive scale/opacity from expression profile
  const orbScale = phase === 'inhale' ? expr.orb_scale_max : expr.orb_scale_min
  const glowScale = phase === 'inhale' ? expr.glow_scale_max : expr.glow_scale_min
  const glowOpacity =
    phase === 'reset'
      ? expr.glow_opacity_min * 0.7
      : phase === 'inhale'
        ? expr.glow_opacity_max
        : expr.glow_opacity_min

  const inhaleEase = [0.25, 0.46, 0.45, 0.94] as const
  const exhaleEase = [0.33, 0.0, 0.67, 1.0] as const
  const duration = phase === 'inhale' ? inhale_seconds : phase === 'exhale' ? exhale_seconds : 0.2
  const ease = phase === 'inhale' ? inhaleEase : exhaleEase

  return (
    <div
      className={styles.container}
      aria-label={`Breathing: ${phase}. Round ${currentRound} of ${rounds}.`}
    >
      <motion.div
        className={styles.glowRing}
        animate={
          prefersReducedMotion
            ? { opacity: phase === 'inhale' ? expr.glow_opacity_max * 0.9 : expr.glow_opacity_min }
            : { scale: glowScale, opacity: glowOpacity }
        }
        transition={prefersReducedMotion ? { duration: 0.04 } : { duration, ease }}
      />
      <motion.div
        className={styles.orb}
        animate={prefersReducedMotion ? {} : { scale: orbScale }}
        transition={prefersReducedMotion ? { duration: 0.04 } : { duration, ease }}
      >
        {showCountdown && (
          <motion.span
            key={countdown}
            className={styles.countdown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.04 : 0.1 }}
            aria-live="off"
          >
            {countdown}
          </motion.span>
        )}
      </motion.div>
      {cueText && (
        <p className={styles.cueText} aria-live="polite">
          {cueText}
        </p>
      )}
    </div>
  )
}
