import { renderHook, act, waitFor } from '@testing-library/react'

import { useAfterProductRouteTransition } from './useAfterProductRouteTransition'

describe('Given useAfterProductRouteTransition', () => {
  afterEach(() => {
    document.documentElement.classList.remove('product-route-view-transition')
  })

  describe('When no product route transition is active', () => {
    it('Then it is ready immediately', () => {
      const { result } = renderHook(() => useAfterProductRouteTransition())
      expect(result.current).toBe(true)
    })
  })

  describe('When a product route transition is active', () => {
    it('Then it waits until the root class is removed', async () => {
      document.documentElement.classList.add('product-route-view-transition')

      const { result } = renderHook(() => useAfterProductRouteTransition())
      expect(result.current).toBe(false)

      await act(async () => {
        document.documentElement.classList.remove('product-route-view-transition')
      })

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })
  })
})
