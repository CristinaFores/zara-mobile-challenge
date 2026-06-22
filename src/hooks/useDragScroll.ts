'use client'

import { type RefObject, useRef } from 'react'

const DRAG_THRESHOLD = 6

export function useDragScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
  const dragging = useRef(false)
  const hasDragged = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    // Only main button; ignore right-click / middle-click
    if (e.button !== 0) return
    e.preventDefault() // prevents native image/link drag
    const el = ref.current
    if (!el) return
    dragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - el.offsetLeft
    scrollStart.current = el.scrollLeft
    el.style.cursor = 'grabbing'
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !ref.current) return
    const delta = e.pageX - ref.current.offsetLeft - startX.current
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      hasDragged.current = true
    }
    ref.current.scrollLeft = scrollStart.current - delta
  }

  function onMouseUp() {
    dragging.current = false
    const el = ref.current
    if (!el) return
    el.style.cursor = 'grab'
    if (hasDragged.current) {
      el.addEventListener('click', (ev) => ev.preventDefault(), { once: true, capture: true })
    }
    hasDragged.current = false
  }

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp,
    style: { cursor: 'grab' } as React.CSSProperties,
  }
}
