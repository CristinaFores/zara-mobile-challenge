'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { useCart } from '@/features/cart/context/CartContext'
import { ROUTES } from '@/shared/constants'
import {
  getBrowserSearchParamsSnapshot,
  replaceSearchParamsInHistory,
  subscribeToPopstate,
} from '@/shared/lib/browser'
import { navigateToCart } from '@/shared/lib/cartRouteTransition'
import type { ColorOption, Product, ProductDetail, StorageOption } from '@/shared/types'

export interface ProductSelection {
  selectedColor: ColorOption | null
  selectedStorage: StorageOption | null
  setSelectedColor: (color: ColorOption) => void
  setSelectedStorage: (storage: StorageOption) => void
  imageUrl: string
  priceLabel: string
  canAddToCart: boolean
  handleAddToCart: () => void
}

function formatPrice(price: number, hasStorage: boolean): string {
  return hasStorage ? `${price} EUR` : `From ${price} EUR`
}

export function useProductSelection(product: ProductDetail): ProductSelection {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { addToCart } = useCart()
  const [baselineParams] = useState(() => new URLSearchParams(searchParams.toString()))
  const [optimisticParams, setOptimisticParams] = useState<URLSearchParams | null>(null)

  useEffect(() => subscribeToPopstate(() => setOptimisticParams(null)), [])

  const searchSnapshot = useSyncExternalStore(
    subscribeToPopstate,
    getBrowserSearchParamsSnapshot,
    () => null
  )

  const browserParams = useMemo(() => {
    if (searchSnapshot === null) return null
    return new URLSearchParams(searchSnapshot)
  }, [searchSnapshot])

  const selectionParams = useMemo(() => {
    if (optimisticParams) return optimisticParams
    return browserParams ?? baselineParams
  }, [optimisticParams, browserParams, baselineParams])

  const selectedColor =
    product.colorOptions.find((c) => c.name === selectionParams.get('color')) ?? null

  const selectedStorage =
    product.storageOptions.find((s) => s.capacity === selectionParams.get('storage')) ?? null

  const updateSelectionParam = useCallback(
    (key: 'color' | 'storage', value: string) => {
      const params = new URLSearchParams(selectionParams.toString())
      params.set(key, value)
      setOptimisticParams(params)
      replaceSearchParamsInHistory(pathname, params)
    },
    [pathname, selectionParams]
  )

  const setSelectedColor = useCallback(
    (color: ColorOption) => updateSelectionParam('color', color.name),
    [updateSelectionParam]
  )

  const setSelectedStorage = useCallback(
    (storage: StorageOption) => updateSelectionParam('storage', storage.capacity),
    [updateSelectionParam]
  )

  const imageUrl = selectedColor?.imageUrl ?? product.colorOptions[0]?.imageUrl ?? ''
  const priceLabel = formatPrice(
    selectedStorage?.price ?? product.basePrice,
    selectedStorage !== null
  )
  const canAddToCart = selectedColor !== null && selectedStorage !== null

  const handleAddToCart = useCallback(() => {
    if (!selectedColor || !selectedStorage) return
    const productForCart: Product = {
      id: product.id,
      brand: product.brand,
      name: product.name,
      basePrice: product.basePrice,
      imageUrl: selectedColor.imageUrl,
    }
    navigateToCart(router, ROUTES.CART, () => {
      addToCart(productForCart, selectedColor, selectedStorage)
    })
  }, [product, selectedColor, selectedStorage, addToCart, router])

  return {
    selectedColor,
    selectedStorage,
    setSelectedColor,
    setSelectedStorage,
    imageUrl,
    priceLabel,
    canAddToCart,
    handleAddToCart,
  }
}
