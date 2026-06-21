import { ProductCard } from '@/components/ProductCard/ProductCard'
import type { Phone } from '@/types'

import styles from './SimilarProducts.module.scss'

interface SimilarProductsProps {
  products: Phone[]
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) return null

  return (
    <section className={styles['similar-products']} aria-label="Similar items">
      <h2 className={styles['similar-products__heading']}>Similar items</h2>
      <ul className={styles['similar-products__carousel']} role="list">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </ul>
    </section>
  )
}
