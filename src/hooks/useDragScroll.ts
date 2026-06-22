'use client'

import { useCallback, useRef, useState } from 'react'

interface UseDragScrollOptions {
  dragThreshold?: number
}

export function useDragScroll<T extends HTMLElement>({
  dragThreshold = 5,
}: UseDragScrollOptions = {}) {
  const ref = useRef<T>(null)
  const [isDragging, setIsDragging] = useState(false)
  const pointerId = useRef<number | null>(null)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)
  const moved = useRef(false)

  const handlePointerDown = useCallback((event: React.PointerEvent<T>) => {
    const node = ref.current
    if (!node || event.button !== 0 || event.pointerType !== 'mouse') return

    pointerId.current = event.pointerId
    startX.current = event.clientX
    startScrollLeft.current = node.scrollLeft
    moved.current = false
    setIsDragging(true)
    node.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      const node = ref.current
      if (!node || pointerId.current !== event.pointerId) return

      const delta = event.clientX - startX.current
      if (Math.abs(delta) > dragThreshold) {
        moved.current = true
      }

      node.scrollLeft = startScrollLeft.current - delta
    },
    [dragThreshold]
  )

  const endDrag = useCallback((event: React.PointerEvent<T>) => {
    const node = ref.current
    if (!node || pointerId.current !== event.pointerId) return

    node.releasePointerCapture(event.pointerId)
    pointerId.current = null
    setIsDragging(false)
  }, [])

  const handleClickCapture = useCallback((event: React.MouseEvent<T>) => {
    if (!moved.current) return

    event.preventDefault()
    event.stopPropagation()
    moved.current = false
  }, [])

  return {
    ref,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture: handleClickCapture,
    },
  }
}
