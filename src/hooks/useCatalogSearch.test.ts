import { act, renderHook } from '@testing-library/react'

import { phoneListFixture } from '@/__mocks__/phones.fixtures'

import { useCatalogSearch } from './useCatalogSearch'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('Given useCatalogSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    pushMock.mockClear()
  })
  afterEach(() => jest.useRealTimers())

  describe('When no query has been entered', () => {
    it('Then it returns every phone', () => {
      const { result } = renderHook(() => useCatalogSearch({ phones: phoneListFixture }))

      expect(result.current.filteredPhones).toHaveLength(phoneListFixture.length)
      expect(result.current.resultCount).toBe(phoneListFixture.length)
    })
  })

  describe('When an initial query is provided', () => {
    it('Then it filters from the first render', () => {
      const { result } = renderHook(() =>
        useCatalogSearch({ phones: phoneListFixture, initialQuery: 'apple' })
      )

      expect(result.current.filteredPhones.every((phone) => phone.brand === 'Apple')).toBe(true)
    })
  })

  describe('When the query changes', () => {
    it('Then it keeps the previous results until the filter debounce elapses', () => {
      const { result } = renderHook(() => useCatalogSearch({ phones: phoneListFixture }))

      act(() => result.current.onQueryChange('samsung'))

      expect(result.current.resultCount).toBe(phoneListFixture.length)

      act(() => jest.advanceTimersByTime(450))

      expect(result.current.filteredPhones.every((phone) => phone.brand === 'Samsung')).toBe(true)
    })

    it('Then it matches by name case-insensitively', () => {
      const { result } = renderHook(() => useCatalogSearch({ phones: phoneListFixture }))

      act(() => result.current.onQueryChange('PIXEL'))
      act(() => jest.advanceTimersByTime(450))

      expect(result.current.filteredPhones).toHaveLength(1)
      expect(result.current.filteredPhones[0].name).toMatch(/pixel/i)
    })

    it('Then it pushes the query to the URL after the url debounce', () => {
      const { result } = renderHook(() => useCatalogSearch({ phones: phoneListFixture }))

      act(() => result.current.onQueryChange('apple'))
      act(() => jest.advanceTimersByTime(300))

      expect(pushMock).toHaveBeenCalledWith('/?search=apple', { scroll: false })
    })

    it('Then an empty query clears the URL param', () => {
      const { result } = renderHook(() => useCatalogSearch({ phones: phoneListFixture }))

      act(() => result.current.onQueryChange(''))
      act(() => jest.advanceTimersByTime(300))

      expect(pushMock).toHaveBeenCalledWith('/', { scroll: false })
    })
  })
})
