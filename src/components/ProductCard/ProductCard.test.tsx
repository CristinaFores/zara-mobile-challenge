import { render, screen } from '@testing-library/react'

import { ROUTES } from '@/constants'
import { phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'

import { ProductCard } from './ProductCard'

jest.mock('../ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) => <span data-testid="product-image" aria-label={alt} />,
}))

const [phone] = phoneListFixture

describe('Given a ProductCard', () => {
  describe('When rendered with a phone', () => {
    beforeEach(() => render(<ProductCard {...phone} />))

    it('Then it links to the phone detail page', () => {
      expect(screen.getByRole('link')).toHaveAttribute('href', `${ROUTES.PHONE_DETAIL}/${phone.id}`)
    })

    it('Then it has an accessible label with brand, name and price', () => {
      expect(
        screen.getByRole('link', { name: `${phone.brand} ${phone.name}, ${phone.basePrice} EUR` })
      ).toBeInTheDocument()
    })

    it('Then it renders the brand', () => {
      expect(screen.getByText(phone.brand)).toBeInTheDocument()
    })

    it('Then it renders the model name', () => {
      expect(screen.getByText(phone.name)).toBeInTheDocument()
    })

    it('Then it renders the price with EUR suffix', () => {
      expect(screen.getByText(`${phone.basePrice} EUR`)).toBeInTheDocument()
    })

    it('Then it renders the product image', () => {
      expect(screen.getByTestId('product-image')).toBeInTheDocument()
    })
  })
})
