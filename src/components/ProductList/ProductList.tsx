import type { Phone } from '@/types'

import { ProductCard } from '../ProductCard/ProductCard'

import styles from './ProductList.module.scss'

interface ProductListProps {
  readonly phones: readonly Phone[]
}

const PRIORITY_COUNT = 6

export function ProductList({ phones }: ProductListProps) {
  return (
    <ul className={styles['product-list']} aria-label="Phones catalog">
      {phones.map((phone, index) => (
        <li key={phone.id} className={styles['product-list__item']}>
          <ProductCard {...phone} priority={index < PRIORITY_COUNT} />
        </li>
      ))}
    </ul>
  )
}
