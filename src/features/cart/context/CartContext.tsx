'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

import { cartStorage } from '@/features/cart/lib/cartStorage'
import type { CartItem, ColorOption, Product, StorageOption } from '@/shared/types'

import { cartReducer, initialState } from './cartReducer'

export interface CartContextValue {
  cartItems: CartItem[]
  cartTotal: number
  cartCount: number
  isHydrated: boolean
  addToCart: (product: Product, selectedColor: ColorOption, selectedStorage: StorageOption) => void
  removeFromCart: (key: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

CartContext.displayName = 'CartContext'

function useCartProviderValue(): CartContextValue {
  const [{ cartItems, isHydrated }, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: cartStorage.read() })
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    cartStorage.write(cartItems)
  }, [cartItems, isHydrated])

  const addToCart = useCallback<CartContextValue['addToCart']>(
    (product, selectedColor, selectedStorage) =>
      dispatch({ type: 'ADD', payload: { product, selectedColor, selectedStorage } }),
    []
  )

  const removeFromCart = useCallback<CartContextValue['removeFromCart']>(
    (key) => dispatch({ type: 'REMOVE', payload: key }),
    []
  )

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return useMemo(
    () => ({
      cartItems,
      cartTotal,
      cartCount,
      isHydrated,
      addToCart,
      removeFromCart,
      clearCart,
    }),
    [cartItems, cartTotal, cartCount, isHydrated, addToCart, removeFromCart, clearCart]
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cartValue = useCartProviderValue()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (!announcement) return
    const timer = setTimeout(() => setAnnouncement(''), 3000)
    return () => clearTimeout(timer)
  }, [announcement])

  const { addToCart: originalAddToCart } = cartValue
  const addToCart = useCallback<CartContextValue['addToCart']>(
    (product, selectedColor, selectedStorage) => {
      originalAddToCart(product, selectedColor, selectedStorage)
      setAnnouncement(`${product.brand} ${product.name} added to cart`)
    },
    [originalAddToCart]
  )

  const contextValue = useMemo(() => ({ ...cartValue, addToCart }), [cartValue, addToCart])

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
