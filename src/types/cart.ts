import type { ColorOption, StorageOption } from './phone'

/**
 * A line in the cart, uniquely identified by `key` (product + colour + storage),
 * so the same phone in two configurations stays as two separate lines.
 */
export interface CartItem {
  key: string
  id: string
  brand: string
  name: string
  imageUrl: string
  selectedColor: ColorOption
  selectedStorage: StorageOption
  price: number
  quantity: number
}
