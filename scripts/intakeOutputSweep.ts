/**
 * Intake → Output Sweep — engine-level audit harness.
 *
 * Authority: docs/superpowers/specs/2026-05-05-intake-output-sweep-design.md
 *
 * Enumerates every meaningful intake combination (8 dimensions, 95,040 cases),
 * pipes each through the production HARI + M6.4 + M6.5 + M6.8 engine pipelines
 * exactly as the live app does on the CLEAR safety-gate path, and records the
 * full per-case decision chain to JSONL plus dedupe + findings markdown reports.
 *
 * Run:  npm run sweep
 */

// ── Browser-API polyfills (run-once, before any engine import) ────────────────
//
// The engine's pattern-reader / hint-reinforcement modules read session history
// from localStorage. In Node we provide a minimal in-memory shim so a fresh-user
// (empty history) baseline runs without throwing.

interface MinimalStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  readonly length: number
  key(index: number): string | null
}

if (typeof (globalThis as unknown as { localStorage?: unknown }).localStorage === 'undefined') {
  const store = new Map<string, string>()
  const shim: MinimalStorage = {
    getItem: (k) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k, v) => { store.set(k, String(v)) },
    removeItem: (k) => { store.delete(k) },
    clear: () => { store.clear() },
    get length() { return store.size },
    key: (i) => Array.from(store.keys())[i] ?? null,
  }
  Object.defineProperty(globalThis, 'localStorage', { value: shim, configurable: true, writable: true })
}

// ── Engine + type imports (after polyfill is installed) ───────────────────────

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  HariSessionIntake,
  IntakeBranch,
  IrritabilityPattern,
  FlareSensitivity,
  CurrentContext,
  SessionLengthPreference,
  SymptomFocus,
  SessionIntent,
  HariEmotionalState,
  BodyLocation,
  LocationPattern,
} from '../src/types/hari'

import { buildM7Session } from '../src/engine/m7/integration'
import type { IntakeSensorState } from '../src/types/m7'

import {
  branchToEmotionalStates,
  applyIrritabilityEscalation,
  deriveSymptomFocusFromLocation,
} from '../src/engine/intakeTranslation'
import { interpretStates } from '../src/engine/hari/stateInterpretation'
import { resolveHariSession } from '../src/engine/hari/index'
import { buildHariSession, synthesizePainInput } from '../src/engine/hari/sessionBridge'
import { buildDeliveryConfig, applyLengthPreference } from '../src/engine/hari/sessionConfig'
import { classifyNeedProfile } from '../src/engine/hari/needProfile'
import { buildFeasibilityProfile } from '../src/engine/hari/feasibility'
import { selectBreathFamily } from '../src/engine/hari/breathFamily'

// ── Output paths ──────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Toggle audit run via env var: SWEEP_VARIANT=postfix → wire-through audit dir,
// otherwise the original baseline dir. Both are kept side-by-side for comparison.
const SWEEP_VARIANT = process.env.SWEEP_VARIANT === 'postfix' ? 'postfix' : 'baseline'
const OUT_DIR =
  SWEEP_VARIANT === 'postfix'
    ? path.resolve(__dirname, '..', 'docs', 'superpowers', 'audits', 'intake-output-sweep-2026-05-05-postfix')
    : path.resolve(__dirname, '..', 'docs', 'superpowers', 'audits', 'intake-output-sweep-2026-05-05')
console.log(`[sweep] variant=${SWEEP_VARIANT}, output dir = ${OUT_DIR}`)
const RAW_PATH = path.join(OUT_DIR, 'raw.jsonl')

// Make sure the output dir exists.
fs.mkdirSync(OUT_DIR, { recursive: true })

// ── Dimension enumeration ─────────────────────────────────────────────────────

const BRANCHES: IntakeBranch[] = ['tightness_or_pain', 'anxious_or_overwhelmed']
const SEVERITIES: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const IRRITABILITIES: IrritabilityPattern[] = [
  'fast_onset_slow_resolution',
  'slow_onset_fast_resolution',
  'symmetric',
]
const SENSITIVITIES: FlareSensitivity[] = ['low', 'moderate', 'high', 'not_sure']
const CONTEXTS: CurrentContext[] = ['sitting', 'standing', 'driving', 'lying_down', 'after_strain']
const LENGTHS: SessionLengthPreference[] = ['short', 'standard', 'long']
const SESSION_INTENTS: SessionIntent[] = [
  'quick_reset', 'deeper_regulation', 'flare_sensitive_support', 'cautious_test',
]

