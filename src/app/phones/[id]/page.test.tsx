import { render, screen } from '@testing-library/react'

import { phoneDetailFixture } from '@/test-utils/fixtures/phones.fixtures'

import PhoneDetailPage, { generateMetadata } from './page'

jest.mock('@/shared/lib/loadPhone', () => ({
  loadPhoneDetail: jest.fn().mockResolvedValue(phoneDetailFixture),
  buildPhoneDetailMetadata: jest.fn().mockReturnValue({
    title: 'Galaxy S24 Ultra | Mobile Catalog',
    description: phoneDetailFixture.description,
  }),
}))

jest.mock('@/features/product-detail/components/ProductDetail/PhoneDetailView', () => ({
  PhoneDetailView: ({ phone }: { phone: { name: string } }) => (
    <main data-testid="phone-detail-view">{phone.name}</main>
  ),
}))

const params = Promise.resolve({ id: phoneDetailFixture.id })

describe('Given PhoneDetailPage', () => {
  describe('When rendered with a valid phone id', () => {
    it('Then it renders PhoneDetailView with the phone data', async () => {
      const jsx = await PhoneDetailPage({ params })
      render(jsx)
      expect(screen.getByTestId('phone-detail-view')).toBeInTheDocument()
      expect(screen.getByText(phoneDetailFixture.name)).toBeInTheDocument()
    })

    it('Then it calls loadPhoneDetail with the correct id', async () => {
      const { loadPhoneDetail } = jest.requireMock('@/shared/lib/loadPhone') as {
        loadPhoneDetail: jest.Mock
      }
      await PhoneDetailPage({ params })
      expect(loadPhoneDetail).toHaveBeenCalledWith(phoneDetailFixture.id)
    })
  })

  describe('When generateMetadata is called', () => {
    it('Then it returns metadata built from the phone detail', async () => {
      const metadata = await generateMetadata({ params })
      expect(metadata).toEqual({
        title: 'Galaxy S24 Ultra | Mobile Catalog',
        description: phoneDetailFixture.description,
      })
    })

    it('Then it calls loadPhoneDetail with the correct id', async () => {
      const { loadPhoneDetail } = jest.requireMock('@/shared/lib/loadPhone') as {
        loadPhoneDetail: jest.Mock
      }
      loadPhoneDetail.mockClear()
      await generateMetadata({ params })
      expect(loadPhoneDetail).toHaveBeenCalledWith(phoneDetailFixture.id)
    })
  })
})
