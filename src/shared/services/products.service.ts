import { PRODUCTS_FETCH_LIMIT, PRODUCTS_LIMIT } from '@/shared/constants'
import type { Product, ProductDetail } from '@/shared/types'

import { fetchProductById, fetchProductList } from './products.api'

export async function getProducts(search?: string): Promise<Product[]> {
  const products = await fetchProductList({ limit: PRODUCTS_FETCH_LIMIT, search })
  return products.slice(0, PRODUCTS_LIMIT)
}

export async function getProductById(id: string): Promise<ProductDetail> {
  return fetchProductById(id)
}
