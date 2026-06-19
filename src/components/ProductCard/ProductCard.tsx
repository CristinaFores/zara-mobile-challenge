import Image from 'next/image'
import Link from 'next/link'

import { ROUTES } from '@/constants'
import type { Phone } from '@/types'

import styles from './ProductCard.module.scss'

type ProductCardProps = Readonly<Phone>

export function ProductCard({ id, brand, name, basePrice, imageUrl }: ProductCardProps) {
  return (
    <Link
      href={`${ROUTES.PHONE_DETAIL}/${id}`}
      className={styles.card}
      aria-label={`${brand} ${name}, ${basePrice} EUR`}
    >
      <div className={styles.card__imageWrapper}>
        <Image
          src={imageUrl}
          alt={`${brand} ${name}`}
          fill
          sizes="(max-width: 834px) 100vw, (max-width: 1920px) 50vw, 25vw"
          className={styles.card__image}
        />
      </div>
      <div className={styles.card__info}>
        <div className={styles.card__details}>
          <p className={styles.card__brand}>{brand}</p>
          <p className={styles.card__name}>{name}</p>
        </div>
        <p className={styles.card__price}>{basePrice} EUR</p>
      </div>
    </Link>
  )
}
