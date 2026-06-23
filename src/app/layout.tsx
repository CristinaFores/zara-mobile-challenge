import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { CartProvider } from '@/features/cart/context/CartContext'
import { Header } from '@/shared/components/Header/Header'

import '@/scss/globals.scss'
import styles from './layout.module.scss'

export const metadata: Metadata = {
  title: {
    template: '%s | Mobile Catalog',
    default: 'Mobile Catalog',
  },
  description: 'Browse and find the latest smartphones.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className={styles.main}>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
