import { act, renderHook } from '@testing-library/react'

import type { Phone } from '@/types'

import { useFlipAnimation } from './useFlipAnimation'

function makePhone(id: string): Phone {
  return { id, brand: 'Brand', name: `Phone ${id}`, basePrice: 100, imageUrl: 'x.webp' }
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
    it('Then it displays the initial phones and is idle', () => {
      const phones = [makePhone('a'), makePhone('b')]
      const { result } = renderHook(() => useFlipAnimation(phones))

      expect(result.current.displayedPhones).toEqual(phones)
      expect(result.current.animationPhase).toBe('idle')
      expect(result.current.exitingCards).toEqual([])
    })
  })

  describe('When the phone ids do not change', () => {
    it('Then it syncs the displayed phones without animating', () => {
      const { result, rerender } = renderHook(({ phones }) => useFlipAnimation(phones), {
        initialProps: { phones: [makePhone('a')] },
      })

      rerender({ phones: [makePhone('a')] })

      expect(result.current.animationPhase).toBe('idle')
      expect(result.current.displayedPhones).toHaveLength(1)
    })
  })

  describe('When the phone ids change', () => {
    it('Then it enters the animating phase and returns to idle after the transition', () => {
      const { result, rerender } = renderHook(({ phones }) => useFlipAnimation(phones), {
        initialProps: { phones: [makePhone('a'), makePhone('b')] },
      })

      act(() => rerender({ phones: [makePhone('a')] }))

      expect(result.current.animationPhase).toBe('animating')
      expect(result.current.displayedPhones).toEqual([makePhone('a')])

      act(() => jest.advanceTimersByTime(FLIP_TRANSITION_MS))

      expect(result.current.animationPhase).toBe('idle')
      expect(result.current.exitingCards).toEqual([])
    })
  })

  describe('When the phones change again mid-animation', () => {
    it('Then the queued update runs after the current animation finishes', () => {
      const { result, rerender } = renderHook(({ phones }) => useFlipAnimation(phones), {
        initialProps: { phones: [makePhone('a'), makePhone('b'), makePhone('c')] },
      })

      act(() => rerender({ phones: [makePhone('a'), makePhone('b')] }))
      expect(result.current.animationPhase).toBe('animating')

      act(() => rerender({ phones: [makePhone('a')] }))

      act(() => jest.advanceTimersByTime(FLIP_TRANSITION_MS))
      act(() => jest.advanceTimersByTime(FLIP_TRANSITION_MS))

      expect(result.current.displayedPhones).toEqual([makePhone('a')])
      expect(result.current.animationPhase).toBe('idle')
    })
  })
})
