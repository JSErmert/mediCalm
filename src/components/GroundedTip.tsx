/**
 * GroundedTip — an educational tip with a "▲ Learn more" affordance that reveals
 * the supporting PubMed source (faithful quote + PMID + link).
 * Authority: docs/superpowers/specs/2026-06-19-grounded-message-layer-design.md §6
 */
import { useState } from 'react'
import type { GroundedMessage } from '../types/groundedMessage'
import pmidCache from '../data/pmidVerification.json'

const CACHE = pmidCache as Record<string, { title: string; authors: string; year: number }>

export function GroundedTip({ message }: { message: GroundedMessage }) {
  const [open, setOpen] = useState(false)
  const rec = CACHE[message.citation.pmid]
  const attribution = rec && rec.authors ? `${rec.authors} (${rec.year})` : 'PubMed'

  return (
    <div className="grounded-tip">
      <p className="grounded-tip__text">{message.text}</p>
      <button
        type="button"
        className="grounded-tip__toggle"
        aria-expanded={open}
        aria-label={open ? 'Hide research source' : 'Learn more — show research source'}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">▲</span> Learn more
      </button>
      {open && (
        <div className="grounded-tip__popup" role="region" aria-label="Research source">
          <p className="grounded-tip__quote">&ldquo;{message.display_quote}&rdquo;</p>
          <p className="grounded-tip__attrib">
            {attribution} &middot; PMID {message.citation.pmid}
          </p>
          <a
            className="grounded-tip__link"
            href={message.citation.source_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on PubMed
          </a>
        </div>
      )}
    </div>
  )
}
