// src/engine/sessionBuilder.ts
import type { PainInputState, ProtocolDefinition, RuntimeSession, SafetyAssessment } from '../types'

export function buildSession(
  protocol: ProtocolDefinition,
  input: PainInputState,
  safety: SafetyAssessment,
): RuntimeSession {
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const { inhale_seconds, exhale_seconds, rounds } = protocol.default_timing_profile
  const estimated = Math.floor((inhale_seconds + exhale_seconds + 0.4) * rounds)

  return {
    session_id: id,
    created_at: new Date().toISOString(),
    protocol_id: protocol.protocol_id,
    protocol_name: protocol.protocol_name,
    goal: protocol.goal,
    display_mode: protocol.display_mode,
    timing_profile: protocol.default_timing_profile,
    cue_sequence: protocol.cue_sequence,
    estimated_length_seconds: estimated,
    status: 'completed',
    stop_conditions: protocol.stop_conditions,
    allowed_follow_up: protocol.follow_up_candidates,
    provenance_tags: protocol.provenance_tags,
    pain_input: input,
    safety_assessment: safety,
  }
}
