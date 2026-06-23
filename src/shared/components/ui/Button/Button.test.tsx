import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from './Button'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('Given a Button', () => {
  describe('When rendered without href (action button)', () => {
    it('Then renders a <button> element', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('Then calls onClick when clicked', async () => {
      const onClick = jest.fn()
      render(<Button onClick={onClick}>Click me</Button>)
      await userEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('Then is disabled when the disabled prop is set', () => {
      render(<Button disabled>Click me</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('Then applies the secondary variant class', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button').className).toContain('secondary')
    })

    it('Then applies the fullWidth class', () => {
      render(<Button fullWidth>Full Width</Button>)
      expect(screen.getByRole('button').className).toContain('full')
    })
  })

  describe('When rendered with href (navigation button)', () => {
    it('Then renders an anchor element instead of a button', () => {
      render(<Button href="/products">Go to products</Button>)
      expect(screen.getByRole('link', { name: 'Go to products' })).toBeInTheDocument()
    })

    it('Then the anchor has the correct href', () => {
      render(<Button href="/products">Go to products</Button>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/products')
    })

    it('Then applies the fullWidth class on the link too', () => {
      render(
        <Button href="/products" fullWidth>
          Full Width Link
        </Button>
      )
      expect(screen.getByRole('link').className).toContain('full')
    })
  })
})
