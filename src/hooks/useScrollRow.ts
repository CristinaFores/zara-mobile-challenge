'use client'

import { useEffect } from 'react'

import { useDragScroll } from '@/hooks/useDragScroll'

interface UseScrollRowOptions {
  resetKey?: string
}

export function useScrollRow<T extends HTMLElement>({ resetKey = '' }: UseScrollRowOptions = {}) {
  const { ref, isDragging, handlers } = useDragScroll<T>()

  useEffect(() => {
    const row = ref.current
    const firstItem = row?.firstElementChild

    if (!(row && firstItem instanceof HTMLElement)) return

    if (typeof firstItem.scrollIntoView === 'function') {
      firstItem.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  useEffect(() => {
    const row = ref.current
    if (!row) return

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      row.scrollLeft += event.deltaY
      event.preventDefault()
    }

    row.addEventListener('wheel', handleWheel, { passive: false })

    return () => row.removeEventListener('wheel', handleWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, isDragging, handlers }
}
