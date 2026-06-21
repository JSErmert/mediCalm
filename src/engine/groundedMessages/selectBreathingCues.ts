/**
 * Deterministic per-session breathing-cue selection (Grounded Guidance Layer 3).
 * Pure: no clock, no randomness (INV-1). Built once at session start.
 * Authority: docs/apex-bundle/grounded-guidance/07-layer3-in-session-carousel-spec.md
 */
import type { BreathingCue, CueSessionInput, SessionCues } from '../../types/breathingCue'
import { BREATHING_CUES } from '../../data/breathingCues'

function included(cue: BreathingCue, input: CueSessionInput): boolean {
  if (cue.core) return true
  const cond = cue.condition
  if (!cond) return false
  if (cond.locationIncludes) {
    const loc = new Set(input.location ?? [])
    if (cond.locationIncludes.some((t) => loc.has(t))) return true
  }
  if (cond.goalIncludes && input.goal && cond.goalIncludes.includes(input.goal)) return true
  if (cond.locationPatternIncludes && input.locationPattern &&
      cond.locationPatternIncludes.includes(input.locationPattern)) return true
  return false
}

export function selectBreathingCues(
  input: CueSessionInput,
  bank: BreathingCue[] = BREATHING_CUES,
): SessionCues {
  const chosen = bank.filter((c) => included(c, input))
  return {
    setupCues: chosen.filter((c) => c.phase === 'setup'),
    inSessionCues: chosen.filter((c) => c.phase === 'in_session'),
  }
}
