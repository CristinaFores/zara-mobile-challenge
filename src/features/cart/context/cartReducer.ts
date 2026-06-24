import { createCartLineId } from '@/features/cart/lib/createCartLineId'
import type { CartItem, ColorOption, Product, StorageOption } from '@/shared/types'

export interface CartState {
  cartItems: CartItem[]
  isHydrated: boolean
}

export type CartAction =
  | { type: 'HYDRATE'; payload: CartItem[] }
  | {
      type: 'ADD'
      payload: { product: Product; selectedColor: ColorOption; selectedStorage: StorageOption }
    }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR' }

export const initialState: CartState = { cartItems: [], isHydrated: false }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { cartItems: action.payload, isHydrated: true }

    case 'ADD': {
      const { product, selectedColor, selectedStorage } = action.payload
      const cartItems: CartItem[] = [
        ...state.cartItems,
        {
          key: createCartLineId(product.id),
          id: product.id,
          brand: product.brand,
          name: product.name,
          imageUrl: selectedColor.imageUrl ?? product.imageUrl,
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

    default:
      return state
  }
}
