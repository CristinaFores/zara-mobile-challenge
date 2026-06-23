import { http, HttpResponse } from 'msw'

import { server } from '@/test-utils/msw/server'

import apiClient from './apiClient'

const API = process.env.API_BASE_URL

describe('Given the API client is used to make a request', () => {
  describe('When any request goes through the client', () => {
    it('Then it is sent to the base URL from API_BASE_URL so every call hits the right API origin', async () => {
      // The handler is registered on the absolute API origin; if the request
      // arrives, the configured baseURL was applied to the relative path.
      server.use(http.get(`${API}/products`, () => HttpResponse.json([])))

      const response = await apiClient.get('/products')

      expect(response.status).toBe(200)
    })

    it('And it carries the x-api-key header from API_KEY so the external API authorises it', async () => {
      let receivedKey: string | null = null
      server.use(
        http.get(`${API}/products`, ({ request }) => {
          receivedKey = request.headers.get('x-api-key')
          return HttpResponse.json([])
        })
      )

      await apiClient.get('/products')

      expect(receivedKey).toBe(process.env.API_KEY)
    })

    it('And the credential travels on the wire exactly as provided by the environment — nothing hardcoded in source', async () => {
      let receivedKey: string | null = null
      server.use(
        http.get(`${API}/products`, ({ request }) => {
          receivedKey = request.headers.get('x-api-key')
          return HttpResponse.json([])
        })
      )

      await apiClient.get('/products')

      expect(receivedKey).toBe('test-api-key')
    })
  })
})
