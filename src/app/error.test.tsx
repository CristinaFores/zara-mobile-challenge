import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ErrorBoundary from './error'

describe('Given the route ErrorBoundary', () => {
  describe('When an error is thrown', () => {
    it('Then it shows the error message', () => {
      render(<ErrorBoundary error={new Error('Boom')} reset={jest.fn()} />)

      expect(screen.getByText('Boom')).toBeInTheDocument()
    })

    it('Then it calls reset when the user retries', async () => {
      const reset = jest.fn()
      render(<ErrorBoundary error={new Error('Boom')} reset={reset} />)

      await userEvent.click(screen.getByRole('button', { name: /try again/i }))

      expect(reset).toHaveBeenCalledTimes(1)
    })
  })
})
