import { render, screen } from '@testing-library/react'

import { EmptyState } from './EmptyState'

describe('Given an EmptyState component', () => {
  describe('When rendered with no props', () => {
    it('Then it has a status role', () => {
      render(<EmptyState />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('When rendered, Then it shows the default message', () => {
      render(<EmptyState />)
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })
  })

  describe('Given a custom message', () => {
    it('When rendered, Then it shows the provided message', () => {
      render(<EmptyState message="Your cart is empty" />)
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })
  })
})
