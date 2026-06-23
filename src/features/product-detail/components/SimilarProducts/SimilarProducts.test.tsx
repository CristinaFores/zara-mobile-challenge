import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { productDetailFixture } from '@/test-utils/fixtures/products.fixtures'

import { SimilarProducts } from './SimilarProducts'

jest.mock('@/shared/components/ui/ScrollRow/ScrollRow', () => ({
  ScrollRow: ({
    children,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode
    'aria-label'?: string
  }) => <ul aria-label={ariaLabel}>{children}</ul>,
}))

jest.mock('./SimilarProductCard', () => ({
  SimilarProductCard: ({ name }: { name: string }) => <li>{name}</li>,
}))

const products = productDetailFixture.similarProducts

describe('Given SimilarProducts', () => {
  describe('When the products array is empty', () => {
    it('Then it renders nothing', () => {
      const { container } = render(<SimilarProducts products={[]} />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('When products are provided', () => {
    beforeEach(() => render(<SimilarProducts products={products} />))

    it('Then it renders the "Similar items" section', () => {
      expect(screen.getByRole('region', { name: /similar items/i })).toBeInTheDocument()
    })

    it('Then it renders one card per product', () => {
      expect(screen.getAllByRole('listitem')).toHaveLength(products.length)
    })

    it('Then each product name is visible', () => {
      products.forEach((p) => expect(screen.getByText(p.name)).toBeInTheDocument())
    })
  })

  describe('When the current product id is provided', () => {
    it('Then it excludes the current product from the carousel', () => {
      render(<SimilarProducts products={products} currentProductId={products[0].id} />)

      expect(screen.getAllByRole('listitem')).toHaveLength(products.length - 1)
      expect(screen.queryByText(products[0].name)).not.toBeInTheDocument()
    })
  })
})
