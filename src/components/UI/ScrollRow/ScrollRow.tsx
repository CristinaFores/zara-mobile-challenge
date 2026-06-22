'use client'

import type { ReactNode } from 'react'

import { useScrollRow } from '@/hooks/useScrollRow'

import styles from './ScrollRow.module.scss'

interface ScrollRowProps {
  children: ReactNode
  resetKey?: string
  className?: string
  'aria-label'?: string
}

export function ScrollRow({
  children,
  resetKey,
  className,
  'aria-label': ariaLabel,
}: ScrollRowProps) {
  const { ref, isDragging, handlers, thumb } = useScrollRow<HTMLUListElement>({ resetKey })

  return (
    <div className={styles['scroll-row-wrapper']}>
      <ul
        ref={ref}
        className={[
          styles['scroll-row'],
          isDragging ? styles['scroll-row--dragging'] : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={ariaLabel}
        {...handlers}
      >
        {children}
      </ul>

      {thumb.visible ? (
        <div className={styles['scroll-row__scrollbar']} aria-hidden="true">
          <span
            className={styles['scroll-row__scrollbar-thumb']}
            style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}