// ── Baseline variant: silent/adaptive symptom_focus enumeration ──────────────
const SYMPTOM_FOCI: SymptomFocus[] = [
  'proactive', 'neck_upper', 'rib_side_back', 'jaw_facial', 'spread_tension', 'mixed',
]

// ── Postfix variant: location-bucket enumeration ──────────────────────────────
//
// Each entry represents a clinically meaningful body-picker outcome. The
// resulting symptom_focus is computed via deriveSymptomFocusFromLocation,
// exercising the wire-through end-to-end.
interface LocationCase {
  id: string
  location: BodyLocation[]
  pattern: LocationPattern | undefined
}

const LOCATION_CASES: LocationCase[] = [
  // Empty (anxious branch, or user skipped picker)
  { id: 'empty', location: [], pattern: undefined },
  // Single bucket — one region from each
  { id: 'jaw_facial_only', location: ['jaw_tmj_facial'], pattern: 'single' },
  { id: 'neck_upper_only_neck', location: ['neck'], pattern: 'single' },
  { id: 'neck_upper_only_shoulder', location: ['shoulder_left'], pattern: 'single' },
  { id: 'rib_side_back_only_ribs', location: ['rib_side'], pattern: 'single' },
  { id: 'rib_side_back_only_chest', location: ['chest_sternum'], pattern: 'single' },
  { id: 'spread_tension_only_lower_back', location: ['lower_back'], pattern: 'single' },
  { id: 'spread_tension_only_glute', location: ['glute'], pattern: 'single' },
  { id: 'spread_tension_only_calves', location: ['calf_shin_left'], pattern: 'single' },
  { id: 'spread_tension_only_wrist', location: ['wrist_hand_right'], pattern: 'single' },
  // Connected (within one chain)
  { id: 'connected_lumbo_pelvic', location: ['lower_back', 'glute', 'hip_pelvis'], pattern: 'connected' },
  { id: 'connected_cervical_upper', location: ['neck', 'upper_back', 'shoulder_left'], pattern: 'connected' },
  // Multifocal (cross-bucket → derives to 'mixed')
  { id: 'multifocal_neck_lumbar', location: ['neck', 'lower_back'], pattern: 'multifocal' },
  { id: 'multifocal_jaw_rib', location: ['jaw_tmj_facial', 'rib_side'], pattern: 'multifocal' },
  // Widespread (4+ across 3+ chains)
  { id: 'widespread', location: ['neck', 'lower_back', 'shoulder_left', 'ankle_foot_right'], pattern: 'widespread' },
  // Diffuse (escape hatch)
  { id: 'diffuse_unspecified', location: [], pattern: 'diffuse_unspecified' },
]

const TOTAL_CASES =
  SWEEP_VARIANT === 'postfix'
    ? BRANCHES.length *
      SEVERITIES.length *
      IRRITABILITIES.length *
      SENSITIVITIES.length *
      CONTEXTS.length *
      LENGTHS.length *
      LOCATION_CASES.length *
      SESSION_INTENTS.length
    : BRANCHES.length *
      SEVERITIES.length *
      IRRITABILITIES.length *
      SENSITIVITIES.length *
      CONTEXTS.length *
      LENGTHS.length *
      SYMPTOM_FOCI.length *
      SESSION_INTENTS.length

console.log(`[sweep] enumerating ${TOTAL_CASES.toLocaleString()} intake cases`)

// ── Per-case runner ───────────────────────────────────────────────────────────

interface SweepRow {
  case_id: string
  intake: HariSessionIntake
  states: HariEmotionalState[]
  interpretation: ReturnType<typeof interpretStates>
  hari: {
    state_estimate: unknown
    link_map: unknown
    intervention: unknown
    session_framing: unknown
  }
  runtime_session: {
    protocol_id: string
    pain_input: ReturnType<typeof synthesizePainInput>
    timing_profile_pre_m6: unknown
  }
  delivery_config: ReturnType<typeof buildDeliveryConfig>
  need_profile: ReturnType<typeof classifyNeedProfile>
  feasibility_profile: ReturnType<typeof buildFeasibilityProfile>
  breath_family: ReturnType<typeof selectBreathFamily>
  output_fingerprint: string
}

