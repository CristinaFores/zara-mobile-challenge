import { http, HttpResponse } from 'msw'

import { phoneDetailFixture, phoneListFixture } from '@/__mocks__/phones.fixtures'
import { API_ENDPOINTS } from '@/constants'

const productsUrl = `https://api.test${API_ENDPOINTS.PRODUCTS}`

export const handlers = [
  http.get(productsUrl, () => HttpResponse.json(phoneListFixture)),

  http.get(`${productsUrl}/:id`, ({ params }) => {
    if (params.id === phoneDetailFixture.id) {
      return HttpResponse.json(phoneDetailFixture)
    }
    return HttpResponse.json({ message: 'Product not found' }, { status: 404 })
  }),
]
