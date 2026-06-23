import { render, screen } from '@testing-library/react'

import { SpecsTableRow } from './SpecsTableRow'

describe('Given SpecsTableRow', () => {
  it('Then it renders the label', () => {
    render(<SpecsTableRow label="Screen" value='6.8" AMOLED' />)
    expect(screen.getByText('Screen')).toBeInTheDocument()
  })

  it('Then it renders the value', () => {
    render(<SpecsTableRow label="Screen" value='6.8" AMOLED' />)
    expect(screen.getByText('6.8" AMOLED')).toBeInTheDocument()
  })
})
