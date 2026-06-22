'use client'

import { useCallback, useEffect, useState } from 'react'

import { useDragScroll } from '@/hooks/useDragScroll'

interface UseScrollRowOptions {
  resetKey?: string
}

export interface ScrollRowThumb {
  readonly width: number
  readonly left: number
  readonly visible: boolean
}

function computeScrollThumb(row: HTMLElement): ScrollRowThumb {
  const { clientWidth, scrollLeft, scrollWidth } = row

  if (scrollWidth <= clientWidth + 1) {
    return { width: 100, left: 0, visible: false }
  }

  return {
    width: (clientWidth / scrollWidth) * 100,
    left: (scrollLeft / scrollWidth) * 100,
    visible: true,
  }
}

export function useScrollRow<T extends HTMLElement>({ resetKey = '' }: UseScrollRowOptions = {}) {
  const { ref, isDragging, handlers } = useDragScroll<T>()
  const [thumb, setThumb] = useState<ScrollRowThumb>({ width: 100, left: 0, visible: false })

  const updateThumb = useCallback(() => {
    const row = ref.current
    if (!row) return
    setThumb(computeScrollThumb(row))
  }, [ref])

  useEffect(() => {
    const row = ref.current
    const firstItem = row?.firstElementChild

    if (!(row && firstItem instanceof HTMLElement)) return

    const centerOffset = firstItem.offsetLeft - (row.clientWidth - firstItem.offsetWidth) / 2
    row.scrollLeft = Math.max(0, Math.min(centerOffset, row.scrollWidth - row.clientWidth))
    updateThumb()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, updateThumb])

  useEffect(() => {
    const row = ref.current
    if (!row) return

    updateThumb()
    row.addEventListener('scroll', updateThumb, { passive: true })

    const observer = new ResizeObserver(updateThumb)
    observer.observe(row)

    return () => {
      row.removeEventListener('scroll', updateThumb)
      observer.disconnect()
    }
  }, [ref, updateThumb])

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

  return { ref, isDragging, handlers, thumb }
}
