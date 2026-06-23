import { act, render, screen } from '@testing-library/react'

import { ROUTES } from '@/shared/constants'

import { Header } from './Header'

import styles from './Header.module.scss'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Given a Header component', () => {
  const cartLink = <a href="/cart">Cart slot</a>

  describe('When rendered with a cart link slot', () => {
    it('Then the logo links to the home route', () => {
      render(<Header cartLink={cartLink} />)
      expect(screen.getByRole('link', { name: 'Zara' })).toHaveAttribute('href', ROUTES.HOME)
    })

    it('Then it renders the cart link slot', () => {
      render(<Header cartLink={cartLink} />)
      expect(screen.getByRole('link', { name: 'Cart slot' })).toBeInTheDocument()
    })
  })

  describe('Given the Header mounts for the first time on a non-cart page', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    })

    it('When rendered, Then the animated loading bar is visible immediately', () => {
      const { container } = render(<Header cartLink={cartLink} />)
      expect(container.querySelector(`.${styles.header__loadingBar}`)).toBeInTheDocument()
    })

    it('And after 1200ms the loading bar is removed', () => {
      const { container } = render(<Header cartLink={cartLink} />)
      act(() => {
        jest.advanceTimersByTime(1200)
      })
      expect(container.querySelector(`.${styles.header__loadingBar}`)).not.toBeInTheDocument()
    })
  })
})
