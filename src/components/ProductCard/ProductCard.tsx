import Link from 'next/link'

import { ROUTES } from '@/constants'
import type { Phone } from '@/types'

import { ProductImage } from '../ProductImage/ProductImage'

import styles from './ProductCard.module.scss'

type ProductCardProps = Readonly<Phone> & {
  readonly priority?: boolean
}

export function ProductCard({
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
      <div className={styles['product-card__image-wrapper']}>
        <ProductImage src={imageUrl} alt={`${brand} ${name}`} priority={priority} />
      </div>
      <div className={styles['product-card__info']}>
        <div className={styles['product-card__details']}>
          <p className={styles['product-card__brand']}>{brand}</p>
          <p className={styles['product-card__name']}>{name}</p>
        </div>
        <p className={styles['product-card__price']}>{basePrice} EUR</p>
      </div>
    </Link>
  )
}
