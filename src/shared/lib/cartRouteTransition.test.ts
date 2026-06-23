import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { CART_ROUTE_CLASS, navigateToCart } from './cartRouteTransition'

function createRouter(): AppRouterInstance {
  return { push: jest.fn() } as unknown as AppRouterInstance
}

describe('Given navigateToCart', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    window.scrollTo = jest.fn()
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: jest.fn((update: () => void | Promise<void>) => {
        void update()
        return { finished: Promise.resolve() }
      }),
    })
    globalThis.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  describe('When navigating from a product detail page', () => {
    it('Then it runs the pre-navigation callback inside the view transition update', async () => {
      const router = createRouter()
      const gallery = document.createElement('div')
      gallery.style.viewTransitionName = 'product-image-test'
      document.body.appendChild(gallery)
      const onBeforeNavigate = jest.fn()

      navigateToCart(router, '/cart', onBeforeNavigate)

      expect(onBeforeNavigate).toHaveBeenCalled()
      expect(document.startViewTransition).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/cart')
      expect(gallery.style.viewTransitionName).toBe('none')

      await Promise.resolve()

      expect(document.documentElement.classList.contains(CART_ROUTE_CLASS)).toBe(false)
    })
  })
})
