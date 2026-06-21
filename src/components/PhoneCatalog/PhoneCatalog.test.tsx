import { render, screen } from '@testing-library/react'

import { phoneListFixture } from '@/__mocks__/phones.fixtures'

import { PhoneCatalog } from './PhoneCatalog'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('../ProductCard/ProductCard', () => ({
  ProductCard: ({ name }: { name: string }) => <li>{name}</li>,
}))

describe('Given a PhoneCatalog', () => {
  describe('When rendered with phones', () => {
    beforeEach(() => render(<PhoneCatalog phones={phoneListFixture} />))

    it('Then it renders the search box', () => {
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('Then it renders the result count for all phones', () => {
      expect(screen.getByText(`${phoneListFixture.length} results`)).toBeInTheDocument()
    })

    it('Then it renders one item per phone', () => {
      expect(screen.getAllByRole('listitem')).toHaveLength(phoneListFixture.length)
    })
  })

  describe('When an initial search is provided', () => {
    it('Then it pre-filters the list', () => {
      render(<PhoneCatalog phones={phoneListFixture} initialSearch="apple" />)

      const appleCount = phoneListFixture.filter((phone) => phone.brand === 'Apple').length
      expect(
        screen.getByText(`${appleCount} result${appleCount === 1 ? '' : 's'}`)
      ).toBeInTheDocument()
    })
  })
})
