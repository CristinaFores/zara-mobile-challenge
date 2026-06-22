'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SEARCH_DEBOUNCE_MS } from '@/constants'
import type { Phone } from '@/types'

import { useDebounce } from './useDebounce'

interface UseCatalogSearchOptions {
  phones: Phone[]
  initialQuery?: string
}

interface CatalogSearchResult {
  query: string
  filteredPhones: Phone[]
  resultCount: number
  onQueryChange: (value: string) => void
}

export function useCatalogSearch({
  phones,
  initialQuery = '',
}: UseCatalogSearchOptions): CatalogSearchResult {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const url = debouncedQuery ? `/?search=${encodeURIComponent(debouncedQuery)}` : '/'
    router.push(url, { scroll: false })
  }, [debouncedQuery, router])

  const onQueryChange = useCallback((value: string) => setQuery(value), [])

  return { query, filteredPhones: phones, resultCount: phones.length, onQueryChange }
}
