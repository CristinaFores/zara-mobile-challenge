import { render, screen } from '@testing-library/react'

import { productDetailFixture } from '@/test-utils/fixtures/products.fixtures'

import ProductDetailPage, { generateMetadata } from './page'

jest.mock('@/shared/lib/loadProduct', () => ({
  loadProductDetail: jest.fn().mockResolvedValue(productDetailFixture),
  buildProductDetailMetadata: jest.fn().mockReturnValue({
    title: 'Galaxy S24 Ultra | Mobile Catalog',
    description: productDetailFixture.description,
  }),
}))

jest.mock('@/features/product-detail/components/ProductDetail/ProductDetailView', () => ({
  ProductDetailView: ({ product }: { product: { name: string } }) => (
    <main data-testid="product-detail-view">{product.name}</main>
  ),
}))

const params = Promise.resolve({ id: productDetailFixture.id })

describe('Given ProductDetailPage', () => {
  describe('When rendered with a valid product id', () => {
    it('Then it renders ProductDetailView with the product data', async () => {
      const jsx = await ProductDetailPage({ params })
      render(jsx)
      expect(screen.getByTestId('product-detail-view')).toBeInTheDocument()
      expect(screen.getByText(productDetailFixture.name)).toBeInTheDocument()
    })

    it('Then it calls loadProductDetail with the correct id', async () => {
      const { loadProductDetail } = jest.requireMock('@/shared/lib/loadProduct') as {
        loadProductDetail: jest.Mock
      }
      await ProductDetailPage({ params })
      expect(loadProductDetail).toHaveBeenCalledWith(productDetailFixture.id)
    })
  })

  describe('When generateMetadata is called', () => {
    it('Then it returns metadata built from the product detail', async () => {
      const metadata = await generateMetadata({ params })
      expect(metadata).toEqual({
        title: 'Galaxy S24 Ultra | Mobile Catalog',
        description: productDetailFixture.description,
      })
    })

    it('Then it calls loadProductDetail with the correct id', async () => {
      const { loadProductDetail } = jest.requireMock('@/shared/lib/loadProduct') as {
        loadProductDetail: jest.Mock
      }
      loadProductDetail.mockClear()
      await generateMetadata({ params })
      expect(loadProductDetail).toHaveBeenCalledWith(productDetailFixture.id)
    })
  })
})
