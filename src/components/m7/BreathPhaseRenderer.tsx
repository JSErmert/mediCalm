/**
 * BreathPhaseRenderer — renders an M7 BreathPhase using the legacy BreathingOrb
 * visualization. Visually identical to a pre-M7.2 breath session: the orb
 * scale animation, countdown, instruction text, and round tracking all flow
 * through BreathingOrb. M7.2's contribution is wrapping it in the multi-phase
 * state machine — the orb itself is unchanged.
 *
 * Authority: docs/superpowers/specs/2026-05-05-m7-pt-pathway-foundation-design.md §3.2
 */
import { BreathingOrb } from '../BreathingOrb'
import { BREATH_FAMILIES } from '../../engine/hari/breathFamily'
import type { BreathPhase } from '../../types/m7'
import type { ExpressionProfile } from '../../engine/presentation/expressionProfile'

type Props = {
  phase: BreathPhase
  onComplete: () => void
  /** Optional — falls back to BreathingOrb's DEFAULT_EXPRESSION when absent. */
  expressionProfile?: ExpressionProfile
  /** Optional — drives micro-guidance copy. */
  protocolId?: string
}

export function BreathPhaseRenderer({ phase, onComplete, expressionProfile, protocolId }: Props) {
  const family = BREATH_FAMILIES[phase.breath_family]
  const timingProfile = {
    inhale_seconds: family.inhaleSeconds,
    exhale_seconds: family.exhaleSeconds,
    rounds: phase.num_cycles,
  }

  return (
    <div role="region" aria-label="Breath phase">
      {phase.cue.opening && <p>{phase.cue.opening}</p>}
      <BreathingOrb
        timingProfile={timingProfile}
        expressionProfile={expressionProfile}
        protocolId={protocolId}
        onAllRoundsComplete={onComplete}
        gentleLabels
      />
      {phase.cue.closing && <p>{phase.cue.closing}</p>}
    </div>
  )
}
