import { render, screen } from '@testing-library/react'

import { productListFixture } from '@/test-utils/fixtures/products.fixtures'

import Home from './page'

jest.mock('@/shared/services/products.service', () => ({
  getProducts: jest.fn(),
}))

jest.mock('@/features/catalog/components/ProductCatalog/ProductCatalog', () => ({
  ProductCatalog: ({
    products,
    initialSearch,
  }: {
    products: readonly unknown[]
    initialSearch?: string
  }) => (
    <div data-testid="product-catalog" data-initial-search={initialSearch ?? ''}>
      {products.length} products
    </div>
  ),
}))

const { getProducts } = jest.requireMock('@/shared/services/products.service') as {
  getProducts: jest.Mock
}

describe('Given Home', () => {
  beforeEach(() => {
    getProducts.mockResolvedValue(productListFixture)
  })

  describe('When rendered without search params', () => {
    it('Then it loads the catalog and passes an empty initialSearch', async () => {
      const jsx = await Home({ searchParams: Promise.resolve({}) })
      render(jsx)

      expect(getProducts).toHaveBeenCalledWith(undefined)
      expect(screen.getByTestId('product-catalog')).toHaveAttribute('data-initial-search', '')
      expect(screen.getByText(`${productListFixture.length} products`)).toBeInTheDocument()
    })
  })

  describe('When rendered with a search param', () => {
    it('Then it fetches filtered products and forwards the query to ProductCatalog', async () => {
      const filtered = [productListFixture[0]]
      getProducts.mockResolvedValue(filtered)

      const jsx = await Home({ searchParams: Promise.resolve({ search: 'samsung' }) })
      render(jsx)

      expect(getProducts).toHaveBeenCalledWith('samsung')
      expect(screen.getByTestId('product-catalog')).toHaveAttribute(
        'data-initial-search',
        'samsung'
      )
      expect(screen.getByText('1 products')).toBeInTheDocument()
    })
  })
})
