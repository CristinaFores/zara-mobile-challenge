import { act, renderHook } from '@testing-library/react'

import { phoneDetailFixture } from '@/test-utils/fixtures/phones.fixtures'

import { useProductSelection } from './useProductSelection'

const mockReplace = jest.fn()
const mockAddToCart = jest.fn()

let mockParams: Record<string, string | null> = {}

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => mockParams[key] ?? null, toString: () => '' }),
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/phones/SMG-S24U',
}))

jest.mock('@/context/cart/CartContext', () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}))

function setup(params: Record<string, string | null> = {}) {
  mockParams = params
  return renderHook(() => useProductSelection(phoneDetailFixture))
}

beforeEach(() => {
  mockReplace.mockClear()
  mockAddToCart.mockClear()
  mockParams = {}
})

describe('Given useProductSelection', () => {
  describe('When no URL params are set', () => {
    it('Then selectedColor is null', () => {
      const { result } = setup()
      expect(result.current.selectedColor).toBeNull()
    })

    it('Then selectedStorage is null', () => {
      const { result } = setup()
      expect(result.current.selectedStorage).toBeNull()
    })

    it('Then canAddToCart is false', () => {
      const { result } = setup()
      expect(result.current.canAddToCart).toBe(false)
    })

    it('Then imageUrl falls back to the first color option image', () => {
      const { result } = setup()
      expect(result.current.imageUrl).toBe(phoneDetailFixture.colorOptions[0].imageUrl)
    })

    it('Then priceLabel shows "From X EUR" using the base price', () => {
      const { result } = setup()
      expect(result.current.priceLabel).toBe(`From ${phoneDetailFixture.basePrice} EUR`)
    })
  })

  describe('When both color and storage are in the URL', () => {
    const color = phoneDetailFixture.colorOptions[1]
    const storage = phoneDetailFixture.storageOptions[1]

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
    it('Then it calls router.replace with the color in the URL', () => {
      const { result } = setup()
      const color = phoneDetailFixture.colorOptions[0]

      act(() => result.current.setSelectedColor(color))

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(new URLSearchParams({ color: color.name }).toString()),
        { scroll: false }
      )
    })
  })

  describe('When setSelectedStorage is called', () => {
    it('Then it calls router.replace with the storage in the URL', () => {
      const { result } = setup()
      const storage = phoneDetailFixture.storageOptions[0]

      act(() => result.current.setSelectedStorage(storage))

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(new URLSearchParams({ storage: storage.capacity }).toString()),
        { scroll: false }
      )
    })
  })

  describe('When handleAddToCart is called without full selection', () => {
    it('Then it does not call addToCart', () => {
      const { result } = setup({ color: phoneDetailFixture.colorOptions[0].name })

      act(() => result.current.handleAddToCart())

      expect(mockAddToCart).not.toHaveBeenCalled()
    })
  })

  describe('When handleAddToCart is called with both color and storage selected', () => {
    it('Then it calls addToCart with the phone, color, and storage', () => {
      const color = phoneDetailFixture.colorOptions[0]
      const storage = phoneDetailFixture.storageOptions[0]
      const { result } = setup({ color: color.name, storage: storage.capacity })

      act(() => result.current.handleAddToCart())

      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({ id: phoneDetailFixture.id }),
        color,
        storage
      )
    })
  })
})
