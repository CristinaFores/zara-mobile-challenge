'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

import { useCart } from '@/features/cart/context/CartContext'
import headerStyles from '@/shared/components/Header/Header.module.scss'
import CartIcon from '@/shared/components/ui/icons/CartIcon'
import { ROUTES } from '@/shared/constants'
import { navigateToCart } from '@/shared/lib/cartRouteTransition'

function getCartAriaLabel(isHydrated: boolean, cartCount: number): string {
  if (!isHydrated || cartCount <= 0) return 'Cart'
  const itemLabel = cartCount === 1 ? 'item' : 'items'
  return `Cart, ${cartCount} ${itemLabel}`
}

export function CartNavLink() {
  const { cartCount, isHydrated } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const hasItems = cartCount > 0
  const isCart = pathname === ROUTES.CART

  const handleCartClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isCart) return
    event.preventDefault()
    navigateToCart(router, ROUTES.CART)
  }

  return (
    <Link
      href={ROUTES.CART}
      className={headerStyles.header__cart}
      aria-label={getCartAriaLabel(isHydrated, cartCount)}
      transitionTypes={['cart']}
      onClick={handleCartClick}
    >
      <CartIcon mode={isHydrated && hasItems ? 'full' : 'empty'} aria-hidden="true" />
      <span
        className={headerStyles.header__badge}
        aria-hidden="true"
        style={{ visibility: isHydrated ? 'visible' : 'hidden' }}
      >
        {cartCount}
      </span>
    </Link>
  )
}
