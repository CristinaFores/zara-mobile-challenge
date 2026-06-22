'use client'

import { ProductImage } from '@/components/ProductImage/ProductImage'
import type { CartItem as CartItemType } from '@/types'

import styles from './CartItem.module.scss'

interface CartItemProps {
  item: CartItemType
  onRemove: (key: string) => void
}

export function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <li className={styles['cart-item']}>
      <div className={styles['cart-item__image']}>
        <ProductImage
          src={item.imageUrl}
          alt={`${item.brand} ${item.name}`}
          sizes="(max-width: 767px) 8.75rem, 15.625rem"
        />
      </div>
      <div className={styles['cart-item__content']}>
        <div className={styles['cart-item__details']}>
          <p className={styles['cart-item__name']}>{item.name}</p>
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
