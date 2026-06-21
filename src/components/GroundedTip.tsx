/**
 * GroundedTip — an educational tip with a "▼ Learn more" affordance that reveals
 * the supporting PubMed source (paper title + "et al." attribution + linked PMID).
 * Authority: docs/superpowers/specs/2026-06-19-grounded-message-layer-design.md §6
 */
import { useState } from 'react'
import type { GroundedMessage } from '../types/groundedMessage'
import pmidCache from '../data/pmidVerification.json'

const CACHE = pmidCache as Record<string, { title: string; authors: string; year: number }>

export function GroundedTip({ message }: { message: GroundedMessage }) {
  const [open, setOpen] = useState(false)
  const rec = CACHE[message.citation.pmid]
  const firstAuthor = rec?.authors?.split(',')[0]?.split(' ')[0] ?? ''
  const attribution = firstAuthor ? `${firstAuthor} et al.` : 'PubMed'

  return (
    <div className="grounded-tip">
      <p className="grounded-tip__text">{message.text}</p>
      <div className="grounded-tip__anchor">
        {open && (
          <div className="grounded-tip__popup" role="region" aria-label="Research source">
            <p className="grounded-tip__attrib">
              {attribution} &middot;{' '}
              <a
                className="grounded-tip__pmid-link"
                href={message.citation.source_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                PMID {message.citation.pmid}
              </a>
            </p>
          </div>
        )}
        <button
          type="button"
          className="grounded-tip__toggle"
          aria-expanded={open}
          aria-label={open ? 'Hide research source' : 'Learn more — show research source'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '▲' : '▼'}</span> Learn more
        </button>
      </div>
    </div>
  )
}
