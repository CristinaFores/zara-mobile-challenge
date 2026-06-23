'use client'

import type { ReactNode } from 'react'

import { useScrollRow } from '@/shared/hooks/useScrollRow'

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
  const { viewportRef, thumb } = useScrollRow({ resetKey })

  return (
    <div className={styles['scroll-row-wrapper']}>
      <div
        ref={viewportRef}
        className={styles['scroll-row-viewport']}
        data-carousel-progress={thumb.visible ? thumb.left.toFixed(3) : undefined}
      >
        <ul
          className={[styles['scroll-row'], className].filter(Boolean).join(' ')}
          aria-label={ariaLabel}
        >
          {children}
        </ul>
      </div>

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
