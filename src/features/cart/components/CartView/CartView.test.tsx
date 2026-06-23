import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { CartContextValue } from '@/features/cart/context/CartContext'
import type { CartItem } from '@/shared/types'

import { CartView } from './CartView'

const mockRemoveFromCart = jest.fn()

const baseCart: CartContextValue = {
  cartItems: [] as CartItem[],
  cartTotal: 0,
  cartCount: 0,
  isHydrated: true,
  addToCart: jest.fn(),
  removeFromCart: mockRemoveFromCart,
  clearCart: jest.fn(),
}

jest.mock('@/features/cart/context/CartContext', () => ({
  useCart: () => mockCartValue,
}))

jest.mock('@/shared/components/ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) => <span data-testid="product-image" aria-label={alt} />,
}))

jest.mock('next/navigation', () => ({ usePathname: () => '/cart' }))

let mockCartValue: CartContextValue = { ...baseCart }

describe('Given CartView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCartValue = { ...baseCart }
  })

  describe('When the cart is not yet hydrated', () => {
    it('Then it renders a loading placeholder with no visible content', () => {
      mockCartValue = { ...baseCart, isHydrated: false }
      render(<CartView />)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('When the cart is empty', () => {
    it('Then it shows the Cart (0) heading', () => {
      render(<CartView />)
      expect(screen.getByRole('heading', { name: /cart \(0\)/i })).toBeInTheDocument()
    })

    it('Then it shows a link back to the catalog', () => {
      render(<CartView />)
      expect(screen.getByRole('link', { name: /continue shopping/i })).toBeInTheDocument()
    })

    it('Then no items list is rendered', () => {
      render(<CartView />)
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('Then the checkout actions are not rendered', () => {
      render(<CartView />)
      expect(screen.queryByRole('button', { name: /pay/i })).not.toBeInTheDocument()
      expect(screen.queryByText(/^total$/i)).not.toBeInTheDocument()
    })
  })

  describe('When the cart has one item', () => {
    beforeEach(() => {
      mockCartValue = {
        ...baseCart,
        cartTotal: 1329,
        cartCount: 1,
        cartItems: [
          {
            key: 'smg-s24-ultra::titanium-violet::256GB',
            id: 'smg-s24-ultra',
            brand: 'Samsung',
            name: 'Galaxy S24 Ultra',
            imageUrl: 'https://example.com/image.webp',
            selectedColor: {
              name: 'Titanium Violet',
              hexCode: '#7d6b99',
              imageUrl: 'https://example.com/image.webp',
            },
            selectedStorage: { capacity: '256GB', price: 1329 },
            price: 1329,
            quantity: 1,
          },
        ],
      }
    })

    it('Then it renders the item name', () => {
      render(<CartView />)
      expect(screen.getByText('Galaxy S24 Ultra')).toBeInTheDocument()
    })

    it('Then it renders the storage and color', () => {
      render(<CartView />)
      expect(screen.getByText('256GB | Titanium Violet')).toBeInTheDocument()
    })

    it('Then it renders the price and cart total — both showing 1329 EUR', () => {
      render(<CartView />)
      expect(screen.getAllByText('1329 EUR')).toHaveLength(2)
    })

    it('Then qty is not shown when quantity is 1', () => {
      render(<CartView />)
      expect(screen.queryByText(/qty/i)).not.toBeInTheDocument()
    })

    it('Then clicking Remove calls removeFromCart with the item key after the exit animation', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      render(<CartView />)
      await user.click(
        screen.getByRole('button', { name: /remove samsung galaxy s24 ultra from cart/i })
      )

      expect(mockRemoveFromCart).not.toHaveBeenCalled()

      jest.advanceTimersByTime(720)

      expect(mockRemoveFromCart).toHaveBeenCalledWith('smg-s24-ultra::titanium-violet::256GB')
      jest.useRealTimers()
    })
  })

  describe('When the cart has an item with quantity > 1', () => {
    it('Then the heading reflects the total count', () => {
      mockCartValue = {
        ...baseCart,
        cartTotal: 2658,
        cartCount: 2,
        cartItems: [
          {
            key: 'smg-s24-ultra::titanium-violet::256GB',
            id: 'smg-s24-ultra',
            brand: 'Samsung',
            name: 'Galaxy S24 Ultra',
            imageUrl: 'https://example.com/image.webp',
            selectedColor: {
              name: 'Titanium Violet',
              hexCode: '#7d6b99',
              imageUrl: 'https://example.com/image.webp',
            },
            selectedStorage: { capacity: '256GB', price: 1329 },
            price: 1329,
            quantity: 2,
          },
        ],
      }
      render(<CartView />)
      expect(screen.getByRole('heading', { name: /cart \(2\)/i })).toBeInTheDocument()
    })
  })
})
