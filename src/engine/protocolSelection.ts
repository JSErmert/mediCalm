// src/engine/protocolSelection.ts
import type { PainInputState, ProtocolDefinition } from '../types'
import { PROTOCOLS } from '../data/protocols'
import type { MechanismScore } from './mechanismScoring'

/**
 * Authority: Execution Spec (doc 04) § 4. Protocol Selection Engine
 *            Mechanism + Protocol Mapping (doc 19) § Protocol Entry Decision Matrix
 */

/** Ordered protocol candidates per top mechanism. First valid entry wins. */
const ENTRY_CANDIDATES: Record<string, string[]> = {
  MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION: ['PROTO_BURNING_NERVE_CALM_RESET'],
  MECH_GENERAL_OVERPROTECTION_STATE:         ['PROTO_SUPPORTED_FORWARD_LEAN_RESET', 'PROTO_RIB_EXPANSION_RESET'],
  MECH_JAW_CERVICAL_CO_CONTRACTION:          ['PROTO_JAW_UNCLENCH_RESET'],
  MECH_POSTURAL_COMPRESSION:                 ['PROTO_SEATED_DECOMPRESSION_RESET', 'PROTO_RIB_EXPANSION_RESET'],
  MECH_RIB_RESTRICTION:                      ['PROTO_RIB_EXPANSION_RESET', 'PROTO_SEATED_DECOMPRESSION_RESET'],
  MECH_CERVICAL_GUARDING:                    ['PROTO_RIB_EXPANSION_RESET', 'PROTO_SEATED_DECOMPRESSION_RESET'],
}

/** Display modes that involve active movement. Blocked under nerve or high-pain conditions. */
const MOVEMENT_MODES = ['breath_with_micro_movement', 'position_with_breath'] as const

function isMovementProtocol(p: ProtocolDefinition): boolean {
  return (MOVEMENT_MODES as readonly string[]).includes(p.display_mode)
}

function buildBlockedIds(rankedScores: MechanismScore[], input: PainInputState): Set<string> {
  const blocked = new Set<string>()

  const nerveInTop3 = rankedScores
    .slice(0, 3)
    .some((s) => s.mechanism_id === 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')

  for (const p of PROTOCOLS) {
    if (nerveInTop3 && isMovementProtocol(p)) blocked.add(p.protocol_id)
    if (input.pain_level >= 7 && isMovementProtocol(p)) blocked.add(p.protocol_id)
  }

  return blocked
}

export function selectProtocol(
  rankedScores: MechanismScore[],
  input: PainInputState,
): ProtocolDefinition {
  const protocolMap = new Map(PROTOCOLS.map((p) => [p.protocol_id, p]))
  const blocked = buildBlockedIds(rankedScores, input)

  // Walk ranked mechanisms, try each candidate in order
  for (const { mechanism_id } of rankedScores) {
    const candidates = ENTRY_CANDIDATES[mechanism_id] ?? []
    for (const candidateId of candidates) {
      if (blocked.has(candidateId)) continue
      const protocol = protocolMap.get(candidateId)
      if (protocol) return protocol
    }
  }

  // Safe fallback: PROTO_RIB_EXPANSION_RESET (breath_with_body_cue, always safe)
  return protocolMap.get('PROTO_RIB_EXPANSION_RESET')!
}
