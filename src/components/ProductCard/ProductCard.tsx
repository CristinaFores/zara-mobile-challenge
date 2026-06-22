import Link from 'next/link'
import { memo } from 'react'

import { ROUTES } from '@/constants'
import type { Phone } from '@/types'

import { ProductImage } from '../ProductImage/ProductImage'

import styles from './ProductCard.module.scss'

type ProductCardProps = Phone & {
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
  return (
    <li
      ref={cardRef ? (element) => cardRef(element) : undefined}
      className={[styles['product-card'], className].filter(Boolean).join(' ')}
    >
      <Link
        href={`${ROUTES.PHONE_DETAIL}/${id}`}
        className={styles['product-card__link']}
        aria-label={`${brand} ${name}, ${basePrice} EUR`}
      >
        <figure className={styles['product-card__image-wrapper']}>
          <ProductImage
            src={imageUrl}
            alt={`${brand} ${name}`}
            sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            priority={priority}
          />
        </figure>
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
