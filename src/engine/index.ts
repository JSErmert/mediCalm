// src/engine/index.ts
import type { PainInputState, RuntimeSession, SafetyAssessment } from '../types'
import { runSafetyPrecheck } from './safetyPrecheck'
import { scoreMechanisms } from './mechanismScoring'
import { selectProtocol } from './protocolSelection'
import { buildSession } from './sessionBuilder'

export type SessionResolution =
  | { kind: 'session'; session: RuntimeSession }
  | { kind: 'safety_stop'; assessment: SafetyAssessment }

export function resolveSession(input: PainInputState): SessionResolution {
  const safety = runSafetyPrecheck(input)

  if (safety.mode === 'SAFETY_STOP_MODE') {
    return { kind: 'safety_stop', assessment: safety }
  }

  const rankedMechanisms = scoreMechanisms(input)
  const protocol = selectProtocol(rankedMechanisms, input)
  const session = buildSession(protocol, input, safety)

  return { kind: 'session', session }
}
