/**
 * Intake → Output Sweep — report generators.
 *
 * Produces:
 *   - distinct-outputs.md  — every unique output fingerprint, cohort sizes,
 *                            sample reasoning chain, and dim-by-dim pivot
 *   - findings.md          — clinical-defensibility readout: cardinality,
 *                            differentiation map, location disconnect demo,
 *                            collisions, reachability gaps
 *
 * Authority: docs/superpowers/specs/2026-05-05-intake-output-sweep-design.md
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import type { HariSessionIntake } from '../src/types/hari'

interface ReportInput {
  outDir: string
  totalCases: number
  elapsedMs: number
  fingerprintCounts: Map<string, number>
  fingerprintExemplars: Map<string, unknown>
  fingerprintCohorts: Map<string, HariSessionIntake[]>
}

const INTAKE_DIMS: (keyof HariSessionIntake)[] = [
  'branch',
  'baseline_intensity',
  'irritability',
  'flare_sensitivity',
  'current_context',
  'session_length_preference',
  'symptom_focus',
  'session_intent',
]

function pivotByDim(cohort: HariSessionIntake[], dim: keyof HariSessionIntake): Record<string, number> {
  const out: Record<string, number> = {}
  for (const intake of cohort) {
    const v = String(intake[dim])
    out[v] = (out[v] ?? 0) + 1
  }
  return out
}

/** Returns dims whose values fully vary across the cohort (every possible value
 *  appears) vs. dims that are pinned (only one value appears) vs. partial. */
function dimVariance(cohort: HariSessionIntake[]): Record<string, 'pinned' | 'partial' | 'free'> {
  const out: Record<string, 'pinned' | 'partial' | 'free'> = {}
  for (const dim of INTAKE_DIMS) {
    const seen = new Set(cohort.map((i) => String(i[dim])))
    if (seen.size === 1) out[dim] = 'pinned'
    else if (seen.size < EXPECTED_VALUES[dim]) out[dim] = 'partial'
    else out[dim] = 'free'
  }
  return out
}

const EXPECTED_VALUES: Record<string, number> = {
  branch: 2,
  baseline_intensity: 11,
  irritability: 3,
  flare_sensitivity: 4,
  current_context: 5,
  session_length_preference: 3,
  symptom_focus: 6,
  session_intent: 4,
}

/** When a dim is "pinned", returns the single value; useful for differentiation map. */
function pinnedValueFor(cohort: HariSessionIntake[], dim: keyof HariSessionIntake): string | null {
  if (cohort.length === 0) return null
  const first = String(cohort[0][dim])
  for (const intake of cohort) if (String(intake[dim]) !== first) return null
  return first
}

function fmtFingerprint(fp: string): string {
  // Pretty-print fingerprint into a header
  return fp.split('|').join(' · ')
}

function fmtJsonBlock(obj: unknown): string {
  return '```json\n' + JSON.stringify(obj, null, 2) + '\n```'
}

// ─────────────────────────────────────────────────────────────────────────────
// distinct-outputs.md
// ─────────────────────────────────────────────────────────────────────────────

