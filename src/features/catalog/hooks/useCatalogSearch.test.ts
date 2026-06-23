import { act, renderHook } from '@testing-library/react'

import { useCatalogSearch } from '@/features/catalog/hooks/useCatalogSearch'
import { productListFixture } from '@/test-utils/fixtures/products.fixtures'

const pushMock = jest.fn()
const replaceMock = jest.fn()
let searchParamValue = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'search' ? searchParamValue : null),
  }),
}))

describe('Given useCatalogSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    pushMock.mockClear()
    replaceMock.mockClear()
    searchParamValue = ''
  })
  afterEach(() => jest.useRealTimers())

  describe('When no query has been entered', () => {
    it('Then it returns every product', () => {
      const { result } = renderHook(() => useCatalogSearch({ products: productListFixture }))

      expect(result.current.filteredProducts).toHaveLength(productListFixture.length)
      expect(result.current.resultCount).toBe(productListFixture.length)
    })
  })

  describe('When an initial query is provided', () => {
    it('Then it returns the products as-is — the server already filtered them before passing the prop', () => {
      const appleOnly = productListFixture.filter((p) => p.brand === 'Apple')
      const { result } = renderHook(() =>
        useCatalogSearch({ products: appleOnly, initialQuery: 'apple' })
      )

      expect(result.current.filteredProducts).toEqual(appleOnly)
      expect(result.current.resultCount).toBe(appleOnly.length)
    })
  })

  describe('When initialQuery changes after mount', () => {
    it('Then query syncs from the URL so back/forward keeps the input aligned', () => {
      const { result, rerender } = renderHook(
        ({
          initialQuery,
          products,
        }: {
          initialQuery: string
          products: typeof productListFixture
        }) => useCatalogSearch({ products, initialQuery }),
        { initialProps: { products: productListFixture, initialQuery: 'samsung' } }
      )

      expect(result.current.query).toBe('samsung')

      rerender({ products: productListFixture, initialQuery: '' })

      expect(result.current.query).toBe('')
    })

    it('Then typing ahead of the debounced URL update is not reset while initialQuery stays the same', () => {
      const { result } = renderHook(() =>
        useCatalogSearch({ products: productListFixture, initialQuery: '' })
      )

      act(() => result.current.onQueryChange('sam'))

      expect(result.current.query).toBe('sam')
    })
  })

  describe('When the query changes', () => {
    it('Then filteredProducts stays equal to the products prop — local filtering is server-side now', () => {
      const { result } = renderHook(() => useCatalogSearch({ products: productListFixture }))

      act(() => result.current.onQueryChange('samsung'))
      act(() => jest.advanceTimersByTime(450))

      expect(result.current.filteredProducts).toEqual(productListFixture)
      expect(result.current.resultCount).toBe(productListFixture.length)
    })

    it('Then it replaces the encoded query in the URL after the debounce so the Server Component re-fetches', () => {
      const { result } = renderHook(() => useCatalogSearch({ products: productListFixture }))

      act(() => result.current.onQueryChange('PIXEL'))
      act(() => jest.advanceTimersByTime(300))

      expect(replaceMock).toHaveBeenCalledWith('/?search=PIXEL', { scroll: false })
    })

    it('Then it replaces the query in the URL after the url debounce', () => {
      const { result } = renderHook(() => useCatalogSearch({ products: productListFixture }))

      act(() => result.current.onQueryChange('apple'))
      act(() => jest.advanceTimersByTime(300))

      expect(replaceMock).toHaveBeenCalledWith('/?search=apple', { scroll: false })
    })

    it('Then an empty query clears the URL param', () => {
      searchParamValue = 'apple'
      const { result } = renderHook(() =>
        useCatalogSearch({ products: productListFixture, initialQuery: 'apple' })
      )

      act(() => result.current.onQueryChange(''))
      act(() => jest.advanceTimersByTime(300))

      expect(replaceMock).toHaveBeenCalledWith('/', { scroll: false })
    })
  })
})
