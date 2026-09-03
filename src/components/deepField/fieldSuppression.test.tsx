/**
 * fieldSuppression — the counter contract.
 *
 * The interesting behaviour here is NOT "a component can turn the field off". It is
 * that two components can hold it off at once, and the first one to let go must not
 * switch the field back on underneath the second. That is the entire reason this is a
 * counter and not a boolean, and it is the only part of the file a future edit is
 * likely to "simplify" away — so it is asserted directly, twice, from both ends.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useState } from 'react'
import {
  FieldSuppressionProvider,
  useFieldSuppressed,
  useSuppressField,
} from './fieldSuppression'

/** Prints the current suppression state so a test can read it out of the DOM. */
function Readout() {
  return <span data-testid="state">{useFieldSuppressed() ? 'suppressed' : 'free'}</span>
}

/** A component that holds the field down for as long as it is mounted. */
function Holder({ active = true }: { active?: boolean }) {
  useSuppressField(active)
  return null
}

function state() {
  return screen.getByTestId('state').textContent
}

describe('fieldSuppression', () => {
  it('leaves the field free when nothing is holding it', () => {
    render(
      <FieldSuppressionProvider>
        <Readout />
      </FieldSuppressionProvider>
    )
    expect(state()).toBe('free')
  })

  it('leaves the field free when a holder is mounted but inactive', () => {
    render(
      <FieldSuppressionProvider>
        <Holder active={false} />
        <Readout />
      </FieldSuppressionProvider>
    )
    expect(state()).toBe('free')
  })

  it('suppresses the field while a holder is active', () => {
    render(
      <FieldSuppressionProvider>
        <Holder />
        <Readout />
      </FieldSuppressionProvider>
    )
    expect(state()).toBe('suppressed')
  })

  it('releases when the holder stops being active', () => {
    function Toggling() {
      const [active, setActive] = useState(true)
      useSuppressField(active)
      return (
        <button type="button" onClick={() => setActive(false)}>
          release
        </button>
      )
    }
    render(
      <FieldSuppressionProvider>
        <Toggling />
        <Readout />
      </FieldSuppressionProvider>
    )
    expect(state()).toBe('suppressed')
    act(() => {
      screen.getByRole('button', { name: 'release' }).click()
    })
    expect(state()).toBe('free')
  })

  it('releases when the holder unmounts', () => {
    function Host() {
      const [mounted, setMounted] = useState(true)
      return (
        <>
          {mounted && <Holder />}
          <button type="button" onClick={() => setMounted(false)}>
            unmount
          </button>
        </>
      )
    }
    render(
      <FieldSuppressionProvider>
        <Host />
        <Readout />
      </FieldSuppressionProvider>
    )
    expect(state()).toBe('suppressed')
    act(() => {
      screen.getByRole('button', { name: 'unmount' }).click()
    })
    expect(state()).toBe('free')
  })

  /**
   * The case a boolean gets wrong. Two holders overlap; one goes away; the field must
   * stay down because the other is still holding it. If this ever passes with the
   * counter replaced by a boolean flag, the test has stopped testing anything.
   */
  it('stays suppressed while a second holder is still holding', () => {
    function Host() {
      const [first, setFirst] = useState(true)
      return (
        <>
          {first && <Holder />}
          <Holder />
          <button type="button" onClick={() => setFirst(false)}>
            drop one
          </button>
        </>
      )
    }
    render(
      <FieldSuppressionProvider>
        <Host />
        <Readout />
      </FieldSuppressionProvider>
    )
    expect(state()).toBe('suppressed')
    act(() => {
      screen.getByRole('button', { name: 'drop one' }).click()
    })
    expect(state()).toBe('suppressed')
  })

  /**
   * Atmosphere is never allowed to take a screen down with it. A holder rendered
   * outside any provider must be inert, not fatal — this is the failure mode where a
   * refactor moves a provider and a safety screen crashes instead of looking plain.
   */
  it('degrades to a working screen when no provider is present', () => {
    expect(() =>
      render(
        <>
          <Holder />
          <Readout />
        </>
      )
    ).not.toThrow()
    expect(state()).toBe('free')
  })
})
