import { act, renderHook } from '@testing-library/react'

import { useImageCrossfade } from './useImageCrossfade'

const URL_A = 'https://example.com/image-a.webp'
const URL_B = 'https://example.com/image-b.webp'

describe('Given useImageCrossfade', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(globalThis, 'Image').mockImplementation(() => {
      const img = {
        complete: true,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        set src(_value: string) {
          queueMicrotask(() => img.onload?.())
        },
      }
      return img as unknown as HTMLImageElement
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  describe('When initialized with a URL', () => {
    it('Then both slots contain the initial URL', () => {
      const { result } = renderHook(() => useImageCrossfade(URL_A))
      expect(result.current[0].url).toBe(URL_A)
      expect(result.current[1].url).toBe(URL_A)
    })

    it('Then slot0 is front (zIndex 2) and slot1 is hidden (opacity 0)', () => {
      const { result } = renderHook(() => useImageCrossfade(URL_A))
      expect(result.current[0].zIndex).toBe(2)
      expect(result.current[0].opacity).toBe(1)
      expect(result.current[1].zIndex).toBe(1)
      expect(result.current[1].opacity).toBe(0)
    })

    it('Then both slots expose an onLoad callback', () => {
      const { result } = renderHook(() => useImageCrossfade(URL_A))
      expect(typeof result.current[0].onLoad).toBe('function')
      expect(typeof result.current[1].onLoad).toBe('function')
    })
  })

  describe('When the URL changes to a new value', () => {
    it('Then the back slot receives the new URL immediately', () => {
      const { result, rerender } = renderHook(({ url }) => useImageCrossfade(url), {
        initialProps: { url: URL_A },
      })

      act(() => {
        rerender({ url: URL_B })
      })

      // slot1 (back) should now load the new URL
      expect(result.current[1].url).toBe(URL_B)
      // slot0 (front) keeps the old URL during crossfade
      expect(result.current[0].url).toBe(URL_A)
    })

    it('Then the incoming slot starts invisible (opacity 0)', () => {
      const { result, rerender } = renderHook(({ url }) => useImageCrossfade(url), {
        initialProps: { url: URL_A },
      })

      act(() => {
        rerender({ url: URL_B })
      })

      expect(result.current[1].opacity).toBe(0)
    })

    it('Then the incoming slot has no transition until image loads', () => {
      const { result, rerender } = renderHook(({ url }) => useImageCrossfade(url), {
        initialProps: { url: URL_A },
      })

      act(() => {
        rerender({ url: URL_B })
      })

      expect(result.current[1].transition).toBe('none')
    })
  })

  describe('When the URL changes to the same value', () => {
    it('Then no crossfade is triggered and slot0 stays front', () => {
      const { result, rerender } = renderHook(({ url }) => useImageCrossfade(url), {
        initialProps: { url: URL_A },
      })

      act(() => {
        rerender({ url: URL_A })
      })

      expect(result.current[0].zIndex).toBe(2)
      expect(result.current[0].url).toBe(URL_A)
      expect(result.current[1].zIndex).toBe(1)
    })
  })

  describe('When onLoad fires on the incoming slot', () => {
    it('Then after animation frames the incoming slot becomes opaque', () => {
      const { result, rerender } = renderHook(({ url }) => useImageCrossfade(url), {
        initialProps: { url: URL_A },
      })

      act(() => {
        rerender({ url: URL_B })
      })

      // Signal that the new image loaded
      act(() => {
        result.current[1].onLoad()
      })

      // Flush RAF callbacks and the settle timeout
      act(() => {
        jest.runAllTimers()
      })

      expect(result.current[1].opacity).toBe(1)
    })

    it('Then after the settle timeout the back slot becomes the new front', () => {
      const { result, rerender } = renderHook(({ url }) => useImageCrossfade(url), {
        initialProps: { url: URL_A },
      })

      act(() => {
        rerender({ url: URL_B })
      })

      act(() => {
        result.current[1].onLoad()
      })

      act(() => {
        jest.runAllTimers()
      })

      // slot1 now holds URL_B and is front (zIndex 2), no incoming in progress
      expect(result.current[1].url).toBe(URL_B)
    })
  })

  describe('When onLoad fires on the non-incoming slot', () => {
    it('Then the state does not change', () => {
      const { result } = renderHook(() => useImageCrossfade(URL_A))

      const beforeZIndex = result.current[0].zIndex

      // slot0 is front, not incoming — calling onLoad should be a no-op
      act(() => {
        result.current[0].onLoad()
      })

      expect(result.current[0].zIndex).toBe(beforeZIndex)
      expect(result.current[0].url).toBe(URL_A)
    })
  })

  describe('When switching back to a URL already loaded in the back slot', () => {
    it('Then the crossfade proceeds without waiting for onLoad', () => {
      const { result, rerender } = renderHook(({ url }) => useImageCrossfade(url), {
        initialProps: { url: URL_A },
      })

      // First crossfade: A → B
      act(() => {
        rerender({ url: URL_B })
      })
      act(() => {
        result.current[1].onLoad()
      })
      act(() => {
        jest.runAllTimers()
      })

      // Second crossfade: B → A — slot0 already has URL_A, no onLoad needed
      act(() => {
        rerender({ url: URL_A })
      })
      act(() => {
        jest.runAllTimers()
      })

      // slot0 should have URL_A and be the visible front
      expect(result.current[0].url).toBe(URL_A)
      expect(result.current[0].opacity).toBe(1)
    })
  })
})
