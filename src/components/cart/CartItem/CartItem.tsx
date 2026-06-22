'use client'

import Image, { type ImageLoaderProps } from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { ROUTES } from '@/constants'
import type { CartItem as CartItemType } from '@/types'
import { buildProxyUrl } from '@/utils/imageProxy'

import styles from './CartItem.module.scss'

function cartLoader({ src, width, quality }: ImageLoaderProps) {
  return buildProxyUrl(src, width, quality)
}

const CART_IMG_PX = 140

interface CartItemProps {
  item: CartItemType
  onRemove: (key: string) => void
}

export function CartItem({ item, onRemove }: CartItemProps) {
  const [imgError, setImgError] = useState(false)

  const detailHref = `${ROUTES.PHONE_DETAIL}/${item.id}?color=${encodeURIComponent(item.selectedColor.name)}&storage=${encodeURIComponent(item.selectedStorage.capacity)}`

  return (
    <li className={styles['cart-item']}>
      <Link
        href={detailHref}
        className={styles['cart-item__image']}
        aria-label={`${item.brand} ${item.name}`}
      >
        {item.imageUrl && !imgError && (
          <Image
            loader={cartLoader}
            src={item.imageUrl}
            alt={`${item.brand} ${item.name}`}
            width={CART_IMG_PX}
            height={CART_IMG_PX}
            className={styles['cart-item__img']}
            sizes="8.75rem"
            onError={() => setImgError(true)}
          />
        )}
      </Link>
      <div className={styles['cart-item__content']}>
        <div className={styles['cart-item__details']}>
          <Link href={detailHref} className={styles['cart-item__name-link']}>
            <p className={styles['cart-item__name']}>{item.name}</p>
          </Link>
          <p className={styles['cart-item__config']}>
            {item.selectedStorage.capacity} | {item.selectedColor.name}
          </p>
          <p className={styles['cart-item__price']}>{item.price} EUR</p>
        </div>
        <button
          type="button"
          className={styles['cart-item__remove']}
          onClick={() => onRemove(item.key)}
          aria-label={`Remove ${item.name} from cart`}
        >
          Eliminar
        </button>
      </div>
    </li>
  )
}
