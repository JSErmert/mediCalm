import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BodyPickerSVG } from './BodyPickerSVG'

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
