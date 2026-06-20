import type { GroundedMessage } from '../types/groundedMessage'

export const GROUNDED_MESSAGES: GroundedMessage[] = [
  {
    message_id: 'gentle_exercise_eases_sensitization',
    text: 'Gentle, regular movement can calm an over-sensitized pain system over time.',
    selectors: { symptom: ['aching', 'soreness', 'burning'] },
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
    review_status: 'engineering_passed',
  },
]
