// src/engine/protocolSelection.test.ts
import { describe, it, expect } from 'vitest'
import { selectProtocol } from './protocolSelection'
import type { PainInputState } from '../types'
import type { MechanismScore } from './mechanismScoring'

function makeScores(topId: string, rest: string[] = []): MechanismScore[] {
  return [
    { mechanism_id: topId, score: 20 },
    ...rest.map((id, i) => ({ mechanism_id: id, score: 10 - i })),
  ]
}

describe('selectProtocol', () => {
  it('selects PROTO_REDUCED_EFFORT when MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION is top', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['arm'], symptom_tags: ['burning'] }
    const scores = makeScores('MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_REDUCED_EFFORT')
  })

  it('selects PROTO_CALM_DOWNREGULATE when MECH_RIB_RESTRICTION is top', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['ribs'], symptom_tags: ['tightness'] }
    const scores = makeScores('MECH_RIB_RESTRICTION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_CALM_DOWNREGULATE')
  })

  it('selects PROTO_CALM_DOWNREGULATE when MECH_JAW_CERVICAL_CO_CONTRACTION is top', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['jaw'], symptom_tags: ['tightness'] }
    const scores = makeScores('MECH_JAW_CERVICAL_CO_CONTRACTION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_CALM_DOWNREGULATE')
  })

  it('selects PROTO_STABILIZE_BALANCE when MECH_POSTURAL_COMPRESSION is top and pain is low', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['lower_back'], symptom_tags: ['pressure'] }
    const scores = makeScores('MECH_POSTURAL_COMPRESSION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_STABILIZE_BALANCE')
  })

  it('blocks PROTO_STABILIZE_BALANCE when MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION is in top 3', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['arm'], symptom_tags: ['burning'] }
    const scores = [
      { mechanism_id: 'MECH_RIB_RESTRICTION', score: 20 },
      { mechanism_id: 'MECH_POSTURAL_COMPRESSION', score: 15 },
      { mechanism_id: 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION', score: 10 },
    ]
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).not.toBe('PROTO_STABILIZE_BALANCE')
  })

  it('blocks PROTO_STABILIZE_BALANCE when pain_level >= 7', () => {
    const input: PainInputState = { pain_level: 7, location_tags: ['back_neck'], symptom_tags: ['stiffness'] }
    const scores = makeScores('MECH_CERVICAL_GUARDING')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).not.toBe('PROTO_STABILIZE_BALANCE')
  })

  it('always returns a valid ProtocolDefinition (never undefined)', () => {
    const input: PainInputState = { pain_level: 3, location_tags: ['shoulders'], symptom_tags: ['aching'] }
    const scores = makeScores('MECH_GENERAL_OVERPROTECTION_STATE')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBeDefined()
    expect(protocol.cue_sequence.length).toBeGreaterThan(0)
  })

  it('uses hariHintProtocolId when provided and not blocked', () => {
    const input: PainInputState = { pain_level: 3, location_tags: ['ribs'], symptom_tags: ['tightness'] }
    const scores = makeScores('MECH_RIB_RESTRICTION')
    const protocol = selectProtocol(scores, input, 'PROTO_STABILIZE_BALANCE')
    expect(protocol.protocol_id).toBe('PROTO_STABILIZE_BALANCE')
  })

  it('ignores hariHintProtocolId when it is blocked', () => {
    const input: PainInputState = { pain_level: 8, location_tags: ['arm'], symptom_tags: ['burning'] }
    const scores = makeScores('MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')
    // STABILIZE_BALANCE is blocked: pain >= 7 AND nerve symptom
    const protocol = selectProtocol(scores, input, 'PROTO_STABILIZE_BALANCE')
    expect(protocol.protocol_id).not.toBe('PROTO_STABILIZE_BALANCE')
  })
})
