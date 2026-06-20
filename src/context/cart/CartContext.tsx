'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'

import { cartStorage } from '@/lib/cartStorage'
import type { CartItem, ColorOption, Phone, StorageOption } from '@/types'

import { cartReducer, initialState } from './cartReducer'

export interface CartContextValue {
  cartItems: CartItem[]
  cartTotal: number
  cartCount: number
  isHydrated: boolean
  addToCart: (phone: Phone, selectedColor: ColorOption, selectedStorage: StorageOption) => void
  removeFromCart: (key: string) => void
  clearCart: () => void
  syncPrices: (updates: Record<string, number>) => void
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
    (phone, selectedColor, selectedStorage) =>
      dispatch({ type: 'ADD', payload: { phone, selectedColor, selectedStorage } }),
    []
  )

  const removeFromCart = useCallback<CartContextValue['removeFromCart']>(
    (key) => dispatch({ type: 'REMOVE', payload: key }),
    []
  )

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const syncPrices = useCallback<CartContextValue['syncPrices']>(
    (updates) => dispatch({ type: 'SYNC_PRICES', payload: updates }),
    []
  )

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cartItems,
    cartTotal,
    cartCount,
    isHydrated,
    addToCart,
    removeFromCart,
    clearCart,
    syncPrices,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cartValue = useCartProviderValue()
  return <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
