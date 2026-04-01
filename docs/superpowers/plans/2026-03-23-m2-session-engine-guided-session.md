# M2 Session Engine + Guided Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete M2 vertical slice: safety precheck, deterministic mechanism scoring, protocol selection, real guided session screen with countdown-first breathing orb, 3-step emergence, completion form, session save, and history display.

**Architecture:** The execution engine (`src/engine/`) is a pure functional pipeline — `resolveSession(input)` runs safetyPrecheck → mechanismScoring → protocolSelection → sessionBuilder and returns a `SessionResolution` union. The UI layer (GuidedSessionScreen + components) consumes the resolved session object; AppContext state machine routes between screens. Session history is persisted to localStorage under `medicaLm_session_history`.

**Tech Stack:** React 18, TypeScript, Framer Motion 11, Vitest 2, @testing-library/react, CSS Modules, localStorage

---

## File Structure

**New files:**
- `src/engine/safetyPrecheck.ts` — pure fn: checks input for escalation/stop tags → SafetyAssessment
- `src/engine/safetyPrecheck.test.ts`
- `src/engine/mechanismScoring.ts` — pure fn: scores all mechanisms from input → ranked MechanismScore[]
- `src/engine/mechanismScoring.test.ts`
- `src/engine/protocolSelection.ts` — pure fn: picks protocol from ranked mechanisms + blocking rules → ProtocolDefinition
- `src/engine/protocolSelection.test.ts`
- `src/engine/sessionBuilder.ts` — pure fn: assembles RuntimeSession from protocol + input + safety assessment
- `src/engine/sessionBuilder.test.ts`
- `src/engine/index.ts` — composes pipeline, exports `resolveSession(input): SessionResolution`
- `src/storage/sessionHistory.ts` — `saveSession()`, `loadHistory()` wrappers
- `src/storage/sessionHistory.test.ts`
- `src/screens/SafetyStopScreen.tsx` + `SafetyStopScreen.module.css`
- `src/components/BreathingOrb.tsx` + `BreathingOrb.module.css`
- `src/components/StepEmergence.tsx` + `StepEmergence.module.css`
- `src/components/CompletionForm.tsx` + `CompletionForm.module.css`
- `src/screens/GuidedSessionScreen.tsx` + `GuidedSessionScreen.module.css`

**Modified files:**
- `src/context/AppContext.tsx` — add `guided_session`, `safety_stop` screens; add `activeSession`, `safetyAssessment` state; add new actions
- `src/context/AppProvider.tsx` — add reducer cases for new actions
- `src/screens/PainInputScreen.tsx` — call `resolveSession()` on submit, route to real screen
- `src/App.tsx` — wire new screens, remove session_placeholder
- `src/App.test.tsx` — update test that checks for "milestone 1 complete"

---

## Task 1: Safety Precheck Engine

**Files:**
- Create: `src/engine/safetyPrecheck.ts`
- Create: `src/engine/safetyPrecheck.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/engine/safetyPrecheck.test.ts
import { describe, it, expect } from 'vitest'
import { runSafetyPrecheck } from './safetyPrecheck'
import type { PainInputState } from '../types'

const base: PainInputState = {
  pain_level: 5,
  location_tags: ['back_neck'],
  symptom_tags: ['tightness'],
}

describe('runSafetyPrecheck', () => {
  it('returns DIRECT_SESSION_MODE for clean input', () => {
    const result = runSafetyPrecheck(base)
    expect(result.mode).toBe('DIRECT_SESSION_MODE')
    expect(result.safety_tags).toHaveLength(0)
    expect(result.stop_reason).toBeNull()
  })

  it('returns SAFETY_STOP_MODE when coordination_change is in symptom_tags', () => {
    const input = { ...base, symptom_tags: ['coordination_change'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
    expect(result.safety_tags).toContain('coordination_change')
    expect(result.stop_reason).not.toBeNull()
  })

  it('returns SAFETY_STOP_MODE when weakness is in symptom_tags', () => {
    const input = { ...base, symptom_tags: ['weakness'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
  })

  it('returns SAFETY_STOP_MODE when hand location + numbness present', () => {
    const input = { ...base, location_tags: ['hand'], symptom_tags: ['numbness'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
    expect(result.safety_tags).toContain('hand_dysfunction_proxy')
  })

  it('returns SAFETY_STOP_MODE when hand location + tingling present', () => {
    const input = { ...base, location_tags: ['hand'], symptom_tags: ['tingling'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('SAFETY_STOP_MODE')
  })

  it('returns DIRECT_SESSION_MODE when hand present but no nerve-type symptom', () => {
    const input = { ...base, location_tags: ['hand'], symptom_tags: ['tightness'] }
    const result = runSafetyPrecheck(input)
    expect(result.mode).toBe('DIRECT_SESSION_MODE')
  })

  it('includes stop_reason string for all stop modes', () => {
    const input = { ...base, symptom_tags: ['coordination_change'] }
    const result = runSafetyPrecheck(input)
    expect(typeof result.stop_reason).toBe('string')
    expect(result.stop_reason!.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/safetyPrecheck.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// src/engine/safetyPrecheck.ts
import type { PainInputState, SafetyAssessment } from '../types'

/**
 * Symptom tags that always trigger SAFETY_STOP_MODE.
 * Authority: Execution Spec (doc 04) § 2. Safety Precheck Engine
 */
const SYMPTOM_STOP_TAGS = ['coordination_change', 'weakness'] as const

/**
 * Hand location + any of these symptoms = hand_dysfunction proxy.
 * Triggers SAFETY_STOP_MODE.
 */
const HAND_NERVE_SYMPTOMS = ['numbness', 'tingling', 'radiating'] as const

export function runSafetyPrecheck(input: PainInputState): SafetyAssessment {
  const hitSymptomStop = input.symptom_tags.filter((t) =>
    (SYMPTOM_STOP_TAGS as readonly string[]).includes(t)
  )
  if (hitSymptomStop.length > 0) {
    return {
      mode: 'SAFETY_STOP_MODE',
      safety_tags: hitSymptomStop,
      stop_reason:
        'Input contains a symptom requiring clinical assessment before guided session.',
    }
  }

  const hasHand = input.location_tags.includes('hand')
  const hasNerveSymptom = input.symptom_tags.some((t) =>
    (HAND_NERVE_SYMPTOMS as readonly string[]).includes(t)
  )
  if (hasHand && hasNerveSymptom) {
    return {
      mode: 'SAFETY_STOP_MODE',
      safety_tags: ['hand_dysfunction_proxy'],
      stop_reason:
        'Hand location with nerve-type symptom — requires clinical review before guided session.',
    }
  }

  return {
    mode: 'DIRECT_SESSION_MODE',
    safety_tags: [],
    stop_reason: null,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/safetyPrecheck.test.ts`
Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/engine/safetyPrecheck.ts src/engine/safetyPrecheck.test.ts
git commit -m "feat(engine): add safety precheck — coordination_change, weakness, hand+nerve proxy"
```

---

## Task 2: Mechanism Scoring Engine

**Files:**
- Create: `src/engine/mechanismScoring.ts`
- Create: `src/engine/mechanismScoring.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/engine/mechanismScoring.test.ts
import { describe, it, expect } from 'vitest'
import { scoreMechanisms } from './mechanismScoring'
import type { PainInputState } from '../types'

