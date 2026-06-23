import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { CartProvider } from '@/features/cart/context/CartContext'
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/shared/lib/siteMetadata'

import { AppHeader } from './AppHeader'

import '@/scss/globals.scss'
import styles from './layout.module.scss'

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    description: DEFAULT_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AppHeader />
          <main className={styles.main}>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