interface IntakeArgs {
  branch: IntakeBranch
  baseline_intensity: number
  irritability: IrritabilityPattern
  flare_sensitivity: FlareSensitivity
  current_context: CurrentContext
  session_length_preference: SessionLengthPreference
  session_intent: SessionIntent
  // Baseline variant uses symptom_focus directly; postfix variant uses location.
  symptom_focus?: SymptomFocus
  location_case?: LocationCase
}

const ADAPTIVE_FOCUS_FALLBACK: SymptomFocus = 'spread_tension'

function makeIntake(args: IntakeArgs): HariSessionIntake {
  if (SWEEP_VARIANT === 'postfix') {
    // Apply the SessionIntakeScreen.handleSubmit equivalent transformations.
    const lc = args.location_case!
    const effectiveFlare = applyIrritabilityEscalation(args.flare_sensitivity, args.irritability)
    const derivedFocus = deriveSymptomFocusFromLocation(lc.location, lc.pattern, ADAPTIVE_FOCUS_FALLBACK)
    return {
      branch: args.branch,
      irritability: args.irritability,
      baseline_intensity: args.baseline_intensity,
      flare_sensitivity: effectiveFlare,
      location: lc.location,
      location_muscles: undefined,
      location_pattern: lc.pattern,
      current_context: args.current_context,
      session_length_preference: args.session_length_preference,
      session_intent: args.session_intent,
      symptom_focus: derivedFocus,
    }
  }
  // Baseline variant — silent/adaptive symptom_focus, no wire-throughs applied.
  return {
    branch: args.branch,
    irritability: args.irritability,
    baseline_intensity: args.baseline_intensity,
    flare_sensitivity: args.flare_sensitivity,
    location: [],
    location_muscles: undefined,
    location_pattern: undefined,
    current_context: args.current_context,
    session_length_preference: args.session_length_preference,
    session_intent: args.session_intent,
    symptom_focus: args.symptom_focus!,
  }
}

function caseId(intake: HariSessionIntake, locationLabel?: string): string {
  return [
    intake.branch,
    `s${intake.baseline_intensity}`,
    intake.irritability,
    intake.flare_sensitivity,
    intake.current_context,
    intake.session_length_preference,
    locationLabel ?? intake.symptom_focus,
    intake.session_intent,
  ].join('__')
}

function fingerprintFor(row: Omit<SweepRow, 'output_fingerprint' | 'case_id'>): string {
  const dc = row.delivery_config
  const protocol = row.runtime_session.protocol_id
  const family = (row.breath_family as { name?: string }).name ?? 'unknown'
  return [
    `protocol=${protocol}`,
    `family=${family}`,
    `inhale=${dc.inhaleSeconds}`,
    `hold=${dc.holdSeconds}`,
    `exhale=${dc.exhaleSeconds}`,
    `duration=${dc.durationSeconds}`,
  ].join('|')
}

// ── M7 sensor state builder ───────────────────────────────────────────────────

function buildIntakeSensorState(intake: HariSessionIntake): IntakeSensorState {
  const breathDowngraded =
    intake.flare_sensitivity === 'high' || intake.baseline_intensity >= 7
  return {
    branch: intake.branch,
    location: intake.location,
    location_pattern: intake.location_pattern,
    current_context: intake.current_context,
    session_intent: intake.session_intent,
    session_length_preference: intake.session_length_preference,
    flare_sensitivity: intake.flare_sensitivity,
    baseline_intensity: intake.baseline_intensity,
    irritability: intake.irritability,
    derived_signals: { breathDowngraded },
  }
}

