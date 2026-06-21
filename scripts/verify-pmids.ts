/**
 * Verifies every PMID in the message bank resolves to a real PubMed article and
 * caches its metadata. Run on demand / periodically — NOT in the default CI path.
 * The offline test (pmidVerification.test.ts) enforces that the cache covers the bank.
 */
import { writeFileSync } from 'node:fs'
import { GROUNDED_MESSAGES } from '../src/data/groundedMessages'

type CacheRec = { title: string; authors: string; year: number; fetched_at: string }
const OUT = new URL('../src/data/pmidVerification.json', import.meta.url)

async function main() {
  const pmids = [...new Set(GROUNDED_MESSAGES.map((m) => m.citation.pmid))]
  const cache: Record<string, CacheRec> = {}
  for (const pmid of pmids) {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`PubMed esummary HTTP ${res.status} for PMID ${pmid}`)
    const json: unknown = await res.json()
    const rec = (json as Record<string, unknown>)?.result as Record<string, unknown> | undefined
    const entry = rec?.[pmid] as Record<string, unknown> | undefined
    if (!entry || entry['error'] || !entry['title']) {
      throw new Error(`PMID ${pmid} did NOT resolve to a real article`)
    }
    const year = Number(String((entry['pubdate'] as string) ?? '').slice(0, 4)) || 0
    const authors = Array.isArray(entry['authors'])
      ? (entry['authors'] as Array<Record<string, string>>)
          .map((a) => a['name'])
          .filter(Boolean)
          .join(', ')
      : ''
    cache[pmid] = { title: entry['title'] as string, authors, year, fetched_at: new Date().toISOString() }
    console.log(`✓ ${pmid} — ${entry['title']}`)
  }
  writeFileSync(OUT, JSON.stringify(cache, null, 2) + '\n')
  console.log(`Wrote ${Object.keys(cache).length} verified PMIDs to ${OUT.pathname}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
