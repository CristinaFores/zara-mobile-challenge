'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

import { ROUTES } from '@/constants'
import { useCart } from '@/context/cart/CartContext'
import type { ColorOption, Phone, PhoneDetail, StorageOption } from '@/types'

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

export function useProductSelection(phone: PhoneDetail): ProductSelection {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { addToCart } = useCart()

  const selectedColor =
    phone.colorOptions.find((c) => c.name === searchParams.get('color')) ??
    phone.colorOptions[0] ??
    null

  const selectedStorage =
    phone.storageOptions.find((s) => s.capacity === searchParams.get('storage')) ??
    phone.storageOptions[0] ??
    null

  const setSelectedColor = useCallback(
    (color: ColorOption) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('color', color.name)
      const storageIsValid = phone.storageOptions.some((s) => s.capacity === params.get('storage'))
      if (!storageIsValid && phone.storageOptions[0]) {
        params.set('storage', phone.storageOptions[0].capacity)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams, phone.storageOptions]
  )

  const setSelectedStorage = useCallback(
    (storage: StorageOption) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('storage', storage.capacity)
      const colorIsValid = phone.colorOptions.some((c) => c.name === params.get('color'))
      if (!colorIsValid && phone.colorOptions[0]) {
        params.set('color', phone.colorOptions[0].name)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams, phone.colorOptions]
  )

  const imageUrl = selectedColor?.imageUrl ?? phone.colorOptions[0]?.imageUrl ?? ''
  const priceLabel = formatPrice(
    selectedStorage?.price ?? phone.basePrice,
    selectedStorage !== null
  )
  const canAddToCart = selectedColor !== null && selectedStorage !== null

  const handleAddToCart = useCallback(() => {
    if (!selectedColor || !selectedStorage) return
    const phoneForCart: Phone = {
      id: phone.id,
      brand: phone.brand,
      name: phone.name,
      basePrice: phone.basePrice,
      imageUrl: selectedColor.imageUrl,
    }
    addToCart(phoneForCart, selectedColor, selectedStorage)
    router.push(ROUTES.CART)
  }, [phone, selectedColor, selectedStorage, addToCart, router])

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
