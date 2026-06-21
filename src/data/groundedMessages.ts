import type { GroundedMessage } from '../types/groundedMessage'

export const GROUNDED_MESSAGES: GroundedMessage[] = [
  {
    message_id: 'gentle_exercise_eases_sensitization',
    text: 'Gentle, regular movement can calm an over-sensitized pain system over time.',
    // goal[] is engineering routing metadata (same class as symptom[]), not a
    // faithfulness claim — it decides where the already-attested message routes
    // at the recommendation-reveal. PT sanity-check of the routing recommended.
    selectors: { symptom: ['aching', 'soreness', 'burning'], goal: ['decompress', 'restore'] },
    citation: {
      pmid: '39818121',
      source_link: 'https://pubmed.ncbi.nlm.nih.gov/39818121/',
      exact_figure: 'SMD -0.81, 95 % CI -0.93 to -0.70',
      figure_units: 'SMD (standardised mean difference) with 95% CI',
    },
    display_quote:
      'Meta-analysis revealed large improvement of post-intervention CS indices compared to baseline (SMD -0.81, 95 % CI -0.93 to -0.70).',
    authored_by: 'JSEer',
    authored_at: '2026-06-19T00:00:00.000Z',
    // Clinical attestation (two-lock model, lock 2): Dr. Zach Ermert, SPT,
    // attested 2026-06-20 during the MET demo walkthrough that this message
    // faithfully represents PMID 39818121. This is what authorizes 'pt_advisor_passed'
    // and lets the message clear liveMessages() to reach real users.
    review_status: 'pt_advisor_passed',
  },
  {
    message_id: 'chest_expansion_supports_breathing',
    text: 'Gentle rib and chest expansion supports easier breathing.',
    selectors: { location: ['ribs', 'chest', 'upper_back'], goal: ['decompress'] },
    citation: {
      pmid: '24835338',
      source_link: 'https://pubmed.ncbi.nlm.nih.gov/24835338/',
      exact_figure: 'r = 0.42',
      figure_units: 'Pearson correlation (chest expansion vs maximum voluntary ventilation)',
    },
    display_quote:
      'Chest expansion correlated significantly with maximum voluntary ventilation (r = 0.42).',
    authored_by: 'JSEer',
    authored_at: '2026-06-21T00:00:00.000Z',
    // Sourced from the-muscle-pt research-001 (Wirth 2014), PubMed-direct verified.
    // DARK (engineering_passed) until Zach Ermert, SPT attests faithfulness.
    review_status: 'engineering_passed',
  },
]
