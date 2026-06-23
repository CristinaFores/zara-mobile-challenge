'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useCart } from '@/features/cart/context/CartContext'
import { ROUTES } from '@/shared/constants'

import CartIcon from '../ui/icons/CartIcon'
import Logo from '../ui/Logo'

import styles from './Header.module.scss'

const LOADING_BAR_DURATION_MS = 1200

function getCartAriaLabel(isHydrated: boolean, cartCount: number): string {
  if (!isHydrated || cartCount <= 0) return 'Cart'
  const itemLabel = cartCount === 1 ? 'item' : 'items'
  return `Cart, ${cartCount} ${itemLabel}`
}

export function Header() {
  const { cartCount, isHydrated } = useCart()
  const pathname = usePathname()
  const hasItems = cartCount > 0
  const isCart = pathname === ROUTES.CART

  const [showLoadingBar, setShowLoadingBar] = useState(true)

  useEffect(() => {
    if (isCart) return // stays fixed on cart page
    const timer = setTimeout(() => setShowLoadingBar(false), LOADING_BAR_DURATION_MS)
    return () => clearTimeout(timer)
  }, [isCart])

  return (
    <header className={styles.header}>
      {showLoadingBar && (
        <div
          className={isCart ? styles['header__loadingBar--static'] : styles.header__loadingBar}
          aria-hidden="true"
        />
      )}
      <div className={styles.header__inner}>
        <Link href={ROUTES.HOME} className={styles.header__logo} aria-label="Zara">
          <Logo />
        </Link>
        <Link
          href={ROUTES.CART}
          className={styles.header__cart}
          aria-label={getCartAriaLabel(isHydrated, cartCount)}
        >
          <CartIcon mode={isHydrated && hasItems ? 'full' : 'empty'} aria-hidden="true" />
          <span
            className={styles.header__badge}
            aria-hidden="true"
            style={{ visibility: isHydrated ? 'visible' : 'hidden' }}
          >
            {cartCount}
          </span>
        </Link>
      </div>
    </header>
  )
}
