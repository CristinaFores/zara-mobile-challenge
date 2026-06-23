'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { ROUTES } from '@/shared/constants'

import Logo from '../ui/Logo'

import styles from './Header.module.scss'

const LOADING_BAR_DURATION_MS = 1200

interface HeaderProps {
  cartLink: ReactNode
}

export function Header({ cartLink }: HeaderProps) {
  const pathname = usePathname()
  const isCart = pathname === ROUTES.CART

  const [showLoadingBar, setShowLoadingBar] = useState(true)

  useEffect(() => {
    if (isCart) return
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
        {cartLink}
      </div>
    </header>
  )
}
