import { describe, it, expect } from 'vitest'
import type { HistoryEntry } from '../../types'
import type { GroundedMessage } from '../../types/groundedMessage'
import { selectPreSessionTip, liveMessages } from './selectTip'

function msg(
  id: string,
  selectors: GroundedMessage['selectors'],
  status: GroundedMessage['review_status'] = 'pt_advisor_passed',
): GroundedMessage {
  return {
    message_id: id,
    text: `tip ${id}`,
    selectors,
    citation: {
      pmid: '1',
      source_link: 'https://pubmed.ncbi.nlm.nih.gov/1/',
      exact_figure: 'x',
      figure_units: 'y',
    },
    display_quote: 'q',
    authored_by: 'test',
    authored_at: '2026-06-19T00:00:00.000Z',
    review_status: status,
  }
}

function session(over: Partial<HistoryEntry>): HistoryEntry {
  return {
    session_id: 's',
    timestamp: '2026-06-19T00:00:00.000Z',
    pain_before: 5,
    pain_after: 4,
    location_tags: [],
    symptom_tags: [],
    selected_protocol_id: 'P',
    selected_protocol_name: 'P',
    result: 'better',
    change_markers: [],
    session_status: 'completed',
    session_duration_seconds: 100,
    ...over,
  }
}

describe('selectPreSessionTip', () => {
  it('returns null when there is no prior session', () => {
    expect(selectPreSessionTip(null, [msg('a', { symptom: ['tightness'] })])).toBeNull()
  })

  it('returns null when nothing matches', () => {
    const bank = [msg('a', { symptom: ['burning'] })]
    expect(selectPreSessionTip(session({ symptom_tags: ['tightness'] }), bank)).toBeNull()
  })

  it('selects a matching message', () => {
    const bank = [msg('a', { symptom: ['tightness'] })]
    expect(selectPreSessionTip(session({ symptom_tags: ['tightness'] }), bank)?.message_id).toBe('a')
  })

  it('ranks by match specificity (more matched tags wins)', () => {
    const bank = [
      msg('one', { symptom: ['tightness'] }),
      msg('two', { symptom: ['tightness'], trigger: ['stress'] }),
    ]
    const tip = selectPreSessionTip(session({ symptom_tags: ['tightness'], trigger_tag: 'stress' }), bank)
    expect(tip?.message_id).toBe('two')
  })

  it('is deterministic — ties broken by message_id ascending', () => {
    const bank = [msg('zebra', { symptom: ['tightness'] }), msg('alpha', { symptom: ['tightness'] })]
    expect(selectPreSessionTip(session({ symptom_tags: ['tightness'] }), bank)?.message_id).toBe('alpha')
  })

  it('never selects a message that is not pt_advisor_passed', () => {
    const bank = [msg('draft', { symptom: ['tightness'] }, 'engineering_passed')]
    expect(selectPreSessionTip(session({ symptom_tags: ['tightness'] }), bank)).toBeNull()
  })
})

describe('liveMessages', () => {
  it('includes only pt_advisor_passed messages', () => {
    const bank = [
      msg('a', {}, 'pt_advisor_passed'),
      msg('b', {}, 'engineering_passed'),
      msg('c', {}, 'draft'),
    ]
    expect(liveMessages(bank).map((m) => m.message_id)).toEqual(['a'])
  })
})
