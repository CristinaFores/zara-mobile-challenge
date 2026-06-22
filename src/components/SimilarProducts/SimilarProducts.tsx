'use client'

import { useRef } from 'react'

import { ProductCard } from '@/components/ProductCard/ProductCard'
import { useDragScroll } from '@/hooks/useDragScroll'
import type { Phone } from '@/types'

import styles from './SimilarProducts.module.scss'

interface SimilarProductsProps {
  products: Phone[]
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const drag = useDragScroll(listRef)

  if (products.length === 0) return null

  return (
    <section className={styles['similar-products']} aria-label="Similar items">
      <h2 className={styles['similar-products__heading']}>Similar items</h2>
      <ul
        ref={listRef}
        className={styles['similar-products__carousel']}
        style={drag.style}
        onMouseDown={drag.onMouseDown}
        onMouseMove={drag.onMouseMove}
        onMouseUp={drag.onMouseUp}
        onMouseLeave={drag.onMouseLeave}
      >
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </ul>
    </section>
  )
}
