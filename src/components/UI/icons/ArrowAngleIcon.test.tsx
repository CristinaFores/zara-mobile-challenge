import { render } from '@testing-library/react'

import ArrowAngleIcon from './ArrowAngleIcon'

describe('Given ArrowAngleIcon', () => {
  it('Then it renders an SVG element', () => {
    const { container } = render(<ArrowAngleIcon />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('Then it is hidden from assistive technology', () => {
    const { container } = render(<ArrowAngleIcon />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('Then the left direction applies no extra rotation', () => {
    const { container } = render(<ArrowAngleIcon direction="left" />)
    expect(container.querySelector('svg')).toHaveStyle({ transform: 'rotate(0deg)' })
  })

  it('Then the right direction rotates 180deg', () => {
    const { container } = render(<ArrowAngleIcon direction="right" />)
    expect(container.querySelector('svg')).toHaveStyle({ transform: 'rotate(180deg)' })
  })
})
