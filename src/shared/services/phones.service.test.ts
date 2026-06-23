import { http, HttpResponse } from 'msw'

import { API_ENDPOINTS, HTTP_STATUS, PHONES_FETCH_LIMIT } from '@/shared/constants'
import {
  apiErrorFixtures,
  phoneDetailFixture,
  phoneListFixture,
} from '@/test-utils/fixtures/phones.fixtures'
import { server } from '@/test-utils/msw/server'

import { getPhoneById, getPhones } from './phones.service'

const API_BASE = process.env.API_BASE_URL
const PRODUCTS_URL = `${API_BASE}${API_ENDPOINTS.PRODUCTS}`

interface AxiosLikeError extends Error {
  response?: { status: number; data: { message: string } }
}

function captureProductsRequest() {
  const captured: { url: URL | null } = { url: null }
  server.use(
    http.get(PRODUCTS_URL, ({ request }) => {
      captured.url = new URL(request.url)
      return HttpResponse.json(phoneListFixture)
    })
  )
  return captured
}

describe('Given the catalog page is loaded', () => {
  describe('When getPhones is called', () => {
    it('Then it over-fetches by one so duplicates can be removed before capping the catalog', async () => {
      const captured = captureProductsRequest()

      await getPhones()

      expect(captured.url?.searchParams.get('limit')).toBe(String(PHONES_FETCH_LIMIT))
    })
  })
})

describe('Given the API responds successfully with a list of phones', () => {
  describe('When getPhones resolves', () => {
    it('Then it returns an array with one object per phone, each carrying the fields the catalog card needs', async () => {
      const result = await getPhones()

      expect(result).toHaveLength(phoneListFixture.length)
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          brand: expect.any(String),
          name: expect.any(String),
          basePrice: expect.any(Number),
          imageUrl: expect.any(String),
        })
      )
    })
  })
})

describe('Given the API returns an empty catalog', () => {
  describe('When getPhones resolves', () => {
    it('Then it returns an empty array so the UI can show the empty-state message', async () => {
      server.use(http.get(PRODUCTS_URL, () => HttpResponse.json([])))

      const result = await getPhones()

      expect(result).toEqual([])
    })
  })
})

describe('Given the user navigates to a valid product detail page', () => {
  describe('When getPhoneById is called with the phone id from the URL', () => {
    it('Then it requests the external product detail endpoint for that id', async () => {
      let requestedPath: string | null = null
      server.use(
        http.get(`${PRODUCTS_URL}/:id`, ({ request, params }) => {
          requestedPath = new URL(request.url).pathname
          expect(params.id).toBe('SMG-S24U')
          return HttpResponse.json(phoneDetailFixture)
        })
      )

      await getPhoneById('SMG-S24U')

      expect(requestedPath).toBe('/products/SMG-S24U')
    })

    it('And it returns the full detail object exactly as the route delivers it', async () => {
      const result = await getPhoneById('SMG-S24U')

      expect(result).toEqual(phoneDetailFixture)
    })

    it('And the specs block contains all eight technical fields the detail page displays', async () => {
      const result = await getPhoneById('SMG-S24U')

      expect(result.specs).toEqual(
        expect.objectContaining({
          screen: expect.any(String),
          resolution: expect.any(String),
          processor: expect.any(String),
          mainCamera: expect.any(String),
          selfieCamera: expect.any(String),
          battery: expect.any(String),
          os: expect.any(String),
          screenRefreshRate: expect.any(String),
        })
      )
    })

    it('And each color option carries a name, hex code and its own image URL so switching color swaps the photo', async () => {
      const result = await getPhoneById('SMG-S24U')

      expect(result.colorOptions.length).toBeGreaterThan(0)
      result.colorOptions.forEach((option) => {
        expect(option).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            hexCode: expect.any(String),
            imageUrl: expect.any(String),
          })
        )
      })
    })

    it('And each storage tier carries a capacity label and its price so the UI can update the total when the user switches tier', async () => {
      const result = await getPhoneById('SMG-S24U')

      expect(result.storageOptions.length).toBeGreaterThan(0)
      result.storageOptions.forEach((option) => {
        expect(option).toEqual(
          expect.objectContaining({
            capacity: expect.any(String),
            price: expect.any(Number),
          })
        )
      })
    })
  })
})

describe('Given the id in the URL does not match any phone in the catalog', () => {
  describe('When getPhoneById is called with that unknown id', () => {
    it('Then it propagates a 404 Not Found error so the page can redirect the user to the catalog', async () => {
      const { status, message } = apiErrorFixtures.notFound
      server.use(http.get(`${PRODUCTS_URL}/:id`, () => HttpResponse.json({ message }, { status })))

      const error = (await getPhoneById('INVALID').catch((e) => e)) as AxiosLikeError

      expect(error.response?.status).toBe(HTTP_STATUS.NOT_FOUND)
      expect(error.response?.data.message).toBe(apiErrorFixtures.notFound.message)
    })
  })
})

describe('Given the id contains characters that would break the upstream path', () => {
  describe('When getPhoneById is called with a malformed id', () => {
    it('Then it rejects with 404 before calling the external API', async () => {
      let requestCount = 0
      server.use(
        http.get(`${PRODUCTS_URL}/:id`, () => {
          requestCount += 1
          return HttpResponse.json(phoneDetailFixture)
        })
      )

      const error = await getPhoneById('foo/bar').catch((e) => e)

      expect(error).toMatchObject({ status: HTTP_STATUS.NOT_FOUND, message: 'Product not found' })
      expect(requestCount).toBe(0)
    })
  })
})

describe('Given the API key is missing or has been rotated and the current one is no longer valid', () => {
  describe('When getPhones is called', () => {
    it('Then it propagates a 401 Unauthorized error so the caller knows the problem is authentication, not data', async () => {
      const { status, message } = apiErrorFixtures.unauthorized
      server.use(http.get(PRODUCTS_URL, () => HttpResponse.json({ message }, { status })))

      const error = (await getPhones().catch((e) => e)) as AxiosLikeError

      expect(error.response?.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(error.response?.data.message).toBe(apiErrorFixtures.unauthorized.message)
    })
  })

  describe('When getPhoneById is called', () => {
    it('Then it propagates a 401 Unauthorized error for the same reason', async () => {
      const { status, message } = apiErrorFixtures.unauthorized
      server.use(http.get(`${PRODUCTS_URL}/:id`, () => HttpResponse.json({ message }, { status })))

      const error = (await getPhoneById('SMG-S24U').catch((e) => e)) as AxiosLikeError

      expect(error.response?.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(error.response?.data.message).toBe(apiErrorFixtures.unauthorized.message)
    })
  })
})

describe('Given the device has no internet connection or the API server is unreachable', () => {
  describe('When getPhones is called', () => {
    it('Then it propagates the network error so the UI can show a connection error message', async () => {
      server.use(http.get(PRODUCTS_URL, () => HttpResponse.error()))

      await expect(getPhones()).rejects.toThrow()
    })
  })

  describe('When getPhoneById is called', () => {
    it('Then it propagates the network error so the UI can show a connection error message', async () => {
      server.use(http.get(`${PRODUCTS_URL}/:id`, () => HttpResponse.error()))

      await expect(getPhoneById('SMG-S24U')).rejects.toThrow()
    })
  })
})
