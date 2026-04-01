/**
 * Session reflections — M3.1.1
 *
 * Deterministic, protocol-specific one-line observations shown after session completion.
 * Tone: neutral, mechanism-grounded, factual. No diagnosis, no overclaiming, no motivation.
 *
 * Authority: Safety + Reassurance Spec (doc 06) — claims limits
 *            Source Truth Doctrine (doc 02) — source boundaries
 */

export const SESSION_REFLECTIONS: Record<string, string> = {
  PROTO_REDUCED_EFFORT:
    'Reducing physical effort lowers the input that sensitised nerve pathways respond to.',

  PROTO_CALM_DOWNREGULATE:
    'A longer exhale activates the system pathways associated with calming and tension release.',

  PROTO_STABILIZE_BALANCE:
    'Equal inhale and exhale supports a steady, regulated breathing pattern without overcorrection.',
}

export function getSessionReflection(protocolId: string): string | null {
  return SESSION_REFLECTIONS[protocolId] ?? null
}
