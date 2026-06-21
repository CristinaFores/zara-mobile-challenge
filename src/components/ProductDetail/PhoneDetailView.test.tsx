import { render, screen } from '@testing-library/react'

import { phoneDetailFixture } from '@/__mocks__/phones.fixtures'

import { PhoneDetailView } from './PhoneDetailView'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('./ProductDetailHero', () => ({
  ProductDetailHero: ({ phone }: { phone: { name: string } }) => <div>{phone.name}</div>,
}))

jest.mock('@/components/SpecsTable/SpecsTable', () => ({
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

jest.mock('@/components/SimilarProducts/SimilarProducts', () => ({
  SimilarProducts: ({ products }: { products: { name: string }[] }) => (
    <div>{products.map((p) => p.name).join(', ')}</div>
  ),
}))

describe('Given PhoneDetailView', () => {
  beforeEach(() => render(<PhoneDetailView phone={phoneDetailFixture} />))

  it('Then it renders the back link to the catalog', () => {
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })

  it('Then it renders the phone name via the hero', () => {
    expect(screen.getByText(phoneDetailFixture.name)).toBeInTheDocument()
  })

  it('Then it renders the spec rows for brand and name', () => {
    expect(screen.getByText(/^Brand:/)).toBeInTheDocument()
    expect(screen.getByText(`Brand: ${phoneDetailFixture.brand}`)).toBeInTheDocument()
  })

  it('Then it renders similar products', () => {
    expect(
      screen.getByText(phoneDetailFixture.similarProducts.map((p) => p.name).join(', '))
    ).toBeInTheDocument()
  })
})
