'use client'

import { useState } from 'react'

import { CartItem } from '@/features/cart/components/CartItem/CartItem'
import { useCart } from '@/features/cart/context/CartContext'
import { Button } from '@/shared/components/ui/Button/Button'
import { ROUTES } from '@/shared/constants'

import styles from './CartView.module.scss'

export function CartView() {
  const { cartItems, cartTotal, cartCount, removeFromCart, isHydrated } = useCart()
  const hasItems = cartItems.length > 0
  const [hadItems, setHadItems] = useState(hasItems)

  if (hasItems && !hadItems) {
    setHadItems(true)
  }

  if (!isHydrated) {
    return <div className={styles['cart-view__loading']} aria-busy="true" />
  }

  const heading = `Cart (${cartCount})`
  const showCheckoutFooter = hasItems || hadItems

  return (
    <div className={styles['cart-view']}>
      <h1 className={styles['cart-view__heading']}>{heading}</h1>

      {hasItems && (
        <ul className={styles['cart-view__list']}>
          {cartItems.map((item) => (
            <CartItem key={item.key} item={item} onRemove={removeFromCart} />
          ))}
        </ul>
      )}

      <footer
        className={`${styles['cart-view__footer']} ${showCheckoutFooter ? styles['cart-view__footer--has-items'] : ''}`}
      >
        <Button
          href={ROUTES.HOME}
          variant="secondary"
          className={styles['cart-view__btn-continue']}
        >
          Continue shopping
        </Button>
        {showCheckoutFooter && (
          <>
            <p
              className={`${styles['cart-view__total']} ${hasItems ? '' : styles['cart-view__total--hidden']}`}
              aria-hidden={!hasItems}
            >
              <span className={styles['cart-view__total-label']}>Total</span>
              <span className={styles['cart-view__total-value']}>{cartTotal} EUR</span>
            </p>
            <Button
              className={`${styles['cart-view__btn-pay']} ${hasItems ? '' : styles['cart-view__btn-pay--hidden']}`}
              disabled={!hasItems}
              aria-hidden={!hasItems}
              tabIndex={hasItems ? 0 : -1}
            >
              Pay
            </Button>
          </>
        )}
      </footer>
    </div>
  )
}
