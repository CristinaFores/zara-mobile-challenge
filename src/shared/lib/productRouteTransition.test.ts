import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import {
  beginProductRouteViewTransition,
  setReturningProductId,
} from '@/shared/store/productNavigation'

import {
  navigateBackFromProductDetail,
  PRODUCT_ROUTE_CLASS,
  PRODUCT_ROUTE_READY_CLASS,
} from './productRouteTransition'

jest.mock('@/shared/store/productNavigation', () => ({
  beginProductRouteViewTransition: jest.fn(() => Promise.resolve()),
  scrollToProductDetailTop: jest.fn(),
  setReturningProductId: jest.fn(),
  resolveProductRouteViewTransition: jest.fn(),
}))

describe('Given navigateBackFromProductDetail', () => {
  const router = {
    back: jest.fn(),
    push: jest.fn(),
  } as unknown as AppRouterInstance

  beforeEach(() => {
    jest.clearAllMocks()
    document.documentElement.className = ''
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(window, 'history', {
      configurable: true,
      value: { length: 2 },
    })
    jest.mocked(beginProductRouteViewTransition).mockReturnValue(Promise.resolve())
  })

  describe('When view transitions are unavailable', () => {
    it('Then it navigates back without preparing the transition', () => {
      navigateBackFromProductDetail(router, 'SMG-S24U')

      expect(setReturningProductId).not.toHaveBeenCalled()
      expect(router.back).toHaveBeenCalled()
    })
  })

  describe('When view transitions are available', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value: jest.fn((update) => {
          void update()
          return {
            ready: Promise.resolve(),
            finished: Promise.resolve(),
          }
        }),
      })
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: jest.fn().mockReturnValue({ matches: false }),
      })
    })

    it('Then it prepares the product route and navigates back', () => {
      navigateBackFromProductDetail(router, 'SMG-S24U')

      expect(setReturningProductId).toHaveBeenCalledWith('SMG-S24U')
      expect(beginProductRouteViewTransition).toHaveBeenCalledWith('SMG-S24U')
      expect(document.documentElement.classList.contains(PRODUCT_ROUTE_CLASS)).toBe(true)
      expect(document.startViewTransition).toHaveBeenCalled()
      expect(router.back).toHaveBeenCalled()
    })

    it('Then it clears transition classes when finished', async () => {
      navigateBackFromProductDetail(router, 'SMG-S24U')

      await Promise.resolve()

      expect(document.documentElement.classList.contains(PRODUCT_ROUTE_CLASS)).toBe(false)
      expect(document.documentElement.classList.contains(PRODUCT_ROUTE_READY_CLASS)).toBe(false)
      expect(setReturningProductId).toHaveBeenLastCalledWith(null)
    })

    it('Then it falls back to push when there is no history', () => {
      Object.defineProperty(window, 'history', {
        configurable: true,
        value: { length: 1 },
      })

      navigateBackFromProductDetail(router, 'SMG-S24U', '/products')

      expect(router.push).toHaveBeenCalledWith('/products')
      expect(router.back).not.toHaveBeenCalled()
    })
  })
})
