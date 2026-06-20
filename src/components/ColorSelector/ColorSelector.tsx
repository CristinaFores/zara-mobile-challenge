'use client'

import { useTextCrossfade } from '@/hooks/useTextCrossfade'
import type { ColorOption } from '@/types'

import styles from './ColorSelector.module.scss'

interface ColorSelectorProps {
  options: ColorOption[]
  selected: ColorOption | null
  onSelect: (option: ColorOption) => void
}

export function ColorSelector({ options, selected, onSelect }: ColorSelectorProps) {
  const nameSlots = useTextCrossfade(selected?.name ?? '')

  return (
    <div className={styles['color-selector']}>
      <p className={styles['color-selector__label']}>Color: Pick your favourite.</p>
      <div className={styles['color-selector__swatches']} role="group" aria-label="Color options">
        {options.map((option) => {
          const isSelected = selected?.name === option.name
          return (
            <button
              key={option.name}
              type="button"
              className={styles['color-selector__swatch']}
              style={{ backgroundColor: option.hexCode }}
              aria-pressed={isSelected}
              aria-label={option.name}
              data-selected={isSelected}
              onClick={() => onSelect(option)}
            />
          )
        })}
      </div>
      <div className={styles['color-selector__name-wrapper']} aria-live="polite">
        {nameSlots.map((slot, index) => (
          <span
            key={index}
            className={styles['color-selector__selected-name']}
            style={{ opacity: slot.isActive ? 1 : 0, transition: 'opacity 0.3s ease' }}
            aria-hidden={!slot.isActive}
          >
            {slot.text}
          </span>
        ))}
      </div>
    </div>
  )
}
