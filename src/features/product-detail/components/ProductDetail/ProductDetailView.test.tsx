import { render, screen } from '@testing-library/react'

import { productDetailFixture } from '@/test-utils/fixtures/products.fixtures'

import { ProductDetailView } from './ProductDetailView'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('./ProductDetailHero', () => ({
  ProductDetailHero: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}))

jest.mock('@/features/product-detail/components/SpecsTable/SpecsTable', () => ({
  SpecsTable: ({ rows }: { rows: { label: string; value: string }[] }) => (
    <ul>
      {rows.map((r) => (
        <li key={r.label}>
          {r.label}: {r.value}
        </li>
      ))}
    </ul>
  ),
}))

jest.mock('@/features/product-detail/components/SimilarProducts/SimilarProducts', () => ({
  SimilarProducts: ({ products }: { products: { name: string }[] }) => (
    <div>{products.map((p) => p.name).join(', ')}</div>
  ),
}))

describe('Given ProductDetailView', () => {
  beforeEach(() => render(<ProductDetailView product={productDetailFixture} />))

  it('Then it renders the back link to the catalog', () => {
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })

  it('Then it renders the product name via the hero', () => {
    expect(screen.getByText(productDetailFixture.name)).toBeInTheDocument()
  })

  it('Then it renders the spec rows for brand and name', () => {
    expect(screen.getByText(/^Brand:/)).toBeInTheDocument()
    expect(screen.getByText(`Brand: ${productDetailFixture.brand}`)).toBeInTheDocument()
  })

  it('Then it renders similar products', () => {
    expect(
      screen.getByText(productDetailFixture.similarProducts.map((p) => p.name).join(', '))
    ).toBeInTheDocument()
  })
})
