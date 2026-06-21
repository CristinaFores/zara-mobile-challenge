import { render, screen } from '@testing-library/react'

import { phoneDetailFixture } from '@/__mocks__/phones.fixtures'

import { SimilarProducts } from './SimilarProducts'

jest.mock('@/components/ProductCard/ProductCard', () => ({
  ProductCard: ({ name }: { name: string }) => <li>{name}</li>,
}))

const products = phoneDetailFixture.similarProducts

describe('Given SimilarProducts', () => {
  describe('When the products array is empty', () => {
    it('Then it renders nothing', () => {
      const { container } = render(<SimilarProducts products={[]} />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('When products are provided', () => {
    beforeEach(() => render(<SimilarProducts products={products} />))

    it('Then it renders the "Similar items" section', () => {
      expect(screen.getByRole('region', { name: /similar items/i })).toBeInTheDocument()
    })

    it('Then it renders one card per product', () => {
      expect(screen.getAllByRole('listitem')).toHaveLength(products.length)
    })

    it('Then each product name is visible', () => {
      products.forEach((p) => expect(screen.getByText(p.name)).toBeInTheDocument())
    })
  })
})