function runCase(intake: HariSessionIntake, locationLabel?: string): SweepRow {
  const states = branchToEmotionalStates(intake.branch)
  const interpretation = interpretStates({
    states,
    intensity: intake.baseline_intensity,
    sensitivity: intake.flare_sensitivity,
  })

  const hariResolution = resolveHariSession(intake, null)
  const runtimeSession = buildHariSession(hariResolution, { outcome: 'CLEAR' })

  // Postfix variant: pass session_length_preference into buildDeliveryConfig
  // and apply the same length adjustment to NeedProfile so the report's
  // need_profile / feasibility_profile reflect the actual configured session.
  const baseNeed = classifyNeedProfile(interpretation)
  const need =
    SWEEP_VARIANT === 'postfix'
      ? applyLengthPreference(baseNeed, intake.session_length_preference)
      : baseNeed
  const feasibility = buildFeasibilityProfile(need)
  const family = selectBreathFamily(need, feasibility)
  const deliveryConfig =
    SWEEP_VARIANT === 'postfix'
      ? buildDeliveryConfig(interpretation, intake.session_length_preference)
      : buildDeliveryConfig(interpretation)

  const partial: Omit<SweepRow, 'output_fingerprint' | 'case_id'> = {
    intake,
    states,
    interpretation,
    hari: {
      state_estimate: hariResolution.state_estimate,
      link_map: hariResolution.link_map,
      intervention: hariResolution.intervention,
      session_framing: hariResolution.session_framing,
    },
    runtime_session: {
      protocol_id: (runtimeSession.hari_metadata?.intervention.mapped_protocol_id) ?? 'UNKNOWN',
      pain_input: synthesizePainInput(intake),
      timing_profile_pre_m6: runtimeSession.timing_profile,
    },
    delivery_config: deliveryConfig,
    need_profile: need,
    feasibility_profile: feasibility,
    breath_family: family,
  }

  return {
    ...partial,
    case_id: caseId(intake, locationLabel),
    output_fingerprint: fingerprintFor(partial),
  }
}

// ── Validation: 100-case spot check before full sweep ─────────────────────────

