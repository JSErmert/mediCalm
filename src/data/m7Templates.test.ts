// src/data/m7Templates.test.ts
import { describe, it, expect } from 'vitest'
import { M7_TEMPLATES, getTemplate, type TransitionTemplate } from './m7Templates'

describe('M7 template registry — initial population', () => {
  it('exports M7_TEMPLATES array with required initial templates', () => {
    expect(Array.isArray(M7_TEMPLATES)).toBe(true)
    const ids = M7_TEMPLATES.map(t => t.template_id)
    expect(ids).toContain('standard_5_count')
    expect(ids).toContain('standard_between')
    expect(ids).toContain('standard_completion')
  })

  it('every template carries (template_id, template_version, subtype, copy)', () => {
    for (const t of M7_TEMPLATES) {
      expect(typeof t.template_id).toBe('string')
      expect(typeof t.template_version).toBe('string')
      expect(['intro', 'between', 'closing']).toContain(t.subtype)
      expect(typeof t.copy).toBe('string')
    }
  })

  it('getTemplate(id, version) returns the matching template', () => {
    const t = getTemplate('standard_5_count', '1.0.0')
    expect(t.template_id).toBe('standard_5_count')
    expect(t.subtype).toBe('intro')
  })

  it('getTemplate throws on unknown (id, version) pair', () => {
    expect(() => getTemplate('does_not_exist', '1.0.0')).toThrow()
    expect(() => getTemplate('standard_5_count', '99.0.0')).toThrow()
  })

  it('TransitionTemplate type carries the expected fields', () => {
    const t: TransitionTemplate = {
      template_id: 'x',
      template_version: '1.0.0',
      subtype: 'intro',
      copy: 'test',
    }
    expect(t.template_id).toBe('x')
  })
})
