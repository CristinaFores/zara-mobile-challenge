import { CART_KEY } from '@/shared/constants'
import { isBrowser } from '@/shared/lib/browser'
import type { CartItem, ColorOption, StorageOption } from '@/shared/types'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isColorOption(value: unknown): value is ColorOption {
  if (!isRecord(value)) return false
  return (
    typeof value.name === 'string' &&
    typeof value.hexCode === 'string' &&
    (value.imageUrl === undefined || typeof value.imageUrl === 'string')
  )
}

function isStorageOption(value: unknown): value is StorageOption {
  if (!isRecord(value)) return false
  return typeof value.capacity === 'string' && Number.isFinite(value.price)
}

function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value)) return false
  return (
    typeof value.key === 'string' &&
    typeof value.id === 'string' &&
    typeof value.brand === 'string' &&
    typeof value.name === 'string' &&
    (value.imageUrl === undefined || typeof value.imageUrl === 'string') &&
    isColorOption(value.selectedColor) &&
    isStorageOption(value.selectedStorage) &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) &&
    typeof value.quantity === 'number' &&
    Number.isFinite(value.quantity) &&
    value.quantity > 0
  )
}

function parseCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(isCartItem)
}

/** Read/write access to the persisted cart, safe to call during SSR. */
export const cartStorage = {
  read(): CartItem[] {
    if (!isBrowser()) return []
    return safeExecute<CartItem[]>(() => {
      const data = localStorage.getItem(CART_KEY)
      if (!data) return []
      return parseCartItems(JSON.parse(data))
    }, [])
  },

  write(items: CartItem[]): void {
    if (!isBrowser()) return
    safeExecute(() => {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }, undefined)
  },

  clear(): void {
    if (!isBrowser()) return
    safeExecute(() => {
      localStorage.removeItem(CART_KEY)
    }, undefined)
  },
}
