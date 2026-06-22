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
  const { ref, isDragging, handlers } = useScrollRow<HTMLUListElement>({ resetKey })

  return (
    <ul
      ref={ref}
      className={[styles['scroll-row'], isDragging ? styles['scroll-row--dragging'] : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      {...handlers}
    >
      {children}
    </ul>
  )
}
