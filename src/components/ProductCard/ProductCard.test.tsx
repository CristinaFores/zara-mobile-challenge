import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ROUTES } from '@/constants'
import { beginProductRouteViewTransition, setProductPreview } from '@/store/productNavigation'
import { phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'

import { ProductCard } from './ProductCard'

const pushMock = jest.fn()
const prefetchMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, prefetch: prefetchMock }),
}))

jest.mock('@/store/productNavigation', () => ({
  beginProductRouteViewTransition: jest.fn(() => Promise.resolve()),
  getProductDetailHref: (id: string) => `/phones/${id}`,
  getProductViewTransitionName: (id: string, part: string) => `product-${part}-${id}`,
  scrollToProductDetailTop: jest.fn(),
  setProductPreview: jest.fn(),
}))

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

  describe('When the card link is clicked', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value: jest.fn((callback: () => void | Promise<void>) => {
          void callback()
          return {
            ready: Promise.resolve(),
            finished: Promise.resolve(),
          }
        }),
      })
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
      render(<ProductCard {...phone} />)
    })

    it('Then it stores the preview and starts the route view transition', async () => {
      await userEvent.click(screen.getByRole('link'))

      expect(setProductPreview).toHaveBeenCalledWith({
        id: phone.id,
        brand: phone.brand,
        name: phone.name,
        basePrice: phone.basePrice,
        imageUrl: phone.imageUrl,
        href: `${ROUTES.PHONE_DETAIL}/${phone.id}`,
      })
      expect(beginProductRouteViewTransition).toHaveBeenCalledWith(phone.id)
    })
  })
})
