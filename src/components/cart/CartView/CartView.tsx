'use client'

import Link from 'next/link'

import { ProductImage } from '@/components/ProductImage/ProductImage'
import { Button } from '@/components/UI/Button/Button'
import { ROUTES } from '@/constants'
import { useCart } from '@/context/cart/CartContext'
import type { CartItem } from '@/types'

import styles from './CartView.module.scss'

function CartItemRow({ item, onRemove }: { item: CartItem; onRemove: (key: string) => void }) {
  return (
    <li className={styles['cart-item']}>
      <div className={styles['cart-item__image']}>
        <ProductImage src={item.imageUrl} alt={`${item.brand} ${item.name}`} />
      </div>
      <div className={styles['cart-item__details']}>
        <p className={styles['cart-item__brand']}>{item.brand}</p>
        <p className={styles['cart-item__name']}>{item.name}</p>
        <p className={styles['cart-item__config']}>
          {item.selectedStorage.capacity} · {item.selectedColor.name}
        </p>
        <p className={styles['cart-item__price']}>{item.price} EUR</p>
      </div>
      <button
        className={styles['cart-item__remove']}
        onClick={() => onRemove(item.key)}
        aria-label={`Remove ${item.brand} ${item.name} from cart`}
      >
        ×
      </button>
    </li>
  )
}

export function CartView() {
  const { cartItems, cartTotal, removeFromCart, isHydrated } = useCart()

  if (!isHydrated) {
    return <div className={styles.cart__loading} aria-busy="true" />
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.cart__empty}>
        <p className={styles['cart__empty-message']}>Your cart is empty.</p>
        <Link href={ROUTES.HOME} className={styles['cart__empty-link']}>
          Back to catalog
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.cart}>
      <h1 className={styles.cart__heading}>Cart</h1>
      <ul className={styles.cart__list} role="list">
        {cartItems.map((item) => (
          <CartItemRow key={item.key} item={item} onRemove={removeFromCart} />
        ))}
      </ul>
      <footer className={styles.cart__footer}>
        <p className={styles.cart__total}>
          <span className={styles['cart__total-label']}>Total</span>
          <span className={styles['cart__total-value']}>{cartTotal} EUR</span>
        </p>
        <Button href={ROUTES.HOME}>Continue shopping</Button>
      </footer>
    </div>
  )
}
