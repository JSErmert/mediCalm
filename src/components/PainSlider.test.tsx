import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PainSlider } from './PainSlider'

describe('PainSlider', () => {
  it('renders with the initial value displayed', () => {
    render(<PainSlider value={5} onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toHaveValue('5')
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('has min=0 and max=10', () => {
    render(<PainSlider value={0} onChange={vi.fn()} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '10')
  })

  it('has an accessible label', () => {
    render(<PainSlider value={3} onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toHaveAccessibleName(/pain level/i)
  })

  it('calls onChange with a number when value changes', () => {
    const onChange = vi.fn()
    render(<PainSlider value={5} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    // fireEvent.change is correct for input[type=range] in jsdom
    fireEvent.change(slider, { target: { value: '6' } })
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('shows /10 label alongside the value', () => {
    render(<PainSlider value={7} onChange={vi.fn()} />)
    expect(screen.getByText('/10')).toBeInTheDocument()
  })
})
