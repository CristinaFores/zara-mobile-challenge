import { render, screen } from '@testing-library/react'

import { useCart, type CartContextValue } from '@/features/cart/context/CartContext'
import { ROUTES } from '@/shared/constants'

import { CartNavLink } from './CartNavLink'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/shared/lib/cartRouteTransition', () => ({
  navigateToCart: jest.fn(),
}))

jest.mock('@/features/cart/context/CartContext')

const mockUseCart = jest.mocked(useCart)

const mockCart = (cartCount: number, isHydrated = true) =>
  mockUseCart.mockReturnValue({ cartCount, isHydrated } as CartContextValue)

describe('Given CartNavLink', () => {
  describe('When the cart is empty', () => {
    beforeEach(() => {
      mockCart(0)
    })

    it('Then the cart link has an accessible label without item count', () => {
      render(<CartNavLink />)
      expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument()
    })

    it('Then the badge displays 0', () => {
      render(<CartNavLink />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('When the cart has 1 item', () => {
    beforeEach(() => {
      mockCart(1)
    })

    it('Then the cart link uses the singular label', () => {
      render(<CartNavLink />)
      expect(screen.getByRole('link', { name: 'Cart, 1 item' })).toBeInTheDocument()
    })

    it('Then the badge displays 1', () => {
      render(<CartNavLink />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('When the cart has multiple items', () => {
    beforeEach(() => {
      mockCart(5)
    })

    it('Then the cart link uses the plural label', () => {
      render(<CartNavLink />)
      expect(screen.getByRole('link', { name: 'Cart, 5 items' })).toBeInTheDocument()
    })

    it('Then the badge displays the count', () => {
      render(<CartNavLink />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('When rendered', () => {
    beforeEach(() => {
      mockCart(0)
    })

    it('Then the cart link points to the cart route', () => {
      render(<CartNavLink />)
      expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', ROUTES.CART)
    })
  })
})
