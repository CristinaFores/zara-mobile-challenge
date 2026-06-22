'use client'

import { useMemo } from 'react'

import { ProductCard } from '@/components/ProductCard/ProductCard'
import { ScrollRow } from '@/components/UI/ScrollRow/ScrollRow'
import type { Phone } from '@/types'
import { dedupeById } from '@/utils/dedupeById'

import styles from './SimilarProducts.module.scss'

interface SimilarProductsProps {
  products: Phone[]
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  const uniqueProducts = useMemo(() => dedupeById(products), [products])
  const productIds = useMemo(
    () => uniqueProducts.map((product) => product.id).join(','),
    [uniqueProducts]
  )

  if (uniqueProducts.length === 0) return null

  return (
    <section className={styles['similar-products']} aria-label="Similar items">
      <h2 className={styles['similar-products__heading']}>Similar items</h2>
      <ScrollRow resetKey={productIds} aria-label="Similar products">
        {uniqueProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </ScrollRow>
    </section>
  )
}
