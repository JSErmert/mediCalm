import { describe, it, expect, beforeEach } from 'vitest'
import { storageGet, storageSet, storageRemove } from './localStorage'

describe('localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null for a missing key', () => {
    expect(storageGet('does_not_exist')).toBeNull()
  })

  it('stores and retrieves a primitive value', () => {
    storageSet('num', 42)
    expect(storageGet('num')).toBe(42)
  })

  it('stores and retrieves an object', () => {
    storageSet('obj', { a: 1, b: 'hello' })
    expect(storageGet('obj')).toEqual({ a: 1, b: 'hello' })
  })

  it('removes a key', () => {
    storageSet('to_remove', 'value')
    storageRemove('to_remove')
    expect(storageGet('to_remove')).toBeNull()
  })

  it('returns null when stored JSON is malformed', () => {
    localStorage.setItem('medicaLm_bad', '{not valid json')
    expect(storageGet('bad')).toBeNull()
  })

  it('uses the medicaLm_ prefix so keys are namespaced', () => {
    storageSet('settings', { x: 1 })
    // raw key in localStorage should be prefixed
    expect(localStorage.getItem('medicaLm_settings')).not.toBeNull()
    // unprefixed key should not exist
    expect(localStorage.getItem('settings')).toBeNull()
  })
})
