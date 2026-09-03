/**
 * YourPatternsPanel — no-silent-blank contract.
 *
 * The panel is rendered inside a styled card on HomeScreen. Before this suite it
 * returned `null` on a first run, so the card chrome painted as an empty 257x136
 * box beside "Your State" — the second thing a first-time user sees. The contract
 * asserted here is that the panel ALWAYS renders something readable: its own
 * empty state before there is any history, the session summary after.
 *
 * Constraints inherited from the component (M6.8.2 Part 3): no charts, no
 * analytics, no percentages, no performance framing.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { HistoryEntry } from '../types'
import { saveHistory } from '../storage/sessionHistory'
import { YourPatternsPanel } from './YourPatternsPanel'

/** Invented fixture — structurally valid, describes no real person or session. */
function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    session_id: 'fixture-0001',
    timestamp: new Date().toISOString(),
    pain_before: 5,
    pain_after: 3,
    location_tags: [],
    symptom_tags: [],
    selected_protocol_id: 'fixture-protocol',
    selected_protocol_name: 'Fixture protocol',
    result: 'better',
    change_markers: [],
    session_status: 'completed',
    session_duration_seconds: 300,
    ...overrides,
  } as HistoryEntry
}

/** Seeds through the real writer, so the test cannot drift from the storage contract. */
function seedHistory(entries: HistoryEntry[]) {
  saveHistory(entries)
}

describe('YourPatternsPanel', () => {
  beforeEach(() => localStorage.clear())

  it('never renders as a blank card when no sessions exist', () => {
    const { container } = render(<YourPatternsPanel />)
    expect(container.textContent?.trim()).not.toBe('')
  })

  it('names itself and explains what will appear, before any session exists', () => {
    render(<YourPatternsPanel />)
    expect(screen.getByText(/your patterns/i)).toBeInTheDocument()
    expect(screen.getByText(/after your first session/i)).toBeInTheDocument()
  })

  it('shows the session summary once history exists', () => {
    seedHistory([makeEntry()])
    render(<YourPatternsPanel />)
    expect(screen.getByText(/standard session/i)).toBeInTheDocument()
  })

  it('drops the empty-state copy once history exists', () => {
    seedHistory([makeEntry()])
    render(<YourPatternsPanel />)
    expect(screen.queryByText(/after your first session/i)).not.toBeInTheDocument()
  })

  it('does not flash the empty state on the first paint when history exists', () => {
    // History is read synchronously from localStorage, so the very first render
    // must already show the session — never the empty copy, then a swap.
    seedHistory([makeEntry()])
    const { container } = render(<YourPatternsPanel />)
    expect(container.textContent).not.toMatch(/after your first session/i)
  })
})
