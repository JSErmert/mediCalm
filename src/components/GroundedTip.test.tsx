import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GroundedTip } from './GroundedTip'
import type { GroundedMessage } from '../types/groundedMessage'

const message: GroundedMessage = {
  message_id: 'demo',
  text: 'Slowing your exhale helps your nervous system settle.',
  selectors: { symptom: ['tightness'] },
  citation: {
    pmid: '33117119',
    source_link: 'https://pubmed.ncbi.nlm.nih.gov/33117119/',
    exact_figure: 'example figure',
    figure_units: 'units',
  },
  display_quote: 'Slow breathing increased HRV.',
  authored_by: 'test',
  authored_at: '2026-06-19T00:00:00.000Z',
  review_status: 'pt_advisor_passed',
}

describe('GroundedTip', () => {
  it('renders the message text', () => {
    render(<GroundedTip message={message} />)
    expect(screen.getByText(message.text)).toBeInTheDocument()
  })

  it('hides the source until the toggle is pressed', () => {
    render(<GroundedTip message={message} />)
    expect(screen.queryByText(/Slow breathing increased HRV/)).not.toBeInTheDocument()
  })

  it('reveals attribution and a linked PMID on toggle', async () => {
    const user = userEvent.setup()
    render(<GroundedTip message={message} />)
    await user.click(screen.getByRole('button', { name: /learn more/i }))
    const link = screen.getByRole('link', { name: /PMID 33117119/i })
    expect(link).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/33117119/')
  })

  it('exposes aria-expanded state on the toggle', async () => {
    const user = userEvent.setup()
    render(<GroundedTip message={message} />)
    const toggle = screen.getByRole('button', { name: /learn more/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})
