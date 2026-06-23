'use client'

import Link from 'next/link'
import { memo } from 'react'

import { ProductImage } from '@/shared/components/ProductImage/ProductImage'
import { useProductDetailNavigation } from '@/shared/hooks/useProductDetailNavigation'
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
    imageTransitionStyle,
    warmRoute,
    activatePointerNavigation,
    navigateWithViewTransition,
    activateNavigation,
  } = useProductDetailNavigation({ id, brand, name, basePrice, imageUrl }, { priority })

  return (
    <li
      ref={cardRef ? (element) => cardRef(element) : undefined}
      className={[styles['product-card'], className].filter(Boolean).join(' ')}
    >
      <Link
        href={href}
        className={styles['product-card__link']}
        aria-label={`${brand} ${name}, ${basePrice} EUR`}
        prefetch={prefetchFull || priority ? true : 'auto'}
        transitionTypes={['product-detail']}
        onMouseEnter={warmRoute}
        onFocus={warmRoute}
        onTouchStart={warmRoute}
        onPointerDown={activatePointerNavigation}
        onClick={navigateWithViewTransition}
        onNavigate={activateNavigation}
      >
        <span className={styles['product-card__image-wrapper']} style={imageTransitionStyle}>
          <ProductImage
            src={imageUrl}
            alt={`${brand} ${name}`}
            sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            priority={priority}
          />
        </span>
        <div className={styles['product-card__info']}>
          <hgroup className={styles['product-card__details']}>
            <p className={styles['product-card__brand']}>{brand}</p>
            <h3 className={styles['product-card__name']}>{name}</h3>
          </hgroup>
          <p className={styles['product-card__price']}>{basePrice} EUR</p>
        </div>
      </Link>
    </li>
  )
})
