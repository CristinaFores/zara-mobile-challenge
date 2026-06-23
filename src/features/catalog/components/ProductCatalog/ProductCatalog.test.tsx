import { render, screen } from '@testing-library/react'

import { productListFixture } from '@/test-utils/fixtures/products.fixtures'

import { ProductCatalog } from './ProductCatalog'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('../ProductCard/ProductCard', () => ({
  ProductCard: ({ name }: { name: string }) => <li>{name}</li>,
}))

describe('Given a ProductCatalog', () => {
  describe('When rendered with products', () => {
    beforeEach(() => render(<ProductCatalog products={productListFixture} />))

    it('Then it renders the search box', () => {
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('Then it renders the result count for all products', () => {
      expect(screen.getByText(`${productListFixture.length} results`)).toBeInTheDocument()
    })

    it('Then it renders one item per product', () => {
      expect(screen.getAllByRole('listitem')).toHaveLength(productListFixture.length)
    })
  })

  describe('When an initial search is provided', () => {
    it('Then it shows the count for the products the server already filtered — not a local re-filter', () => {
      const appleProducts = productListFixture.filter((product) => product.brand === 'Apple')
      render(<ProductCatalog products={appleProducts} initialSearch="apple" />)

      expect(
        screen.getByText(`${appleProducts.length} result${appleProducts.length === 1 ? '' : 's'}`)
      ).toBeInTheDocument()
    })

    it('Then it shows an empty search message when the server returns no matches', () => {
      render(<ProductCatalog products={[]} initialSearch="zzzznonexistentphone" />)

      expect(screen.getByText('No smartphones match your search.')).toBeInTheDocument()
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })
  })
})
