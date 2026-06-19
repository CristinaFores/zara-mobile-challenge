import type { Phone } from '@/types'

import { ProductCard } from '../ProductCard/ProductCard'

import styles from './ProductList.module.scss'

interface ProductListProps {
  readonly phones: readonly Phone[]
}

export function ProductList({ phones }: ProductListProps) {
  return (
    <ul className={styles.grid} aria-label="Phones catalog">
      {phones.map((phone) => (
        <li key={phone.id} className={styles.grid__item}>
          <ProductCard {...phone} />
        </li>
      ))}
    </ul>
  )
}
