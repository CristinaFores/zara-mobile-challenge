import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Header } from '@/components/Header/Header'
import { CartProvider } from '@/context/cart/CartContext'
import '@/scss/globals.scss'

export const metadata: Metadata = {
  title: 'Zara Mobile Catalog',
  description: 'Browse, search and shop a catalog of mobile phones.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
