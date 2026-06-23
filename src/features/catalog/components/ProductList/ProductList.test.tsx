import { render, screen } from '@testing-library/react'

import { productListFixture } from '@/test-utils/fixtures/products.fixtures'

import { ProductList } from './ProductList'

jest.mock('../ProductCard/ProductCard', () => ({
  ProductCard: ({ name }: { name: string }) => <li>{name}</li>,
}))

describe('Given a ProductList', () => {
  describe('When rendered with a list of products', () => {
    beforeEach(() => render(<ProductList products={productListFixture} />))

    it('Then it renders a list with an accessible label', () => {
      expect(screen.getByRole('list', { name: /products catalog/i })).toBeInTheDocument()
    })

    it('Then it renders one item per product', () => {
      expect(screen.getAllByRole('listitem')).toHaveLength(productListFixture.length)
    })

    it('Then it renders each product name', () => {
      productListFixture.forEach(({ name }) => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })
  })

  describe('When rendered with an empty list', () => {
    it('Then it renders an empty list', () => {
      render(<ProductList products={[]} />)
      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })
  })
})
