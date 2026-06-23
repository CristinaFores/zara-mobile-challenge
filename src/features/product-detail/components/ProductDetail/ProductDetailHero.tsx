'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { ColorSelector } from '@/features/product-detail/components/ColorSelector/ColorSelector'
import { StorageSelector } from '@/features/product-detail/components/StorageSelector/StorageSelector'
import { useAfterProductRouteTransition } from '@/features/product-detail/hooks/useAfterProductRouteTransition'
import { ProductImage } from '@/shared/components/ProductImage/ProductImage'
import { Button } from '@/shared/components/ui/Button/Button'
import {
  DETAIL_HERO_IMAGE_SIZES,
  DETAIL_HERO_IMAGE_WIDTH,
  IMAGE_CROSSFADE_MS,
} from '@/shared/constants'
import { useTextCrossfade } from '@/shared/hooks/useTextCrossfade'
import {
  getProductViewTransitionName,
  resolveProductRouteViewTransition,
  scrollToProductDetailTop,
  useProductPreview,
} from '@/shared/store/productNavigation'
import type { ProductDetail } from '@/shared/types'

import { useProductSelection } from '../../hooks/useProductSelection'

import styles from './ProductDetailHero.module.scss'

interface ProductDetailHeroProps {
  product: ProductDetail
}

function uniqueColorImageUrls(colorOptions: ProductDetail['colorOptions']): string[] {
  const seen = new Set<string>()

  return colorOptions
    .map(({ imageUrl }) => imageUrl)
    .filter((imageUrl): imageUrl is string => {
      if (!imageUrl || seen.has(imageUrl)) return false
      seen.add(imageUrl)
      return true
    })
}

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const routeTransitionDone = useAfterProductRouteTransition()
  const preview = useProductPreview(product.id)
  const selection = useProductSelection(product)
  const colorImageUrls = useMemo(
    () => uniqueColorImageUrls(product.colorOptions),
    [product.colorOptions]
  )
  const activeImageUrl = selection.imageUrl
  const routeImageUrl = preview?.imageUrl ?? activeImageUrl
  const [handoffComplete, setHandoffComplete] = useState(false)
  const [prevRouteTransitionDone, setPrevRouteTransitionDone] = useState(routeTransitionDone)
  const [priceSlot0, priceSlot1] = useTextCrossfade(selection.priceLabel)
  const imageAlt = `${product.brand} ${product.name}`

  if (prevRouteTransitionDone !== routeTransitionDone) {
    setPrevRouteTransitionDone(routeTransitionDone)
    if (!routeTransitionDone) setHandoffComplete(false)
  }

  const completeHandoff = useCallback(() => {
    setHandoffComplete(true)
  }, [])

  const showRouteCover =
    routeTransitionDone &&
    preview !== null &&
    !handoffComplete &&
    routeImageUrl !== activeImageUrl &&
    selection.selectedColor === null

  const imageTransitionStyle = useMemo(() => {
    if (routeTransitionDone) return undefined
    return { viewTransitionName: getProductViewTransitionName(product.id) }
  }, [product.id, routeTransitionDone])

  useLayoutEffect(() => {
    if ('scrollRestoration' in globalThis.history) {
      globalThis.history.scrollRestoration = 'manual'
    }

    scrollToProductDetailTop()
    resolveProductRouteViewTransition(product.id)
  }, [product.id])

  useEffect(() => {
    scrollToProductDetailTop()
  }, [product.id])

  return (
    <section className={styles['product-detail-hero']} aria-label={imageAlt}>
      <div className={styles['product-detail-hero__gallery']} style={imageTransitionStyle}>
        {colorImageUrls.map((imageUrl) => {
          const isActive = imageUrl === activeImageUrl
          const isRoutePreview = imageUrl === routeImageUrl
          const shouldMountImage = routeTransitionDone || isRoutePreview
          const isVisible = routeTransitionDone ? isActive : isRoutePreview

          return (
            <figure
              key={imageUrl}
              className={styles['product-detail-hero__image']}
              style={{
                zIndex: isVisible ? 2 : 1,
                opacity: isVisible ? 1 : 0,
                transition: routeTransitionDone ? `opacity ${IMAGE_CROSSFADE_MS}ms ease` : 'none',
              }}
              aria-hidden={!isVisible}
            >
              {shouldMountImage ? (
                <ProductImage
                  src={imageUrl}
                  alt={isVisible ? imageAlt : ''}
                  sizes={DETAIL_HERO_IMAGE_SIZES}
                  fixedProxyWidth={DETAIL_HERO_IMAGE_WIDTH}
                  priority={isRoutePreview}
                  eager={routeTransitionDone && !isActive && !isRoutePreview}
                  onLoad={isActive && routeTransitionDone ? completeHandoff : undefined}
                />
              ) : null}
            </figure>
          )
        })}

        {showRouteCover ? (
          <figure className={styles['product-detail-hero__route-cover']} aria-hidden="true">
            <ProductImage
              src={routeImageUrl}
              alt=""
              sizes={DETAIL_HERO_IMAGE_SIZES}
              fixedProxyWidth={DETAIL_HERO_IMAGE_WIDTH}
              priority
            />
          </figure>
        ) : null}
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
