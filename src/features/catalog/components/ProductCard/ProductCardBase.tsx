'use client'

import Link from 'next/link'
import type { CSSProperties, MouseEvent, PointerEvent } from 'react'

import { ProductImage } from '@/shared/components/ProductImage/ProductImage'
import type { Product } from '@/shared/types'

import styles from './ProductCard.module.scss'

export interface ProductCardBaseProps extends Pick<
  Product,
  'brand' | 'name' | 'basePrice' | 'imageUrl'
> {
  href: string
  prefetch?: boolean | 'auto'
  imageTransitionStyle?: CSSProperties
  priority?: boolean
  imageSizes?: string
  onMouseEnter?: () => void
  onFocus?: () => void
  onTouchStart?: () => void
  onPointerDown?: (event: PointerEvent<HTMLAnchorElement>) => void
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  onNavigate?: () => void
  headingLevel?: 2 | 3
}

const DEFAULT_IMAGE_SIZES =
  '(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw'

export function ProductCardBase({
  brand,
  name,
  basePrice,
  imageUrl,
  href,
  prefetch = 'auto',
  imageTransitionStyle,
  priority = false,
  imageSizes = DEFAULT_IMAGE_SIZES,
  onMouseEnter,
  onFocus,
  onTouchStart,
  onPointerDown,
  onClick,
  onNavigate,
  headingLevel = 2,
}: ProductCardBaseProps) {
  const ProductNameHeading = headingLevel === 3 ? 'h3' : 'h2'

  return (
    <Link
      href={href}
      className={styles['product-card__link']}
      aria-label={`${brand} ${name}, ${basePrice} EUR`}
      prefetch={prefetch}
      transitionTypes={['product-detail']}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onTouchStart={onTouchStart}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onNavigate={onNavigate}
    >
      <span className={styles['product-card__image-wrapper']} style={imageTransitionStyle}>
        <ProductImage
          src={imageUrl}
          alt={`${brand} ${name}`}
          sizes={imageSizes}
          priority={priority}
        />
      </span>
      <div className={styles['product-card__info']}>
        <hgroup className={styles['product-card__details']}>
          <p className={styles['product-card__brand']}>{brand}</p>
          <ProductNameHeading className={styles['product-card__name']}>{name}</ProductNameHeading>
        </hgroup>
        <p className={styles['product-card__price']}>{basePrice} EUR</p>
      </div>
    </Link>
  )
}
