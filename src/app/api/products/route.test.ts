import { http, HttpResponse } from 'msw'
import { NextRequest } from 'next/server'

import { API_ENDPOINTS } from '@/shared/constants'
import { apiErrorFixtures, phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'
import { server } from '@/test-utils/msw/server'

import { GET } from './route'

const API = process.env.API_BASE_URL
const PRODUCTS_URL = `${API}${API_ENDPOINTS.PRODUCTS}`

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/products')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url)
}

describe('Given GET /api/products', () => {
  describe('When called without params', () => {
    it('Then it proxies the response from the external API', async () => {
      const res = await GET(makeRequest())
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(phoneListFixture)
    })

    it('Then it forwards the limit param to the external API', async () => {
      let capturedLimit: string | null = null
      server.use(
        http.get(PRODUCTS_URL, ({ request }) => {
          capturedLimit = new URL(request.url).searchParams.get('limit')
          return HttpResponse.json(phoneListFixture)
        })
      )

      await GET(makeRequest({ limit: '10' }))

      expect(capturedLimit).toBe('10')
    })
  })

  describe('When called with a search param', () => {
    it('Then it forwards search to the external API so results are filtered server-side', async () => {
      let capturedSearch: string | null = null
      server.use(
        http.get(PRODUCTS_URL, ({ request }) => {
          capturedSearch = new URL(request.url).searchParams.get('search')
          return HttpResponse.json(phoneListFixture)
        })
      )

      await GET(makeRequest({ search: 'samsung' }))

      expect(capturedSearch).toBe('samsung')
    })
  })

  describe('When the external API returns 401', () => {
    it('Then it proxies the 401 status to the caller', async () => {
      const { status, message } = apiErrorFixtures.unauthorized
      server.use(http.get(PRODUCTS_URL, () => HttpResponse.json({ message }, { status })))

      const res = await GET(makeRequest())

      expect(res.status).toBe(401)
      expect((await res.json()).message).toBe(message)
    })
  })

  describe('When the external API returns 500', () => {
    it('Then it returns 500 to the caller', async () => {
      const { status, message } = apiErrorFixtures.serverError
      server.use(http.get(PRODUCTS_URL, () => HttpResponse.json({ message }, { status })))

      const res = await GET(makeRequest())

      expect(res.status).toBe(500)
    })
  })
})
