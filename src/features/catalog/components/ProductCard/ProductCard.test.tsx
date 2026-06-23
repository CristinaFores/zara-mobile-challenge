import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard'
import { ROUTES } from '@/shared/constants'
import {
  beginProductRouteViewTransition,
  setProductPreview,
} from '@/shared/store/productNavigation'
import { productListFixture } from '@/test-utils/fixtures/products.fixtures'

const pushMock = jest.fn()
const prefetchMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, prefetch: prefetchMock }),
  usePathname: () => '/',
}))

jest.mock('@/shared/store/productNavigation', () => ({
  beginProductRouteViewTransition: jest.fn(() => Promise.resolve()),
  getProductDetailHref: (id: string) => `/products/${id}`,
  getProductViewTransitionName: (id: string) => `product-image-${id}`,
  scrollToProductDetailTop: jest.fn(),
  setProductPreview: jest.fn(),
  resolveProductRouteViewTransition: jest.fn(),
  useReturningProductTransitionTarget: jest.fn(() => false),
}))

jest.mock('@/shared/components/ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) => <span data-testid="product-image" aria-label={alt} />,
}))

const [product] = productListFixture

describe('Given a ProductCard', () => {
  describe('When rendered with a product', () => {
    beforeEach(() => render(<ProductCard {...product} />))

    it('Then it links to the product detail page', () => {
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `${ROUTES.PRODUCT_DETAIL}/${product.id}`
      )
    })

    it('Then it has an accessible label with brand, name and price', () => {
      expect(
        screen.getByRole('link', {
          name: `${product.brand} ${product.name}, ${product.basePrice} EUR`,
        })
      ).toBeInTheDocument()
    })

    it('Then it renders the brand', () => {
      expect(screen.getByText(product.brand)).toBeInTheDocument()
    })

    it('Then it renders the model name', () => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })

    it('Then it renders the price with EUR suffix', () => {
      expect(screen.getByText(`${product.basePrice} EUR`)).toBeInTheDocument()
    })

    it('Then it renders the product image', () => {
      expect(screen.getByTestId('product-image')).toBeInTheDocument()
    })
  })

  describe('When the card link is clicked', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value: jest.fn((callback: () => void | Promise<void>) => {
          void callback()
          return {
            ready: Promise.resolve(),
            finished: Promise.resolve(),
          }
        }),
      })
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
      render(<ProductCard {...product} />)
    })

    it('Then it stores the preview and starts the route view transition', async () => {
      await userEvent.click(screen.getByRole('link'))

      expect(setProductPreview).toHaveBeenCalledWith({
        id: product.id,
        brand: product.brand,
        name: product.name,
        basePrice: product.basePrice,
        imageUrl: product.imageUrl,
        href: `${ROUTES.PRODUCT_DETAIL}/${product.id}`,
      })
      expect(beginProductRouteViewTransition).toHaveBeenCalledWith(product.id)
    })
  })

  describe('When view transitions are unavailable', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value: undefined,
      })
      globalThis.matchMedia = jest.fn().mockImplementation(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
      render(<ProductCard {...product} />)
    })

    it('Then it stores the preview without starting a route transition', async () => {
      await userEvent.click(screen.getByRole('link'))

      expect(setProductPreview).toHaveBeenCalled()
      expect(beginProductRouteViewTransition).not.toHaveBeenCalled()
    })
  })
})
