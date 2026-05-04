import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MuscleDrawer } from './MuscleDrawer'

describe('MuscleDrawer', () => {
  it('is hidden when region is null (no .open class)', () => {
    const { container } = render(
      <MuscleDrawer region={null} selectedMuscles={[]} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).not.toMatch(/open/)
  })

  it('opens with .open class when region is set', () => {
    const { container } = render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    const drawer = container.querySelector('[data-testid="muscle-drawer"]')!
    expect(drawer.className).toMatch(/open/)
  })

  it('renders one chip per muscle in that region', () => {
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    expect(screen.getByRole('button', { name: /left shoulder \(front\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /left shoulder \(side\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /left trapezius \(upper\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /left rear deltoid/i })).toBeInTheDocument()
  })

  it('selected muscle chips have .selected class', () => {
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={['shoulder_front_left']} onToggleMuscle={() => {}} onClose={() => {}} />
    )
    const btn = screen.getByRole('button', { name: /left shoulder \(front\)/i })
    expect(btn.className).toMatch(/selected/)
  })

  it('clicking a muscle chip fires onToggleMuscle', async () => {
    const onToggle = vi.fn()
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={onToggle} onClose={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: /left shoulder \(front\)/i }))
    expect(onToggle).toHaveBeenCalledWith('shoulder_front_left')
  })

  it('clicking the close button fires onClose', async () => {
    const onClose = vi.fn()
    render(
      <MuscleDrawer region="shoulder_left" selectedMuscles={[]} onToggleMuscle={() => {}} onClose={onClose} />
    )
    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
