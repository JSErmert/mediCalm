import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HistoryCard } from './HistoryCard'
import type { HistoryEntry } from '../types'

const baseEntry: HistoryEntry = {
  session_id: 'sess_test_001',
  timestamp: '2026-03-23T22:14:00Z',
  pain_before: 7,
  pain_after: 4,
  location_tags: ['front_neck', 'ribs'],
  symptom_tags: ['burning', 'tightness'],
  trigger_tag: 'sitting',
  selected_protocol_id: 'PROTO_RIB_EXPANSION_RESET',
  selected_protocol_name: 'Rib Expansion Reset',
  result: 'better',
  change_markers: ['less_burning'],
  session_status: 'completed',
  session_duration_seconds: 88,
}

describe('HistoryCard', () => {
  it('renders pain before and after', () => {
    render(<HistoryCard entry={baseEntry} />)
    expect(screen.getByText(/7.*4/)).toBeInTheDocument()
  })

  it('renders the protocol name', () => {
    render(<HistoryCard entry={baseEntry} />)
    expect(screen.getByText('Rib Expansion Reset')).toBeInTheDocument()
  })

  it('renders "Helped" for a better result', () => {
    render(<HistoryCard entry={baseEntry} />)
    expect(screen.getByText('Helped')).toBeInTheDocument()
  })

  it('renders "Worse" for a worse result — no celebratory styling applied', () => {
    render(<HistoryCard entry={{ ...baseEntry, result: 'worse' }} />)
    expect(screen.getByText('Worse')).toBeInTheDocument()
  })

  it('renders "Interrupted" for an interrupted session', () => {
    render(<HistoryCard entry={{ ...baseEntry, result: 'interrupted' }} />)
    expect(screen.getByText('Interrupted')).toBeInTheDocument()
  })

  it('has an accessible article label', () => {
    render(<HistoryCard entry={baseEntry} />)
    // aria-label includes the date
    expect(screen.getByRole('article')).toBeInTheDocument()
  })
})
