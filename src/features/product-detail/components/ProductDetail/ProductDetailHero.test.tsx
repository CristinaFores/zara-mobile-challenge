import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { productDetailFixture } from '@/test-utils/fixtures/products.fixtures'

import { ProductDetailHero } from './ProductDetailHero'

const mockHandleAddToCart = jest.fn()
const mockSetSelectedStorage = jest.fn()
const mockSetSelectedColor = jest.fn()

let mockCanAddToCart = false

jest.mock('@/features/product-detail/hooks/useAfterProductRouteTransition', () => ({
  useAfterProductRouteTransition: () => true,
}))

jest.mock('../../hooks/useProductSelection', () => ({
  useProductSelection: () => ({
    imageUrl:
      'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp',
    priceLabel: mockCanAddToCart ? '1449 EUR' : '1329 EUR',
    selectedColor: null,
    setSelectedColor: mockSetSelectedColor,
    selectedStorage: null,
    setSelectedStorage: mockSetSelectedStorage,
    canAddToCart: mockCanAddToCart,
    handleAddToCart: mockHandleAddToCart,
  }),
}))

jest.mock('@/shared/hooks/useTextCrossfade', () => ({
  useTextCrossfade: (text: string) => [
    { text, isActive: true },
    { text: '', isActive: false },
  ],
}))

jest.mock('@/features/product-detail/components/ColorSelector/ColorSelector', () => ({
  ColorSelector: () => <div data-testid="color-selector" />,
}))

jest.mock('@/features/product-detail/components/StorageSelector/StorageSelector', () => ({
  StorageSelector: () => <div data-testid="storage-selector" />,
}))

jest.mock('@/shared/components/ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) =>
    alt ? <span role="img" aria-label={alt} /> : <span aria-hidden="true" />,
}))

jest.mock('@/shared/components/ui/Button/Button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    disabled?: boolean
    onClick?: () => void
    'aria-label'?: string
  }) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}))

describe('Given ProductDetailHero', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('When rendered', () => {
    it('Then it renders the product name', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(screen.getByText(productDetailFixture.name)).toBeInTheDocument()
    })

    it('Then it renders the price label', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(screen.getByText('1329 EUR')).toBeInTheDocument()
    })

    it('Then it renders the hero image', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(
        screen.getByRole('img', {
          name: `${productDetailFixture.brand} ${productDetailFixture.name}`,
        })
      ).toBeInTheDocument()
    })

    it('Then it renders the color selector', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(screen.getByTestId('color-selector')).toBeInTheDocument()
    })

    it('Then it renders the storage selector', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(screen.getByTestId('storage-selector')).toBeInTheDocument()
    })

    it('Then the section has an accessible label with brand and name', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(
        screen.getByRole('region', {
          name: `${productDetailFixture.brand} ${productDetailFixture.name}`,
        })
      ).toBeInTheDocument()
    })
  })

  describe('When canAddToCart is false', () => {
    it('Then the Add button is disabled', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('When canAddToCart is true', () => {
    beforeEach(() => {
      mockCanAddToCart = true
    })

    afterEach(() => {
      mockCanAddToCart = false
    })

    it('Then the Add button is enabled', () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('Then clicking Add calls handleAddToCart', async () => {
      render(<ProductDetailHero product={productDetailFixture} />)
      await userEvent.click(screen.getByRole('button'))
      expect(mockHandleAddToCart).toHaveBeenCalledTimes(1)
    })
  })
})
