import { isAxiosError } from 'axios'
import { NextResponse } from 'next/server'

import { API_ENDPOINTS, HTTP_STATUS, PRODUCTS_LIMIT } from '@/shared/constants'
import type { Product, ProductDetail } from '@/shared/types'

import apiClient from './apiClient'

const PRODUCT_ID_PATTERN = /^[A-Z0-9-]+$/i

export class ProductNotFoundError extends Error {
  readonly status = HTTP_STATUS.NOT_FOUND

  constructor(message = 'Product not found') {
    super(message)
    this.name = 'ProductNotFoundError'
  }
}

export interface FetchProductListOptions {
  readonly limit?: number
  readonly search?: string
}

export async function fetchProductList(options: FetchProductListOptions = {}): Promise<Product[]> {
  const limit = options.limit ?? PRODUCTS_LIMIT
  const { data } = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS, {
    params: { limit, ...(options.search ? { search: options.search } : {}) },
  })
  return [...new Map(data.map((product) => [product.id, product])).values()]
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  if (!PRODUCT_ID_PATTERN.test(id)) {
    throw new ProductNotFoundError()
  }
  const { data } = await apiClient.get<ProductDetail>(
    `${API_ENDPOINTS.PRODUCTS}/${encodeURIComponent(id)}`
  )
  return data
}

export function productsErrorResponse(error: unknown): NextResponse {
  if (error instanceof ProductNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: error.status })
  }
  if (isAxiosError(error) && error.response) {
    return NextResponse.json(error.response.data, { status: error.response.status })
  }
  return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
}
