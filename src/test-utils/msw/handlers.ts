import { http, HttpResponse } from 'msw'

import { API_ENDPOINTS } from '@/shared/constants'
import { productDetailFixture, productListFixture } from '@/test-utils/fixtures/products.fixtures'

const productsUrl = `https://api.test${API_ENDPOINTS.PRODUCTS}`

export const handlers = [
  http.get(productsUrl, () => HttpResponse.json(productListFixture)),

  http.get(`${productsUrl}/:id`, ({ params }) => {
    if (params.id === productDetailFixture.id) {
      return HttpResponse.json(productDetailFixture)
    }
    return HttpResponse.json({ message: 'Product not found' }, { status: 404 })
  }),
]
