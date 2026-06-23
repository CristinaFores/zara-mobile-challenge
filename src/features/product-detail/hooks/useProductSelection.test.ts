import { act, renderHook } from '@testing-library/react'

import { productDetailFixture } from '@/test-utils/fixtures/products.fixtures'

import { useProductSelection } from './useProductSelection'

const mockReplace = jest.fn()
const mockAddToCart = jest.fn()
const mockReplaceSearchParamsInHistory = jest.fn()
const mockGetBrowserSearchParamsSnapshot = jest.fn((): string | null => null)

let mockParams: Record<string, string | null> = {}

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockParams[key] ?? null,
    toString: () =>
      new URLSearchParams(
        Object.entries(mockParams).flatMap(([key, value]) => (value === null ? [] : [[key, value]]))
      ).toString(),
  }),
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => '/products/SMG-S24U',
}))

jest.mock('@/features/cart/context/CartContext', () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}))

jest.mock('@/shared/lib/browser', () => {
  const actual = jest.requireActual<typeof import('@/shared/lib/browser')>('@/shared/lib/browser')

  return {
    ...actual,
    getBrowserSearchParamsSnapshot: () => mockGetBrowserSearchParamsSnapshot(),
    subscribeToPopstate: () => () => undefined,
    replaceSearchParamsInHistory: (...args: unknown[]) => mockReplaceSearchParamsInHistory(...args),
  }
})

function setup(params: Record<string, string | null> = {}) {
  mockParams = params
  return renderHook(() => useProductSelection(productDetailFixture))
}

beforeEach(() => {
  mockReplace.mockClear()
  mockAddToCart.mockClear()
  mockReplaceSearchParamsInHistory.mockClear()
  mockGetBrowserSearchParamsSnapshot.mockReturnValue(null)
  mockParams = {}
})

describe('Given useProductSelection', () => {
  describe('When no URL params are set', () => {
    it('Then selectedColor is null until the user picks one', () => {
      const { result } = setup()
      expect(result.current.selectedColor).toBeNull()
    })

    it('Then selectedStorage is null until the user picks one', () => {
      const { result } = setup()
      expect(result.current.selectedStorage).toBeNull()
    })

    it('Then canAddToCart is false because nothing is selected', () => {
      const { result } = setup()
      expect(result.current.canAddToCart).toBe(false)
    })

    it('Then imageUrl falls back to the first color preview image', () => {
      const { result } = setup()
      expect(result.current.imageUrl).toBe(productDetailFixture.colorOptions[0].imageUrl)
    })

    it('Then priceLabel shows the base price with "From"', () => {
      const { result } = setup()
      expect(result.current.priceLabel).toBe(`From ${productDetailFixture.basePrice} EUR`)
    })
  })

  describe('When both color and storage are in the URL', () => {
    const color = productDetailFixture.colorOptions[1]
    const storage = productDetailFixture.storageOptions[1]

    it('Then selectedColor matches the URL param', () => {
      const { result } = setup({ color: color.name, storage: storage.capacity })
      expect(result.current.selectedColor).toEqual(color)
    })

    it('Then selectedStorage matches the URL param', () => {
      const { result } = setup({ color: color.name, storage: storage.capacity })
      expect(result.current.selectedStorage).toEqual(storage)
    })

    it('Then canAddToCart is true', () => {
      const { result } = setup({ color: color.name, storage: storage.capacity })
      expect(result.current.canAddToCart).toBe(true)
    })

    it('Then imageUrl is the selected color image', () => {
      const { result } = setup({ color: color.name, storage: storage.capacity })
      expect(result.current.imageUrl).toBe(color.imageUrl)
    })

    it('Then priceLabel shows the storage price without "From"', () => {
      const { result } = setup({ color: color.name, storage: storage.capacity })
      expect(result.current.priceLabel).toBe(`${storage.price} EUR`)
    })
  })

  describe('When setSelectedColor is called', () => {
    it('Then it updates the selection immediately before the URL commits', () => {
      const { result } = setup()
      const color = productDetailFixture.colorOptions[0]

      act(() => result.current.setSelectedColor(color))

      expect(result.current.selectedColor).toEqual(color)
    })

    it('Then it updates the URL with history.replaceState without router.replace', () => {
      const { result } = setup()
      const color = productDetailFixture.colorOptions[0]

      act(() => result.current.setSelectedColor(color))

      expect(mockReplaceSearchParamsInHistory).toHaveBeenCalledWith(
        '/products/SMG-S24U',
        expect.objectContaining({
          get: expect.any(Function),
        })
      )
      expect(mockReplaceSearchParamsInHistory.mock.calls[0][1].get('color')).toBe(color.name)
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe('When setSelectedStorage is called', () => {
    it('Then it updates the selection immediately before the URL commits', () => {
      const { result } = setup()
      const storage = productDetailFixture.storageOptions[0]

      act(() => result.current.setSelectedStorage(storage))

      expect(result.current.selectedStorage).toEqual(storage)
    })

    it('Then it updates the URL with history.replaceState without router.replace', () => {
      const { result } = setup()
      const storage = productDetailFixture.storageOptions[0]

      act(() => result.current.setSelectedStorage(storage))

      expect(mockReplaceSearchParamsInHistory).toHaveBeenCalledWith(
        '/products/SMG-S24U',
        expect.objectContaining({
          get: expect.any(Function),
        })
      )
      expect(mockReplaceSearchParamsInHistory.mock.calls[0][1].get('storage')).toBe(
        storage.capacity
      )
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe('When handleAddToCart is called without full selection', () => {
    it('Then it does not call addToCart when storageOptions is empty', () => {
      mockParams = {}
      const { result } = renderHook(() =>
        useProductSelection({ ...productDetailFixture, storageOptions: [] })
      )

      act(() => result.current.handleAddToCart())

      expect(mockAddToCart).not.toHaveBeenCalled()
    })

    it('Then it does not call addToCart when only color is selected', () => {
      const color = productDetailFixture.colorOptions[0]
      const { result } = setup({ color: color.name })

      act(() => result.current.handleAddToCart())

      expect(mockAddToCart).not.toHaveBeenCalled()
    })
  })

  describe('When handleAddToCart is called with both color and storage selected', () => {
    it('Then it calls addToCart with the product, color, and storage', () => {
      const color = productDetailFixture.colorOptions[0]
      const storage = productDetailFixture.storageOptions[0]
      const { result } = setup({ color: color.name, storage: storage.capacity })

      act(() => result.current.handleAddToCart())

      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({ id: productDetailFixture.id }),
        color,
        storage
      )
    })
  })
})
