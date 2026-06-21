import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecommendationReveal } from './RecommendationReveal'
import type { GroundedMessage } from '../types/groundedMessage'

const live: GroundedMessage = {
  message_id: 'm',
  text: 'Gentle movement can calm an over-sensitized system.',
  selectors: { goal: ['decompress'], symptom: ['aching'] },
  citation: {
    pmid: '39818121', source_link: 'https://pubmed.ncbi.nlm.nih.gov/39818121/',
    exact_figure: 'SMD -0.81', figure_units: 'SMD',
  },
  display_quote: 'Meta-analysis revealed large improvement (SMD -0.81).',
  authored_by: 't', authored_at: '2026-06-20T00:00:00.000Z',
  review_status: 'pt_advisor_passed',
}

describe('RecommendationReveal', () => {
  it('renders nothing when goal is null', () => {
    const { container } = render(<RecommendationReveal goal={null} input={{}} bank={[live]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when no message matches the goal (honest degradation)', () => {
    const { container } = render(<RecommendationReveal goal="expand" input={{}} bank={[live]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the message text and an app-voice why line for a matched goal', () => {
    render(<RecommendationReveal goal="decompress" input={{ symptom: ['aching'] }} bank={[live]} />)
    expect(screen.getByText(/Gentle movement can calm/)).toBeInTheDocument()
    // app-voice why line present, and NOT attributed to the paper
    expect(screen.getByText(/why this for you/i)).toBeInTheDocument()
  })

  it('reveals the linked PMID after expanding Learn more (minimal dropdown)', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(<RecommendationReveal goal="decompress" input={{}} bank={[live]} />)
    expect(screen.queryByRole('link', { name: /PMID 39818121/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /learn more/i }))
    const link = screen.getByRole('link', { name: /PMID 39818121/i })
    expect(link).toHaveAttribute('href', live.citation.source_link)
  })
})
