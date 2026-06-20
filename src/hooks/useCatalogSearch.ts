'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { SEARCH_DEBOUNCE_MS } from '@/constants'
import type { Phone } from '@/types'

import { useDebounce } from './useDebounce'

const FILTER_DEBOUNCE_MS = 450

function filterPhonesByQuery(phones: readonly Phone[], query: string): Phone[] {
  const trimmed = query.trim()
  if (!trimmed) return [...phones]

  const normalizedQuery = trimmed.toLowerCase()
  return phones.filter(
    (phone) =>
      phone.brand.toLowerCase().includes(normalizedQuery) ||
      phone.name.toLowerCase().includes(normalizedQuery)
  )
}

interface UseCatalogSearchOptions {
  readonly phones: readonly Phone[]
  readonly initialQuery?: string
}

interface CatalogSearchResult {
  readonly query: string
  readonly filteredPhones: readonly Phone[]
  readonly resultCount: number
  readonly onQueryChange: (value: string) => void
}

export function useCatalogSearch({
  phones,
  initialQuery = '',
}: UseCatalogSearchOptions): CatalogSearchResult {
  const router = useRouter()
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, FILTER_DEBOUNCE_MS)

  const filteredPhones = useMemo(
    () => filterPhonesByQuery(phones, debouncedQuery),
    [phones, debouncedQuery]
  )

  const resultCount = filteredPhones.length

  const onQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current)
      urlDebounceRef.current = setTimeout(() => {
        const params = new URLSearchParams()
        if (value) params.set('search', value)
        router.push(`/?${params.toString()}`, { scroll: false })
      }, SEARCH_DEBOUNCE_MS)
    },
    [router]
  )

  return { query, filteredPhones, resultCount, onQueryChange }
}
