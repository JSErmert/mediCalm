/**
 * DEV ONLY — buildDevSession
 *
 * Builds a RuntimeSession from a PainInputState by bypassing the safety check.
 * Used exclusively by RDReviewScreen. Never called in production code paths.
 *
 * The original safety assessment (SAFETY_STOP_MODE with flags) is preserved in
 * the returned session's safety_assessment field for audit purposes.
 * safety_override_used: true marks the session as a developer test override.
 *
 * Safety logic (runSafetyPrecheck, resolveSession) is unaffected.
 */
import type { PainInputState, RuntimeSession, SafetyAssessment } from '../types'
import { scoreMechanisms } from '../engine/mechanismScoring'
import { selectProtocol } from '../engine/protocolSelection'
import { buildSession } from '../engine/sessionBuilder'

export function buildDevSession(
  input: PainInputState,
  originalAssessment: SafetyAssessment,
): RuntimeSession {
  const rankedMechanisms = scoreMechanisms(input)
  const protocol = selectProtocol(rankedMechanisms, input)
  // Pass original assessment so safety_tags + stop_reason are preserved in storage
  const session = buildSession(protocol, input, originalAssessment)
  return { ...session, safety_override_used: true }
}
