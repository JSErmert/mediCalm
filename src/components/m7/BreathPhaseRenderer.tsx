import { useEffect } from 'react'
import { BREATH_FAMILIES } from '../../engine/hari/breathFamily'
import type { BreathPhase } from '../../types/m7'

type Props = {
  phase: BreathPhase
  onComplete: () => void
}

export function BreathPhaseRenderer({ phase, onComplete }: Props) {
  const family = BREATH_FAMILIES[phase.breath_family]
  const cycleSeconds = family.inhaleSeconds + family.exhaleSeconds + (family.holdSeconds ?? 0)
  const totalMs = cycleSeconds * phase.num_cycles * 1000

  useEffect(() => {
    const id = setTimeout(onComplete, totalMs)
    return () => clearTimeout(id)
  }, [totalMs, onComplete])

  return (
    <div role="region" aria-label="Breath phase">
      <p>{phase.cue.opening}</p>
      {phase.cue.mid && <p>{phase.cue.mid}</p>}
      <p>{phase.cue.closing}</p>
    </div>
  )
}
