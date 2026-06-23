import { act, renderHook } from '@testing-library/react'

import { useDebounce } from '@/shared/hooks/useDebounce'

describe('Given useDebounce', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  describe('When the value has just changed', () => {
    it('Then it still returns the previous value before the delay elapses', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'a' },
      })

      rerender({ value: 'b' })

      expect(result.current).toBe('a')
    })
  })

  describe('When the delay elapses', () => {
    it('Then it returns the latest value', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'a' },
      })

      rerender({ value: 'b' })
      act(() => jest.advanceTimersByTime(300))

      expect(result.current).toBe('b')
    })
  })

  describe('When the value changes again before the delay elapses', () => {
    it('Then only the final value is emitted', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'a' },
      })

      rerender({ value: 'b' })
      act(() => jest.advanceTimersByTime(150))
      rerender({ value: 'c' })
      act(() => jest.advanceTimersByTime(150))

      expect(result.current).toBe('a')

      act(() => jest.advanceTimersByTime(150))

      expect(result.current).toBe('c')
    })
  })
})
