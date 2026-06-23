import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { productDetailFixture } from '@/test-utils/fixtures/products.fixtures'

import { StorageSelector } from './StorageSelector'

const options = productDetailFixture.storageOptions

describe('Given StorageSelector', () => {
  describe('When rendered with storage options and no selection', () => {
    it('Then it renders one chip per storage option', () => {
      render(<StorageSelector options={options} selected={null} onSelect={jest.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(options.length)
    })

    it('Then each chip shows its capacity', () => {
      render(<StorageSelector options={options} selected={null} onSelect={jest.fn()} />)

      options.forEach((option) => {
        expect(screen.getByRole('button', { name: option.capacity })).toBeInTheDocument()
      })
    })

    it('Then no chip is pressed', () => {
      render(<StorageSelector options={options} selected={null} onSelect={jest.fn()} />)

      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('When a storage option is selected', () => {
    it('Then only that chip has aria-pressed="true"', () => {
      render(<StorageSelector options={options} selected={options[1]} onSelect={jest.fn()} />)

      expect(screen.getByRole('button', { name: options[1].capacity })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(screen.getByRole('button', { name: options[0].capacity })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    })
  })

  describe('When the user clicks a chip', () => {
    it('Then it calls onSelect with that storage option', async () => {
      const onSelect = jest.fn()
      render(<StorageSelector options={options} selected={null} onSelect={onSelect} />)

      await userEvent.click(screen.getByRole('button', { name: options[2].capacity }))

      expect(onSelect).toHaveBeenCalledWith(options[2])
    })
  })
})
