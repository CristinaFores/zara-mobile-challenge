import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

import { CART_KEY } from '@/constants'
import { phoneDetailFixture, phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'
import type { CartItem } from '@/types'

import { CartProvider, useCart } from './CartContext'

const PHONE = phoneListFixture[0]
const COLOR_VIOLET = phoneDetailFixture.colorOptions[0]
const COLOR_BLACK = phoneDetailFixture.colorOptions[1]
const STORAGE_256 = phoneDetailFixture.storageOptions[0]
const STORAGE_512 = phoneDetailFixture.storageOptions[1]

const toItemKey = (id: string, colorName: string, capacity: string) =>
  `${id}::${colorName}::${capacity}`

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>

async function renderCart() {
  const { result } = renderHook(() => useCart(), { wrapper })
  await waitFor(() => expect(result.current.isHydrated).toBe(true))
  return result
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Given CartProvider mounts with an empty localStorage', () => {
  describe('When the initial render completes', () => {
    it('Then the cart starts with zero items, a total of €0, and a count of 0', async () => {
      const result = await renderCart()

      expect(result.current.cartItems).toHaveLength(0)
      expect(result.current.cartTotal).toBe(0)
      expect(result.current.cartCount).toBe(0)
    })
  })
})

describe('Given the cart is empty', () => {
  describe('When addToCart is called with a phone, a color, and a storage tier', () => {
    it('Then the item appears in the cart with quantity 1', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.cartItems[0].quantity).toBe(1)
    })

    it('And the cart total equals the selected storage price', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })

      expect(result.current.cartTotal).toBe(STORAGE_256.price)
    })

    it('And cartCount increments to 1', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })

      expect(result.current.cartCount).toBe(1)
    })

    it('And localStorage is updated to persist the new cart state across page reloads', async () => {
      const result = await renderCart()

      jest.spyOn(Storage.prototype, 'setItem')

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(CART_KEY, expect.stringContaining(PHONE.id))
    })

    it('And the cart item stores the color image URL so the correct photo shows in the cart', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })

      expect(result.current.cartItems[0].imageUrl).toBe(COLOR_VIOLET.imageUrl)
    })
  })
})

describe('Given the same phone, color, and storage combination is already in the cart', () => {
  describe('When addToCart is called again with the identical combination', () => {
    it('Then the second call is a no-op — one item per unique combination', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.cartItems[0].quantity).toBe(1)
    })

    it('And the total reflects only one unit price', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })

      expect(result.current.cartTotal).toBe(STORAGE_256.price)
    })
  })
})

describe('Given the same phone model is added with two different color selections', () => {
  describe('When addToCart is called once per color', () => {
    it('Then each color is stored as a separate line item — not merged', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
        result.current.addToCart(PHONE, COLOR_BLACK, STORAGE_256)
      })

      expect(result.current.cartItems).toHaveLength(2)
      const colorNames = result.current.cartItems.map((item) => item.selectedColor.name)
      expect(colorNames).toContain(COLOR_VIOLET.name)
      expect(colorNames).toContain(COLOR_BLACK.name)
    })

    it('And the total combines both prices', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
        result.current.addToCart(PHONE, COLOR_BLACK, STORAGE_512)
      })

      expect(result.current.cartTotal).toBe(STORAGE_256.price + STORAGE_512.price)
    })
  })
})

describe('Given an item is in the cart', () => {
  describe('When removeFromCart is called with that item key', () => {
    it('Then the item is no longer in the cart', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })
      const { key } = result.current.cartItems[0]

      act(() => {
        result.current.removeFromCart(key)
      })

      expect(result.current.cartItems).toHaveLength(0)
    })

    it('And the total drops back to 0', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })
      const { key } = result.current.cartItems[0]

      act(() => {
        result.current.removeFromCart(key)
      })

      expect(result.current.cartTotal).toBe(0)
    })

    it('And localStorage is updated to reflect the removal', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })
      const { key } = result.current.cartItems[0]

      jest.spyOn(Storage.prototype, 'setItem')

      act(() => {
        result.current.removeFromCart(key)
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(CART_KEY, '[]')
    })
  })
})

describe('Given two items are in the cart', () => {
  describe('When removeFromCart is called for only one of them', () => {
    it('Then the other item remains and the total reflects only its price', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
        result.current.addToCart(PHONE, COLOR_BLACK, STORAGE_512)
      })
      const keyToRemove = result.current.cartItems[0].key

      act(() => {
        result.current.removeFromCart(keyToRemove)
      })

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.cartTotal).toBe(STORAGE_512.price)
    })
  })
})

describe('Given an item in the cart whose catalog price has changed since it was added', () => {
  describe('When syncPrices is called with the updated price map', () => {
    it('Then the cart item reflects the new price', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
      })
      const { key } = result.current.cartItems[0]

      act(() => {
        result.current.syncPrices({ [key]: 1199 })
      })

      expect(result.current.cartItems[0].price).toBe(1199)
      expect(result.current.cartTotal).toBe(1199)
    })

    it('And items not present in the price map are left unchanged', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
        result.current.addToCart(PHONE, COLOR_BLACK, STORAGE_512)
      })
      const keyViolet = result.current.cartItems[0].key

      act(() => {
        result.current.syncPrices({ [keyViolet]: 1199 })
      })

      expect(result.current.cartItems[1].price).toBe(STORAGE_512.price)
    })
  })
})

describe('Given the user had items saved in localStorage from a previous session', () => {
  describe('When CartProvider mounts', () => {
    it('Then the saved cart is restored so the user continues from where they left off', async () => {
      const savedItem: CartItem = {
        key: toItemKey(PHONE.id, COLOR_VIOLET.name, STORAGE_256.capacity),
        id: PHONE.id,
        brand: PHONE.brand,
        name: PHONE.name,
        imageUrl: COLOR_VIOLET.imageUrl,
        selectedColor: COLOR_VIOLET,
        selectedStorage: STORAGE_256,
        price: STORAGE_256.price,
        quantity: 1,
      }
      localStorage.setItem(CART_KEY, JSON.stringify([savedItem]))

      const result = await renderCart()

      expect(result.current.cartItems).toHaveLength(1)
      expect(result.current.cartItems[0].id).toBe(PHONE.id)
      expect(result.current.cartTotal).toBe(STORAGE_256.price)
    })
  })
})

describe('Given useCart is invoked outside of CartProvider', () => {
  describe('When the hook runs without a wrapping provider in the tree', () => {
    it('Then it throws a descriptive error so the developer can locate the missing provider', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => renderHook(() => useCart())).toThrow(
        'useCart must be used within a CartProvider'
      )
    })
  })
})

describe('Given the user has items in the cart', () => {
  describe('When clearCart is called', () => {
    it('Then the cart is cleared and the user starts with a new empty cart', async () => {
      const result = await renderCart()

      act(() => {
        result.current.addToCart(PHONE, COLOR_VIOLET, STORAGE_256)
        result.current.clearCart()
      })

      expect(result.current.cartItems).toHaveLength(0)
      expect(result.current.cartTotal).toBe(0)
    })
  })
})
