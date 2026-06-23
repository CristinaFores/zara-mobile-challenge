import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { phoneDetailFixture } from '@/test-utils/fixtures/phones.fixtures'

import { ColorSelector } from './ColorSelector'

jest.mock('@/shared/hooks/useTextCrossfade', () => ({
  useTextCrossfade: (text: string) => [
    { text, isActive: true },
    { text: '', isActive: false },
  ],
}))

const options = phoneDetailFixture.colorOptions

describe('Given ColorSelector', () => {
  describe('When rendered with color options and no selection', () => {
    it('Then it renders one swatch button per color option', () => {
      render(<ColorSelector options={options} selected={null} onSelect={jest.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(options.length)
    })

    it('Then no swatch is pressed', () => {
      render(<ColorSelector options={options} selected={null} onSelect={jest.fn()} />)

      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('When a color option is selected', () => {
    it('Then only that swatch has aria-pressed="true"', () => {
      render(<ColorSelector options={options} selected={options[1]} onSelect={jest.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons[1]).toHaveAttribute('aria-pressed', 'true')
      expect(buttons[0]).toHaveAttribute('aria-pressed', 'false')
    })

    it('Then it displays the selected color name', () => {
      render(<ColorSelector options={options} selected={options[0]} onSelect={jest.fn()} />)

      expect(screen.getByText(options[0].name)).toBeInTheDocument()
    })
  })

  describe('When the user clicks a swatch', () => {
    it('Then it calls onSelect with that color option', async () => {
      const onSelect = jest.fn()
      render(<ColorSelector options={options} selected={null} onSelect={onSelect} />)

      await userEvent.click(screen.getByRole('button', { name: options[2].name }))

      expect(onSelect).toHaveBeenCalledWith(options[2])
    })
  })
})
