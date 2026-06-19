import { http, HttpResponse } from 'msw'
import { NextRequest } from 'next/server'
import sharp from 'sharp'

import { server } from '@/test-utils/msw/server'

import { GET } from './route'

const EXTERNAL_IMAGE_URL =
  'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp'

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/images')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url)
}

// Minimal valid 10x10 white PNG that Sharp can process
async function makeImageBuffer(): Promise<Buffer> {
  return sharp({
    create: {
      width: 10,
      height: 10,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer()
}

describe('Given GET /api/images', () => {
  describe('When url param is missing', () => {
    it('Then it returns 400', async () => {
      const res = await GET(makeRequest({}))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body).toEqual({ error: 'Missing url param' })
    })
  })

  describe('When the external image fetch fails with a non-ok status', () => {
    it('Then it forwards the upstream status code', async () => {
      server.use(http.get(EXTERNAL_IMAGE_URL, () => new HttpResponse(null, { status: 404 })))
      const res = await GET(makeRequest({ url: EXTERNAL_IMAGE_URL }))
      expect(res.status).toBe(404)
    })
  })

  describe('When the external image is unreachable', () => {
    it('Then it returns 502', async () => {
      server.use(http.get(EXTERNAL_IMAGE_URL, () => HttpResponse.error()))
      const res = await GET(makeRequest({ url: EXTERNAL_IMAGE_URL }))
      expect(res.status).toBe(502)
    })
  })

  describe('When a valid image url is provided', () => {
    beforeEach(async () => {
      const imageBuffer = await makeImageBuffer()
      server.use(
        http.get(
          EXTERNAL_IMAGE_URL,
          () => new HttpResponse(imageBuffer, { headers: { 'Content-Type': 'image/png' } })
        )
      )
    })

    it('Then it returns 200 with Content-Type image/webp', async () => {
      const res = await GET(makeRequest({ url: EXTERNAL_IMAGE_URL }))
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/webp')
    })

    it('Then it sets an immutable Cache-Control header', async () => {
      const res = await GET(makeRequest({ url: EXTERNAL_IMAGE_URL }))
      expect(res.headers.get('Cache-Control')).toContain('immutable')
    })

    it('Then it respects the w and q params', async () => {
      const res = await GET(makeRequest({ url: EXTERNAL_IMAGE_URL, w: '300', q: '80' }))
      expect(res.status).toBe(200)
    })
  })
})
