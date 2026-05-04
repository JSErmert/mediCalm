import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BodyPickerSVG } from './BodyPickerSVG'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

describe('BodyPickerSVG', () => {
  it('front view renders 40 muscle paths', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(40)
  })

  it('back view renders 49 muscle paths', () => {
    const { container } = render(
      <BodyPickerSVG side="back" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(49)
  })

  it('paths are grouped under <g class="region"> per BodyLocation', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const groups = container.querySelectorAll('g[data-region]')
    expect(groups.length).toBeGreaterThan(0)
    groups.forEach(g => {
      expect(g.querySelectorAll('path').length).toBeGreaterThan(0)
    })
  })

  it('selected regions get a .selected class on their <g>', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={['shoulder_left']} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')
    expect(shoulderGroup?.className.baseVal).toMatch(/selected/)
  })

  it('selecting a muscle marks its parent region as selected via class', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={['shoulder_front_left']} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')
    expect(shoulderGroup?.className.baseVal).toMatch(/selected/)
  })
})

describe('BodyPickerSVG — interactions', () => {
  it('clicking a region <g> fires onRegionTap with the region id', async () => {
    const onTap = vi.fn()
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={onTap} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')!
    await userEvent.click(shoulderGroup)
    expect(onTap).toHaveBeenCalledWith('shoulder_left')
  })

  it('mouse-enter / mouse-leave fires onRegionHover', async () => {
    const onHover = vi.fn()
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={onHover} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]')!
    await userEvent.hover(shoulderGroup)
    expect(onHover).toHaveBeenLastCalledWith('shoulder_left')
    await userEvent.unhover(shoulderGroup)
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  it('region <g> has role="button" and tabindex="0" for keyboard access', () => {
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={() => {}} onRegionHover={() => {}} />
    )
    const groups = container.querySelectorAll('g[data-region]')
    groups.forEach(g => {
      expect(g.getAttribute('role')).toBe('button')
      expect(g.getAttribute('tabindex')).toBe('0')
    })
  })

  it('Enter or Space on a region group fires onRegionTap', async () => {
    const onTap = vi.fn()
    const { container } = render(
      <BodyPickerSVG side="front" selectedRegions={[]} selectedMuscles={[]} onRegionTap={onTap} onRegionHover={() => {}} />
    )
    const shoulderGroup = container.querySelector('g[data-region="shoulder_left"]') as HTMLElement
    shoulderGroup.focus()
    await userEvent.keyboard('{Enter}')
    expect(onTap).toHaveBeenCalledWith('shoulder_left')
    onTap.mockClear()
    await userEvent.keyboard(' ')
    expect(onTap).toHaveBeenCalledWith('shoulder_left')
  })
})
