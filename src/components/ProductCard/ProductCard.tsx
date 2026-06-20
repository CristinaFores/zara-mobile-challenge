import Link from 'next/link'
import { memo } from 'react'

import { ROUTES } from '@/constants'
import type { Phone } from '@/types'

import { ProductImage } from '../ProductImage/ProductImage'

import styles from './ProductCard.module.scss'

type ProductCardProps = Readonly<Phone> & {
  readonly priority?: boolean
}

export const ProductCard = memo(function ProductCard({
  id,
  brand,
  name,
  basePrice,
  imageUrl,
  priority = false,
}: ProductCardProps) {
  return (
    <Link
      href={`${ROUTES.PHONE_DETAIL}/${id}`}
      className={styles['product-card']}
      aria-label={`${brand} ${name}, ${basePrice} EUR`}
    >
      <figure className={styles['product-card__image-wrapper']}>
        <ProductImage src={imageUrl} alt={`${brand} ${name}`} priority={priority} />
      </figure>
      <footer className={styles['product-card__info']}>
        <hgroup className={styles['product-card__details']}>
          <p className={styles['product-card__brand']}>{brand}</p>
          <h3 className={styles['product-card__name']}>{name}</h3>
        </hgroup>
        <p className={styles['product-card__price']}>{basePrice} EUR</p>
      </footer>
    </Link>
  )
})
