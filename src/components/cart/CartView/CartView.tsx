'use client'

import { CartItem } from '@/components/cart/CartItem/CartItem'
import { Button } from '@/components/UI/Button/Button'
import { ROUTES } from '@/constants'
import { useCart } from '@/context/cart/CartContext'

import styles from './CartView.module.scss'

export function CartView() {
  const { cartItems, cartTotal, cartCount, removeFromCart, isHydrated } = useCart()

  if (!isHydrated) {
    return <div className={styles.cart__loading} aria-busy="true" />
  }

  const heading = `Cart (${cartCount})`

  return (
    <div className={styles['cart-view']}>
      <h1 className={styles['cart-view__heading']}>{heading}</h1>

      {cartItems.length > 0 && (
        <ul className={styles['cart-view__list']}>
          {cartItems.map((item) => (
            <CartItem key={item.key} item={item} onRemove={removeFromCart} />
          ))}
        </ul>
      )}

      <footer
        className={`${styles['cart-view__footer']} ${cartItems.length > 0 ? styles['cart-view__footer--has-items'] : ''}`}
      >
        <Button href={ROUTES.HOME} variant="secondary" className={styles['cart__btn-continue']}>
          Continue shopping
        </Button>
        {cartItems.length > 0 && (
          <>
            <p className={styles['cart-view__total']}>
              <span className={styles['cart-view__total-label']}>Total</span>
              <span className={styles['cart-view__total-value']}>{cartTotal} EUR</span>
            </p>

            <Button className={styles['cart-view__btn-pay']}>Pay</Button>
          </>
        )}
      </footer>
    </div>
  )
}
