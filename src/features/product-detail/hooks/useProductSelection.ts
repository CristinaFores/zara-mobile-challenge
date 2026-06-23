'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

import { useCart } from '@/features/cart/context/CartContext'
import { ROUTES } from '@/shared/constants'
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

  const setSelectedColor = useCallback(
    (color: ColorOption) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('color', color.name)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setSelectedStorage = useCallback(
    (storage: StorageOption) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('storage', storage.capacity)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
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
    addToCart(productForCart, selectedColor, selectedStorage)
    router.push(ROUTES.CART)
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
