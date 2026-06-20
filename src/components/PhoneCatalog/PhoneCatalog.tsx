'use client'

import { ProductList } from '@/components/ProductList/ProductList'
import { SearchBar } from '@/components/SearchBar/SearchBar'
import { useCatalogSearch } from '@/hooks/useCatalogSearch'
import { useFlipAnimation } from '@/hooks/useFlipAnimation'
import type { Phone } from '@/types'

import styles from './PhoneCatalog.module.scss'

interface PhoneCatalogProps {
  phones: readonly Phone[]
  initialSearch?: string
}

export function PhoneCatalog({ phones, initialSearch = '' }: PhoneCatalogProps) {
  const { query, filteredPhones, resultCount, onQueryChange } = useCatalogSearch({
    phones,
    initialQuery: initialSearch,
  })

  const { displayedPhones, exitingCards, animationPhase, listRef, cardRef } =
    useFlipAnimation(filteredPhones)

  return (
    <section className={styles['phone-catalog']}>
      <SearchBar query={query} resultCount={resultCount} onQueryChange={onQueryChange} />
      <ProductList
        phones={displayedPhones}
        exitingCards={exitingCards}
        animationPhase={animationPhase}
        listRef={listRef}
        cardRef={cardRef}
      />
    </section>
  )
}
