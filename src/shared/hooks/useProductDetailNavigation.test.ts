import { renderHook } from '@testing-library/react'
import type { MouseEvent } from 'react'

import { ROUTES } from '@/shared/constants'

import { useProductDetailNavigation } from './useProductDetailNavigation'

const pushMock = jest.fn()
const prefetchMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, prefetch: prefetchMock }),
  usePathname: jest.fn(() => '/'),
}))

jest.mock('@/shared/lib/browser', () => ({
  prefersReducedMotion: () => true,
}))

jest.mock('@/shared/store/productNavigation', () => ({
  beginProductRouteViewTransition: jest.fn(() => Promise.resolve()),
  getProductDetailHref: (id: string) => `${ROUTES.PRODUCT_DETAIL}/${id}`,
  getProductViewTransitionName: (id: string) => `product-image-${id}`,
  scrollToProductDetailTop: jest.fn(),
  setProductPreview: jest.fn(),
}))

const product = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1299,
  imageUrl: 'https://example.com/phone.webp',
}

function createClickEvent(): Pick<
  MouseEvent<HTMLAnchorElement>,
  | 'button'
  | 'preventDefault'
  | 'defaultPrevented'
  | 'metaKey'
  | 'altKey'
  | 'ctrlKey'
  | 'shiftKey'
  | 'currentTarget'
> {
  return {
    button: 0,
    preventDefault: jest.fn(),
    defaultPrevented: false,
    metaKey: false,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    currentTarget: { target: '_self' } as HTMLAnchorElement,
  }
}

describe('Given useProductDetailNavigation', () => {
  beforeEach(() => {
    pushMock.mockClear()
    prefetchMock.mockClear()
  })

  describe('When navigating from another product detail page', () => {
    it('Then it uses a plain route change without view transition types', () => {
      const { usePathname } = jest.requireMock('next/navigation') as {
        usePathname: jest.Mock
      }
      usePathname.mockReturnValue(`${ROUTES.PRODUCT_DETAIL}/IPH-15PM`)

      const { result } = renderHook(() =>
        useProductDetailNavigation(product, { enableViewTransition: false })
      )
      const clickEvent = createClickEvent()

      result.current.navigateWithViewTransition(clickEvent as MouseEvent<HTMLAnchorElement>)

      expect(pushMock).toHaveBeenCalledWith(`${ROUTES.PRODUCT_DETAIL}/${product.id}`)
      expect(result.current.linkTransitionTypes).toBeUndefined()
      expect(jest.mocked(clickEvent.preventDefault)).toHaveBeenCalled()
    })
  })

  describe('When navigating from the catalog', () => {
    it('Then it keeps the product-detail transition type on the link', () => {
      const { usePathname } = jest.requireMock('next/navigation') as {
        usePathname: jest.Mock
      }
      usePathname.mockReturnValue('/')

      const { result } = renderHook(() => useProductDetailNavigation(product))

      expect(result.current.linkTransitionTypes).toEqual(['product-detail'])
    })
  })
})
