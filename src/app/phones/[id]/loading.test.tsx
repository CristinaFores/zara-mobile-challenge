import { render, screen } from '@testing-library/react'

import * as productNavigation from '@/shared/store/productNavigation'
import { phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'

import PhoneDetailLoading from './loading'

const [phone] = phoneListFixture
const productId = phone.id

const useParamsMock = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
}))

jest.mock('@/shared/components/BackLink/BackLink', () => ({
  BackLink: ({ href }: { href: string }) => <a href={href}>Back</a>,
}))

jest.mock('@/shared/components/ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

describe('Given PhoneDetailLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useParamsMock.mockReturnValue({ id: productId })
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {})
    productNavigation.setProductPreview({
      id: 'preview-reset',
      brand: phone.brand,
      name: phone.name,
      basePrice: phone.basePrice,
      imageUrl: phone.imageUrl,
      href: productNavigation.getProductDetailHref('preview-reset'),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('When a matching product preview exists', () => {
    beforeEach(() => {
      productNavigation.setProductPreview({
        id: phone.id,
        brand: phone.brand,
        name: phone.name,
        basePrice: phone.basePrice,
        imageUrl: phone.imageUrl,
        href: productNavigation.getProductDetailHref(phone.id),
      })
      render(<PhoneDetailLoading />)
    })

    it('Then it renders the preview image', () => {
      expect(screen.getByRole('img', { name: `${phone.brand} ${phone.name}` })).toBeInTheDocument()
    })

    it('Then it scrolls to the top of the page', () => {
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 })
    })
  })

  describe('When no preview is available', () => {
    beforeEach(() => {
      render(<PhoneDetailLoading />)
    })

    it('Then it renders the loading skeleton without a preview image', () => {
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: /loading product/i })).toBeInTheDocument()
    })
  })

  describe('When the preview href does not match the route', () => {
    beforeEach(() => {
      productNavigation.setProductPreview({
        id: phone.id,
        brand: phone.brand,
        name: phone.name,
        basePrice: phone.basePrice,
        imageUrl: phone.imageUrl,
        href: productNavigation.getProductDetailHref('other-id'),
      })
      render(<PhoneDetailLoading />)
    })

    it('Then it ignores the preview and shows the skeleton', () => {
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: /loading product/i })).toBeInTheDocument()
    })
  })
})
