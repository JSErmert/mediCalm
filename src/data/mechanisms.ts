/**
 * MediCalm Mechanism Registry
 * Authority: Knowledge + Protocol Doctrine (doc 03), Mechanism + Protocol Mapping (doc 19)
 *
 * Each mechanism object encodes a functional state the session engine reasons about.
 * Trigger, symptom, and contraindication tags must use canonical values from taxonomy.ts.
 * Provenance labels: source_grounded | product_inference | design_decision | validation_needed
 */
import type { MechanismObject } from '../types'

export const MECHANISMS: MechanismObject[] = [
  {
    mechanism_id: 'MECH_POSTURAL_COMPRESSION',
    name: 'Postural Compression',
    description: 'Sustained compression of thoracic and lower cervical regions due to prolonged sitting or bracing postures. Reduces movement variability and increases tension in surrounding structures.',
    related_truth_ids: ['MECH_004', 'INT_001'],
    trigger_tags: ['sitting', 'driving'],
    symptom_tags: ['tightness', 'pressure', 'burning'],
    contraindication_tags: [],
    protocol_priority_tags: ['decompression_first'],
  },
  {
    mechanism_id: 'MECH_RIB_RESTRICTION',
    name: 'Ribcage Compression',
    description: 'Reduced posterior-lateral rib expansion during inhalation, leading to compensatory upper-chest breathing and increased cervical and accessory muscle tension.',
    related_truth_ids: ['MECH_001', 'INT_002'],
    trigger_tags: ['sitting', 'exercise', 'overhead_movement'],
    symptom_tags: ['tightness', 'pressure', 'aching', 'shallow_breathing'],
    contraindication_tags: [],
    protocol_priority_tags: ['rib_expansion_first'],
  },
  {
    mechanism_id: 'MECH_CERVICAL_GUARDING',
    name: 'Cervical Guarding',
    description: 'Persistent elevated cervical muscle tone maintained as a protective response following sensitization or sustained abnormal loading. May outlast the original event via fear-avoidance patterns.',
    related_truth_ids: ['MECH_002', 'INT_003'],
    trigger_tags: ['sitting', 'stress', 'screen_use', 'driving', 'post_sleep'],
    symptom_tags: ['stiffness', 'tightness', 'aching', 'soreness', 'guarding'],
    contraindication_tags: [],
    protocol_priority_tags: ['calming_first', 'decompression_before_movement'],
  },
  {
    mechanism_id: 'MECH_JAW_CERVICAL_CO_CONTRACTION',
    name: 'Jaw-Cervical Co-Contraction',
    description: 'Jaw clenching co-activates cervical and upper trap musculature. In a guarding state, jaw and neck tension form a self-reinforcing loop that may be driven by stress, compression, or cervical sensitization.',
    related_truth_ids: ['MECH_002'],
    trigger_tags: ['sitting', 'stress', 'driving', 'eating'],
    symptom_tags: ['tightness', 'aching', 'soreness', 'pressure'],
    contraindication_tags: [],
    protocol_priority_tags: ['jaw_first'],
  },
  {
    mechanism_id: 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION',
    name: 'Mechanically Driven Nerve Irritation',
    description: 'Burning, tingling, or radiating sensations triggered by mechanical inputs (posture, compression, bracing). Reflects nervous system sensitization responding to mechanical context rather than direct structural injury.',
    related_truth_ids: ['SYM_001', 'SYM_002'],
    trigger_tags: ['sitting', 'driving', 'post_sleep', 'stress'],
    symptom_tags: ['burning', 'tingling', 'numbness', 'nerve_like', 'radiating'],
    contraindication_tags: ['progressive_weakness', 'worsening_numbness'],
    protocol_priority_tags: ['calm_only_first', 'no_movement_entry'],
  },
  {
    mechanism_id: 'MECH_GENERAL_OVERPROTECTION_STATE',
    name: 'General Overprotection State',
    description: 'Widespread nervous system sensitization where multiple regions are simultaneously symptomatic. Pain intensity and spread are amplified beyond direct tissue input. Calm-first, non-movement entry is required.',
    related_truth_ids: ['MECH_003'],
    trigger_tags: ['stress', 'post_sleep', 'sitting', 'driving'],
    symptom_tags: ['burning', 'tightness', 'pressure', 'aching', 'shallow_breathing', 'instability'],
    contraindication_tags: [],
    protocol_priority_tags: ['flare_calming_first'],
  },
]
