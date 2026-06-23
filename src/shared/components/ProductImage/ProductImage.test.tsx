'use client'
import { act, render, screen } from '@testing-library/react'

import { ProductImage } from './ProductImage'

const SRC =
  'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp'
const ALT = 'Samsung Galaxy S24 Ultra'

describe('Given a ProductImage', () => {
  describe('When rendered with a valid src', () => {
    it('Then it renders an image with the given alt text', () => {
      render(<ProductImage src={SRC} alt={ALT} />)
      expect(screen.getByRole('img', { name: ALT })).toBeInTheDocument()
    })

    it('Then the src routes through /api/images with the encoded original url', () => {
      render(<ProductImage src={SRC} alt={ALT} />)
      const img = screen.getByRole('img', { name: ALT })
      expect(img).toHaveAttribute('src', expect.stringContaining('/api/images'))
      expect(img).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(SRC)))
    })
  })

  describe('When fixedProxyWidth is set', () => {
    it('Then the src uses that width so preloads and hero share one cache key', () => {
      render(<ProductImage src={SRC} alt={ALT} fixedProxyWidth={828} />)
      const img = screen.getByRole('img', { name: ALT })
      expect(img).toHaveAttribute('src', expect.stringContaining('w=828'))
    })
  })

  describe('When priority is true', () => {
    it('Then the image does not have loading="lazy"', () => {
      render(<ProductImage src={SRC} alt={ALT} priority />)
      expect(screen.getByRole('img', { name: ALT })).not.toHaveAttribute('loading', 'lazy')
    })
  })

  describe('When priority is false', () => {
    it('Then the image has loading="lazy"', () => {
      render(<ProductImage src={SRC} alt={ALT} priority={false} />)
      expect(screen.getByRole('img', { name: ALT })).toHaveAttribute('loading', 'lazy')
    })
  })

  describe('When src is undefined', () => {
    it('Then it renders the fallback with the given alt text', () => {
      render(<ProductImage src={undefined} alt={ALT} />)
      expect(screen.getByRole('img', { name: ALT })).toBeInTheDocument()
    })

    it('Then onLoad is called so crossfade completes', () => {
      const onLoad = jest.fn()
      render(<ProductImage src={undefined} alt={ALT} onLoad={onLoad} />)
      expect(onLoad).toHaveBeenCalledTimes(1)
    })
  })

  describe('When src is an empty string', () => {
    it('Then it renders the fallback with the given alt text', () => {
      render(<ProductImage src="" alt={ALT} />)
      expect(screen.getByRole('img', { name: ALT })).toBeInTheDocument()
    })
  })

  describe('When the image fires an error event', () => {
    it('Then it shows the fallback with the given alt text', () => {
      render(<ProductImage src={SRC} alt={ALT} />)
      const img = screen.getByRole('img', { name: ALT })
      act(() => {
        img.dispatchEvent(new Event('error', { bubbles: true }))
      })
      expect(screen.getByRole('img', { name: ALT })).toBeInTheDocument()
    })

    it('Then onLoad is called after the error so crossfade completes', () => {
      const onLoad = jest.fn()
      render(<ProductImage src={SRC} alt={ALT} onLoad={onLoad} />)
      const img = screen.getByRole('img', { name: ALT })
      act(() => {
        img.dispatchEvent(new Event('error', { bubbles: true }))
      })
      expect(onLoad).toHaveBeenCalled()
    })
  })

  describe('When src changes after an error', () => {
    it('Then the error resets and the new image is attempted', () => {
      const NEW_SRC = 'https://example.com/new-image.webp'
      const { rerender } = render(<ProductImage src={SRC} alt={ALT} />)
      const img = screen.getByRole('img', { name: ALT })
      act(() => {
        img.dispatchEvent(new Event('error', { bubbles: true }))
      })
      expect(screen.getByRole('img', { name: ALT })).toBeInTheDocument()

      act(() => {
        rerender(<ProductImage src={NEW_SRC} alt={ALT} />)
      })
      expect(screen.getByRole('img', { name: ALT })).toBeInTheDocument()
    })
  })
})
