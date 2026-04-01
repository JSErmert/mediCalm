/**
 * MediCalm Micro-Guidance System — M3.2.3
 *
 * Pure, deterministic function: (round, phase, protocolId) → guidance string.
 * No state. No side effects. Returns '' when no guidance should show.
 *
 * Schedule:
 *   entry / pause  — always ''
 *   round 1 inhale — intro 1: effort phrase
 *   round 1 exhale — intro 2: reach phrase
 *   round 2 inhale — intro 3: expand phrase
 *   round 2 exhale → round 3 — gap (settling)
 *   round 4+ inhale — continuation: protocol-specific frequency + rotation
 *   exhale after round 1 — always ''
 *
 * Protocol tuning affects continuation only (intro sequence is identical):
 *   PROTO_REDUCED_EFFORT    — every 3 rounds, emphasise effort phrase
 *   PROTO_CALM_DOWNREGULATE — every 2 rounds, rotate reach → expand → effort
 *   PROTO_STABILIZE_BALANCE — every 2 rounds, rotate effort → reach
 */

const MSG_EFFORT = 'No need to force it.'
const MSG_REACH  = 'Let the breath reach that area.'
const MSG_EXPAND = 'Let the breath expand in all directions.'

interface ContinuationConfig {
  messages: readonly string[]
  every: number
}

const CONTINUATION: Record<string, ContinuationConfig> = {
  PROTO_REDUCED_EFFORT: {
    messages: [MSG_EFFORT],
    every: 3,
  },
  PROTO_CALM_DOWNREGULATE: {
    messages: [MSG_REACH, MSG_EXPAND, MSG_EFFORT],
    every: 2,
  },
  PROTO_STABILIZE_BALANCE: {
    messages: [MSG_EFFORT, MSG_REACH],
    every: 2,
  },
}

const DEFAULT_CONTINUATION = CONTINUATION.PROTO_CALM_DOWNREGULATE

/**
 * Returns the micro-guidance string for a given breath state.
 *
 * @param round      1-indexed current round
 * @param phase      current orb phase
 * @param protocolId active protocol ID (optional — falls back to default)
 */
export function getMicroGuidance(
  round: number,
  phase: 'inhale' | 'exhale' | 'entry' | 'pause',
  protocolId?: string,
): string {
  if (phase === 'entry' || phase === 'pause') return ''

  // Intro sequence — first 3 targeted phases
  if (round === 1 && phase === 'inhale') return MSG_EFFORT
  if (round === 1 && phase === 'exhale') return MSG_REACH
  if (round === 2 && phase === 'inhale') return MSG_EXPAND

  // Continuation — inhale only, starting from round 4
  if (phase !== 'inhale' || round < 4) return ''

  const config = (protocolId ? CONTINUATION[protocolId] : undefined) ?? DEFAULT_CONTINUATION
  const { messages, every } = config

  if ((round - 4) % every !== 0) return ''

  const index = Math.floor((round - 4) / every) % messages.length
  return messages[index]
}
