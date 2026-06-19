import { http, HttpResponse } from 'msw'

import { phoneDetailFixture, phoneListFixture } from '@/__mocks__/phones.fixtures'
import { API_ENDPOINTS } from '@/constants'

/**
 * Base URL the API client talks to during tests. Forced to a fixed value in
 * `jest.setup.ts` so handlers match deterministically in local and CI runs.
 */
const API = process.env.API_BASE_URL ?? 'https://api.test'

const productsUrl = `${API}${API_ENDPOINTS.PRODUCTS}`

/**
 * Default happy-path handlers. Individual tests override these with
 * `server.use(...)` to assert request shape or simulate error responses.
 */
export const handlers = [
  http.get(productsUrl, () => HttpResponse.json(phoneListFixture)),

  http.get(`${productsUrl}/:id`, ({ params }) => {
    if (params.id === phoneDetailFixture.id) {
      return HttpResponse.json(phoneDetailFixture)
    }
    return HttpResponse.json({ message: 'Product not found' }, { status: 404 })
  }),
]
