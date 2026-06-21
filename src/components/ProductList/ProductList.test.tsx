import { render, screen } from '@testing-library/react'

import { phoneListFixture } from '@/__mocks__/phones.fixtures'

import { ProductList } from './ProductList'

jest.mock('../ProductCard/ProductCard', () => ({
  ProductCard: ({ name }: { name: string }) => <li>{name}</li>,
}))

describe('Given a ProductList', () => {
  describe('When rendered with a list of phones', () => {
    beforeEach(() => render(<ProductList phones={phoneListFixture} />))

    it('Then it renders a list with an accessible label', () => {
      expect(screen.getByRole('list', { name: /phones catalog/i })).toBeInTheDocument()
    })

    it('Then it renders one item per phone', () => {
      expect(screen.getAllByRole('listitem')).toHaveLength(phoneListFixture.length)
    })

    it('Then it renders each phone name', () => {
      phoneListFixture.forEach(({ name }) => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })
  })

  describe('When rendered with an empty list', () => {
    it('Then it renders an empty list', () => {
      render(<ProductList phones={[]} />)
      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })
  })
})
