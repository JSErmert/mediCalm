import { useCallback, useEffect, useRef, useState } from 'react'
import { BreathPhaseRenderer } from './BreathPhaseRenderer'
import { IntroTransition } from './IntroTransition'
import { BetweenTransition } from './BetweenTransition'
import { ClosingTransition } from './ClosingTransition'
import { getTemplate } from '../../data/m7Templates'
import type { PTVariant, Phase, TransitionPhase } from '../../types/m7'
import type { ExpressionProfile } from '../../engine/presentation/expressionProfile'
import styles from './PhaseRenderer.module.css'

type Props = {
  variant: PTVariant
  onPhaseStart: (
    phase_index: number,
    phase_type: 'breath' | 'position_hold' | 'transition',
    phase_subtype: 'intro' | 'between' | 'closing' | undefined,
  ) => void
  onPhaseEnd: (phase_index: number) => void
  onSessionComplete: () => void
  /** Forwarded to BreathPhaseRenderer → BreathingOrb for visual styling. Optional. */
  expressionProfile?: ExpressionProfile
  /** Forwarded to BreathingOrb for protocol-specific micro-guidance copy. Optional. */
  protocolId?: string
  /** Clinical context — top-zone protocol/pathway name. Forwarded to BreathPhaseRenderer. */
  sessionName?: string
  /** Clinical context — top-zone diaphragmatic / opening cue. Forwarded to BreathPhaseRenderer. */
  diaphragmaticCue?: string
  /** Clinical context — top-zone duration label. Forwarded to BreathPhaseRenderer. */
  durationLabel?: string
  /** Clinical context — Scope A position note. Forwarded to BreathPhaseRenderer. */
  positionCue?: string
}

export function PhaseRenderer({
  variant,
  onPhaseStart,
  onPhaseEnd,
  onSessionComplete,
  expressionProfile,
  protocolId,
  sessionName,
  diaphragmaticCue,
  durationLabel,
  positionCue,
}: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const phase: Phase | undefined = variant.phases[phaseIndex]

  // Fire onPhaseStart on each phase entry
  const startedRef = useRefInitOnce(phaseIndex, () => {
    if (!phase) return
    const subtype = phase.type === 'transition' ? phase.subtype : undefined
    onPhaseStart(phaseIndex, phase.type, subtype)
  })
  void startedRef

  const handlePhaseComplete = useCallback(() => {
    onPhaseEnd(phaseIndex)
    if (phaseIndex + 1 >= variant.phases.length) {
      onSessionComplete()
    } else {
      setPhaseIndex(phaseIndex + 1)
    }
  }, [phaseIndex, variant.phases.length, onPhaseEnd, onSessionComplete])

  if (!phase) return null

  return (
    <div className={styles.container}>
      {phase.type === 'breath' && (
        <BreathPhaseRenderer
          phase={phase}
          onComplete={handlePhaseComplete}
          expressionProfile={expressionProfile}
          protocolId={protocolId}
          sessionName={sessionName}
          diaphragmaticCue={diaphragmaticCue}
          durationLabel={durationLabel}
          positionCue={positionCue}
        />
      )}
      {phase.type === 'transition' && (
        <TransitionDispatcher phase={phase} onComplete={handlePhaseComplete} />
      )}
    </div>
  )
}

function TransitionDispatcher({ phase, onComplete }: { phase: TransitionPhase; onComplete: () => void }) {
  const tmpl = getTemplate(phase.template_id, phase.template_version)
  const copy = tmpl.copy
  const subtitle = phase.subtitle
  switch (phase.subtype) {
    case 'intro':
      return <IntroTransition copy={copy} subtitle={subtitle} onComplete={onComplete} />
    case 'between':
      return <BetweenTransition copy={copy} subtitle={subtitle} onComplete={onComplete} />
    case 'closing':
      return <ClosingTransition copy={copy} subtitle={subtitle} onComplete={onComplete} />
  }
}

// Helper: fires `effect` once per `key` change, returning a sentinel.
function useRefInitOnce(key: number | string, effect: () => void) {
  const lastKey = useRef<number | string | null>(null)
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key
      effect()
    }
  }, [key, effect])
  return lastKey
}
