import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard'
import { SimilarProductCard } from '@/features/product-detail/components/SimilarProducts/SimilarProductCard'
import type { ExitingCard } from '@/shared/hooks/useFlipAnimation'
import type { Phone } from '@/shared/types'

import styles from './ProductList.module.scss'

type AnimationPhase = 'idle' | 'animating'

interface ProductListProps {
  phones: Phone[]
  exitingCards?: ExitingCard[]
  animationPhase?: AnimationPhase
  cardRef?: (id: string, el: HTMLElement | null) => void
}

const PRIORITY_IMAGE_COUNT = 10

export function ProductList({
  phones,
  exitingCards = [],
  animationPhase = 'idle',
  cardRef,
}: ProductListProps) {
  const isAnimating = animationPhase === 'animating'

  return (
    <section className={styles['product-list-wrapper']} aria-label="Search results">
      <ul className={styles['product-list']} aria-label="Phones catalog">
        {phones?.map((phone, index) => (
          <ProductCard
            key={`catalog-${phone?.id}`}
            {...phone}
            priority={index < PRIORITY_IMAGE_COUNT}
            cardRef={cardRef ? (el) => cardRef(phone.id, el) : undefined}
          />
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
          <SimilarProductCard {...phone} />
        </article>
      ))}
    </section>
  )
}
