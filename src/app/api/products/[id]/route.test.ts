import { http, HttpResponse } from 'msw'

import { apiErrorFixtures, phoneDetailFixture } from '@/__mocks__/phones.fixtures'
import { API_ENDPOINTS } from '@/constants'
import { server } from '@/test-utils/msw/server'

import { GET } from './route'

const API = process.env.API_BASE_URL
const PRODUCTS_URL = `${API}${API_ENDPOINTS.PRODUCTS}`

function callGET(id: string) {
  return GET(new Request('http://localhost'), { params: Promise.resolve({ id }) })
}

describe('Given GET /api/products/[id]', () => {
  describe('When called with a valid phone id', () => {
    it('Then it returns the phone detail from the external API', async () => {
      const res = await callGET(phoneDetailFixture.id)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(phoneDetailFixture)
    })
  })

  describe('When called with an unknown id', () => {
    it('Then it proxies the 404 so the caller can redirect the user', async () => {
      const { status, message } = apiErrorFixtures.notFound
      server.use(http.get(`${PRODUCTS_URL}/:id`, () => HttpResponse.json({ message }, { status })))

      const res = await callGET('INVALID')

      expect(res.status).toBe(404)
      expect((await res.json()).message).toBe(message)
    })
  })

  describe('When the API key is invalid', () => {
    it('Then it proxies the 401 status', async () => {
      const { status, message } = apiErrorFixtures.unauthorized
      server.use(http.get(`${PRODUCTS_URL}/:id`, () => HttpResponse.json({ message }, { status })))

      const res = await callGET(phoneDetailFixture.id)

      expect(res.status).toBe(401)
    })
  })

  describe('When the external API is unreachable', () => {
    it('Then it returns 500', async () => {
      server.use(http.get(`${PRODUCTS_URL}/:id`, () => HttpResponse.error()))

      const res = await callGET(phoneDetailFixture.id)

      expect(res.status).toBe(500)
    })
  })
})
