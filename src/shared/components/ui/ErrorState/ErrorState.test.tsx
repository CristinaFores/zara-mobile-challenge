import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ErrorState } from './ErrorState'

describe('Given an ErrorState component', () => {
  describe('When rendered with no props', () => {
    it('Then it has an alert role', () => {
      render(<ErrorState />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('When rendered, Then it shows the default error message', () => {
      render(<ErrorState />)
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })

    it('When rendered, Then it does not show a retry button', () => {
      render(<ErrorState />)
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
    })
  })

  describe('Given a custom message', () => {
    it('When rendered, Then it shows the provided message', () => {
      render(<ErrorState message="Product not found" />)
      expect(screen.getByText('Product not found')).toBeInTheDocument()
    })
  })

  describe('Given an onRetry callback', () => {
    it('When rendered, Then it shows a retry button', () => {
      render(<ErrorState onRetry={() => {}} />)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('When the retry button is clicked, Then it calls onRetry', async () => {
      const onRetry = jest.fn()
      render(<ErrorState onRetry={onRetry} />)
      await userEvent.click(screen.getByRole('button', { name: /try again/i }))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })
})
