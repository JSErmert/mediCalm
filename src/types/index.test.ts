import { describe, it, expectTypeOf } from 'vitest'
import type {
  PainInputState,
  AppSettings,
  SafetyMode,
  SessionResult,
  HistoryEntry,
  RuntimeSession,
} from './index'

describe('core types', () => {
  it('PainInputState has required fields with correct types', () => {
    const input: PainInputState = {
      pain_level: 7,
      location_tags: ['front_neck'],
      symptom_tags: ['burning'],
    }
    expectTypeOf(input.pain_level).toBeNumber()
    expectTypeOf(input.location_tags).toEqualTypeOf<string[]>()
    expectTypeOf(input.symptom_tags).toEqualTypeOf<string[]>()
    expectTypeOf(input.trigger_tag).toEqualTypeOf<string | undefined>()
    expectTypeOf(input.user_note).toEqualTypeOf<string | undefined>()
  })

  it('AppSettings has required boolean flags', () => {
    const s: AppSettings = {
      audio_enabled: true,
      reduced_motion_enabled: false,
      haptics_enabled: false,
    }
    expectTypeOf(s.audio_enabled).toBeBoolean()
    expectTypeOf(s.reduced_motion_enabled).toBeBoolean()
    expectTypeOf(s.haptics_enabled).toBeBoolean()
  })

  it('SafetyMode is union of three expected strings', () => {
    const a: SafetyMode = 'NORMAL_GUIDANCE_MODE'
    const b: SafetyMode = 'INTERRUPTED_CAUTION_MODE'
    const c: SafetyMode = 'SAFETY_STOP_MODE'
    expectTypeOf(a).toEqualTypeOf<SafetyMode>()
    expectTypeOf(b).toEqualTypeOf<SafetyMode>()
    expectTypeOf(c).toEqualTypeOf<SafetyMode>()
  })

  it('SessionResult is union of four expected strings', () => {
    const results: SessionResult[] = ['better', 'same', 'worse', 'interrupted']
    expectTypeOf(results).toEqualTypeOf<SessionResult[]>()
  })

  it('HistoryEntry result field matches SessionResult', () => {
    expectTypeOf<HistoryEntry['result']>().toEqualTypeOf<SessionResult>()
  })

  it('RuntimeSession pain_input is PainInputState', () => {
    expectTypeOf<RuntimeSession['pain_input']>().toEqualTypeOf<PainInputState>()
  })
})
