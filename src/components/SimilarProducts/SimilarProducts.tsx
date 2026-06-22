'use client'

import { useMemo } from 'react'

import { ScrollRow } from '@/components/UI/ScrollRow/ScrollRow'
import { useAfterProductRouteTransition } from '@/hooks/useAfterProductRouteTransition'
import type { Phone } from '@/types'
import { dedupeById } from '@/utils/dedupeById'

import { SimilarProductCard } from './SimilarProductCard'

import styles from './SimilarProducts.module.scss'

interface SimilarProductsProps {
  products: Phone[]
  currentProductId?: string
}

export function SimilarProducts({ products, currentProductId }: SimilarProductsProps) {
  const ready = useAfterProductRouteTransition()
  const uniqueProducts = useMemo(() => {
    const deduped = dedupeById(products)
    if (!currentProductId) return deduped
    return deduped.filter((product) => product.id !== currentProductId)
  }, [currentProductId, products])

  const productIds = useMemo(
    () => uniqueProducts.map((product) => product.id).join(','),
    [uniqueProducts]
  )

  if (!ready || uniqueProducts.length === 0) return null

  return (
    <section className={styles['similar-products']} aria-label="Similar items">
      <h2 className={styles['similar-products__heading']}>Similar items</h2>
      <ScrollRow resetKey={productIds} aria-label="Similar products">
        {uniqueProducts.map((product, index) => (
          <SimilarProductCard key={`similar-${product.id}-${index}`} {...product} />
        ))}
      </ScrollRow>
    </section>
  )
}
