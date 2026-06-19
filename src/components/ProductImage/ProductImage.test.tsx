'use client'
import { render, screen } from '@testing-library/react'

import { ProductImage } from './ProductImage'

const SRC =
  'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp'
const ALT = 'Samsung Galaxy S24 Ultra'

describe('Given a ProductImage', () => {
  describe('When rendered', () => {
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
})
