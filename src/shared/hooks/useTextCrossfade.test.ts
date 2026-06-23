import { act, renderHook } from '@testing-library/react'

import { useTextCrossfade } from './useTextCrossfade'

describe('Given useTextCrossfade', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  describe('When initialized with a text', () => {
    it('Then slot 0 is active and holds the initial text', () => {
      const { result } = renderHook(() => useTextCrossfade('From 1329 EUR'))
      const [slot0, slot1] = result.current

      expect(slot0.text).toBe('From 1329 EUR')
      expect(slot0.isActive).toBe(true)
      expect(slot1.isActive).toBe(false)
    })
  })

  describe('When the text changes', () => {
    it('Then the inactive slot receives the new text', () => {
      let text = 'From 1329 EUR'
      const { result, rerender } = renderHook(() => useTextCrossfade(text))

      text = '1449 EUR'
      rerender()

      const slots = result.current
      const inactiveSlot = slots.find((s) => !s.isActive)
      expect(inactiveSlot?.text).toBe('1449 EUR')
    })

    it('Then after the crossfade timer fires the new slot becomes active', async () => {
      let text = 'From 1329 EUR'
      const { result, rerender } = renderHook(() => useTextCrossfade(text))

      text = '1449 EUR'
      rerender()

      await act(async () => jest.advanceTimersByTime(20))

      const [slot0, slot1] = result.current
      expect(slot1.isActive).toBe(true)
      expect(slot0.isActive).toBe(false)
      expect(slot1.text).toBe('1449 EUR')
    })

    it('Then the old text remains visible during the transition', () => {
      let text = 'From 1329 EUR'
      const { result, rerender } = renderHook(() => useTextCrossfade(text))

      text = '1449 EUR'
      rerender()

      const [slot0] = result.current
      expect(slot0.text).toBe('From 1329 EUR')
      expect(slot0.isActive).toBe(true)
    })
  })
})
