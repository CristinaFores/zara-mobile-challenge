import { render, screen } from '@testing-library/react'

import { phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'

import Home from './page'

jest.mock('@/shared/services/phones.service', () => ({
  getPhones: jest.fn(),
}))

jest.mock('@/features/catalog/components/PhoneCatalog/PhoneCatalog', () => ({
  PhoneCatalog: ({
    phones,
    initialSearch,
  }: {
    phones: readonly unknown[]
    initialSearch?: string
  }) => (
    <div data-testid="phone-catalog" data-initial-search={initialSearch ?? ''}>
      {phones.length} phones
    </div>
  ),
}))

const { getPhones } = jest.requireMock('@/shared/services/phones.service') as {
  getPhones: jest.Mock
}

describe('Given Home', () => {
  beforeEach(() => {
    getPhones.mockResolvedValue(phoneListFixture)
  })

  describe('When rendered without search params', () => {
    it('Then it loads the catalog and passes an empty initialSearch', async () => {
      const jsx = await Home({ searchParams: Promise.resolve({}) })
      render(jsx)

      expect(getPhones).toHaveBeenCalledWith(undefined)
      expect(screen.getByTestId('phone-catalog')).toHaveAttribute('data-initial-search', '')
      expect(screen.getByText(`${phoneListFixture.length} phones`)).toBeInTheDocument()
    })
  })

  describe('When rendered with a search param', () => {
    it('Then it fetches filtered phones and forwards the query to PhoneCatalog', async () => {
      const filtered = [phoneListFixture[0]]
      getPhones.mockResolvedValue(filtered)

      const jsx = await Home({ searchParams: Promise.resolve({ search: 'samsung' }) })
      render(jsx)

      expect(getPhones).toHaveBeenCalledWith('samsung')
      expect(screen.getByTestId('phone-catalog')).toHaveAttribute('data-initial-search', 'samsung')
      expect(screen.getByText('1 phones')).toBeInTheDocument()
    })
  })
})
