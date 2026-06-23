import { act, render, screen, waitFor } from '@testing-library/react'

import { ScrollRow } from './ScrollRow'

const mockScrollTo = jest.fn()
const mockScrollNext = jest.fn()
const mockScrollPrev = jest.fn()
let scrollProgress = 0
let viewportNode: HTMLDivElement | null = null
let containerNode: HTMLUListElement | null = null
const emblaListeners = new Map<string, Set<() => void>>()

function emitEmblaEvent(event: string) {
  emblaListeners.get(event)?.forEach((callback) => callback())
}

const setViewportRef = (node: HTMLDivElement | null) => {
  viewportNode = node
  containerNode = node?.querySelector('ul') ?? null
}

const emblaApi = {
  rootNode: () => viewportNode,
  containerNode: () => containerNode,
  scrollProgress: () => scrollProgress,
  scrollTo: mockScrollTo,
  scrollNext: mockScrollNext,
  scrollPrev: mockScrollPrev,
  selectedScrollSnap: () => 0,
  on: jest.fn((event: string, callback: () => void) => {
    const listeners = emblaListeners.get(event) ?? new Set()
    listeners.add(callback)
    emblaListeners.set(event, listeners)
  }),
  off: jest.fn((event: string, callback: () => void) => {
    emblaListeners.get(event)?.delete(callback)
  }),
}

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: jest.fn(() => [setViewportRef, emblaApi]),
}))

function renderOverflowingRow() {
  render(
    <ScrollRow aria-label="Similar products">
      {[1, 2, 3].map((index) => (
        <li key={index} style={{ minWidth: '300px' }}>
          Product {index}
        </li>
      ))}
    </ScrollRow>
  )

  const list = screen.getByRole('list', { name: 'Similar products' })
  const viewport = list.parentElement as HTMLDivElement

  Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 })
  Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 900 })
  scrollProgress = 0

  act(() => {
    emitEmblaEvent('reInit')
    emitEmblaEvent('resize')
  })

  return { list, viewport }
}

describe('Given ScrollRow', () => {
  beforeEach(() => {
    mockScrollTo.mockClear()
    mockScrollNext.mockClear()
    mockScrollPrev.mockClear()
    scrollProgress = 0
    viewportNode = null
    containerNode = null
    emblaListeners.clear()
  })

  describe('When the content overflows horizontally', () => {
    beforeEach(() => {
      renderOverflowingRow()
    })

    it('Then it shows a scrollbar indicator', async () => {
      await waitFor(() => {
        expect(document.querySelector('[class*="scroll-row__scrollbar"]')).toBeInTheDocument()
      })
    })
  })

  describe('When the user scrolls vertically over the row', () => {
    it('Then embla moves to the next slide', () => {
      const { viewport } = renderOverflowingRow()

      act(() => {
        viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 24, deltaX: 0, bubbles: true }))
      })

      expect(mockScrollNext).toHaveBeenCalled()
    })
  })

  describe('When the row content is reset', () => {
    it('Then it scrolls back to the first slide', () => {
      const { rerender } = render(
        <ScrollRow resetKey="first" aria-label="Similar products">
          {[1, 2, 3].map((index) => (
            <li key={index} style={{ minWidth: '300px' }}>
              Product {index}
            </li>
          ))}
        </ScrollRow>
      )

      mockScrollTo.mockClear()

      act(() => {
        rerender(
          <ScrollRow resetKey="second" aria-label="Similar products">
            {[1, 2, 3].map((index) => (
              <li key={index} style={{ minWidth: '300px' }}>
                Product {index}
              </li>
            ))}
          </ScrollRow>
        )
      })

      expect(mockScrollTo).toHaveBeenCalledWith(0, true)
    })
  })
})