function writeDistinctOutputs(input: ReportInput): void {
  const lines: string[] = []
  lines.push(`# Distinct Outputs — Intake → Output Sweep`)
  lines.push(``)
  lines.push(`**Generated:** 2026-05-05`)
  lines.push(`**Total cases swept:** ${input.totalCases.toLocaleString()}`)
  lines.push(`**Distinct output fingerprints:** ${input.fingerprintCounts.size}`)
  lines.push(`**Sweep duration:** ${(input.elapsedMs / 1000).toFixed(1)}s`)
  lines.push(``)
  lines.push(`Each section below describes a single distinct output reachable from the engine.`)
  lines.push(`The "cohort" is the set of intake combinations that produce this output.`)
  lines.push(`"Pinned" dims are constant across the cohort (a real driver of this output).`)
  lines.push(`"Free" dims vary fully (do NOT influence this output).`)
  lines.push(`"Partial" dims take some values but not all (partial influence or interaction).`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  // Sort fingerprints by cohort size descending
  const sorted = Array.from(input.fingerprintCounts.entries())
    .sort((a, b) => b[1] - a[1])

  let idx = 1
  for (const [fp, count] of sorted) {
    const cohort = input.fingerprintCohorts.get(fp) ?? []
    const exemplar = input.fingerprintExemplars.get(fp) as Record<string, unknown> | undefined
    const variance = dimVariance(cohort)

    lines.push(`## Output ${idx} — ${fmtFingerprint(fp)}`)
    lines.push(``)
    lines.push(`**Cohort size:** ${count.toLocaleString()} intake combinations`)
    lines.push(`**Share of total:** ${((count / input.totalCases) * 100).toFixed(2)}%`)
    lines.push(``)

    lines.push(`### Driver dims (pinned across cohort)`)
    const pinned = INTAKE_DIMS.filter((d) => variance[d] === 'pinned')
    if (pinned.length === 0) {
      lines.push(`*(none — every dim varies; this output is reached via many intake paths)*`)
    } else {
      for (const d of pinned) {
        lines.push(`- \`${d}\`: \`${pinnedValueFor(cohort, d)}\``)
      }
    }
    lines.push(``)

    lines.push(`### Inert dims (vary freely)`)
    const free = INTAKE_DIMS.filter((d) => variance[d] === 'free')
    if (free.length === 0) {
      lines.push(`*(none — every dim is at least partially constrained)*`)
    } else {
      for (const d of free) {
        const dist = pivotByDim(cohort, d)
        const summary = Object.entries(dist).map(([k, v]) => `${k} (${v})`).join(', ')
        lines.push(`- \`${d}\`: ${summary}`)
      }
    }
    lines.push(``)

    const partial = INTAKE_DIMS.filter((d) => variance[d] === 'partial')
    if (partial.length > 0) {
      lines.push(`### Partial dims (some values appear, others don't)`)
      for (const d of partial) {
        const dist = pivotByDim(cohort, d)
        const summary = Object.entries(dist).map(([k, v]) => `${k} (${v})`).join(', ')
        lines.push(`- \`${d}\`: ${summary}`)
      }
      lines.push(``)
    }

    if (exemplar) {
      lines.push(`### Sample case — full reasoning chain`)
      lines.push(``)
      lines.push(`**case_id:** \`${(exemplar as { case_id: string }).case_id}\``)
      lines.push(``)
      lines.push(`**Intake**`)
      lines.push(fmtJsonBlock((exemplar as { intake: unknown }).intake))
      lines.push(``)
      lines.push(`**StateInterpretationResult (M6.4)**`)
      lines.push(fmtJsonBlock((exemplar as { interpretation: unknown }).interpretation))
      lines.push(``)
      lines.push(`**HARI resolution (M4.3 / M4.4 / M4.5)**`)
      lines.push(fmtJsonBlock((exemplar as { hari: unknown }).hari))
      lines.push(``)
      lines.push(`**Pain input synthesis (M3 bridge)**`)
      lines.push(fmtJsonBlock((exemplar as { runtime_session: { pain_input: unknown } }).runtime_session.pain_input))
      lines.push(``)
      lines.push(`**Need profile (M6.8)**`)
      lines.push(fmtJsonBlock((exemplar as { need_profile: unknown }).need_profile))
      lines.push(``)
      lines.push(`**Feasibility profile (M6.8)**`)
      lines.push(fmtJsonBlock((exemplar as { feasibility_profile: unknown }).feasibility_profile))
      lines.push(``)
      lines.push(`**Breath family (M6.8)**`)
      lines.push(fmtJsonBlock((exemplar as { breath_family: unknown }).breath_family))
      lines.push(``)
      lines.push(`**Delivery config — actual breath timing the user receives (M6.5)**`)
      lines.push(fmtJsonBlock((exemplar as { delivery_config: unknown }).delivery_config))
    }

    lines.push(``)
    lines.push(`---`)
    lines.push(``)
    idx++
  }

  fs.writeFileSync(path.join(input.outDir, 'distinct-outputs.md'), lines.join('\n'), 'utf-8')
  console.log(`[sweep] wrote distinct-outputs.md (${sorted.length} distinct fingerprints)`)
}

// ─────────────────────────────────────────────────────────────────────────────
// findings.md — the clinical-defensibility readout
// ─────────────────────────────────────────────────────────────────────────────

function writeFindings(input: ReportInput): void {
  const lines: string[] = []
  lines.push(`# Findings — Intake → Output Sweep`)
  lines.push(``)
  lines.push(`**Generated:** 2026-05-05`)
  lines.push(`**Total cases swept:** ${input.totalCases.toLocaleString()}`)
  lines.push(`**Distinct output fingerprints:** ${input.fingerprintCounts.size}`)
  lines.push(`**Sweep duration:** ${(input.elapsedMs / 1000).toFixed(1)}s`)
  lines.push(``)
  lines.push(`Authority: \`docs/superpowers/specs/2026-05-05-intake-output-sweep-design.md\``)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  // ── 1. Output cardinality ───────────────────────────────────────────────────
  lines.push(`## 1. Output cardinality`)
  lines.push(``)
  lines.push(`The engine produces **${input.fingerprintCounts.size} distinct breathing-technique outputs** across all ${input.totalCases.toLocaleString()} swept intake combinations. Each output is identified by the tuple \`(protocol_id, breath_family, inhale_seconds, hold_seconds, exhale_seconds, duration_seconds)\` — i.e. what the user actually experiences during the guided session.`)
  lines.push(``)
  lines.push(`### Cohort distribution`)
  lines.push(``)
  lines.push(`| Rank | Fingerprint | Cohort size | Share |`)
  lines.push(`|---|---|---:|---:|`)
  const sorted = Array.from(input.fingerprintCounts.entries()).sort((a, b) => b[1] - a[1])
  for (let i = 0; i < sorted.length; i++) {
    const [fp, count] = sorted[i]
    const pct = ((count / input.totalCases) * 100).toFixed(2)
    lines.push(`| ${i + 1} | \`${fp}\` | ${count.toLocaleString()} | ${pct}% |`)
  }
  lines.push(``)

  // ── 2. Differentiation map: which dims actually move output? ─────────────────
  lines.push(`## 2. Differentiation map — which intake dims actually drive output?`)
  lines.push(``)
  lines.push(`A dim is a **driver** for an output if it is *pinned* (single value) across that output's cohort. A dim is **inert** for an output if it varies freely (every value appears) — meaning that dim has no effect on which output is produced for that cohort.`)
  lines.push(``)
  lines.push(`Across all ${input.fingerprintCounts.size} outputs:`)
  lines.push(``)
  lines.push(`| Dim | Driver in N outputs | Inert in N outputs | Partial in N outputs |`)
  lines.push(`|---|---:|---:|---:|`)
  for (const dim of INTAKE_DIMS) {
    let driver = 0, inert = 0, partial = 0
    for (const [fp] of sorted) {
      const cohort = input.fingerprintCohorts.get(fp) ?? []
      const variance = dimVariance(cohort)
      if (variance[dim] === 'pinned') driver++
      else if (variance[dim] === 'free') inert++
      else partial++
    }
    lines.push(`| \`${dim}\` | ${driver} | ${inert} | ${partial} |`)
  }
  lines.push(``)
  lines.push(`**Read this as:** dims with high driver counts and low inert counts are the dimensions actually shaping the breathing technique. Dims with high inert counts are captured by the intake but ignored by the engine.`)
  lines.push(``)

  // ── 3. Location disconnect demonstration ─────────────────────────────────────
  lines.push(`## 3. Location-vs-output disconnect (current state, pre-fix)`)
  lines.push(``)
  lines.push(`This sweep deliberately holds \`intake.location = []\` for every case because \`synthesizePainInput\` derives \`location_tags\` from \`intake.symptom_focus\` (a silent / adaptive field) and not from \`intake.location\`. The body-picker work shipped in commit \`2607726\` therefore captures anatomical detail into HARI history but does not change which breathing technique the engine selects.`)
  lines.push(``)
  lines.push(`Concretely: two cases identical on every other dim but differing only on \`intake.location\` produce identical output. The 8 dims swept here are the *only* dims that move the engine today; \`location\`, \`location_muscles\`, \`location_pattern\` are inert.`)
  lines.push(``)
  lines.push(`If \`location\` were wired through to derive \`symptom_focus\` (or a richer painInput synthesis), each \`location_pattern\` would map onto a different cohort here and the differentiation map would shift accordingly. That wire-through is a separate decision documented in the body-picker spec; the data above defines the baseline against which any such change can be measured.`)
  lines.push(``)

  // ── 4. Collisions: clinically distinct cohorts → identical output ────────────
  lines.push(`## 4. Collisions — multiple clinically distinct cohorts producing the same output`)
  lines.push(``)
  lines.push(`Each entry in the table below is an output whose cohort spans a wide range of clinically relevant intake values (i.e. multiple values across high-signal dims like \`flare_sensitivity\`, \`baseline_intensity\`, \`branch\`). Larger cohort + more free dims = stronger collision signal = more clinical specificity is being lost at this output.`)
  lines.push(``)
  lines.push(`| Output | Cohort size | Free dims | Notes |`)
  lines.push(`|---|---:|---|---|`)
  const COLLISION_THRESHOLD = 1000
  for (const [fp, count] of sorted) {
    if (count < COLLISION_THRESHOLD) continue
    const cohort = input.fingerprintCohorts.get(fp) ?? []
    const variance = dimVariance(cohort)
    const free = INTAKE_DIMS.filter((d) => variance[d] === 'free')
    if (free.length === 0) continue
    const note = free.length >= 4 ? `wide cohort — review whether this is intended` : ``
    lines.push(`| \`${fp}\` | ${count.toLocaleString()} | ${free.map(f => `\`${f}\``).join(', ')} | ${note} |`)
  }
  lines.push(``)

  // ── 5. Reachability gaps ─────────────────────────────────────────────────────
  lines.push(`## 5. Reachability gaps`)
  lines.push(``)
  lines.push(`Protocols, breath families, and breath ratios that exist in the codebase but are never selected by any swept intake combination. Empty list means full reachability.`)
  lines.push(``)
  const reachedProtocols = new Set<string>()
  const reachedFamilies = new Set<string>()
  for (const fp of input.fingerprintCounts.keys()) {
    const protocolMatch = /protocol=([^|]+)/.exec(fp)
    const familyMatch = /family=([^|]+)/.exec(fp)
    if (protocolMatch) reachedProtocols.add(protocolMatch[1])
    if (familyMatch) reachedFamilies.add(familyMatch[1])
  }
  lines.push(`### Protocols reached`)
  for (const p of Array.from(reachedProtocols).sort()) lines.push(`- \`${p}\``)
  lines.push(``)
  lines.push(`### Breath families reached`)
  for (const f of Array.from(reachedFamilies).sort()) lines.push(`- \`${f}\``)
  lines.push(``)
  lines.push(`(Compare against the canonical lists in \`src/data/protocols.ts\` and \`src/engine/hari/breathFamily.ts\` — anything not appearing above is unreachable from the current intake surface.)`)
  lines.push(``)

  // ── 6. Ready-for-PMID-validation summary ─────────────────────────────────────
  lines.push(`## 6. Ready-for-PMID-validation pairs`)
  lines.push(``)
  lines.push(`Each distinct output is paired with the clinical cohort it serves. To validate clinical defensibility, cross-reference each row against PubMed-cited PT / respiratory research:`)
  lines.push(``)
  lines.push(`| Output | Driver cohort | Suggested literature focus |`)
  lines.push(`|---|---|---|`)
  for (const [fp] of sorted) {
    const cohort = input.fingerprintCohorts.get(fp) ?? []
    const variance = dimVariance(cohort)
    const driverDescription = INTAKE_DIMS
      .filter((d) => variance[d] === 'pinned')
      .map((d) => `${d}=${pinnedValueFor(cohort, d)}`)
      .join(' & ')
    const branch = pinnedValueFor(cohort, 'branch') ?? '(varies)'
    const sensitivity = pinnedValueFor(cohort, 'flare_sensitivity') ?? '(varies)'
    let suggestion = '—'
    if (branch === 'anxious_or_overwhelmed') {
      suggestion = 'vagal tone / parasympathetic activation breathing literature'
    } else if (branch === 'tightness_or_pain' && sensitivity === 'high') {
      suggestion = 'central sensitization / chronic pain breathing literature'
    } else if (branch === 'tightness_or_pain') {
      suggestion = 'musculoskeletal pain + diaphragmatic breathing literature'
    }
    lines.push(`| \`${fp}\` | ${driverDescription || '(no pinned drivers)'} | ${suggestion} |`)
  }
  lines.push(``)
  lines.push(`The PMID validation step is deliberately deferred — see the design spec § "Out of scope for this round".`)
  lines.push(``)

  fs.writeFileSync(path.join(input.outDir, 'findings.md'), lines.join('\n'), 'utf-8')
  console.log(`[sweep] wrote findings.md`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

export function writeReports(input: ReportInput): void {
  writeDistinctOutputs(input)
  writeFindings(input)
}
