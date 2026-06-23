'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

import { useCart } from '@/features/cart/context/CartContext'
import { ROUTES } from '@/shared/constants'
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

  const selectedColor =
    product.colorOptions.find((c) => c.name === searchParams.get('color')) ?? null

  const selectedStorage =
    product.storageOptions.find((s) => s.capacity === searchParams.get('storage')) ?? null

  // router.replace is async: searchParams only updates once the navigation commits.
  // Two quick selections would each start from the same stale snapshot, so the
  // second would drop the first. We merge updates into a pending ref synchronously
  // and reset it when searchParams actually reflects the change.
  const pendingParamsRef = useRef<URLSearchParams | null>(null)

  useEffect(() => {
    pendingParamsRef.current = null
  }, [searchParams])

  const updateSelectionParam = useCallback(
    (key: 'color' | 'storage', value: string) => {
      const params = pendingParamsRef.current ?? new URLSearchParams(searchParams.toString())
      params.set(key, value)
      pendingParamsRef.current = params
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
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
