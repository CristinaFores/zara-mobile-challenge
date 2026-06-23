'use client'

import cardStyles from '@/features/catalog/components/ProductCard/ProductCard.module.scss'
import { ProductCardBase } from '@/features/catalog/components/ProductCard/ProductCardBase'
import { useProductDetailNavigation } from '@/shared/hooks/useProductDetailNavigation'
import type { Product } from '@/shared/types'

const SIMILAR_IMAGE_SIZES = '(max-width: 479px) 100vw, (max-width: 767px) 50vw, 25vw'

export function SimilarProductCard({ id, brand, name, basePrice, imageUrl }: Product) {
  const {
    href,
    prefetchFull,
    imageTransitionStyle,
    warmRoute,
    activatePointerNavigation,
    navigateWithViewTransition,
    activateNavigation,
  } = useProductDetailNavigation({ id, brand, name, basePrice, imageUrl })

  return (
    <li className={cardStyles['product-card']}>
      <ProductCardBase
        brand={brand}
        name={name}
        basePrice={basePrice}
        imageUrl={imageUrl}
        href={href}
        prefetch={prefetchFull ? true : 'auto'}
        imageTransitionStyle={imageTransitionStyle}
        imageSizes={SIMILAR_IMAGE_SIZES}
        onMouseEnter={warmRoute}
        onFocus={warmRoute}
        onTouchStart={warmRoute}
        onPointerDown={activatePointerNavigation}
        onClick={navigateWithViewTransition}
        onNavigate={activateNavigation}
      />
    </li>
  )
}
