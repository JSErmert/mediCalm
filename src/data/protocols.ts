/**
 * MediCalm Protocol Library
 * Authority: Protocol Library (doc 13), Mechanism + Protocol Mapping (doc 19)
 *
 * The runtime engine selects from this library. It does not invent new protocols.
 * All timing profiles use 4s inhale / 7s exhale as the standard breathing model.
 * Cue sequence strings must remain short: max 5 words per cue.
 * Provenance labels reflect the source boundary level of each protocol.
 */
import type { ProtocolDefinition } from '../types'

export const PROTOCOLS: ProtocolDefinition[] = [
  {
    protocol_id: 'PROTO_RIB_EXPANSION_RESET',
    protocol_name: 'Rib Expansion Reset',
    goal: 'Reduce compression and restore rib motion before more specific movement.',
    support_mode: 'Seated or slightly reclined',
    primary_mechanisms: [
      'MECH_RIB_RESTRICTION',
      'MECH_POSTURAL_COMPRESSION',
      'MECH_GENERAL_OVERPROTECTION_STATE',
    ],
    display_mode: 'breath_with_body_cue',
    default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 8 },
    cue_sequence: [
      'Inhale four. Expand ribs.',
      'Exhale seven. Drop shoulders.',
      'Jaw loose. Neck soft.',
    ],
    microtext_options: [
      'Let the back ribs widen.',
      'Do not force the breath.',
      'Use less effort here.',
    ],
    safe_use_cases: [
      'broad tightness with shallow breathing',
      'sitting or bracing compression state',
      'jaw and neck tension with rib restriction pattern',
    ],
    caution_flags: ['dizziness', 'worsening nerve symptoms'],
    stop_conditions: [
      'dizziness',
      'major_pain_spike',
      'severe_shortness_of_breath',
      'worsening_numbness',
      'new_weakness',
    ],
    follow_up_candidates: [
      'PROTO_GENTLE_CERVICAL_RECONNECTION',
      'PROTO_SEATED_DECOMPRESSION_RESET',
    ],
    provenance_tags: ['product_inference', 'design_decision'],
  },
  {
    protocol_id: 'PROTO_SEATED_DECOMPRESSION_RESET',
    protocol_name: 'Seated Decompression Reset',
    goal: 'Reduce seated compression and bracing without forcing posture correction.',
    support_mode: 'Seated upright, feet flat',
    primary_mechanisms: [
      'MECH_POSTURAL_COMPRESSION',
      'MECH_GENERAL_OVERPROTECTION_STATE',
    ],
    display_mode: 'breath_with_posture_cue',
    default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 6 },
    cue_sequence: [
      'Sit tall. Stay unforced.',
      'Expand back ribs on inhale.',
      'Exhale slowly. Let bracing drop.',
    ],
    microtext_options: [
      'Do not puff the chest.',
      'Keep the jaw quiet.',
      'Tall and relaxed.',
    ],
    safe_use_cases: [
      'seated or car-triggered flare',
      'compression with bracing',
    ],
    caution_flags: ['dizziness', 'worsening arm symptoms'],
    stop_conditions: [
      'major_pain_spike',
      'new_weakness',
      'worsening_numbness',
      'severe_shortness_of_breath',
    ],
    follow_up_candidates: ['PROTO_RIB_EXPANSION_RESET'],
    provenance_tags: ['product_inference', 'design_decision'],
  },
  {
    protocol_id: 'PROTO_GENTLE_CERVICAL_RECONNECTION',
    protocol_name: 'Gentle Cervical Reconnection',
    goal: 'Reintroduce low-intensity neck organisation after calming and decompression.',
    support_mode: 'Seated, neck relaxed',
    primary_mechanisms: [
      'MECH_CERVICAL_GUARDING',
      'MECH_JAW_CERVICAL_CO_CONTRACTION',
    ],
    display_mode: 'breath_with_micro_movement',
    default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 5 },
    cue_sequence: [
      'Inhale four. Stay soft.',
      'Exhale seven. Small chin ease.',
      'Neck long. No forcing.',
    ],
    microtext_options: [],
    safe_use_cases: [
      'cervical guarding after successful rib decompression',
      'follow-up to rib expansion reset',
    ],
    caution_flags: [
      'high pain severity',
      'sharp pain with neck motion',
      'worsening radiating symptoms',
    ],
    stop_conditions: [
      'radiating_symptom_spike',
      'new_weakness',
      'dizziness',
      'worsening_numbness',
    ],
    follow_up_candidates: [],
    provenance_tags: ['product_inference', 'validation_needed'],
  },
  {
    protocol_id: 'PROTO_JAW_UNCLENCH_RESET',
    protocol_name: 'Jaw Unclench Reset',
    goal: 'Reduce jaw guarding when linked to neck tension, bracing, or overprotection.',
    support_mode: 'Any comfortable position',
    primary_mechanisms: [
      'MECH_JAW_CERVICAL_CO_CONTRACTION',
      'MECH_GENERAL_OVERPROTECTION_STATE',
    ],
    display_mode: 'breath_with_body_cue',
    default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 6 },
    cue_sequence: [
      'Unclench gently. Teeth apart.',
      'Exhale slowly. Tongue stays easy.',
      'Let neck soften with breath.',
    ],
    microtext_options: [],
    safe_use_cases: [
      'jaw tension linked to neck guarding or stress',
      'bracing with jaw involvement',
    ],
    caution_flags: [
      'locking jaw',
      'severe ear pain',
      'acute dental concern',
    ],
    stop_conditions: [
      'sudden_worsening_jaw_instability',
      'sharp_escalating_pain',
      'new_neurologic_symptoms',
    ],
    follow_up_candidates: ['PROTO_RIB_EXPANSION_RESET'],
    provenance_tags: ['product_inference', 'design_decision'],
  },
  {
    protocol_id: 'PROTO_BURNING_NERVE_CALM_RESET',
    protocol_name: 'Burning Nerve Calm Reset',
    goal: 'Downshift protection when burning or nerve-like discomfort is prominent.',
    support_mode: 'Lying down or supported recline',
    primary_mechanisms: [
      'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION',
      'MECH_GENERAL_OVERPROTECTION_STATE',
    ],
    display_mode: 'breath_only',
    default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 8 },
    cue_sequence: [
      'Use less effort right now.',
      'Inhale four. Shoulders quiet.',
      'Exhale seven. Let body drop.',
    ],
    microtext_options: [],
    safe_use_cases: [
      'burning or neuropathic-quality discomfort',
      'mechanically triggered nerve-like sensations',
    ],
    caution_flags: [
      'progressive neurologic changes',
      'worsening coordination',
    ],
    stop_conditions: [
      'worsening_numbness',
      'new_weakness',
      'major_pain_spike',
      'severe_shortness_of_breath',
    ],
    follow_up_candidates: ['PROTO_RIB_EXPANSION_RESET'],
    provenance_tags: ['product_inference', 'validation_needed'],
  },
  {
    protocol_id: 'PROTO_SUPPORTED_FORWARD_LEAN_RESET',
    protocol_name: 'Supported Forward Lean Reset',
    goal: 'Unload the front neck and shift support into the back body.',
    support_mode: 'Seated, leaning forward onto support',
    primary_mechanisms: [
      'MECH_POSTURAL_COMPRESSION',
      'MECH_CERVICAL_GUARDING',
      'MECH_RIB_RESTRICTION',
    ],
    display_mode: 'position_with_breath',
    default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 5 },
    cue_sequence: [
      'Lean forward. Support your body.',
      'Inhale back ribs into support.',
      'Exhale long. Let neck soften.',
    ],
    microtext_options: [],
    safe_use_cases: [
      'front neck overload with rib restriction',
      'upright breathing is compromised',
    ],
    caution_flags: ['low-back aggravation', 'dizziness with leaning'],
    stop_conditions: ['major_pain_spike', 'dizziness', 'new_weakness'],
    follow_up_candidates: ['PROTO_RIB_EXPANSION_RESET'],
    provenance_tags: ['product_inference', 'design_decision'],
  },
]
