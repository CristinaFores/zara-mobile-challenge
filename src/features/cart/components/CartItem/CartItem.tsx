'use client'

import Image, { type ImageLoaderProps } from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { ROUTES } from '@/shared/constants'
import { cancelScheduledTimeout, scheduleTimeout } from '@/shared/lib/browser'
import type { CartItem as CartItemType } from '@/shared/types'
import { buildProxyUrl } from '@/shared/utils/imageProxy'

import styles from './CartItem.module.scss'

const REMOVE_ANIMATION_MS = 720

function cartLoader({ src, width, quality }: ImageLoaderProps) {
  return buildProxyUrl(src, width, quality)
}

interface CartItemProps {
  item: CartItemType
  onRemove: (key: string) => void
}

export function CartItem({ item, onRemove }: CartItemProps) {
  const itemRef = useRef<HTMLLIElement>(null)
  const [imgError, setImgError] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useLayoutEffect(() => {
    if (!isRemoving || !itemRef.current) return

    const element = itemRef.current
    let innerFrame = 0
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        element.style.height = '0'
      })
    })

    return () => {
      cancelAnimationFrame(outerFrame)
      cancelAnimationFrame(innerFrame)
    }
  }, [isRemoving])

  useEffect(() => {
    if (!isRemoving) return

    const timer = scheduleTimeout(() => onRemove(item.key), REMOVE_ANIMATION_MS)
    return () => cancelScheduledTimeout(timer)
  }, [isRemoving, item.key, onRemove])

  const detailHref = `${ROUTES.PRODUCT_DETAIL}/${item.id}?color=${encodeURIComponent(item.selectedColor.name)}&storage=${encodeURIComponent(item.selectedStorage.capacity)}`

  const handleRemove = () => {
    const element = itemRef.current
    if (isRemoving || !element) return

    element.style.height = `${element.offsetHeight}px`
    element.style.overflow = 'hidden'
    setIsRemoving(true)
  }

  return (
    <li
      ref={itemRef}
      className={`${styles['cart-item']} ${isRemoving ? styles['cart-item--removing'] : ''}`}
    >
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
            className={styles['cart-item__img']}
            sizes="(max-width: 767px) 100vw, 8.75rem"
            onError={() => setImgError(true)}
            fill
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
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`Remove ${item.brand} ${item.name} from cart`}
        >
          Remove
        </button>
      </div>
    </li>
  )
}
