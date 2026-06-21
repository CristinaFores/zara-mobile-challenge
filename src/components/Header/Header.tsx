'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ROUTES } from '@/constants'
import { useCart } from '@/context/cart/CartContext'

import CartIcon from '../UI/icons/CartIcon'
import Logo from '../UI/Logo'

import styles from './Header.module.scss'

const LOADING_BAR_DURATION_MS = 1200

export function Header() {
  const { cartCount } = useCart()
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
          aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
        >
          <CartIcon mode={hasItems ? 'full' : 'empty'} aria-hidden="true" />
          <span className={styles.header__badge} aria-hidden="true">
            {cartCount}
          </span>
        </Link>
      </div>
    </header>
  )
}
