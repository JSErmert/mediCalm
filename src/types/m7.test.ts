// src/types/m7.test.ts
import { describe, it, expect } from 'vitest'
import type { PathwayId, VariantId, TemplateId, SemVer, ISODate } from './m7'

describe('M7 type module — identity primitives', () => {
  it('exports identity primitive types as string aliases', () => {
    const pid: PathwayId = 'thoracic_restrictive_with_anxious_overlay'
    const vid: VariantId = 'th-rest-anx-irrit-fast-flare-mod-int-low'
    const tid: TemplateId = 'standard_5_count'
    const ver: SemVer = '1.0.0'
    const ts: ISODate = '2026-05-05T12:00:00.000Z'
    expect(typeof pid).toBe('string')
    expect(typeof vid).toBe('string')
    expect(typeof tid).toBe('string')
    expect(typeof ver).toBe('string')
    expect(typeof ts).toBe('string')
  })
})
