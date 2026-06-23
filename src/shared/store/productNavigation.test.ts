import { act, renderHook } from '@testing-library/react'

import { ROUTES } from '@/shared/constants'
import {
  beginProductRouteViewTransition,
  getProductDetailHref,
  getProductViewTransitionName,
  resolveProductRouteViewTransition,
  scrollToProductDetailTop,
  setProductPreview,
  useProductPreview,
} from '@/shared/store/productNavigation'
import { productListFixture } from '@/test-utils/fixtures/products.fixtures'

describe('Given productNavigation', () => {
  describe('When getProductDetailHref is called', () => {
    it('Then it returns the product detail route', () => {
      expect(getProductDetailHref('SMG-S24U')).toBe(`${ROUTES.PRODUCT_DETAIL}/SMG-S24U`)
    })
  })

  describe('When getProductViewTransitionName is called', () => {
    it('Then it returns a safe view-transition name for the part', () => {
      expect(getProductViewTransitionName('SMG/S24U', 'image')).toBe('product-image-SMG-S24U')
    })
  })

  describe('When scrollToProductDetailTop is called', () => {
    it('Then it scrolls the window to the top', () => {
      const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {})

      scrollToProductDetailTop()

      expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 })
      scrollTo.mockRestore()
    })
  })

  describe('When a product preview is stored', () => {
    const [product] = productListFixture

    it('Then useProductPreview returns it for the matching product id', () => {
      const preview = {
        id: product.id,
        brand: product.brand,
        name: product.name,
        basePrice: product.basePrice,
        imageUrl: product.imageUrl,
        href: getProductDetailHref(product.id),
      }

      setProductPreview(preview)

      const { result } = renderHook(() => useProductPreview(product.id))

      expect(result.current).toEqual(preview)
    })

    it('Then useProductPreview returns null for a different product id', () => {
      const preview = {
        id: product.id,
        brand: product.brand,
        name: product.name,
        basePrice: product.basePrice,
        imageUrl: product.imageUrl,
        href: getProductDetailHref(product.id),
      }

      setProductPreview(preview)

      const { result } = renderHook(() => useProductPreview('other-id'))

      expect(result.current).toBeNull()
    })
  })

  describe('When a route view transition begins', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('Then it resolves when the destination reports ready', async () => {
      const transition = beginProductRouteViewTransition('SMG-S24U')

      await act(async () => {
        resolveProductRouteViewTransition('SMG-S24U')
        await transition
      })

      await expect(transition).resolves.toBeUndefined()
    })

    it('Then it resolves after the safety timeout', async () => {
      const transition = beginProductRouteViewTransition('SMG-S24U')

      await act(async () => {
        jest.advanceTimersByTime(700)
        await transition
      })

      await expect(transition).resolves.toBeUndefined()
    })

    it('Then resolve ignores a mismatched product id', async () => {
      const transition = beginProductRouteViewTransition('SMG-S24U')

      resolveProductRouteViewTransition('other-id')

      await act(async () => {
        jest.advanceTimersByTime(700)
        await transition
      })

      await expect(transition).resolves.toBeUndefined()
    })
  })
})
