import type { CartItem, ColorOption, Phone, StorageOption } from '@/shared/types'
import { buildKey } from '@/shared/utils/buildKey'

export interface CartState {
  cartItems: CartItem[]
  isHydrated: boolean
}

export type CartAction =
  | { type: 'HYDRATE'; payload: CartItem[] }
  | {
      type: 'ADD'
      payload: { phone: Phone; selectedColor: ColorOption; selectedStorage: StorageOption }
    }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR' }
  | { type: 'SYNC_PRICES'; payload: Record<string, number> }

export const initialState: CartState = { cartItems: [], isHydrated: false }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { cartItems: action.payload, isHydrated: true }

    case 'ADD': {
      const { phone, selectedColor, selectedStorage } = action.payload
      const key = buildKey(phone.id, selectedColor.name, selectedStorage.capacity)
      if (state.cartItems.some((item) => item.key === key)) return state
      const cartItems: CartItem[] = [
        ...state.cartItems,
        {
          key,
          id: phone.id,
          brand: phone.brand,
          name: phone.name,
          imageUrl: selectedColor.imageUrl ?? phone.imageUrl,
          selectedColor,
          selectedStorage,
          price: selectedStorage.price,
          quantity: 1,
        },
      ]
      return { ...state, cartItems }
    }

    case 'REMOVE':
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item.key !== action.payload),
      }

    case 'CLEAR':
      return { ...state, cartItems: [] }

    case 'SYNC_PRICES': {
      const updates = action.payload
      const cartItems = state.cartItems.map((item) =>
        item.key in updates ? { ...item, price: updates[item.key] } : item
      )
      return { ...state, cartItems }
    }

    default:
      return state
  }
}
