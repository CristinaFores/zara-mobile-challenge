import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ScrollRow } from './ScrollRow'

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
  Object.defineProperty(list, 'clientWidth', { configurable: true, value: 300 })
  Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 900 })
  Object.defineProperty(list, 'scrollLeft', { configurable: true, writable: true, value: 0 })

  const firstItem = list.firstElementChild as HTMLElement
  Object.defineProperty(firstItem, 'offsetLeft', { configurable: true, value: 0 })
  Object.defineProperty(firstItem, 'offsetWidth', { configurable: true, value: 300 })
  list.setPointerCapture = jest.fn()
  list.releasePointerCapture = jest.fn()

  act(() => {
    fireEvent.scroll(list)
  })

  return list
}

describe('Given ScrollRow', () => {
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
    it('Then the row moves horizontally instead', () => {
      const list = renderOverflowingRow()

      act(() => {
        list.dispatchEvent(new WheelEvent('wheel', { deltaY: 24, deltaX: 0, bubbles: true }))
      })

      expect(list.scrollLeft).toBe(24)
    })
  })

  describe('When the row content is reset', () => {
    it('Then it recenters on the first item', () => {
      const { rerender } = render(
        <ScrollRow resetKey="first" aria-label="Similar products">
          {[1, 2, 3].map((index) => (
            <li key={index} style={{ minWidth: '300px' }}>
              Product {index}
            </li>
          ))}
        </ScrollRow>
      )

      const list = screen.getByRole('list', { name: 'Similar products' })
      Object.defineProperty(list, 'clientWidth', { configurable: true, value: 300 })
      Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 900 })
      Object.defineProperty(list, 'scrollLeft', { configurable: true, writable: true, value: 120 })

      const firstItem = list.firstElementChild as HTMLElement
      Object.defineProperty(firstItem, 'offsetLeft', { configurable: true, value: 0 })
      Object.defineProperty(firstItem, 'offsetWidth', { configurable: true, value: 300 })

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

      expect(list.scrollLeft).toBe(0)
    })
  })
})
