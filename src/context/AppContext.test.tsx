import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from './AppProvider'
import { useAppContext } from './AppContext'

function TestConsumer() {
  const { state, dispatch } = useAppContext()
  return (
    <div>
      <span data-testid="screen">{state.activeScreen}</span>
      <span data-testid="input">
        {state.pendingPainInput ? state.pendingPainInput.pain_level : 'none'}
      </span>
      <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'pain_input' })}>
        go-input
      </button>
      <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}>
        go-home
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'SET_PAIN_INPUT',
            input: { pain_level: 7, location_tags: ['ribs'], symptom_tags: ['burning'] },
          })
        }
      >
        set-input
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_PAIN_INPUT' })}>
        clear-input
      </button>
    </div>
  )
}

describe('AppContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts on the home screen', () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    expect(screen.getByTestId('screen').textContent).toBe('home')
  })

  it('navigates to pain_input', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('go-input'))
    expect(screen.getByTestId('screen').textContent).toBe('pain_input')
  })

  it('navigates back to home', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('go-input'))
    await userEvent.click(screen.getByText('go-home'))
    expect(screen.getByTestId('screen').textContent).toBe('home')
  })

  it('stores pain input and clears it', async () => {
    render(<AppProvider><TestConsumer /></AppProvider>)
    await userEvent.click(screen.getByText('set-input'))
    expect(screen.getByTestId('input').textContent).toBe('7')
    await userEvent.click(screen.getByText('clear-input'))
    expect(screen.getByTestId('input').textContent).toBe('none')
  })
})
