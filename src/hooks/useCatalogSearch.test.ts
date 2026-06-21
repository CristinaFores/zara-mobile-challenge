import { act, renderHook } from '@testing-library/react'

import { phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'

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
    it('Then it returns the phones as-is — the server already filtered them before passing the prop', () => {
      const appleOnly = phoneListFixture.filter((p) => p.brand === 'Apple')
      const { result } = renderHook(() =>
        useCatalogSearch({ phones: appleOnly, initialQuery: 'apple' })
      )

      expect(result.current.filteredPhones).toEqual(appleOnly)
      expect(result.current.resultCount).toBe(appleOnly.length)
    })
  })

  describe('When the query changes', () => {
    it('Then filteredPhones stays equal to the phones prop — local filtering is server-side now', () => {
      const { result } = renderHook(() => useCatalogSearch({ phones: phoneListFixture }))

      act(() => result.current.onQueryChange('samsung'))
      act(() => jest.advanceTimersByTime(450))

      expect(result.current.filteredPhones).toEqual(phoneListFixture)
      expect(result.current.resultCount).toBe(phoneListFixture.length)
    })

    it('Then it pushes the encoded query to the URL after the debounce so the Server Component re-fetches', () => {
      const { result } = renderHook(() => useCatalogSearch({ phones: phoneListFixture }))

      act(() => result.current.onQueryChange('PIXEL'))
      act(() => jest.advanceTimersByTime(300))

      expect(pushMock).toHaveBeenCalledWith('/?search=PIXEL', { scroll: false })
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
