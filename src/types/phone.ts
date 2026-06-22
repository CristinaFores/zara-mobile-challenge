/**
 * Catalog list item returned by `GET /products`.
 * These are the only fields a product card needs.
 */
export interface Phone {
  id: string
  brand: string
  name: string
  basePrice: number
  imageUrl?: string
}

/** A selectable colour, each with its own product image. */
export interface ColorOption {
  name: string
  hexCode: string
  imageUrl?: string
}

/** A selectable storage tier with the price it sets for the device. */
export interface StorageOption {
  capacity: string
  price: number
}

/** Technical specifications shown on the detail page. */
export interface PhoneSpecs {
  screen: string
  resolution: string
  processor: string
  mainCamera: string
  selfieCamera: string
  battery: string
  os: string
  screenRefreshRate: string
}

/**
 * Full device detail returned by `GET /products/:id`.
 * Shares the catalog identity fields but the displayed image comes from the
 * selected colour, so a top-level `imageUrl` is not guaranteed.
 */
export interface PhoneDetail extends Omit<Phone, 'imageUrl'> {
  imageUrl?: string
  description: string
  rating: number
  specs: PhoneSpecs
  colorOptions: ColorOption[]
  storageOptions: StorageOption[]
  similarProducts: Phone[]
}
