import sharp from 'sharp'

import { removeWhiteBackground } from './imageProcessing'

async function makeWhiteBorderImage(): Promise<{
  data: Buffer
  width: number
  height: number
}> {
  const width = 6
  const height = 6
  const data = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const isCenter = x >= 2 && x <= 3 && y >= 2 && y <= 3

      if (isCenter) {
        data[i] = 20
        data[i + 1] = 20
        data[i + 2] = 20
        data[i + 3] = 255
      } else {
        data[i] = 255
        data[i + 1] = 255
        data[i + 2] = 255
        data[i + 3] = 255
      }
    }
  }

  return { data, width, height }
}

describe('Given a product image on a white background', () => {
  describe('When removeWhiteBackground is called', () => {
    it('Then edge-connected white pixels become transparent and the product stays opaque', async () => {
      const { data, width, height } = await makeWhiteBorderImage()
      const cleaned = removeWhiteBackground(data, width, height)
      const pixels = new Uint8ClampedArray(cleaned.buffer, cleaned.byteOffset, cleaned.byteLength)

      expect(pixels[0 * 4 + 3]).toBe(0)
      expect(pixels[(2 * width + 2) * 4 + 3]).toBe(255)
    })

    it('Then the result can be encoded as webp by sharp', async () => {
      const { data, width, height } = await makeWhiteBorderImage()
      const cleaned = removeWhiteBackground(data, width, height)

      const webp = await sharp(cleaned, {
        raw: { width, height, channels: 4 },
      })
        .webp()
        .toBuffer()

      expect(webp.length).toBeGreaterThan(0)
    })
  })
})
