/**
 * MediCalm Protocol Library — M3.1.1
 * Authority: Protocol Library (doc 13), Mechanism + Protocol Mapping (doc 19)
 *
 * Exactly three breathing protocols. Locked set.
 *
 * 1. PROTO_REDUCED_EFFORT      — 3s / 5s  — nerve/burning/sensitivity
 * 2. PROTO_CALM_DOWNREGULATE   — 4s / 7s  — moderate pain/tension/guarding (default)
 * 3. PROTO_STABILIZE_BALANCE   — 5s / 5s  — low-moderate/stiffness/stable
 *
 * No breath holds. No multi-phase breathing. No aggressive techniques.
 * Cue sequence strings: max 5 words per cue.
 */
import type { ProtocolDefinition } from '../types'

export const PROTOCOLS: ProtocolDefinition[] = [
  {
    protocol_id: 'PROTO_REDUCED_EFFORT',
    protocol_name: 'Reduced Effort',
    goal: 'Ease breathing effort when nerve-involved or high-sensitivity discomfort is present.',
    support_mode: 'Lying down or supported recline',
    primary_mechanisms: [
      'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION',
      'MECH_GENERAL_OVERPROTECTION_STATE',
    ],
    display_mode: 'breath_only',
    default_timing_profile: { inhale_seconds: 3, exhale_seconds: 5, rounds: 8 },
    cue_sequence: [
      'Use less effort right now.',
      'Inhale three. Stay soft.',
      'Exhale five. Let go.',
    ],
    microtext_options: [],
    safe_use_cases: [
      'burning or nerve-like discomfort',
      'high sensitivity or reactive state',
      'shallow or uncomfortable breathing',
      'diffuse or widespread flare',
    ],
    caution_flags: ['progressive neurologic changes', 'worsening coordination'],
    stop_conditions: [
      'worsening_numbness',
      'new_weakness',
      'major_pain_spike',
      'severe_shortness_of_breath',
    ],
    follow_up_candidates: ['PROTO_CALM_DOWNREGULATE'],
    provenance_tags: ['product_inference', 'validation_needed'],
  },

  {
    protocol_id: 'PROTO_CALM_DOWNREGULATE',
    protocol_name: 'Calm Downregulate',
    goal: 'Reduce tension and calm the system response to persistent or moderate pain.',
    support_mode: 'Any comfortable position',
    primary_mechanisms: [
      'MECH_GENERAL_OVERPROTECTION_STATE',
      'MECH_CERVICAL_GUARDING',
      'MECH_JAW_CERVICAL_CO_CONTRACTION',
      'MECH_POSTURAL_COMPRESSION',
    ],
    display_mode: 'breath_with_body_cue',
    default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 8 },
    cue_sequence: [
      'Inhale four. Soften shoulders.',
      'Exhale seven. Let jaw drop.',
      'Stay quiet. No forcing.',
    ],
    microtext_options: [
      'Long exhale releases tension.',
      'Do not force the breath.',
      'Let the body settle.',
    ],
    safe_use_cases: [
      'moderate to high pain',
      'tightness, guarding, or stress',
      'compression or bracing patterns',
      'uncertain or default presentation',
    ],
    caution_flags: ['dizziness', 'worsening nerve symptoms'],
    stop_conditions: [
      'dizziness',
      'major_pain_spike',
      'severe_shortness_of_breath',
      'worsening_numbness',
      'new_weakness',
    ],
    follow_up_candidates: ['PROTO_STABILIZE_BALANCE'],
    provenance_tags: ['product_inference', 'design_decision'],
  },

  {
    protocol_id: 'PROTO_STABILIZE_BALANCE',
    protocol_name: 'Stabilize Balance',
    goal: 'Regulate and stabilize when pain is manageable and a steady rhythm supports recovery.',
    support_mode: 'Seated or comfortable upright',
    primary_mechanisms: [
      'MECH_POSTURAL_COMPRESSION',
      'MECH_RIB_RESTRICTION',
    ],
    display_mode: 'breath_with_body_cue',
    default_timing_profile: { inhale_seconds: 5, exhale_seconds: 5, rounds: 6 },
    cue_sequence: [
      'Inhale five. Tall and easy.',
      'Exhale five. Stay grounded.',
      'Steady rhythm. Controlled.',
    ],
    microtext_options: [
      'Match the pace evenly.',
      'Feel the steady rhythm.',
      'Full breath, full release.',
    ],
    safe_use_cases: [
      'low to moderate pain',
      'stiffness without high sensitivity',
      'stable state or post-session continuation',
    ],
    caution_flags: ['dizziness', 'worsening arm or hand symptoms'],
    stop_conditions: [
      'major_pain_spike',
      'new_weakness',
      'worsening_numbness',
      'severe_shortness_of_breath',
    ],
    follow_up_candidates: [],
    provenance_tags: ['product_inference', 'design_decision'],
  },
]
