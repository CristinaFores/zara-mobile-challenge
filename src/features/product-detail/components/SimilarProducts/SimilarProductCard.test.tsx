import { render, screen } from '@testing-library/react'

import { ROUTES } from '@/shared/constants'
import { productListFixture } from '@/test-utils/fixtures/products.fixtures'

import { SimilarProductCard } from './SimilarProductCard'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}))

jest.mock('@/shared/store/productNavigation', () => ({
  beginProductRouteViewTransition: jest.fn(() => Promise.resolve()),
  getProductDetailHref: (id: string) => `/products/${id}`,
  getProductViewTransitionName: (id: string, part: string) => `product-${part}-${id}`,
  scrollToProductDetailTop: jest.fn(),
  setProductPreview: jest.fn(),
}))

jest.mock('@/shared/components/ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

const [product] = productListFixture

describe('Given a SimilarProductCard', () => {
  describe('When rendered with a product', () => {
    beforeEach(() => render(<SimilarProductCard {...product} />))

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

    it('Then it renders the product image', () => {
      expect(
        screen.getByRole('img', { name: `${product.brand} ${product.name}` })
      ).toBeInTheDocument()
    })
  })
})
