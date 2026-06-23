'use client'

import { useLayoutEffect, useMemo } from 'react'

import { ColorSelector } from '@/features/product-detail/components/ColorSelector/ColorSelector'
import { StorageSelector } from '@/features/product-detail/components/StorageSelector/StorageSelector'
import { useAfterProductRouteTransition } from '@/features/product-detail/hooks/useAfterProductRouteTransition'
import { useColorVariantPreload } from '@/features/product-detail/hooks/useColorVariantPreload'
import { ProductImage } from '@/shared/components/ProductImage/ProductImage'
import { Button } from '@/shared/components/ui/Button/Button'
import { useTextCrossfade } from '@/shared/hooks/useTextCrossfade'
import {
  getProductViewTransitionName,
  resolveProductRouteViewTransition,
  scrollToProductDetailTop,
  useProductPreview,
} from '@/shared/store/productNavigation'
import type { ProductDetail } from '@/shared/types'

import { useImageCrossfade } from '../../hooks/useImageCrossfade'
import { useProductSelection } from '../../hooks/useProductSelection'

import styles from './ProductDetailHero.module.scss'

interface ProductDetailHeroProps {
  product: ProductDetail
}

function getImageSlotKey(routeTransitionDone: boolean, index: number): string {
  if (!routeTransitionDone) {
    return 'route-image'
  }

  return index === 0 ? 'image-slot-a' : 'image-slot-b'
}

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const routeTransitionDone = useAfterProductRouteTransition()
  const preview = useProductPreview(product.id)
  const selection = useProductSelection(product)
  const routeImageUrl = preview?.imageUrl ?? selection.imageUrl
  const [imageSlot0, imageSlot1] = useImageCrossfade(
    routeTransitionDone ? selection.imageUrl : routeImageUrl
  )
  useColorVariantPreload(product.colorOptions, selection.imageUrl)
  const [priceSlot0, priceSlot1] = useTextCrossfade(selection.priceLabel)
  const imageAlt = `${product.brand} ${product.name}`

  const imageTransitionStyle = useMemo(() => {
    if (routeTransitionDone) return undefined
    return { viewTransitionName: getProductViewTransitionName(product.id, 'image') }
  }, [product.id, routeTransitionDone])

  useLayoutEffect(() => {
    scrollToProductDetailTop()
    resolveProductRouteViewTransition(product.id)
  }, [product.id])

  const imageSlots = routeTransitionDone
    ? [imageSlot0, imageSlot1]
    : [{ url: routeImageUrl, opacity: 1, zIndex: 1, transition: 'none', onLoad: () => {} }]

  return (
    <section className={styles['product-detail-hero']} aria-label={imageAlt}>
      <div className={styles['product-detail-hero__gallery']} style={imageTransitionStyle}>
        {imageSlots.map((slot, i) => (
          <figure
            key={getImageSlotKey(routeTransitionDone, i)}
            className={styles['product-detail-hero__image']}
            style={{ zIndex: slot.zIndex, opacity: slot.opacity, transition: slot.transition }}
            aria-hidden={slot.opacity === 0}
          >
            <ProductImage src={slot.url} alt={imageAlt} priority onLoad={slot.onLoad} />
          </figure>
        ))}
      </div>

      <div className={styles['product-detail-hero__info']}>
        <hgroup className={styles['product-detail-hero__heading']}>
          <h1 className={styles['product-detail-hero__name']}>{product.name}</h1>
          {[priceSlot0, priceSlot1].map((slot, i) => (
            <span
              key={i === 0 ? 'price-slot-a' : 'price-slot-b'}
              className={styles['product-detail-hero__price']}
              style={{ opacity: slot.isActive ? 1 : 0, transition: 'opacity 0.3s ease' }}
              aria-hidden={!slot.isActive}
            >
              {slot.text}
            </span>
          ))}
        </hgroup>

        <div className={styles['product-detail-hero__selectors']}>
          <StorageSelector
            options={product.storageOptions}
            selected={selection.selectedStorage}
            onSelect={selection.setSelectedStorage}
          />

          <ColorSelector
            options={product.colorOptions}
            selected={selection.selectedColor}
            onSelect={selection.setSelectedColor}
          />
        </div>

        <Button
          fullWidth
          onClick={selection.handleAddToCart}
          disabled={!selection.canAddToCart}
          aria-label={`Add ${imageAlt} to cart`}
        >
          Add
        </Button>
      </div>
    </section>
  )
}
