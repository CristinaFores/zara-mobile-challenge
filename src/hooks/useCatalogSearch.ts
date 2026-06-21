'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { SEARCH_DEBOUNCE_MS } from '@/constants'
import type { Phone } from '@/types'

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
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [query, setQuery] = useState(initialQuery)

  const onQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current)
      urlDebounceRef.current = setTimeout(() => {
        const url = value ? `/?search=${encodeURIComponent(value)}` : '/'
        router.push(url, { scroll: false })
      }, SEARCH_DEBOUNCE_MS)
    },
    [router]
  )

  return { query, filteredPhones: phones, resultCount: phones.length, onQueryChange }
}
