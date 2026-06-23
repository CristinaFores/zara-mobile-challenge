'use client'

import { ProductList } from '@/features/catalog/components/ProductList/ProductList'
import { SearchBar } from '@/features/catalog/components/SearchBar/SearchBar'
import { useCatalogSearch } from '@/features/catalog/hooks/useCatalogSearch'
import { CATALOG_EMPTY_SEARCH_MESSAGE } from '@/shared/constants'
import { useFlipAnimation } from '@/shared/hooks/useFlipAnimation'
import type { Product } from '@/shared/types'

import styles from './ProductCatalog.module.scss'

interface ProductCatalogProps {
  products: Product[]
  initialSearch?: string
}

export function ProductCatalog({ products, initialSearch = '' }: ProductCatalogProps) {
  const { query, filteredProducts, resultCount, onQueryChange } = useCatalogSearch({
    products,
    initialQuery: initialSearch,
  })

  const { displayedProducts, exitingCards, animationPhase, cardRef } =
    useFlipAnimation(filteredProducts)

  const showEmptySearchState = filteredProducts.length === 0 && query.trim().length > 0

  return (
    <section className={styles['product-catalog']} aria-labelledby="catalog-heading">
      <h1 id="catalog-heading" className="sr-only">
        Product catalog
      </h1>
      <SearchBar query={query} resultCount={resultCount} onQueryChange={onQueryChange} />
      {showEmptySearchState ? (
        <p className={styles['product-catalog__empty-results']} role="status">
          {CATALOG_EMPTY_SEARCH_MESSAGE}
        </p>
      ) : (
        <ProductList
          products={displayedProducts}
          exitingCards={exitingCards}
          animationPhase={animationPhase}
          cardRef={cardRef}
        />
      )}
    </section>
  )
}
