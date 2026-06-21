import type { BreathingCue } from '../types/breathingCue'

export const BREATHING_CUES: BreathingCue[] = [
  {
    id: 'setup_position_supine',
    text: 'If you can, try this lying down.',
    phase: 'setup',
    condition: { locationPatternIncludes: ['single', 'connected'] },
    grounding: { pmid: '24835338', record_id: 'research-001' },
  },
  {
    id: 'setup_hand_belly_chest',
    text: 'One hand on your lower belly, one on your chest — let only the lower hand rise.',
    phase: 'setup',
    core: true,
    grounding: { pmid: '31436595', record_id: 'research-010' },
  },
  {
    id: 'setup_rib_expand',
    text: 'Rest a hand over the sore rib and breathe gently into it.',
    phase: 'setup',
    condition: { locationIncludes: ['ribs'] },
    grounding: { pmid: '24835338', record_id: 'research-001' },
  },
  {
    id: 'setup_position_upright',
    text: 'If you can, sit tall with your back supported.',
    phase: 'setup',
    condition: { locationPatternIncludes: ['widespread', 'multifocal'] },
  },
  {
    id: 'breath_longer_exhale',
    text: 'Let the exhale be a little longer than the inhale.',
    phase: 'in_session',
    core: true,
    grounding: { pmid: '35623448', record_id: 'research-011' },
  },
  {
    id: 'breath_soft_belly',
    text: 'Let the belly stay soft.',
    phase: 'in_session',
    core: true,
    grounding: { pmid: '31436595', record_id: 'research-010' },
  },
  {
    id: 'breath_easy_shoulders',
    text: 'Let the shoulders be easy.',
    phase: 'in_session',
    core: true,
  },
  {
    id: 'breath_decompress_room',
    text: 'Give the sore area a little room with each breath.',
    phase: 'in_session',
    condition: { goalIncludes: ['decompress'] },
    grounding: { pmid: '24835338', record_id: 'research-001' },
  },
]
