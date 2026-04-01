// src/engine/protocolSelection.ts
import type { PainInputState, ProtocolDefinition } from '../types'
import { PROTOCOLS } from '../data/protocols'
import type { MechanismScore } from './mechanismScoring'

/**
 * Authority: Execution Spec (doc 04) § 4. Protocol Selection Engine
 *            Mechanism + Protocol Mapping (doc 19) § Protocol Entry Decision Matrix
 */

/**
 * Ordered protocol candidates per top mechanism. First valid entry wins.
 * Authority: M3.1.1 — Final protocol set + deterministic selection mapping.
 *
 * PROTO_REDUCED_EFFORT    — nerve/burning/sensitivity → 3s/5s, minimal stimulus
 * PROTO_CALM_DOWNREGULATE — tension/guarding/moderate pain → 4s/7s, default fallback
 * PROTO_STABILIZE_BALANCE — low-moderate/stable/stiffness → 5s/5s, balanced
 */
const ENTRY_CANDIDATES: Record<string, string[]> = {
  MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION: ['PROTO_REDUCED_EFFORT'],
  MECH_GENERAL_OVERPROTECTION_STATE:         ['PROTO_CALM_DOWNREGULATE'],
  MECH_JAW_CERVICAL_CO_CONTRACTION:          ['PROTO_CALM_DOWNREGULATE'],
  MECH_CERVICAL_GUARDING:                    ['PROTO_CALM_DOWNREGULATE'],
  MECH_POSTURAL_COMPRESSION:                 ['PROTO_STABILIZE_BALANCE', 'PROTO_CALM_DOWNREGULATE'],
  MECH_RIB_RESTRICTION:                      ['PROTO_CALM_DOWNREGULATE', 'PROTO_STABILIZE_BALANCE'],
}

/**
 * Symptom tags that indicate nerve involvement or high sensitivity.
 * When present, PROTO_STABILIZE_BALANCE is inappropriate — route to CALM or REDUCED instead.
 */
const NERVE_SYMPTOM_TAGS = new Set([
  'burning', 'tingling', 'numbness', 'nerve_like', 'radiating',
])

/**
 * Returns the set of protocol IDs that should not be selected given the current input.
 *
 * Rule: PROTO_STABILIZE_BALANCE is only appropriate for low-moderate, non-sensitive states.
 * It is blocked when:
 *   - pain ≥ 7 (high pain warrants calming, not stabilizing)
 *   - nerve mechanism is in the top 3 scored mechanisms
 *   - any nerve/sensitivity symptom tag is present
 *
 * PROTO_CALM_DOWNREGULATE and PROTO_REDUCED_EFFORT are NEVER blocked.
 * The system always resolves to a protocol — no path ends without a session.
 */
function buildBlockedIds(rankedScores: MechanismScore[], input: PainInputState): Set<string> {
  const blocked = new Set<string>()

  const nerveInTop3 = rankedScores
    .slice(0, 3)
    .some((s) => s.mechanism_id === 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')

  const hasNerveSymptom = input.symptom_tags.some((t) => NERVE_SYMPTOM_TAGS.has(t))

  if (input.pain_level >= 7 || nerveInTop3 || hasNerveSymptom) {
    blocked.add('PROTO_STABILIZE_BALANCE')
  }

  return blocked
}

export function selectProtocol(
  rankedScores: MechanismScore[],
  input: PainInputState,
  /** Optional HARI M4.5 hint — use this protocol ID if not blocked. */
  hariHintProtocolId?: string,
): ProtocolDefinition {
  const protocolMap = new Map(PROTOCOLS.map((p) => [p.protocol_id, p]))
  const blocked = buildBlockedIds(rankedScores, input)

  // M4.5 hint: use HARI's selected protocol if it exists and is not blocked
  if (hariHintProtocolId && !blocked.has(hariHintProtocolId)) {
    const hinted = protocolMap.get(hariHintProtocolId)
    if (hinted) return hinted
  }

  // Walk ranked mechanisms, try each candidate in order
  for (const { mechanism_id } of rankedScores) {
    const candidates = ENTRY_CANDIDATES[mechanism_id] ?? []
    for (const candidateId of candidates) {
      if (blocked.has(candidateId)) continue
      const protocol = protocolMap.get(candidateId)
      if (protocol) return protocol
    }
  }

  // Safe fallback: PROTO_CALM_DOWNREGULATE — 4/7, always safe, default for uncertain cases
  return protocolMap.get('PROTO_CALM_DOWNREGULATE')!
}
