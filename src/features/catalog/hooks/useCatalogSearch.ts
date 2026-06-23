'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SEARCH_DEBOUNCE_MS } from '@/shared/constants'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { Product } from '@/shared/types'

interface UseCatalogSearchOptions {
  products: Product[]
  initialQuery?: string
}

interface CatalogSearchResult {
  query: string
  filteredProducts: Product[]
  resultCount: number
  onQueryChange: (value: string) => void
}

export function useCatalogSearch({
  products,
  initialQuery = '',
}: UseCatalogSearchOptions): CatalogSearchResult {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)
  const isFirstRender = useRef(true)
  const previousInitialQueryRef = useRef(initialQuery)
  const currentSearchQuery = searchParams.get('search') ?? ''

  // URL → input: only when searchParams change (back/forward, link). Ignores re-renders
  // where initialQuery is unchanged so typing ahead of the debounced push is not wiped.
  useEffect(() => {
    if (previousInitialQueryRef.current === initialQuery) return
    previousInitialQueryRef.current = initialQuery
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (debouncedQuery === currentSearchQuery) return
    const url = debouncedQuery ? `/?search=${encodeURIComponent(debouncedQuery)}` : '/'
    router.replace(url, { scroll: false })
  }, [currentSearchQuery, debouncedQuery, router])

  const onQueryChange = useCallback((value: string) => setQuery(value), [])

  return { query, filteredProducts: products, resultCount: products.length, onQueryChange }
}
