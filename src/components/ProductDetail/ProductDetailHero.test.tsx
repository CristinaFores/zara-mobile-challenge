import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { phoneDetailFixture } from '@/__mocks__/phones.fixtures'

import { ProductDetailHero } from './ProductDetailHero'

const mockHandleAddToCart = jest.fn()
const mockSetSelectedStorage = jest.fn()
const mockSetSelectedColor = jest.fn()

let mockCanAddToCart = false

jest.mock('./useProductSelection', () => ({
  useProductSelection: () => ({
    imageUrl: 'https://example.com/image.webp',
    priceLabel: mockCanAddToCart ? '1449 EUR' : '1329 EUR',
    selectedColor: null,
    setSelectedColor: mockSetSelectedColor,
    selectedStorage: null,
    setSelectedStorage: mockSetSelectedStorage,
    canAddToCart: mockCanAddToCart,
    handleAddToCart: mockHandleAddToCart,
  }),
}))

jest.mock('./useImageCrossfade', () => ({
  useImageCrossfade: () => [
    {
      url: 'https://example.com/image.webp',
      zIndex: 2,
      opacity: 1,
      transition: 'none',
      onLoad: jest.fn(),
    },
    {
      url: 'https://example.com/image.webp',
      zIndex: 1,
      opacity: 0,
      transition: 'none',
      onLoad: jest.fn(),
    },
  ],
}))

jest.mock('@/hooks/useTextCrossfade', () => ({
  useTextCrossfade: (text: string) => [
    { text, isActive: true },
    { text: '', isActive: false },
  ],
}))

jest.mock('@/components/ColorSelector/ColorSelector', () => ({
  ColorSelector: () => <div data-testid="color-selector" />,
}))

jest.mock('@/components/StorageSelector/StorageSelector', () => ({
  StorageSelector: () => <div data-testid="storage-selector" />,
}))

jest.mock('@/components/ProductImage/ProductImage', () => ({
  ProductImage: ({ alt }: { alt: string }) => <span data-testid="product-image" aria-label={alt} />,
}))

jest.mock('@/components/UI/Button/Button', () => ({
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
    it('Then it renders the phone name', () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      expect(screen.getByText(phoneDetailFixture.name)).toBeInTheDocument()
    })

    it('Then it renders the price label', () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      expect(screen.getByText('1329 EUR')).toBeInTheDocument()
    })

    it('Then it renders two image slots', () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      expect(screen.getAllByTestId('product-image')).toHaveLength(2)
    })

    it('Then it renders the color selector', () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      expect(screen.getByTestId('color-selector')).toBeInTheDocument()
    })

    it('Then it renders the storage selector', () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      expect(screen.getByTestId('storage-selector')).toBeInTheDocument()
    })

    it('Then the section has an accessible label with brand and name', () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      expect(
        screen.getByRole('region', {
          name: `${phoneDetailFixture.brand} ${phoneDetailFixture.name}`,
        })
      ).toBeInTheDocument()
    })
  })

  describe('When canAddToCart is false', () => {
    it('Then the Add button is disabled', () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
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
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('Then clicking Add calls handleAddToCart', async () => {
      render(<ProductDetailHero phone={phoneDetailFixture} />)
      await userEvent.click(screen.getByRole('button'))
      expect(mockHandleAddToCart).toHaveBeenCalledTimes(1)
    })
  })
})
