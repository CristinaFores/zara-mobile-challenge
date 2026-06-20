'use client'

import { useCallback } from 'react'

import CloseIcon from '@/components/UI/icons/CloseIcon'

import styles from './SearchBar.module.scss'

interface SearchBarProps {
  readonly query: string
  readonly resultCount: number
  readonly onQueryChange: (value: string) => void
}

export function SearchBar({ query, resultCount, onQueryChange }: SearchBarProps) {
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value),
    [onQueryChange]
  )

  const handleClear = useCallback(() => onQueryChange(''), [onQueryChange])

  return (
    <search className={styles['search-bar']}>
      <label className={styles['search-bar__input-wrapper']}>
        <input
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
      </label>
      <output className={styles['search-bar__count']}>
        {resultCount} {resultCount === 1 ? 'result' : 'results'}
      </output>
    </search>
  )
}