describe('scoreMechanisms', () => {
  it('returns all mechanisms with a score property', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['ribs'],
      symptom_tags: ['tightness'],
    }
    const results = scoreMechanisms(input)
    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(typeof r.score).toBe('number')
      expect(typeof r.mechanism_id).toBe('string')
    }
  })

  it('scores RIB_RESTRICTION highest for rib + shallow_breathing', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['ribs', 'mid_back'],
      symptom_tags: ['tightness', 'shallow_breathing', 'aching'],
    }
    const results = scoreMechanisms(input)
    const top = results[0]
    expect(top.mechanism_id).toBe('MECH_RIB_RESTRICTION')
  })

  it('scores MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION highest for arm + burning + radiating', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['arm'],
      symptom_tags: ['burning', 'radiating', 'tingling'],
    }
    const results = scoreMechanisms(input)
    expect(results[0].mechanism_id).toBe('MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')
  })

  it('applies severity bonus for pain_level >= 7', () => {
    const base: PainInputState = {
      pain_level: 5,
      location_tags: ['ribs'],
      symptom_tags: ['tightness'],
    }
    const high: PainInputState = { ...base, pain_level: 7 }
    const baseResults = scoreMechanisms(base)
    const highResults = scoreMechanisms(high)
    // top-scored mechanism should have higher score in high pain
    const baseScore = baseResults[0].score
    const highScore = highResults[0].score
    expect(highScore).toBeGreaterThan(baseScore)
  })

  it('applies -99 safety_penalty for contraindicated input', () => {
    // MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION has contraindication: progressive_weakness, worsening_numbness
    // We cannot select these from taxonomy but we test the penalty logic directly
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['arm'],
      symptom_tags: ['burning', 'radiating'],
    }
    const results = scoreMechanisms(input)
    const nerveEntry = results.find(r => r.mechanism_id === 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')
    expect(nerveEntry).toBeDefined()
    expect(nerveEntry!.score).toBeGreaterThan(0)
  })

  it('returns results sorted descending by score', () => {
    const input: PainInputState = {
      pain_level: 5,
      location_tags: ['back_neck'],
      symptom_tags: ['stiffness', 'tightness'],
    }
    const results = scoreMechanisms(input)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('trigger_tag contributes score (×2) when it matches mechanism trigger_tags', () => {
    const withTrigger: PainInputState = {
      pain_level: 5,
      location_tags: ['back_neck'],
      symptom_tags: ['tightness'],
      trigger_tag: 'driving',
    }
    const withoutTrigger: PainInputState = {
      pain_level: 5,
      location_tags: ['back_neck'],
      symptom_tags: ['tightness'],
    }
    const withResults = scoreMechanisms(withTrigger)
    const withoutResults = scoreMechanisms(withoutTrigger)
    // MECH_POSTURAL_COMPRESSION has trigger: driving
    const withComp = withResults.find(r => r.mechanism_id === 'MECH_POSTURAL_COMPRESSION')!
    const withoutComp = withoutResults.find(r => r.mechanism_id === 'MECH_POSTURAL_COMPRESSION')!
    expect(withComp.score).toBeGreaterThan(withoutComp.score)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/mechanismScoring.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// src/engine/mechanismScoring.ts
import type { PainInputState } from '../types'
import { MECHANISMS } from '../data/mechanisms'

/**
 * Authority: Execution Spec (doc 04) § 3. Mechanism Scoring Engine
 * Weights: symptom_match ×4 | location_match ×3 | trigger_match ×2
 *          severity_high +2 | severity_very_high +3 | contraindication -99
 */

export interface MechanismScore {
  mechanism_id: string
  score: number
}

/**
 * Maps location tags to mechanisms they implicate.
 * Derived from Mechanism + Protocol Mapping (doc 19).
 * This table is the canonical source for location→mechanism scoring weight.
 */
const LOCATION_MECHANISM_MAP: Record<string, string[]> = {
  head:        ['MECH_CERVICAL_GUARDING', 'MECH_GENERAL_OVERPROTECTION_STATE'],
  jaw:         ['MECH_JAW_CERVICAL_CO_CONTRACTION', 'MECH_CERVICAL_GUARDING'],
  ear:         ['MECH_JAW_CERVICAL_CO_CONTRACTION'],
  front_neck:  ['MECH_CERVICAL_GUARDING'],
  back_neck:   ['MECH_CERVICAL_GUARDING', 'MECH_POSTURAL_COMPRESSION'],
  throat:      ['MECH_CERVICAL_GUARDING'],
  shoulders:   ['MECH_POSTURAL_COMPRESSION', 'MECH_CERVICAL_GUARDING'],
  chest:       ['MECH_RIB_RESTRICTION', 'MECH_GENERAL_OVERPROTECTION_STATE'],
  upper_back:  ['MECH_POSTURAL_COMPRESSION', 'MECH_RIB_RESTRICTION'],
  ribs:        ['MECH_RIB_RESTRICTION', 'MECH_POSTURAL_COMPRESSION'],
  mid_back:    ['MECH_RIB_RESTRICTION'],
  lower_back:  ['MECH_POSTURAL_COMPRESSION'],
  hips:        ['MECH_POSTURAL_COMPRESSION'],
  arm:         ['MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION'],
  hand:        ['MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION'],
}

export function scoreMechanisms(input: PainInputState): MechanismScore[] {
  const severityBonus =
    input.pain_level >= 9 ? 3 : input.pain_level >= 7 ? 2 : 0

  const scored = MECHANISMS.map((mech) => {
    // Contraindication check — hard veto
    const hasContraindication = mech.contraindication_tags.some((ct) =>
      input.symptom_tags.includes(ct)
    )
    if (hasContraindication) {
      return { mechanism_id: mech.mechanism_id, score: -99 }
    }

    // Symptom match ×4
    const symptomMatches = input.symptom_tags.filter((t) =>
      mech.symptom_tags.includes(t)
    ).length
    const symptomScore = symptomMatches * 4

    // Location match ×3 (via lookup table, not mechanism schema)
    const locationMatches = input.location_tags.filter((loc) => {
      const implicatedMechs = LOCATION_MECHANISM_MAP[loc] ?? []
      return implicatedMechs.includes(mech.mechanism_id)
    }).length
    const locationScore = locationMatches * 3

    // Trigger match ×2
    const triggerScore =
      input.trigger_tag && mech.trigger_tags.includes(input.trigger_tag) ? 2 : 0

    const total = symptomScore + locationScore + triggerScore + severityBonus

    return { mechanism_id: mech.mechanism_id, score: total }
  })

  return scored.sort((a, b) => b.score - a.score)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/mechanismScoring.test.ts`
Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/engine/mechanismScoring.ts src/engine/mechanismScoring.test.ts
git commit -m "feat(engine): add mechanism scoring with location-mechanism lookup table"
```

---

## Task 3: Protocol Selection Engine

**Files:**
- Create: `src/engine/protocolSelection.ts`
- Create: `src/engine/protocolSelection.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/engine/protocolSelection.test.ts
import { describe, it, expect } from 'vitest'
import { selectProtocol } from './protocolSelection'
import type { PainInputState } from '../types'
import type { MechanismScore } from './mechanismScoring'

function makeScores(topId: string, rest: string[] = []): MechanismScore[] {
  return [
    { mechanism_id: topId, score: 20 },
    ...rest.map((id, i) => ({ mechanism_id: id, score: 10 - i })),
  ]
}

describe('selectProtocol', () => {
  it('selects PROTO_BURNING_NERVE_CALM_RESET when MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION is top', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['arm'], symptom_tags: ['burning'] }
    const scores = makeScores('MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_BURNING_NERVE_CALM_RESET')
  })

  it('selects PROTO_RIB_EXPANSION_RESET when MECH_RIB_RESTRICTION is top', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['ribs'], symptom_tags: ['tightness'] }
    const scores = makeScores('MECH_RIB_RESTRICTION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_RIB_EXPANSION_RESET')
  })

  it('selects PROTO_JAW_UNCLENCH_RESET when MECH_JAW_CERVICAL_CO_CONTRACTION is top', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['jaw'], symptom_tags: ['tightness'] }
    const scores = makeScores('MECH_JAW_CERVICAL_CO_CONTRACTION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_JAW_UNCLENCH_RESET')
  })

  it('selects PROTO_SEATED_DECOMPRESSION_RESET when MECH_POSTURAL_COMPRESSION is top', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['lower_back'], symptom_tags: ['pressure'] }
    const scores = makeScores('MECH_POSTURAL_COMPRESSION')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBe('PROTO_SEATED_DECOMPRESSION_RESET')
  })

  it('blocks movement protocols when MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION is in top 3', () => {
    const input: PainInputState = { pain_level: 5, location_tags: ['arm'], symptom_tags: ['burning'] }
    const scores = [
      { mechanism_id: 'MECH_RIB_RESTRICTION', score: 20 },
      { mechanism_id: 'MECH_POSTURAL_COMPRESSION', score: 15 },
      { mechanism_id: 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION', score: 10 },
    ]
    const protocol = selectProtocol(scores, input)
    // Must not be PROTO_GENTLE_CERVICAL_RECONNECTION (breath_with_micro_movement)
    expect(protocol.display_mode).not.toBe('breath_with_micro_movement')
  })

  it('blocks movement protocols when pain_level >= 7', () => {
    const input: PainInputState = { pain_level: 7, location_tags: ['back_neck'], symptom_tags: ['stiffness'] }
    const scores = makeScores('MECH_CERVICAL_GUARDING')
    const protocol = selectProtocol(scores, input)
    expect(protocol.display_mode).not.toBe('breath_with_micro_movement')
  })

  it('always returns a valid ProtocolDefinition (never undefined)', () => {
    const input: PainInputState = { pain_level: 3, location_tags: ['shoulders'], symptom_tags: ['aching'] }
    const scores = makeScores('MECH_GENERAL_OVERPROTECTION_STATE')
    const protocol = selectProtocol(scores, input)
    expect(protocol.protocol_id).toBeDefined()
    expect(protocol.cue_sequence.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/protocolSelection.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// src/engine/protocolSelection.ts
import type { PainInputState, ProtocolDefinition } from '../types'
import { PROTOCOLS } from '../data/protocols'
import type { MechanismScore } from './mechanismScoring'

/**
 * Authority: Execution Spec (doc 04) § 4. Protocol Selection Engine
 *            Mechanism + Protocol Mapping (doc 19) § Protocol Entry Decision Matrix
 */

/** Ordered protocol candidates per top mechanism. First valid entry wins. */
const ENTRY_CANDIDATES: Record<string, string[]> = {
  MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION: ['PROTO_BURNING_NERVE_CALM_RESET'],
  MECH_GENERAL_OVERPROTECTION_STATE:         ['PROTO_SUPPORTED_FORWARD_LEAN_RESET', 'PROTO_RIB_EXPANSION_RESET'],
  MECH_JAW_CERVICAL_CO_CONTRACTION:          ['PROTO_JAW_UNCLENCH_RESET'],
  MECH_POSTURAL_COMPRESSION:                 ['PROTO_SEATED_DECOMPRESSION_RESET', 'PROTO_RIB_EXPANSION_RESET'],
  MECH_RIB_RESTRICTION:                      ['PROTO_RIB_EXPANSION_RESET', 'PROTO_SEATED_DECOMPRESSION_RESET'],
  MECH_CERVICAL_GUARDING:                    ['PROTO_RIB_EXPANSION_RESET', 'PROTO_SEATED_DECOMPRESSION_RESET'],
}

/** Display modes that involve active movement. Blocked under nerve or high-pain conditions. */
const MOVEMENT_MODES = ['breath_with_micro_movement', 'position_with_breath'] as const

function isMovementProtocol(p: ProtocolDefinition): boolean {
  return (MOVEMENT_MODES as readonly string[]).includes(p.display_mode)
}

function buildBlockedIds(rankedScores: MechanismScore[], input: PainInputState): Set<string> {
  const blocked = new Set<string>()

  const nerveInTop3 = rankedScores
    .slice(0, 3)
    .some((s) => s.mechanism_id === 'MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION')

  for (const p of PROTOCOLS) {
    if (nerveInTop3 && isMovementProtocol(p)) blocked.add(p.protocol_id)
    if (input.pain_level >= 7 && isMovementProtocol(p)) blocked.add(p.protocol_id)
  }

  return blocked
}

export function selectProtocol(
  rankedScores: MechanismScore[],
  input: PainInputState,
): ProtocolDefinition {
  const protocolMap = new Map(PROTOCOLS.map((p) => [p.protocol_id, p]))
  const blocked = buildBlockedIds(rankedScores, input)

  // Walk ranked mechanisms, try each candidate in order
  for (const { mechanism_id } of rankedScores) {
    const candidates = ENTRY_CANDIDATES[mechanism_id] ?? []
    for (const candidateId of candidates) {
      if (blocked.has(candidateId)) continue
      const protocol = protocolMap.get(candidateId)
      if (protocol) return protocol
    }
  }

  // Safe fallback: PROTO_RIB_EXPANSION_RESET (breath_with_body_cue, always safe)
  return protocolMap.get('PROTO_RIB_EXPANSION_RESET')!
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/protocolSelection.test.ts`
Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/engine/protocolSelection.ts src/engine/protocolSelection.test.ts
git commit -m "feat(engine): add deterministic protocol selection with blocking rules"
```

---

## Task 4: Session Builder + Engine Index

**Files:**
- Create: `src/engine/sessionBuilder.ts`
- Create: `src/engine/sessionBuilder.test.ts`
- Create: `src/engine/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/engine/sessionBuilder.test.ts
import { describe, it, expect } from 'vitest'
import { buildSession } from './sessionBuilder'
import type { PainInputState, ProtocolDefinition, SafetyAssessment } from '../types'

const mockProtocol: ProtocolDefinition = {
  protocol_id: 'PROTO_RIB_EXPANSION_RESET',
  protocol_name: 'Rib Expansion Reset',
  goal: 'Reduce compression and restore rib motion.',
  primary_mechanisms: ['MECH_RIB_RESTRICTION'],
  display_mode: 'breath_with_body_cue',
  default_timing_profile: { inhale_seconds: 4, exhale_seconds: 7, rounds: 8 },
  cue_sequence: ['Inhale four. Expand ribs.', 'Exhale seven. Drop shoulders.', 'Jaw loose. Neck soft.'],
  microtext_options: [],
  safe_use_cases: [],
  caution_flags: [],
  stop_conditions: ['dizziness'],
  follow_up_candidates: ['PROTO_GENTLE_CERVICAL_RECONNECTION'],
  provenance_tags: ['product_inference'],
}

const mockInput: PainInputState = {
  pain_level: 5,
  location_tags: ['ribs'],
  symptom_tags: ['tightness'],
}

const mockSafety: SafetyAssessment = {
  mode: 'DIRECT_SESSION_MODE',
  safety_tags: [],
  stop_reason: null,
}

describe('buildSession', () => {
  it('returns a RuntimeSession with all required fields populated', () => {
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(session.session_id).toMatch(/^sess_/)
    expect(session.protocol_id).toBe('PROTO_RIB_EXPANSION_RESET')
    expect(session.protocol_name).toBe('Rib Expansion Reset')
    expect(session.goal).toBe('Reduce compression and restore rib motion.')
    expect(session.display_mode).toBe('breath_with_body_cue')
    expect(session.timing_profile).toEqual({ inhale_seconds: 4, exhale_seconds: 7, rounds: 8 })
    expect(session.cue_sequence).toHaveLength(3)
    expect(session.status).toBe('completed')
    expect(session.pain_input).toEqual(mockInput)
    expect(session.safety_assessment).toEqual(mockSafety)
  })

  it('computes estimated_length_seconds correctly', () => {
    // (4 + 7 + 0.4) * 8 = 11.4 * 8 = 91.2 → floor → 91
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(session.estimated_length_seconds).toBe(91)
  })

  it('creates a valid ISO 8601 created_at timestamp', () => {
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(() => new Date(session.created_at)).not.toThrow()
    expect(session.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('generates unique session_ids', () => {
    const a = buildSession(mockProtocol, mockInput, mockSafety)
    const b = buildSession(mockProtocol, mockInput, mockSafety)
    expect(a.session_id).not.toBe(b.session_id)
  })

  it('copies stop_conditions and follow_up_candidates from protocol', () => {
    const session = buildSession(mockProtocol, mockInput, mockSafety)
    expect(session.stop_conditions).toContain('dizziness')
    expect(session.allowed_follow_up).toContain('PROTO_GENTLE_CERVICAL_RECONNECTION')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/sessionBuilder.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write sessionBuilder.ts**

```typescript
// src/engine/sessionBuilder.ts
import type { PainInputState, ProtocolDefinition, RuntimeSession, SafetyAssessment } from '../types'

export function buildSession(
  protocol: ProtocolDefinition,
  input: PainInputState,
  safety: SafetyAssessment,
): RuntimeSession {
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const { inhale_seconds, exhale_seconds, rounds } = protocol.default_timing_profile
  const estimated = Math.floor((inhale_seconds + exhale_seconds + 0.4) * rounds)

  return {
    session_id: id,
    created_at: new Date().toISOString(),
    protocol_id: protocol.protocol_id,
    protocol_name: protocol.protocol_name,
    goal: protocol.goal,
    display_mode: protocol.display_mode,
    timing_profile: protocol.default_timing_profile,
    cue_sequence: protocol.cue_sequence,
    estimated_length_seconds: estimated,
    status: 'completed',
    stop_conditions: protocol.stop_conditions,
    allowed_follow_up: protocol.follow_up_candidates,
    provenance_tags: protocol.provenance_tags,
    pain_input: input,
    safety_assessment: safety,
  }
}
```

- [ ] **Step 4: Write engine/index.ts**

```typescript
// src/engine/index.ts
import type { PainInputState, RuntimeSession, SafetyAssessment } from '../types'
import { runSafetyPrecheck } from './safetyPrecheck'
import { scoreMechanisms } from './mechanismScoring'
import { selectProtocol } from './protocolSelection'
import { buildSession } from './sessionBuilder'

export type SessionResolution =
  | { kind: 'session'; session: RuntimeSession }
  | { kind: 'safety_stop'; assessment: SafetyAssessment }

export function resolveSession(input: PainInputState): SessionResolution {
  const safety = runSafetyPrecheck(input)

  if (safety.mode === 'SAFETY_STOP_MODE') {
    return { kind: 'safety_stop', assessment: safety }
  }

  const rankedMechanisms = scoreMechanisms(input)
  const protocol = selectProtocol(rankedMechanisms, input)
  const session = buildSession(protocol, input, safety)

  return { kind: 'session', session }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/engine/`
Expected: PASS — all engine tests

- [ ] **Step 6: Commit**

```bash
git add src/engine/sessionBuilder.ts src/engine/sessionBuilder.test.ts src/engine/index.ts
git commit -m "feat(engine): add session builder and resolveSession pipeline"
```

---

## Task 5: Session History Storage

**Files:**
- Create: `src/storage/sessionHistory.ts`
- Create: `src/storage/sessionHistory.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/storage/sessionHistory.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { saveSession, loadHistory } from './sessionHistory'
import type { HistoryEntry } from '../types'

const entry: HistoryEntry = {
  session_id: 'sess_001',
  timestamp: '2026-03-23T12:00:00.000Z',
  pain_before: 6,
  pain_after: 3,
  location_tags: ['ribs'],
  symptom_tags: ['tightness'],
  selected_protocol_id: 'PROTO_RIB_EXPANSION_RESET',
  selected_protocol_name: 'Rib Expansion Reset',
  result: 'better',
  change_markers: ['less_tight'],
  session_status: 'completed',
  session_duration_seconds: 91,
}

describe('sessionHistory', () => {
  beforeEach(() => localStorage.clear())

  it('loadHistory returns empty array when nothing saved', () => {
    expect(loadHistory()).toEqual([])
  })

  it('saveSession persists an entry that loadHistory returns', () => {
    saveSession(entry)
    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0].session_id).toBe('sess_001')
  })

  it('saveSession prepends new entries (most recent first)', () => {
    const older: HistoryEntry = { ...entry, session_id: 'sess_000', timestamp: '2026-03-23T11:00:00.000Z' }
    saveSession(older)
    saveSession(entry)
    const history = loadHistory()
    expect(history[0].session_id).toBe('sess_001')
    expect(history[1].session_id).toBe('sess_000')
  })

  it('saveSession preserves existing entries', () => {
    saveSession(entry)
    const second: HistoryEntry = { ...entry, session_id: 'sess_002' }
    saveSession(second)
    expect(loadHistory()).toHaveLength(2)
  })

  it('loadHistory returns empty array on corrupted storage', () => {
    localStorage.setItem('medicaLm_session_history', 'not-json')
    expect(loadHistory()).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/storage/sessionHistory.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// src/storage/sessionHistory.ts
import type { HistoryEntry } from '../types'
import { storageGet, storageSet } from './localStorage'

const KEY = 'session_history'

export function loadHistory(): HistoryEntry[] {
  return storageGet<HistoryEntry[]>(KEY) ?? []
}

export function saveSession(entry: HistoryEntry): void {
  const history = loadHistory()
  storageSet(KEY, [entry, ...history])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/storage/sessionHistory.test.ts`
Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/storage/sessionHistory.ts src/storage/sessionHistory.test.ts
git commit -m "feat(storage): add session history save/load with prepend ordering"
```

---

## Task 6: AppContext + AppProvider Update

**Files:**
- Modify: `src/context/AppContext.tsx`
- Modify: `src/context/AppProvider.tsx`

- [ ] **Step 1: Update AppContext.tsx**

Replace the file content with:

```typescript
// src/context/AppContext.tsx
import { createContext, useContext } from 'react'
import type { AppSettings, PainInputState, RuntimeSession, SafetyAssessment } from '../types'

export type AppScreen = 'home' | 'pain_input' | 'guided_session' | 'safety_stop'

export interface AppState {
  activeScreen: AppScreen
  pendingPainInput: PainInputState | null
  activeSession: RuntimeSession | null
  safetyAssessment: SafetyAssessment | null
  settings: AppSettings
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: AppScreen }
  | { type: 'SET_PAIN_INPUT'; input: PainInputState }
  | { type: 'CLEAR_PAIN_INPUT' }
  | { type: 'SET_ACTIVE_SESSION'; session: RuntimeSession }
  | { type: 'SET_SAFETY_STOP'; assessment: SafetyAssessment }
  | { type: 'CLEAR_SESSION' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
```

- [ ] **Step 2: Update AppProvider.tsx**

Replace the file content with:

```typescript
// src/context/AppProvider.tsx
import { useReducer, type ReactNode } from 'react'
import { AppContext, type AppState, type AppAction } from './AppContext'
import { loadSettings } from '../storage/settings'

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, activeScreen: action.screen }
    case 'SET_PAIN_INPUT':
      return { ...state, pendingPainInput: action.input }
    case 'CLEAR_PAIN_INPUT':
      return { ...state, pendingPainInput: null }
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.session }
    case 'SET_SAFETY_STOP':
      return { ...state, safetyAssessment: action.assessment }
    case 'CLEAR_SESSION':
      return { ...state, activeSession: null, safetyAssessment: null, pendingPainInput: null }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }
  }
}

function getInitialState(): AppState {
  return {
    activeScreen: 'home',
    pendingPainInput: null,
    activeSession: null,
    safetyAssessment: null,
    settings: loadSettings(),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
```

- [ ] **Step 3: Run full test suite to confirm no regressions**

Run: `npx vitest run`
Expected: All existing tests PASS (TypeScript compile errors for removed `session_placeholder` will be fixed in Task 12)

- [ ] **Step 4: Commit**

```bash
git add src/context/AppContext.tsx src/context/AppProvider.tsx
git commit -m "feat(context): add guided_session and safety_stop screens, session state, new actions"
```

---

## Task 7: SafetyStopScreen

**Files:**
- Create: `src/screens/SafetyStopScreen.tsx`
- Create: `src/screens/SafetyStopScreen.module.css`

- [ ] **Step 1: Write the component**

Copy that follows doc 06 § Safety Stop Copy exactly:
- Heading: "Stop here."
- Body: "Do not start this session."
- Subtext: "This needs clinical attention before guided movement."
- CTA: "Return home"

```typescript
// src/screens/SafetyStopScreen.tsx
import { useAppContext } from '../context/AppContext'
import styles from './SafetyStopScreen.module.css'

/**
 * Pre-session safety stop.
 * Authority: Safety + Reassurance Spec (doc 06) § Pre-Session Safety Stop Copy
 * Shown when resolveSession() returns kind: 'safety_stop'.
 * No back button — only "Return home" to prevent misuse as a bypass.
 */
export function SafetyStopScreen() {
  const { dispatch } = useAppContext()

  function handleReturnHome() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  return (
    <main className={styles.screen} role="alert" aria-live="assertive">
      <div className={styles.content}>
        <h1 className={styles.heading}>Stop here.</h1>
        <p className={styles.body}>Do not start this session.</p>
        <p className={styles.subtext}>
          This needs clinical attention before guided movement.
        </p>
        <p className={styles.subtext}>
          Seek appropriate medical care before continuing.
        </p>
      </div>
      <footer className={styles.footer}>
        <button
          className={styles.returnButton}
          onClick={handleReturnHome}
          type="button"
        >
          Return home
        </button>
      </footer>
    </main>
  )
}
```

- [ ] **Step 2: Write the CSS**

```css
/* src/screens/SafetyStopScreen.module.css */
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 2rem 1.5rem;
  background: var(--color-background);
}

.content {
  max-width: 360px;
  text-align: center;
}

.heading {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.body {
  font-size: 1.0625rem;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.subtext {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.footer {
  margin-top: 2.5rem;
}

.returnButton {
  padding: 0.75rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.returnButton:hover {
  opacity: 0.7;
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: PASS — no regressions

- [ ] **Step 4: Commit**

```bash
git add src/screens/SafetyStopScreen.tsx src/screens/SafetyStopScreen.module.css
git commit -m "feat(screens): add SafetyStopScreen with doc 06 safety stop copy"
```

---

## Task 8: BreathingOrb Component

**Files:**
- Create: `src/components/BreathingOrb.tsx`
- Create: `src/components/BreathingOrb.module.css`

Spec authority: M2_SESSION_EXPERIENCE_SPEC.md § 2c (Orb), § 2d (Countdown)

Key specs:
- Core orb: 52–56% screen width, max 260px
- Scale: 0.72 (rest/exhale end) → 1.0 (inhale peak)
- Glow: 0.55 → 0.85 (scale of shadow spread)
- Inhale easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Exhale easing: `cubic-bezier(0.33, 0.0, 0.67, 1.0)`
- Countdown: displayed inside/above orb, tabular numerals, 80–120ms crossfade
- Countdown always shows ≥1 (starts at inhale_seconds, ticks down to 1, then phase transitions)
- Reset pause: 0.4s between rounds, no countdown shown
- Reduced motion: static orb, 120ms opacity fade, no blur

- [ ] **Step 1: Write the component**

```typescript
// src/components/BreathingOrb.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { TimingProfile } from '../types'
import styles from './BreathingOrb.module.css'

interface Props {
  timingProfile: TimingProfile
  onRoundComplete?: (roundNumber: number) => void
  onAllRoundsComplete?: () => void
  cueText?: string
}

type Phase = 'inhale' | 'exhale' | 'reset'

export function BreathingOrb({ timingProfile, onRoundComplete, onAllRoundsComplete, cueText }: Props) {
  const { inhale_seconds, exhale_seconds, rounds } = timingProfile
  const prefersReducedMotion = useReducedMotion()

  const [phase, setPhase] = useState<Phase>('inhale')
  const [countdown, setCountdown] = useState(inhale_seconds)
  const [currentRound, setCurrentRound] = useState(1)
  const [showCountdown, setShowCountdown] = useState(true)

  const roundRef = useRef(1)
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return

    let interval: ReturnType<typeof setInterval>
    let remaining = inhale_seconds

    function startInhale() {
      setPhase('inhale')
      remaining = inhale_seconds
      setCountdown(remaining)
      setShowCountdown(true)

      interval = setInterval(() => {
        remaining -= 1
        if (remaining >= 1) {
          setCountdown(remaining)
        } else {
          clearInterval(interval)
          startExhale()
        }
      }, 1000)
    }

    function startExhale() {
      setPhase('exhale')
      remaining = exhale_seconds
      setCountdown(remaining)
      setShowCountdown(true)

      interval = setInterval(() => {
        remaining -= 1
        if (remaining >= 1) {
          setCountdown(remaining)
        } else {
          clearInterval(interval)
          startReset()
        }
      }, 1000)
    }

    function startReset() {
      setPhase('reset')
      setShowCountdown(false)
      const round = roundRef.current
      onRoundComplete?.(round)

      setTimeout(() => {
        if (round >= rounds) {
          doneRef.current = true
          onAllRoundsComplete?.()
          return
        }
        roundRef.current = round + 1
        setCurrentRound(roundRef.current)
        startInhale()
      }, 400)
    }

    startInhale()
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const orbScale = phase === 'inhale' ? 1.0 : 0.72
  const glowScale = phase === 'inhale' ? 0.85 : 0.55

  const inhaleEase = [0.25, 0.46, 0.45, 0.94] as const
  const exhaleEase = [0.33, 0.0, 0.67, 1.0] as const
  const duration = phase === 'inhale' ? inhale_seconds : phase === 'exhale' ? exhale_seconds : 0.2
  const ease = phase === 'inhale' ? inhaleEase : exhaleEase

  return (
    <div className={styles.container} aria-label={`Breathing: ${phase}. Round ${currentRound} of ${rounds}.`}>
      <motion.div
        className={styles.glowRing}
        animate={prefersReducedMotion ? {} : { scale: glowScale, opacity: phase === 'reset' ? 0.4 : 1 }}
        transition={prefersReducedMotion ? { duration: 0.12 } : { duration, ease }}
      />
      <motion.div
        className={styles.orb}
        animate={prefersReducedMotion ? {} : { scale: orbScale }}
        transition={prefersReducedMotion ? { duration: 0.12 } : { duration, ease }}
      >
        {showCountdown && (
          <motion.span
            key={countdown}
            className={styles.countdown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            aria-live="off"
          >
            {countdown}
          </motion.span>
        )}
      </motion.div>
      {cueText && (
        <p className={styles.cueText} aria-live="polite">
          {cueText}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write the CSS**

```css
/* src/components/BreathingOrb.module.css */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
}

.orb {
  width: min(54vw, 260px);
  height: min(54vw, 260px);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 38%, var(--color-orb-center, #e8f0fe), var(--color-orb-edge, #c5d8f8));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.glowRing {
  position: absolute;
  width: min(54vw, 260px);
  height: min(54vw, 260px);
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-orb-glow, rgba(160, 200, 250, 0.35)), transparent 70%);
  /* glow is slightly larger than orb */
  scale: 1.18;
  z-index: 0;
}

.countdown {
  font-size: clamp(2.25rem, 8vw, 3rem);
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  user-select: none;
}

.cueText {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 240px;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

@media (prefers-reduced-motion: reduce) {
  .orb,
  .glowRing {
    transition: opacity 0.12s ease !important;
  }
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: PASS — no regressions

- [ ] **Step 4: Commit**

```bash
git add src/components/BreathingOrb.tsx src/components/BreathingOrb.module.css
git commit -m "feat(components): add BreathingOrb with countdown-first 4/7 breathing, reduced motion"
```

---

## Task 9: StepEmergence Component

**Files:**
- Create: `src/components/StepEmergence.tsx`
- Create: `src/components/StepEmergence.module.css`

Spec: 3 steps, Step1@0s, Step2@+3s, Step3@+6s. Each: 350–420ms blur-to-crisp ease-out. Prior steps dim to 50–60% opacity. Reduced motion: 120ms, no blur.

- [ ] **Step 1: Write the component**

```typescript
// src/components/StepEmergence.tsx
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './StepEmergence.module.css'

interface Props {
  steps: [string, string, string]
}

export function StepEmergence({ steps }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    const t2 = setTimeout(() => setVisibleCount(2), 3000)
    const t3 = setTimeout(() => setVisibleCount(3), 6000)
    return () => {
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <ol className={styles.list} aria-label="Session guidance steps">
      {steps.map((text, i) => {
        const stepNum = i + 1
        const isVisible = stepNum <= visibleCount
        const isDimmed = isVisible && stepNum < visibleCount

        if (!isVisible) return null

        return (
          <motion.li
            key={stepNum}
            className={styles.step}
            initial={prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, filter: 'blur(3px)' }
            }
            animate={prefersReducedMotion
              ? { opacity: isDimmed ? 0.55 : 1 }
              : { opacity: isDimmed ? 0.55 : 1, filter: 'blur(0px)' }
            }
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.38, ease: 'easeOut' }}
          >
            {text}
          </motion.li>
        )
      })}
    </ol>
  )
}
```

- [ ] **Step 2: Write the CSS**

```css
/* src/components/StepEmergence.module.css */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 300px;
  text-align: center;
}

.step {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  letter-spacing: 0.01em;
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/StepEmergence.tsx src/components/StepEmergence.module.css
git commit -m "feat(components): add StepEmergence with 3-step timed blur-to-crisp reveal"
```

---

## Task 10: CompletionForm Component

**Files:**
- Create: `src/components/CompletionForm.tsx`
- Create: `src/components/CompletionForm.module.css`

Spec:
- "Session complete." heading
- "Notice what changed." subtext
- Pain-after slider (pre-populated at pain_before value)
- Better / Same / Worse buttons (equal weight, only one active)
- Change markers (multi-select from CHANGE_MARKERS taxonomy) — hidden when `minimal={true}`
- Optional note textarea (≤200 chars) — hidden when `minimal={true}`
- "Save and finish" button — disabled until result selected
- `onSave(feedback: SessionFeedback)` callback
- `minimal?: boolean` prop — for user_stopped path (pain_after + result only, per spec §6)

- [ ] **Step 1: Write the component**

```typescript
// src/components/CompletionForm.tsx
import { useState } from 'react'
import type { SessionFeedback } from '../types'
import { CHANGE_MARKERS } from '../types/taxonomy'
import { PainSlider } from './PainSlider'
import { TagSelector } from './TagSelector'
import styles from './CompletionForm.module.css'

interface Props {
  sessionId: string
  painBefore: number
  onSave: (feedback: SessionFeedback) => void
  /** When true: hide change markers + note. Used for user_stopped path. */
  minimal?: boolean
}

type ResultOption = 'better' | 'same' | 'worse'

const RESULT_OPTIONS: { value: ResultOption; label: string }[] = [
  { value: 'better', label: 'Better' },
  { value: 'same',   label: 'Same'   },
  { value: 'worse',  label: 'Worse'  },
]

export function CompletionForm({ sessionId, painBefore, onSave, minimal = false }: Props) {
  const [painAfter, setPainAfter] = useState(painBefore)
  const [result, setResult] = useState<ResultOption | null>(null)
  const [changeMarkers, setChangeMarkers] = useState<string[]>([])
  const [note, setNote] = useState('')

  function toggleMarker(tag: string) {
    setChangeMarkers((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSave() {
    if (!result) return
    onSave({
      session_id: sessionId,
      pain_before: painBefore,
      pain_after: painAfter,
      result,
      change_markers: changeMarkers,
      ...(note.trim() !== '' && { note: note.trim() }),
    })
  }

  return (
    <div className={styles.form}>
      <header className={styles.header}>
        <h2 className={styles.heading}>Session complete.</h2>
        <p className={styles.subtext}>Notice what changed.</p>
      </header>

      <section className={styles.section} aria-label="Pain level after session">
        <PainSlider value={painAfter} onChange={setPainAfter} />
      </section>

      <section className={styles.section} aria-label="How do you feel?">
        <p className={styles.sectionLabel}>How do you feel?</p>
        <div className={styles.resultButtons} role="group" aria-label="Session result">
          {RESULT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.resultButton} ${result === value ? styles.active : ''}`}
              onClick={() => setResult(value)}
              aria-pressed={result === value}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {!minimal && (
        <section className={styles.section}>
          <TagSelector
            tags={CHANGE_MARKERS}
            selected={changeMarkers}
            onToggle={toggleMarker}
            label="What changed? (optional)"
          />
        </section>
      )}

      {!minimal && (
        <section className={styles.section}>
          <label className={styles.noteLabel} htmlFor="completion-note">
            Note (optional)
          </label>
          <textarea
            id="completion-note"
            className={styles.noteInput}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything to note?"
            rows={2}
            maxLength={200}
            aria-label="Optional completion note"
          />
        </section>
      )}

      <footer className={styles.footer}>
        <button
          className={styles.saveButton}
          type="button"
          onClick={handleSave}
          disabled={result === null}
          aria-disabled={result === null}
        >
          Save and finish
        </button>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Write the CSS**

```css
/* src/components/CompletionForm.module.css */
.form {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header {
  text-align: center;
  padding: 2rem 0 1.5rem;
}

.heading {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.subtext {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.section {
  padding: 1rem 0;
}

.sectionLabel {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.resultButtons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.resultButton {
  padding: 0.625rem 0;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.resultButton.active {
  background: var(--color-accent-subtle, rgba(160, 200, 250, 0.18));
  color: var(--color-text-primary);
  border-color: var(--color-accent-border, rgba(160, 200, 250, 0.5));
}

.noteLabel {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.noteInput {
  width: 100%;
  box-sizing: border-box;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  resize: none;
}

.footer {
  padding: 1.5rem 0 2.5rem;
}

.saveButton {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--color-accent, #4a90d9);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.saveButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/CompletionForm.tsx src/components/CompletionForm.module.css
git commit -m "feat(components): add CompletionForm with pain-after, result, change markers, save"
```

---

## Task 11: GuidedSessionScreen

**Files:**
- Create: `src/screens/GuidedSessionScreen.tsx`
- Create: `src/screens/GuidedSessionScreen.module.css`

Spec:
- Three phases — `breathing`, `safety_interrupt`, `completion` (+ `stopped_completion` for user-stopped path)
- Top zone: protocol name (small, muted) + goal text below it
- Phase transitions on `onAllRoundsComplete` (breathing → completion)
- Early exit: <20s → immediate stop, no confirmation; ≥20s → "Stop this session?" confirm dialog
- If confirmed stop: route to `stopped_completion` phase — minimal CompletionForm (pain_after + result only), save with `session_status: 'user_stopped'`
- Safety interrupt: "I feel unwell" button in footer alongside Stop; halts orb, replaces step text with safety copy per doc 06, shows Return home button; no save required on this path per spec
- No pause in M2

- [ ] **Step 1: Write the screen**

```typescript
// src/screens/GuidedSessionScreen.tsx
import { useRef, useState } from 'react'
import type { SessionFeedback, HistoryEntry } from '../types'
import { useAppContext } from '../context/AppContext'
import { BreathingOrb } from '../components/BreathingOrb'
import { StepEmergence } from '../components/StepEmergence'
import { CompletionForm } from '../components/CompletionForm'
import { saveSession } from '../storage/sessionHistory'
import styles from './GuidedSessionScreen.module.css'

/**
 * Authority: M2_SESSION_EXPERIENCE_SPEC.md
 *            Execution Spec (doc 04) § 5. Session Orchestration Engine
 *            Safety + Reassurance Spec (doc 06) § 2. Active Session Safety Interrupts
 */
type SessionPhase = 'breathing' | 'safety_interrupt' | 'completion' | 'stopped_completion'

export function GuidedSessionScreen() {
  const { state, dispatch } = useAppContext()
  const session = state.activeSession!

  const [phase, setPhase] = useState<SessionPhase>('breathing')
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [orbRunning, setOrbRunning] = useState(true)

  const startTimeRef = useRef(Date.now())
  const elapsedAtStopRef = useRef(0)

  function getElapsedSeconds() {
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }

  function handleAllRoundsComplete() {
    setPhase('completion')
  }

  // ── Stop button ─────────────────────────────────────────────────────────────
  function handleStopButtonPress() {
    const elapsed = getElapsedSeconds()
    if (elapsed < 20) {
      // Immediate exit — no confirmation needed
      dispatch({ type: 'CLEAR_SESSION' })
      dispatch({ type: 'NAVIGATE', screen: 'home' })
    } else {
      elapsedAtStopRef.current = elapsed
      setShowStopConfirm(true)
    }
  }

  function handleConfirmStop() {
    setShowStopConfirm(false)
    setPhase('stopped_completion')
  }

  function handleCancelStop() {
    setShowStopConfirm(false)
  }

  // ── Safety interrupt ─────────────────────────────────────────────────────────
  function handleSafetyInterrupt() {
    setOrbRunning(false)
    setShowStopConfirm(false)
    setPhase('safety_interrupt')
  }

  function handleSafetyReturnHome() {
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // ── Completion save (full) ───────────────────────────────────────────────────
  function handleSave(feedback: SessionFeedback) {
    const elapsed = getElapsedSeconds()
    const entry: HistoryEntry = {
      session_id: session.session_id,
      timestamp: session.created_at,
      pain_before: feedback.pain_before,
      pain_after: feedback.pain_after,
      location_tags: session.pain_input.location_tags,
      symptom_tags: session.pain_input.symptom_tags,
      trigger_tag: session.pain_input.trigger_tag,
      selected_protocol_id: session.protocol_id,
      selected_protocol_name: session.protocol_name,
      result: feedback.result,
      change_markers: feedback.change_markers,
      session_status: 'completed',
      session_duration_seconds: elapsed,
    }
    saveSession(entry)
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // ── Stopped completion save (minimal — no change markers/note) ───────────────
  function handleStoppedSave(feedback: SessionFeedback) {
    const elapsed = elapsedAtStopRef.current || getElapsedSeconds()
    const entry: HistoryEntry = {
      session_id: session.session_id,
      timestamp: session.created_at,
      pain_before: feedback.pain_before,
      pain_after: feedback.pain_after,
      location_tags: session.pain_input.location_tags,
      symptom_tags: session.pain_input.symptom_tags,
      trigger_tag: session.pain_input.trigger_tag,
      selected_protocol_id: session.protocol_id,
      selected_protocol_name: session.protocol_name,
      result: feedback.result,
      change_markers: [],
      session_status: 'user_stopped',
      session_duration_seconds: elapsed,
    }
    saveSession(entry)
    dispatch({ type: 'CLEAR_SESSION' })
    dispatch({ type: 'NAVIGATE', screen: 'home' })
  }

  // Cue text rotates through cue_sequence by round
  const [currentRound, setCurrentRound] = useState(1)
  const cueText = session.cue_sequence[
    (currentRound - 1) % session.cue_sequence.length
  ]

  const emergenceSteps: [string, string, string] = [
    session.cue_sequence[0] ?? '',
    session.cue_sequence[1] ?? '',
    session.cue_sequence[2] ?? '',
  ]

  return (
    <main className={styles.screen}>

      {/* ── Breathing Phase ─────────────────────────────────────────────── */}
      {phase === 'breathing' && (
        <div className={styles.breathingPhase}>
          {/* Top zone: protocol name + goal (spec §3) */}
          <header className={styles.topZone} aria-label="Protocol context">
            <p className={styles.protocolName}>{session.protocol_name}</p>
            <p className={styles.goalText}>{session.goal}</p>
          </header>

          <div className={styles.orbArea}>
            {orbRunning && (
              <BreathingOrb
                timingProfile={session.timing_profile}
                onRoundComplete={(round) => setCurrentRound(round + 1)}
                onAllRoundsComplete={handleAllRoundsComplete}
                cueText={cueText}
              />
            )}
          </div>

          <div className={styles.emergenceArea}>
            <StepEmergence steps={emergenceSteps} />
          </div>

          <footer className={styles.sessionFooter}>
            <button
              className={styles.safetyButton}
              type="button"
              onClick={handleSafetyInterrupt}
              aria-label="I feel unwell — stop session"
            >
              I feel unwell
            </button>
            <button
              className={styles.stopButton}
              type="button"
              onClick={handleStopButtonPress}
              aria-label="Stop session"
            >
              Stop
            </button>
          </footer>
        </div>
      )}

      {/* ── Safety Interrupt Phase ──────────────────────────────────────── */}
      {phase === 'safety_interrupt' && (
        <div className={styles.safetyInterruptPhase} role="alert" aria-live="assertive">
          <p className={styles.safetyHeading}>Stop.</p>
          <p className={styles.safetyBody}>Exit carefully.</p>
          <p className={styles.safetySubtext}>
            If symptoms are severe or new, seek appropriate care before continuing.
          </p>
          <button
            className={styles.returnHomeButton}
            type="button"
            onClick={handleSafetyReturnHome}
          >
            Return home
          </button>
        </div>
      )}

      {/* ── Full Completion Phase ───────────────────────────────────────── */}
      {phase === 'completion' && (
        <div className={styles.completionPhase}>
          <CompletionForm
            sessionId={session.session_id}
            painBefore={session.pain_input.pain_level}
            onSave={handleSave}
          />
        </div>
      )}

      {/* ── Stopped Completion Phase (minimal) ─────────────────────────── */}
      {phase === 'stopped_completion' && (
        <div className={styles.completionPhase}>
          <CompletionForm
            sessionId={session.session_id}
            painBefore={session.pain_input.pain_level}
            onSave={handleStoppedSave}
            minimal
          />
        </div>
      )}

      {/* ── Stop Confirmation Dialog ────────────────────────────────────── */}
      {showStopConfirm && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Stop session confirmation">
          <div className={styles.confirmDialog}>
            <p className={styles.confirmText}>Stop this session?</p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmStop}
                type="button"
                onClick={handleConfirmStop}
              >
                Stop
              </button>
              <button
                className={styles.confirmContinue}
                type="button"
                onClick={handleCancelStop}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Write the CSS**

```css
/* src/screens/GuidedSessionScreen.module.css */
.screen {
  min-height: 100dvh;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
}

/* ── Breathing Phase ─────────────────────────────────────────────────── */
.breathingPhase {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 1.5rem 2rem;
}

/* Top zone: protocol name + goal — small, muted, provides context not instruction */
.topZone {
  width: 100%;
  text-align: center;
  padding-bottom: 0.5rem;
}

.protocolName {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.35));
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.goalText {
  font-size: 0.8125rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.35));
  line-height: 1.4;
}

.orbArea {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emergenceArea {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 1rem;
}

.sessionFooter {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.safetyButton {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.safetyButton:hover {
  opacity: 0.9;
}

.stopButton {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.stopButton:hover {
  opacity: 1;
}

/* ── Safety Interrupt Phase ──────────────────────────────────────────── */
.safetyInterruptPhase {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  gap: 0.75rem;
}

.safetyHeading {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.safetyBody {
  font-size: 1.0625rem;
  color: var(--color-text-primary);
}

.safetySubtext {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-width: 300px;
}

.returnHomeButton {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.returnHomeButton:hover {
  opacity: 0.7;
}

/* ── Completion + Stopped Completion Phases ──────────────────────────── */
.completionPhase {
  flex: 1;
  overflow-y: auto;
}

/* ── Stop Confirmation Overlay ───────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.confirmDialog {
  background: var(--color-surface, #1a1e2e);
  border-radius: 0.75rem;
  padding: 2rem 1.5rem;
  max-width: 280px;
  width: 100%;
  text-align: center;
}

.confirmText {
  font-size: 1.0625rem;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

.confirmButtons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.confirmStop {
  padding: 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  cursor: pointer;
}

.confirmContinue {
  padding: 0.625rem;
  border: none;
  border-radius: 0.375rem;
  background: var(--color-accent, #4a90d9);
  color: #fff;
  font-size: 0.9375rem;
  cursor: pointer;
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/screens/GuidedSessionScreen.tsx src/screens/GuidedSessionScreen.module.css
git commit -m "feat(screens): add GuidedSessionScreen with breathing/completion phases, stop flow"
```

---

## Task 12: Wire App.tsx + PainInputScreen + Update Tests

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/screens/PainInputScreen.tsx`
- Modify: `src/App.test.tsx`
- Delete: `src/screens/SessionPlaceholder.tsx` (after confirming no remaining imports)

- [ ] **Step 1: Update PainInputScreen.tsx handleSubmit**

Replace only the `handleSubmit` function body — imports and JSX stay the same:

```typescript
// In src/screens/PainInputScreen.tsx, replace handleSubmit:
import { resolveSession } from '../engine'

  function handleSubmit() {
    if (!canSubmit) return

    const input: PainInputState = {
      pain_level: painLevel,
      location_tags: locationTags,
      symptom_tags: symptomTags,
      ...(triggerTag !== undefined && { trigger_tag: triggerTag }),
      ...(userNote.trim() !== '' && { user_note: userNote.trim() }),
    }

    const resolution = resolveSession(input)

    dispatch({ type: 'SET_PAIN_INPUT', input })

    if (resolution.kind === 'safety_stop') {
      dispatch({ type: 'SET_SAFETY_STOP', assessment: resolution.assessment })
      dispatch({ type: 'NAVIGATE', screen: 'safety_stop' })
    } else {
      dispatch({ type: 'SET_ACTIVE_SESSION', session: resolution.session })
      dispatch({ type: 'NAVIGATE', screen: 'guided_session' })
    }
  }
```

- [ ] **Step 2: Update App.tsx**

Replace full content:

```typescript
// src/App.tsx
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppProvider'
import { useAppContext } from './context/AppContext'
import { ScreenTransition } from './components/ScreenTransition'
import { HomeScreen } from './screens/HomeScreen'
import { PainInputScreen } from './screens/PainInputScreen'
import { GuidedSessionScreen } from './screens/GuidedSessionScreen'
import { SafetyStopScreen } from './screens/SafetyStopScreen'

function ScreenRouter() {
  const { state } = useAppContext()
  const { activeScreen } = state

  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeScreen === 'home' && (
        <ScreenTransition screenKey="home">
          <HomeScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'pain_input' && (
        <ScreenTransition screenKey="pain_input">
          <PainInputScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'guided_session' && (
        <ScreenTransition screenKey="guided_session">
          <GuidedSessionScreen />
        </ScreenTransition>
      )}
      {activeScreen === 'safety_stop' && (
        <ScreenTransition screenKey="safety_stop">
          <SafetyStopScreen />
        </ScreenTransition>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  )
}
```

- [ ] **Step 3: Update App.test.tsx**

Replace the last test ("reaches SessionPlaceholder after completing pain input") with a test that verifies the guided session screen loads:

```typescript
// Replace the last it() block in src/App.test.tsx:
  it('reaches GuidedSessionScreen after completing pain input with safe input', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start a new guided session/i }))
    // Select required inputs — ribs + tightness → MECH_RIB_RESTRICTION → PROTO_RIB_EXPANSION_RESET
    await userEvent.click(screen.getByRole('button', { name: /^ribs$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^tightness$/i }))
    await userEvent.click(screen.getByRole('button', { name: /begin session/i }))
    // GuidedSessionScreen renders — orb container is present
    expect(screen.getByRole('main')).toBeInTheDocument()
    // Stop button is visible
    expect(screen.getByRole('button', { name: /stop session/i })).toBeInTheDocument()
  })
```

Also remove the `session_placeholder` import reference by updating the top-level import if it still references SessionPlaceholder.

- [ ] **Step 4: Verify SessionPlaceholder has no remaining imports**

Run: `grep -r "SessionPlaceholder\|session_placeholder" src/`
Expected: No results (or only if there are legitimate remaining references — confirm before deleting)

- [ ] **Step 5: Delete SessionPlaceholder.tsx**

Only after confirming no imports remain:

```bash
rm src/screens/SessionPlaceholder.tsx
```

- [ ] **Step 6: Run full test suite**

Run: `npx vitest run`
Expected: PASS — all tests pass including updated App.test.tsx

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/screens/PainInputScreen.tsx src/App.test.tsx
git rm src/screens/SessionPlaceholder.tsx
git commit -m "feat(m2): wire resolveSession into PainInputScreen, replace SessionPlaceholder with real screens"
```

---

## Verification After All Tasks

- [ ] Run full test suite: `npx vitest run` — all PASS
- [ ] TypeScript check: `npx tsc --noEmit` — no errors
- [ ] Manual smoke test:
  - Enter pain input with ribs + tightness → GuidedSessionScreen loads, orb animates, countdown shows 4→3→2→1
  - Let session complete → CompletionForm shows with pain slider pre-populated
  - Select "Better" + Save → returns to HomeScreen, history card visible
  - Enter pain input with `coordination_change` → SafetyStopScreen shows "Stop here."
  - On SafetyStopScreen, click "Return home" → HomeScreen with no crash
