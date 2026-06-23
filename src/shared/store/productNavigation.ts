'use client'

import { useSyncExternalStore } from 'react'

import { ROUTES } from '@/shared/constants'
import type { Product } from '@/shared/types'

export interface ProductPreview extends Pick<
  Product,
  'id' | 'brand' | 'name' | 'basePrice' | 'imageUrl'
> {
  readonly href: string
}

export function getProductDetailHref(productId: string): string {
  return `${ROUTES.PRODUCT_DETAIL}/${encodeURIComponent(productId)}`
}

export function getProductViewTransitionName(productId: string, part: 'image' | 'title'): string {
  const safeId = productId.replace(/[^a-zA-Z0-9_-]/g, '-')
  return `product-${part}-${safeId}`
}

export function scrollToProductDetailTop(): void {
  window.scrollTo({ top: 0, left: 0 })
}

let currentPreview: ProductPreview | null = null
const previewListeners = new Set<() => void>()

export function setProductPreview(preview: ProductPreview): void {
  currentPreview = preview
  previewListeners.forEach((fn) => fn())
}

function subscribeToPreview(listener: () => void): () => void {
  previewListeners.add(listener)
  return () => {
    previewListeners.delete(listener)
  }
}

export function useProductPreview(productId?: string): ProductPreview | null {
  return useSyncExternalStore(
    subscribeToPreview,
    () => {
      if (!productId) return currentPreview
      const preview = currentPreview
      if (preview?.id !== productId) return null
      if (preview?.href !== getProductDetailHref(productId)) return null
      return preview
    },
    () => null
  )
}

let pendingRouteTransition: {
  readonly productId: string
  readonly resolve: () => void
  readonly timeout: ReturnType<typeof setTimeout>
} | null = null

export function beginProductRouteViewTransition(productId: string): Promise<void> {
  pendingRouteTransition?.resolve()
  clearTimeout(pendingRouteTransition?.timeout)

  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (pendingRouteTransition?.productId === productId) {
        pendingRouteTransition = null
      }
      resolve()
    }, 700)

    pendingRouteTransition = {
      productId,
      resolve: () => {
        clearTimeout(timeout)
        if (pendingRouteTransition?.productId === productId) {
          pendingRouteTransition = null
        }
        resolve()
      },
      timeout,
    }
  })
}

export function resolveProductRouteViewTransition(productId: string): void {
  if (pendingRouteTransition?.productId !== productId) return
  pendingRouteTransition.resolve()
}
