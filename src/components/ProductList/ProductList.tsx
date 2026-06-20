import type { ExitingCard } from '@/hooks/useFlipAnimation'
import type { Phone } from '@/types'

import { ProductCard } from '../ProductCard/ProductCard'

import styles from './ProductList.module.scss'

type AnimationPhase = 'idle' | 'animating'

interface ProductListProps {
  readonly phones: readonly Phone[]
  readonly exitingCards?: readonly ExitingCard[]
  readonly animationPhase?: AnimationPhase
  readonly listRef?: (el: HTMLUListElement | null) => void
  readonly cardRef?: (id: string, el: HTMLElement | null) => void
}

const PRIORITY_IMAGE_COUNT = 6

export function ProductList({
  phones,
  exitingCards = [],
  animationPhase = 'idle',
  listRef,
  cardRef,
}: ProductListProps) {
  const isAnimating = animationPhase === 'animating'

  return (
    <section className={styles['product-list-wrapper']}>
      <ul className={styles['product-list']} ref={listRef} aria-label="Phones catalog">
        {phones?.map((phone, index) => (
          <li
            key={phone?.id}
            ref={cardRef ? (el) => cardRef(phone.id, el) : undefined}
            className={styles['product-list__item']}
          >
            <ProductCard {...phone} priority={index < PRIORITY_IMAGE_COUNT} />
          </li>
        ))}
      </ul>

      {exitingCards?.map(({ phone, rect }) => (
        <article
          key={`exit-${phone.id}`}
          aria-hidden="true"
          className={`${styles['product-list__exiting']} ${isAnimating ? styles['product-list__exiting--active'] : ''}`}
          style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        >
          <ProductCard {...phone} priority={false} />
        </article>
      ))}
    </section>
  )
}
