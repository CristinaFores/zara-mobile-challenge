import type { ColorOption, StorageOption } from './product'

/**
 * A line in the cart. `key` is a unique line id; the same product + config can appear
 * more than once as separate rows (no quantity control in the Figma cart).
 */
export interface CartItem {
  key: string
  id: string
  brand: string
  name: string
  imageUrl?: string
  selectedColor: ColorOption
  selectedStorage: StorageOption
  price: number
  quantity: number
}
