'use client'

import { memo, useLayoutEffect } from 'react'

import { ProductCardBase } from '@/features/catalog/components/ProductCard/ProductCardBase'
import { useProductDetailNavigation } from '@/shared/hooks/useProductDetailNavigation'
import {
  getProductViewTransitionName,
  resolveProductRouteViewTransition,
  useReturningProductTransitionTarget,
} from '@/shared/store/productNavigation'
import type { Product } from '@/shared/types'

import styles from './ProductCard.module.scss'

type ProductCardProps = Product & {
  className?: string
  priority?: boolean
  cardRef?: (element: HTMLElement | null) => void
}

export const ProductCard = memo(function ProductCard({
  id,
  brand,
  name,
  basePrice,
  imageUrl,
  priority = false,
  cardRef,
  className,
}: ProductCardProps) {
  const {
    href,
    prefetchFull,
    imageTransitionStyle: forwardImageTransitionStyle,
    warmRoute,
    activatePointerNavigation,
    navigateWithViewTransition,
    activateNavigation,
  } = useProductDetailNavigation({ id, brand, name, basePrice, imageUrl }, { priority })
  const isBackTransitionTarget = useReturningProductTransitionTarget(id)

  useLayoutEffect(() => {
    if (!isBackTransitionTarget) return
    resolveProductRouteViewTransition(id)
  }, [id, isBackTransitionTarget])

  const imageTransitionStyle =
    forwardImageTransitionStyle ??
    (isBackTransitionTarget
      ? { viewTransitionName: getProductViewTransitionName(id, 'image') }
      : undefined)

  return (
    <li
      ref={cardRef ? (element) => cardRef(element) : undefined}
      className={[styles['product-card'], className].filter(Boolean).join(' ')}
    >
      <ProductCardBase
        brand={brand}
        name={name}
        basePrice={basePrice}
        imageUrl={imageUrl}
        href={href}
        prefetch={prefetchFull || priority ? true : 'auto'}
        imageTransitionStyle={imageTransitionStyle}
        priority={priority}
        onMouseEnter={warmRoute}
        onFocus={warmRoute}
        onTouchStart={warmRoute}
        onPointerDown={activatePointerNavigation}
        onClick={navigateWithViewTransition}
        onNavigate={activateNavigation}
      />
    </li>
  )
})
