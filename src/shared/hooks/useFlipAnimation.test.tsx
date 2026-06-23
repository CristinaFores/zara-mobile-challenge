import { act, renderHook } from '@testing-library/react'

import type { Product } from '@/shared/types'

import { useFlipAnimation } from './useFlipAnimation'

function makeProduct(id: string): Product {
  return { id, brand: 'Brand', name: `Product ${id}`, basePrice: 100, imageUrl: 'x.webp' }
}

const FLIP_TRANSITION_MS = 500

describe('Given useFlipAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('When first rendered', () => {
    it('Then it displays the initial products and is idle', () => {
      const products = [makeProduct('a'), makeProduct('b')]
      const { result } = renderHook(() => useFlipAnimation(products))

      expect(result.current.displayedProducts).toEqual(products)
      expect(result.current.animationPhase).toBe('idle')
      expect(result.current.exitingCards).toEqual([])
    })
  })

  describe('When the product ids do not change', () => {
    it('Then it syncs the displayed products without animating', () => {
      const { result, rerender } = renderHook(({ products }) => useFlipAnimation(products), {
        initialProps: { products: [makeProduct('a')] },
      })

      rerender({ products: [makeProduct('a')] })

      expect(result.current.animationPhase).toBe('idle')
      expect(result.current.displayedProducts).toHaveLength(1)
    })
  })

  describe('When the product ids change', () => {
    it('Then it enters the animating phase and returns to idle after the transition', () => {
      const { result, rerender } = renderHook(({ products }) => useFlipAnimation(products), {
        initialProps: { products: [makeProduct('a'), makeProduct('b')] },
      })

      act(() => rerender({ products: [makeProduct('a')] }))

      expect(result.current.animationPhase).toBe('animating')
      expect(result.current.displayedProducts).toEqual([makeProduct('a')])

      act(() => jest.advanceTimersByTime(FLIP_TRANSITION_MS))

      expect(result.current.animationPhase).toBe('idle')
      expect(result.current.exitingCards).toEqual([])
    })
  })

  describe('When the products change again mid-animation', () => {
    it('Then the queued update runs after the current animation finishes', () => {
      const { result, rerender } = renderHook(({ products }) => useFlipAnimation(products), {
        initialProps: { products: [makeProduct('a'), makeProduct('b'), makeProduct('c')] },
      })

      act(() => rerender({ products: [makeProduct('a'), makeProduct('b')] }))
      expect(result.current.animationPhase).toBe('animating')

      act(() => rerender({ products: [makeProduct('a')] }))

      act(() => jest.advanceTimersByTime(FLIP_TRANSITION_MS))
      act(() => jest.advanceTimersByTime(FLIP_TRANSITION_MS))

      expect(result.current.displayedProducts).toEqual([makeProduct('a')])
      expect(result.current.animationPhase).toBe('idle')
    })
  })
})
