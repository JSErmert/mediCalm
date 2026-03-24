// src/engine/sessionBuilder.test.ts
import { describe, it, expect } from 'vitest'
import { buildSession } from './sessionBuilder'
import type { PainInputState, ProtocolDefinition, SafetyAssessment } from '../types'

const mockProtocol: ProtocolDefinition = {
  protocol_id: 'PROTO_RIB_EXPANSION_RESET',
  protocol_name: 'Rib Expansion Reset',
  goal: 'Reduce compression and restore rib motion.',
  primary_mechanisms: ['MECH_RIB_RESTRICTION'],
  display_mode: 'breath_with_body_cue',
  default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 8 },
  cue_sequence: ['Inhale four. Expand ribs.', 'Exhale seven. Drop shoulders.', 'Jaw loose. Neck soft.'],
  microtext_options: [],
  safe_use_cases: [],
  caution_flags: [],
  stop_conditions: ['dizziness'],
  follow_up_candidates: ['PROTO_GENTLE_CERVICAL_RECONNECTION'],
  provenance_tags: ['product_inference'],
}

const mockInput: PainInputState = {
  pain_level: 5,
  location_tags: ['ribs'],
  symptom_tags: ['tightness'],
}

const mockSafety: SafetyAssessment = {
  mode: 'DIRECT_SESSION_MODE',
  safety_tags: [],
  stop_reason: null,
}

describe('buildSession', () => {
  it('returns a RuntimeSession with all required fields populated', () => {
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(session.session_id).toMatch(/^sess_/)
    expect(session.protocol_id).toBe('PROTO_RIB_EXPANSION_RESET')
    expect(session.protocol_name).toBe('Rib Expansion Reset')
    expect(session.goal).toBe('Reduce compression and restore rib motion.')
    expect(session.display_mode).toBe('breath_with_body_cue')
    expect(session.timing_profile).toEqual({ inhale_seconds: 4, exhale_seconds: 7, rounds: 8 })
    expect(session.cue_sequence).toHaveLength(3)
    expect(session.status).toBe('completed')
    expect(session.pain_input).toEqual(mockInput)
    expect(session.safety_assessment).toEqual(mockSafety)
  })

  it('computes estimated_length_seconds correctly', () => {
    // (4 + 7 + 0.4) * 8 = 11.4 * 8 = 91.2 → floor → 91
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(session.estimated_length_seconds).toBe(91)
  })

  it('creates a valid ISO 8601 created_at timestamp', () => {
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(() => new Date(session.created_at)).not.toThrow()
    expect(session.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('generates unique session_ids', () => {
    const a = buildSession(mockProtocol, mockInput, mockSafety)
    const b = buildSession(mockProtocol, mockInput, mockSafety)
    expect(a.session_id).not.toBe(b.session_id)
  })

  it('copies stop_conditions and follow_up_candidates from protocol', () => {
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(session.stop_conditions).toContain('dizziness')
    expect(session.allowed_follow_up).toContain('PROTO_GENTLE_CERVICAL_RECONNECTION')
  })
})
