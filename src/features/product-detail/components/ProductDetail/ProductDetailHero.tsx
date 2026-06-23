'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react'

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
  type ProductPreview,
} from '@/shared/store/productNavigation'
import type { ColorOption, ProductDetail } from '@/shared/types'

import { useProductSelection } from '../../hooks/useProductSelection'

import styles from './ProductDetailHero.module.scss'

interface ProductDetailHeroProps {
  product: ProductDetail
}

interface ProductDetailHeroGalleryProps {
  productId: string
  imageAlt: string
  routeTransitionDone: boolean
  preview: ProductPreview | null
  colorImageUrls: string[]
  activeImageUrl: string
  routeImageUrl: string
  selectedColor: ColorOption | null
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

function ProductDetailHeroGallery({
  productId,
  imageAlt,
  routeTransitionDone,
  preview,
  colorImageUrls,
  activeImageUrl,
  routeImageUrl,
  selectedColor,
}: ProductDetailHeroGalleryProps) {
  const [handoffComplete, setHandoffComplete] = useState(false)

  const completeHandoff = useCallback(() => {
    setHandoffComplete(true)
  }, [])

  const showRouteCover =
    routeTransitionDone &&
    preview !== null &&
    !handoffComplete &&
    routeImageUrl !== activeImageUrl &&
    selectedColor === null

  const galleryStyle = useMemo((): CSSProperties | undefined => {
    const crossfadeStyle = {
      '--hero-image-crossfade-duration': `${IMAGE_CROSSFADE_MS}ms`,
    } as CSSProperties

    if (routeTransitionDone) return crossfadeStyle
    return {
      ...crossfadeStyle,
      viewTransitionName: getProductViewTransitionName(productId),
    }
  }, [productId, routeTransitionDone])

  return (
    <div className={styles['product-detail-hero__gallery']} style={galleryStyle}>
      {colorImageUrls.map((imageUrl) => {
        const isActive = imageUrl === activeImageUrl
        const isRoutePreview = imageUrl === routeImageUrl
        const shouldMountImage = routeTransitionDone || isRoutePreview
        const isVisible = routeTransitionDone ? isActive : isRoutePreview
        const imageClassName = [
          styles['product-detail-hero__image'],
          routeTransitionDone ? styles['product-detail-hero__image--animating'] : '',
          isVisible ? styles['product-detail-hero__image--visible'] : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <figure key={imageUrl} className={imageClassName} aria-hidden={!isVisible}>
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
  )
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
  const [priceSlot0, priceSlot1] = useTextCrossfade(selection.priceLabel)
  const imageAlt = `${product.brand} ${product.name}`

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
      <ProductDetailHeroGallery
        key={product.id}
        productId={product.id}
        imageAlt={imageAlt}
        routeTransitionDone={routeTransitionDone}
        preview={preview}
        colorImageUrls={colorImageUrls}
        activeImageUrl={activeImageUrl}
        routeImageUrl={routeImageUrl}
        selectedColor={selection.selectedColor}
      />

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
