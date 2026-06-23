'use client'

import { CartNavLink } from '@/features/cart/components/CartNavLink/CartNavLink'
import { Header } from '@/shared/components/Header/Header'

export function AppHeader() {
  return <Header cartLink={<CartNavLink />} />
}
