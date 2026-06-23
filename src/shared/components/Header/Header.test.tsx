import { act, render, screen } from '@testing-library/react'

import { useCart, type CartContextValue } from '@/features/cart/context/CartContext'
import { ROUTES } from '@/shared/constants'

import { Header } from './Header'

import styles from './Header.module.scss'

jest.mock('@/features/cart/context/CartContext')

const mockUseCart = jest.mocked(useCart)

const mockCart = (cartCount: number) =>
  mockUseCart.mockReturnValue({ cartCount, isHydrated: true } as CartContextValue)

describe('Given a Header component', () => {
  describe('When the cart is empty', () => {
    beforeEach(() => {
      mockCart(0)
    })

    it('When rendered, Then the cart link has an accessible label without item count', () => {
      render(<Header />)
      expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument()
    })

    it('When rendered, Then the badge displays 0', () => {
      render(<Header />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Given the cart has 1 item', () => {
    beforeEach(() => {
      mockCart(1)
    })

    it('When rendered, Then the cart link uses the singular label', () => {
      render(<Header />)
      expect(screen.getByRole('link', { name: 'Cart, 1 item' })).toBeInTheDocument()
    })

    it('When rendered, Then the badge displays 1', () => {
      render(<Header />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Given the cart has multiple items', () => {
    beforeEach(() => {
      mockCart(5)
    })

    it('When rendered, Then the cart link uses the plural label', () => {
      render(<Header />)
      expect(screen.getByRole('link', { name: 'Cart, 5 items' })).toBeInTheDocument()
    })

    it('When rendered, Then the badge displays the count', () => {
      render(<Header />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('Given any cart state', () => {
    beforeEach(() => {
      mockCart(0)
    })

    it('When rendered, Then the logo links to the home route', () => {
      render(<Header />)
      expect(screen.getByRole('link', { name: 'Zara' })).toHaveAttribute('href', ROUTES.HOME)
    })

    it('When rendered, Then the cart link points to the cart route', () => {
      render(<Header />)
      expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', ROUTES.CART)
    })
  })

  describe('Given the Header mounts for the first time on a non-cart page', () => {
    beforeEach(() => {
      mockCart(0)
      jest.useFakeTimers()
    })

    afterEach(() => {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    })

    it('When rendered, Then the animated loading bar is visible immediately', () => {
      const { container } = render(<Header />)
      expect(container.querySelector(`.${styles.header__loadingBar}`)).toBeInTheDocument()
    })

    it('And after 1200ms the loading bar is removed', () => {
      const { container } = render(<Header />)
      act(() => {
        jest.advanceTimersByTime(1200)
      })
      expect(container.querySelector(`.${styles.header__loadingBar}`)).not.toBeInTheDocument()
    })
  })
})
