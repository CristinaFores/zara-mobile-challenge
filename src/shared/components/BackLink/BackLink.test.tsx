import { render, screen } from '@testing-library/react'

import { BackLink } from './BackLink'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Given BackLink', () => {
  describe('When rendered with an href', () => {
    it('Then it renders a navigation landmark', () => {
      render(<BackLink href="/" />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('Then the link points to the given href', () => {
      render(<BackLink href="/" />)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    })

    it('Then it shows the default label "Back"', () => {
      render(<BackLink href="/" />)
      expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
    })
  })

  describe('When a custom label is provided', () => {
    it('Then it renders the custom label instead', () => {
      render(<BackLink href="/phones" label="Go back" />)
      expect(screen.getByRole('link', { name: /go back/i })).toBeInTheDocument()
    })
  })
})
