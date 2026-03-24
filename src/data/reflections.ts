/**
 * Session reflections — M2.5
 *
 * Deterministic, protocol-specific one-line observations shown after session completion.
 * Tone: neutral, mechanism-grounded, factual. No diagnosis, no overclaiming, no motivation.
 *
 * Authority: Safety + Reassurance Spec (doc 06) — claims limits
 *            Source Truth Doctrine (doc 02) — source boundaries
 */

export const SESSION_REFLECTIONS: Record<string, string> = {
  PROTO_RIB_EXPANSION_RESET:
    'Restoring rib movement can reduce the tension that accumulates with shallow breathing.',

  PROTO_SEATED_DECOMPRESSION_RESET:
    'Breathing with less effort allows compression from sustained sitting to reduce.',

  PROTO_GENTLE_CERVICAL_RECONNECTION:
    'Breath-linked movement can help settle protective patterns held in the neck.',

  PROTO_JAW_UNCLENCH_RESET:
    'Releasing jaw tension reduces effort carried through the neck and upper back.',

  PROTO_BURNING_NERVE_CALM_RESET:
    'Reducing physical effort lowers the input that sensitised nerve pathways respond to.',

  PROTO_SUPPORTED_FORWARD_LEAN_RESET:
    'A forward-supported position shifts load away from the front of the neck and upper chest.',
}

export function getSessionReflection(protocolId: string): string | null {
  return SESSION_REFLECTIONS[protocolId] ?? null
}
