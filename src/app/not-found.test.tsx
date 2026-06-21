import { render, screen } from '@testing-library/react'

import NotFound from './not-found'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Given the NotFound page', () => {
  beforeEach(() => render(<NotFound />))

  it('Then it shows the 404 code', () => {
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('Then it shows the page not found heading', () => {
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })

  it('Then it renders a link back to the catalog', () => {
    const link = screen.getByRole('link', { name: /go back home/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
