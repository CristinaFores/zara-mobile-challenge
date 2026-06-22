import Link from 'next/link'

import { ProductImage } from '@/components/ProductImage/ProductImage'
import { getProductDetailHref } from '@/store/productNavigation'
import type { Phone } from '@/types'

import cardStyles from '../ProductCard/ProductCard.module.scss'

export function SimilarProductCard({ id, brand, name, basePrice, imageUrl }: Phone) {
  const href = getProductDetailHref(id)

  return (
    <li className={cardStyles['product-card']}>
      <Link
        href={href}
        className={cardStyles['product-card__link']}
        aria-label={`${brand} ${name}, ${basePrice} EUR`}
      >
        <span className={cardStyles['product-card__image-wrapper']}>
          <ProductImage
            src={imageUrl}
            alt={`${brand} ${name}`}
            sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, 25vw"
          />
        </span>
        <div className={cardStyles['product-card__info']}>
          <hgroup className={cardStyles['product-card__details']}>
            <p className={cardStyles['product-card__brand']}>{brand}</p>
            <h3 className={cardStyles['product-card__name']}>{name}</h3>
          </hgroup>
          <p className={cardStyles['product-card__price']}>{basePrice} EUR</p>
        </div>
      </Link>
    </li>
  )
}
