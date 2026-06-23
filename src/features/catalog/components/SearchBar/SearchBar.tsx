'use client'

import { useCallback } from 'react'

import CloseIcon from '@/shared/components/ui/icons/CloseIcon'

import styles from './SearchBar.module.scss'

interface SearchBarProps {
  query: string
  resultCount: number
  onQueryChange: (value: string) => void
}

export function SearchBar({ query, resultCount, onQueryChange }: SearchBarProps) {
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value),
    [onQueryChange]
  )

  const handleClear = useCallback(() => onQueryChange(''), [onQueryChange])

  return (
    <search className={styles['search-bar']}>
      <label htmlFor="product-search" className="sr-only">
        Search
      </label>
      <div className={styles['search-bar__input-wrapper']}>
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a smartphone..."
          className={styles['search-bar__input']}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={styles['search-bar__clear']}
            aria-label="Clear search"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <output htmlFor="product-search" className={styles['search-bar__count']}>
        {resultCount} {resultCount === 1 ? 'result' : 'results'}
      </output>
    </search>
  )
}
