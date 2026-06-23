import { isAxiosError } from 'axios'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { HTTP_STATUS } from '@/shared/constants'
import { ProductNotFoundError } from '@/shared/services/products.api'
import { getProductById } from '@/shared/services/products.service'
import type { ProductDetail } from '@/shared/types'

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof ProductNotFoundError ||
    (isAxiosError(error) && error.response?.status === HTTP_STATUS.NOT_FOUND)
  )
}

export const loadProductDetail = cache(async (id: string): Promise<ProductDetail> => {
  try {
    return await getProductById(id)
  } catch (error) {
    if (isNotFoundError(error)) notFound()
    throw error
  }
})

export function buildProductDetailMetadata(product: ProductDetail): Metadata {
  return {
    title: `${product.name} - ${product.brand}`,
    description: product.description,
  }
}
