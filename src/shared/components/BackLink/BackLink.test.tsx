import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BackLink } from './BackLink'

const backMock = jest.fn()
const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: backMock, push: pushMock }),
}))

describe('Given BackLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'history', {
      configurable: true,
      value: { length: 2 },
    })
  })

  describe('When rendered', () => {
    it('Then it renders a navigation landmark', () => {
      render(<BackLink />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('Then it shows the default label "Back"', () => {
      render(<BackLink />)
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })
  })

  describe('When the user clicks back with browser history', () => {
    it('Then it navigates back in history', async () => {
      render(<BackLink />)
      await userEvent.click(screen.getByRole('button', { name: /back/i }))
      expect(backMock).toHaveBeenCalled()
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  describe('When there is no browser history', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'history', {
        configurable: true,
        value: { length: 1 },
      })
    })

    it('Then it falls back to the catalog', async () => {
      render(<BackLink />)
      await userEvent.click(screen.getByRole('button', { name: /back/i }))
      expect(pushMock).toHaveBeenCalledWith('/')
      expect(backMock).not.toHaveBeenCalled()
    })

    it('Then it can use a custom fallback href', async () => {
      render(<BackLink fallbackHref="/products" label="Go back" />)
      await userEvent.click(screen.getByRole('button', { name: /go back/i }))
      expect(pushMock).toHaveBeenCalledWith('/products')
    })
  })
})
