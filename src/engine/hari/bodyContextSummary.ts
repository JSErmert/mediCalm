/**
 * M4.1 — Body Context Schema + Summary Builder
 * Authority: M4.1 §13 (Raw Entry + Normalized Summary Rule)
 *            M4.1 §17 (Display Rule at Session Start)
 *            M4.1 §23 (Low-Confidence Fallback Compatibility)
 *
 * This module transforms user-entered Body Context into a normalized
 * summary object for HARI to use during state estimation.
 *
 * HARI reads normalized summaries — not raw text alone.
 * The user-facing layer preserves natural language.
 * The system layer preserves structured interpretability.
 */
import type { BodyContext, BodyContextItem, BodyContextSummary } from '../../types/hari'

// ── Active Item Filter ────────────────────────────────────────────────────────

/**
 * Only items with 'active' or 'unsure' status should influence HARI reasoning.
 * Items marked 'removed', 'outdated', or 'changed' have reduced influence.
 * Authority: M4.1 §11 (Source and Status Rule)
 */
export function getActiveBodyContextItems(ctx: BodyContext): BodyContextItem[] {
  return ctx.items.filter(
    (item) => item.status === 'active' || item.status === 'unsure'
  )
}

// ── Sensitive Region Extraction ───────────────────────────────────────────────

const REGION_KEYWORDS: Record<string, string[]> = {
  neck: ['neck', 'cervical', 'back of neck'],
  jaw: ['jaw', 'tmj', 'facial', 'face'],
  ribs: ['rib', 'side', 'intercostal'],
  upper_back: ['upper back', 'thoracic', 'shoulders', 'shoulder'],
  lower_back: ['lower back', 'lumbar'],
  chest: ['chest'],
  head: ['head', 'skull', 'occiput'],
}

function extractRegions(items: BodyContextItem[]): string[] {
  const found = new Set<string>()
  for (const item of items) {
    if (item.normalized?.affected_regions) {
      item.normalized.affected_regions.forEach((r) => found.add(r))
      continue
    }
    const text = item.raw_text.toLowerCase()
    for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        found.add(region)
      }
    }
  }
  return Array.from(found)
}

// ── Trigger Extraction ────────────────────────────────────────────────────────

function extractTriggers(items: BodyContextItem[]): string[] {
  const triggerItems = items.filter(
    (item) => item.category === 'trigger_patterns'
  )
  const found = new Set<string>()
  for (const item of triggerItems) {
    if (item.normalized?.trigger) {
      found.add(item.normalized.trigger)
    } else {
      // Surface the raw text when normalized isn't available
      const short = item.raw_text.split(/[.,]/)[0].trim()
      if (short.length > 0 && short.length <= 60) found.add(short)
    }
  }
  return Array.from(found)
}

// ── Relief Extraction ─────────────────────────────────────────────────────────

function extractRelievers(items: BodyContextItem[]): string[] {
  const reliefItems = items.filter(
    (item) => item.category === 'relief_patterns'
  )
  const found = new Set<string>()
  for (const item of reliefItems) {
    const short = item.raw_text.split(/[.,]/)[0].trim()
    if (short.length > 0 && short.length <= 60) found.add(short)
  }
  return Array.from(found)
}

// ── Session Preference Extraction ────────────────────────────────────────────

function extractSessionPreferences(
  items: BodyContextItem[]
): BodyContextSummary['session_preferences'] {
  const prefItems = items.filter(
    (item) => item.category === 'session_structure_preferences'
  )
  const preferences: BodyContextSummary['session_preferences'] = {}
  for (const item of prefItems) {
    const text = item.raw_text.toLowerCase()
    if (text.includes('short') || text.includes('brief') || text.includes('quick')) {
      preferences.length = 'shorter'
    } else if (text.includes('long') || text.includes('deeper') || text.includes('extended')) {
      preferences.length = 'longer'
    } else if (text.includes('standard') || text.includes('normal')) {
      preferences.length = 'standard'
    }
    if (text.includes('quick reset') || text.includes('reset')) {
      preferences.style = 'quick_reset'
    } else if (text.includes('deep') || text.includes('full')) {
      preferences.style = 'deeper_regulation'
    }
  }
  return preferences
}

// ── Display Banner Builder ────────────────────────────────────────────────────

/**
 * Builds the compact session-start summary banner.
 * Authority: M4.1 §17
 *
 * Format: "Using saved Body Context\n[compact summary of key context]"
 * Must be compact, calm, useful, non-overwhelming.
 */
function buildDisplayBanner(
  regions: string[],
  triggers: string[],
  relievers: string[]
): string {
  const parts: string[] = []
  if (regions.length > 0) {
    parts.push(`${regions.join(', ')} sensitivity`)
  }
  if (triggers.length > 0) {
    const shown = triggers.slice(0, 2).join(', ')
    parts.push(`${shown} trigger${triggers.length > 1 ? 's' : ''}`)
  }
  if (relievers.length > 0) {
    const shown = relievers[0]
    parts.push(`${shown} tends to help`)
  }
  return parts.length > 0
    ? `Using saved Body Context\n${parts.join(' · ')}`
    : 'Using saved Body Context'
}

// ── Main Summary Builder ──────────────────────────────────────────────────────

/**
 * Build a normalized BodyContextSummary from a BodyContext for HARI use.
 * Authority: M4.1 §13
 *
 * Returns a sparse summary when Body Context is empty.
 * HARI must remain compatible with sparse or absent context.
 * Authority: M4.1 §15, §23
 */
export function buildBodyContextSummary(
  ctx: BodyContext | null
): BodyContextSummary {
  if (!ctx || ctx.items.length === 0) {
    return {
      display_banner: '',
      has_context: false,
      sensitive_regions: [],
      known_triggers: [],
      known_relievers: [],
      session_preferences: {},
      active_items: [],
    }
  }

  const active = getActiveBodyContextItems(ctx)
  const sensitive_regions = extractRegions(
    active.filter((i) => i.category === 'sensitive_regions')
  )
  const known_triggers = extractTriggers(active)
  const known_relievers = extractRelievers(active)
  const session_preferences = extractSessionPreferences(active)

  const display_banner =
    active.length > 0
      ? buildDisplayBanner(sensitive_regions, known_triggers, known_relievers)
      : ''

  return {
    display_banner,
    has_context: active.length > 0,
    sensitive_regions,
    known_triggers,
    known_relievers,
    session_preferences,
    active_items: active,
  }
}

// ── Influence-Worthy Context Check ────────────────────────────────────────────

/**
 * Returns true if Body Context has enough content to meaningfully influence
 * HARI reasoning. Sparse context reduces personalization depth per M4.1 §23.
 */
export function hasInfluenceableContext(summary: BodyContextSummary): boolean {
  return (
    summary.has_context &&
    (summary.sensitive_regions.length > 0 || summary.known_triggers.length > 0)
  )
}