console.log('[sweep] running 100-case validation spot check...')
let validationOk = true
let validationError: string | null = null
try {
  for (let i = 0; i < 100; i++) {
    const baseArgs = {
      branch: BRANCHES[i % BRANCHES.length],
      baseline_intensity: SEVERITIES[i % SEVERITIES.length],
      irritability: IRRITABILITIES[i % IRRITABILITIES.length],
      flare_sensitivity: SENSITIVITIES[i % SENSITIVITIES.length],
      current_context: CONTEXTS[i % CONTEXTS.length],
      session_length_preference: LENGTHS[i % LENGTHS.length],
      session_intent: SESSION_INTENTS[i % SESSION_INTENTS.length],
    }
    const intake =
      SWEEP_VARIANT === 'postfix'
        ? makeIntake({ ...baseArgs, location_case: LOCATION_CASES[i % LOCATION_CASES.length] })
        : makeIntake({ ...baseArgs, symptom_focus: SYMPTOM_FOCI[i % SYMPTOM_FOCI.length] })
    runCase(intake, SWEEP_VARIANT === 'postfix' ? LOCATION_CASES[i % LOCATION_CASES.length].id : undefined)
  }
} catch (err) {
  validationOk = false
  validationError = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack ?? ''}` : String(err)
}
if (!validationOk) {
  console.error('[sweep] VALIDATION FAILED:', validationError)
  process.exit(1)
}
console.log('[sweep] validation passed — proceeding to full sweep')

// ── Full sweep ────────────────────────────────────────────────────────────────

const startTime = Date.now()
const writeStream = fs.createWriteStream(RAW_PATH, { encoding: 'utf-8' })

let written = 0
const fingerprintCounts = new Map<string, number>()
const fingerprintExemplars = new Map<string, SweepRow>()
const fingerprintCohorts = new Map<string, SweepRow['intake'][]>()

function recordRow(row: SweepRow): void {
  const fp = row.output_fingerprint
  fingerprintCounts.set(fp, (fingerprintCounts.get(fp) ?? 0) + 1)
  if (!fingerprintExemplars.has(fp)) fingerprintExemplars.set(fp, row)
  const cohort = fingerprintCohorts.get(fp) ?? []
  cohort.push(row.intake)
  fingerprintCohorts.set(fp, cohort)
}

// The 8th-axis variant differs by sweep variant:
//   baseline → SYMPTOM_FOCI (silent / adaptive symptom_focus, location empty)
//   postfix  → LOCATION_CASES (body-picker buckets driving derived symptom_focus)
const EIGHTH_AXIS: Array<SymptomFocus | LocationCase> =
  SWEEP_VARIANT === 'postfix' ? LOCATION_CASES : SYMPTOM_FOCI

for (const branch of BRANCHES) {
  for (const baseline_intensity of SEVERITIES) {
    for (const irritability of IRRITABILITIES) {
      for (const flare_sensitivity of SENSITIVITIES) {
        for (const current_context of CONTEXTS) {
          for (const session_length_preference of LENGTHS) {
            for (const eighth of EIGHTH_AXIS) {
              for (const session_intent of SESSION_INTENTS) {
                const baseArgs = {
                  branch, baseline_intensity, irritability, flare_sensitivity,
                  current_context, session_length_preference, session_intent,
                }
                const isLocationCase = SWEEP_VARIANT === 'postfix'
                const intake = makeIntake(
                  isLocationCase
                    ? { ...baseArgs, location_case: eighth as LocationCase }
                    : { ...baseArgs, symptom_focus: eighth as SymptomFocus }
                )
                const locationLabel = isLocationCase ? (eighth as LocationCase).id : undefined
                let row: SweepRow
                try {
                  row = runCase(intake, locationLabel)
                } catch (err) {
                  console.error(`[sweep] case failed: ${caseId(intake, locationLabel)}`, err)
                  continue
                }

                // ── M7.2 regression assertion (postfix only) ──────────────────
                // M7 selection routes on session_length_preference and mirrors
                // the postfix wire-through, not the baseline (which ignores length).
                //
                // M7.1 contract: BREATH-PHASE timing equivalence with legacy.
                //   The TimingProfile adapter finds the breath phase by type;
                //   intro + closing transitions don't affect this comparison.
                // M7.2 contract: every variant has exactly 3 phases
                //   ([intro_transition, breath, closing_transition]) per the
                //   pathway library v0.2 migration.
                if (SWEEP_VARIANT === 'postfix') {
                  const caseIndex = written
                  const intakeSensorState = buildIntakeSensorState(intake)
                  const m7Result = buildM7Session(intakeSensorState)
                  const dc = row.delivery_config
                  const legacyRounds = Math.floor(dc.durationSeconds / (dc.inhaleSeconds + dc.exhaleSeconds))
                  const legacyTimingMatches =
                    dc.inhaleSeconds === m7Result.timing.inhale_seconds &&
                    dc.exhaleSeconds === m7Result.timing.exhale_seconds &&
                    legacyRounds === m7Result.timing.rounds
                  if (!legacyTimingMatches) {
                    throw new Error(
                      `M7.1 regression at case ${caseIndex}: legacy ${JSON.stringify({ inhale: dc.inhaleSeconds, exhale: dc.exhaleSeconds, rounds: legacyRounds })} vs m7 ${JSON.stringify(m7Result.timing)} for intake ${JSON.stringify(intakeSensorState)}`
                    )
                  }
                  if (m7Result.variant.phases.length !== 3) {
                    throw new Error(
                      `M7.2 phase count regression at case ${caseIndex}: expected 3 phases (intro+breath+closing), got ${m7Result.variant.phases.length} for variant ${m7Result.variant.variant_id}`
                    )
                  }
                }
                // ─────────────────────────────────────────────────────────────

                writeStream.write(JSON.stringify(row) + '\n')
                recordRow(row)
                written++
                if (written % 10_000 === 0) {
                  const pct = ((written / TOTAL_CASES) * 100).toFixed(1)
                  console.log(`[sweep] ${written.toLocaleString()} / ${TOTAL_CASES.toLocaleString()} (${pct}%)`)
                }
              }
            }
          }
        }
      }
    }
  }
}

writeStream.end()
await new Promise<void>((resolve, reject) => {
  writeStream.on('finish', () => resolve())
  writeStream.on('error', reject)
})

const elapsedMs = Date.now() - startTime
console.log(`[sweep] wrote ${written.toLocaleString()} cases in ${(elapsedMs / 1000).toFixed(1)}s → ${RAW_PATH}`)
console.log(`[sweep] distinct output fingerprints: ${fingerprintCounts.size}`)

// ── Hand off to report generators ─────────────────────────────────────────────

import { writeReports } from './intakeOutputSweep.report'

writeReports({
  outDir: OUT_DIR,
  totalCases: written,
  elapsedMs,
  fingerprintCounts,
  fingerprintExemplars,
  fingerprintCohorts,
})

console.log('[sweep] done')
