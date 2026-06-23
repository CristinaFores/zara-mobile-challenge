import type { StorageOption } from '@/shared/types'

import styles from './StorageSelector.module.scss'

interface StorageSelectorProps {
  options: StorageOption[]
  selected: StorageOption | null
  onSelect: (option: StorageOption) => void
}

export function StorageSelector({ options, selected, onSelect }: StorageSelectorProps) {
  return (
    <div className={styles['storage-selector']}>
      {/* Label copy matches the Figma challenge spec (EN label + ¿ punctuation) — not a localization oversight. */}
      <p id="storage-selector-label" className={styles['storage-selector__label']}>
        Storage ¿How much space do you need?
      </p>
      <div
        className={styles['storage-selector__options']}
        role="group"
        aria-labelledby="storage-selector-label"
      >
        {options.map((option) => {
          const isSelected = selected?.capacity === option.capacity
          return (
            <button
              key={option.capacity}
              type="button"
              className={styles['storage-selector__chip']}
              aria-pressed={isSelected}
              data-selected={isSelected}
              onClick={() => onSelect(option)}
            >
              {option.capacity}
            </button>
          )
        })}
      </div>
    </div>
  )
}
