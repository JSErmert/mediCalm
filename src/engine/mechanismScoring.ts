// src/engine/mechanismScoring.ts
import type { PainInputState } from '../types'
import { MECHANISMS } from '../data/mechanisms'

/**
 * Authority: Execution Spec (doc 04) § 3. Mechanism Scoring Engine
 * Weights: symptom_match ×4 | location_match ×3 | trigger_match ×2
 *          severity_high +2 | severity_very_high +3 | contraindication -99
 */

export interface MechanismScore {
  mechanism_id: string
  score: number
}

/**
 * Maps location tags to mechanisms they implicate.
 * Derived from Mechanism + Protocol Mapping (doc 19).
 * This table is the canonical source for location→mechanism scoring weight.
 */
const LOCATION_MECHANISM_MAP: Record<string, string[]> = {
  head:        ['MECH_CERVICAL_GUARDING', 'MECH_GENERAL_OVERPROTECTION_STATE'],
  jaw:         ['MECH_JAW_CERVICAL_CO_CONTRACTION', 'MECH_CERVICAL_GUARDING'],
  ear:         ['MECH_JAW_CERVICAL_CO_CONTRACTION'],
  front_neck:  ['MECH_CERVICAL_GUARDING'],
  back_neck:   ['MECH_CERVICAL_GUARDING', 'MECH_POSTURAL_COMPRESSION'],
  throat:      ['MECH_CERVICAL_GUARDING'],
  shoulders:   ['MECH_POSTURAL_COMPRESSION', 'MECH_CERVICAL_GUARDING'],
  chest:       ['MECH_RIB_RESTRICTION', 'MECH_GENERAL_OVERPROTECTION_STATE'],
  upper_back:  ['MECH_POSTURAL_COMPRESSION', 'MECH_RIB_RESTRICTION'],
  ribs:        ['MECH_RIB_RESTRICTION', 'MECH_POSTURAL_COMPRESSION'],
  mid_back:    ['MECH_RIB_RESTRICTION'],
  lower_back:  ['MECH_POSTURAL_COMPRESSION'],
  hips:        ['MECH_POSTURAL_COMPRESSION'],
  arm:         ['MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION'],
  hand:        ['MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION'],
}

export function scoreMechanisms(input: PainInputState): MechanismScore[] {
  const severityBonus =
    input.pain_level >= 9 ? 3 : input.pain_level >= 7 ? 2 : 0

  const scored = MECHANISMS.map((mech) => {
    // Contraindication check — hard veto
    const hasContraindication = mech.contraindication_tags.some((ct) =>
      input.symptom_tags.includes(ct)
    )
    if (hasContraindication) {
      return { mechanism_id: mech.mechanism_id, score: -99 }
    }

    // Symptom match ×4
    const symptomMatches = input.symptom_tags.filter((t) =>
      mech.symptom_tags.includes(t)
    ).length
    const symptomScore = symptomMatches * 4

    // Location match ×3 (via lookup table, not mechanism schema)
    const locationMatches = input.location_tags.filter((loc) => {
      const implicatedMechs = LOCATION_MECHANISM_MAP[loc] ?? []
      return implicatedMechs.includes(mech.mechanism_id)
    }).length
    const locationScore = locationMatches * 3

    // Trigger match ×2
    const triggerScore =
      input.trigger_tag && mech.trigger_tags.includes(input.trigger_tag) ? 2 : 0

    const total = symptomScore + locationScore + triggerScore + severityBonus

    return { mechanism_id: mech.mechanism_id, score: total }
  })

  return scored.sort((a, b) => b.score - a.score)
}
