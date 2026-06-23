'use client'

import { ProductList } from '@/features/catalog/components/ProductList/ProductList'
import { SearchBar } from '@/features/catalog/components/SearchBar/SearchBar'
import { useCatalogSearch } from '@/features/catalog/hooks/useCatalogSearch'
import { useFlipAnimation } from '@/shared/hooks/useFlipAnimation'
import type { Phone } from '@/shared/types'

import styles from './PhoneCatalog.module.scss'

interface PhoneCatalogProps {
  phones: Phone[]
  initialSearch?: string
}

export function PhoneCatalog({ phones, initialSearch = '' }: PhoneCatalogProps) {
  const { query, filteredPhones, resultCount, onQueryChange } = useCatalogSearch({
    phones,
    initialQuery: initialSearch,
  })

  const { displayedPhones, exitingCards, animationPhase, cardRef } =
    useFlipAnimation(filteredPhones)

  return (
    <section className={styles['phone-catalog']} aria-labelledby="catalog-heading">
      <h1 id="catalog-heading" className="sr-only">
        Phone catalog
      </h1>
      <SearchBar query={query} resultCount={resultCount} onQueryChange={onQueryChange} />
      <ProductList
        phones={displayedPhones}
        exitingCards={exitingCards}
        animationPhase={animationPhase}
        cardRef={cardRef}
      />
    </section>
  )
}
