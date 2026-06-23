import { act, renderHook } from '@testing-library/react'
import type { MouseEvent, PointerEvent as ReactPointerEvent } from 'react'

import { useDragScroll } from './useDragScroll'

function createPointerEvent(
  node: HTMLDivElement,
  init: { clientX: number; pointerId?: number }
): ReactPointerEvent<HTMLDivElement> {
  return {
    button: 0,
    pointerType: 'mouse',
    pointerId: init.pointerId ?? 1,
    clientX: init.clientX,
    currentTarget: node,
  } as ReactPointerEvent<HTMLDivElement>
}

function createClickEvent(): Pick<
  MouseEvent<HTMLDivElement>,
  'preventDefault' | 'stopPropagation'
> {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  }
}

describe('Given useDragScroll', () => {
  describe('When the user drags horizontally with the mouse', () => {
    it('Then the row scrolls and releases on pointer up', () => {
      const { result } = renderHook(() => useDragScroll<HTMLDivElement>())
      const node = document.createElement('div')
      Object.defineProperty(node, 'scrollLeft', { writable: true, value: 0 })
      node.setPointerCapture = jest.fn()
      node.releasePointerCapture = jest.fn()
      result.current.ref.current = node

      act(() => {
        result.current.handlers.onPointerDown(createPointerEvent(node, { clientX: 100 }))
      })
      expect(result.current.isDragging).toBe(true)

      act(() => {
        result.current.handlers.onPointerMove(createPointerEvent(node, { clientX: 60 }))
      })
      expect(node.scrollLeft).toBe(40)

      act(() => {
        result.current.handlers.onPointerUp(createPointerEvent(node, { clientX: 60 }))
      })
      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('When the user drags and then clicks a link inside the row', () => {
    it('Then the click is suppressed to avoid accidental navigation', () => {
      const { result } = renderHook(() => useDragScroll<HTMLDivElement>())
      const node = document.createElement('div')
      Object.defineProperty(node, 'scrollLeft', { writable: true, value: 0 })
      node.setPointerCapture = jest.fn()
      node.releasePointerCapture = jest.fn()
      result.current.ref.current = node
      const clickEvent = createClickEvent()

      act(() => {
        result.current.handlers.onPointerDown(createPointerEvent(node, { clientX: 100 }))
        result.current.handlers.onPointerMove(createPointerEvent(node, { clientX: 40 }))
        result.current.handlers.onClickCapture(clickEvent as unknown as MouseEvent<HTMLDivElement>)
      })

      expect(jest.mocked(clickEvent.preventDefault)).toHaveBeenCalled()
      expect(jest.mocked(clickEvent.stopPropagation)).toHaveBeenCalled()
    })
  })
})
