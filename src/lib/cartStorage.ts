import { CART_KEY } from '@/constants'
import type { CartItem } from '@/types'

/**
 * Runs a storage operation, returning `fallback` silently if it throws
 * (e.g. private mode, quota exceeded, corrupted JSON).
 */
function safeExecute<T>(operation: () => T, fallback: T): T {
  try {
    return operation()
  } catch {
    return fallback
  }
}

/** Read/write access to the persisted cart, safe to call during SSR. */
export const cartStorage = {
  read(): CartItem[] {
    if (typeof window === 'undefined') return []
    return safeExecute<CartItem[]>(() => {
      const data = localStorage.getItem(CART_KEY)
      return data ? (JSON.parse(data) as CartItem[]) : []
    }, [])
  },

  write(items: CartItem[]): void {
    if (typeof window === 'undefined') return
    safeExecute(() => {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }, undefined)
  },

  clear(): void {
    if (typeof window === 'undefined') return
    safeExecute(() => {
      localStorage.removeItem(CART_KEY)
    }, undefined)
  },
}
