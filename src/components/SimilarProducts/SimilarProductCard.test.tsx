import { render, screen } from '@testing-library/react'

import { ROUTES } from '@/constants'
import { phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'

import { SimilarProductCard } from './SimilarProductCard'

jest.mock('@/components/ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

const [phone] = phoneListFixture

describe('Given a SimilarProductCard', () => {
  describe('When rendered with a phone', () => {
    beforeEach(() => render(<SimilarProductCard {...phone} />))

    it('Then it links to the phone detail page', () => {
      expect(screen.getByRole('link')).toHaveAttribute('href', `${ROUTES.PHONE_DETAIL}/${phone.id}`)
    })

    it('Then it has an accessible label with brand, name and price', () => {
      expect(
        screen.getByRole('link', { name: `${phone.brand} ${phone.name}, ${phone.basePrice} EUR` })
      ).toBeInTheDocument()
    })

    it('Then it renders the product image', () => {
      expect(screen.getByRole('img', { name: `${phone.brand} ${phone.name}` })).toBeInTheDocument()
    })
  })
})
