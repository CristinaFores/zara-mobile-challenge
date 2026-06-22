import { render, screen } from '@testing-library/react'

import { SpecsTable } from './SpecsTable'

const rows = [
  { label: 'Brand', value: 'Samsung' },
  { label: 'Screen', value: '6.8" Dynamic AMOLED 2X' },
  { label: 'Battery', value: '5000 mAh' },
]

describe('Given SpecsTable', () => {
  beforeEach(() => render(<SpecsTable rows={rows} />))

  it('Then it renders the Specifications heading', () => {
    expect(screen.getByRole('heading', { name: /specifications/i })).toBeInTheDocument()
  })

  it('Then it renders one entry per row', () => {
    expect(screen.getAllByRole('term')).toHaveLength(rows.length)
  })

  it('Then each row shows its label', () => {
    rows.forEach((row) => expect(screen.getByText(row.label)).toBeInTheDocument())
  })

  it('Then each row shows its value', () => {
    rows.forEach((row) => expect(screen.getByText(row.value)).toBeInTheDocument())
  })
})
