import { getProductById } from '@/shared/services/products.service'
import { productDetailFixture } from '@/test-utils/fixtures/products.fixtures'

const mockNotFound = jest.fn().mockImplementation(() => {
  throw Object.assign(new Error('NEXT_NOT_FOUND'), { digest: 'NEXT_NOT_FOUND' })
})

jest.mock('next/navigation', () => ({ notFound: () => mockNotFound() }))
jest.mock('react', () => ({ ...jest.requireActual('react'), cache: (fn: unknown) => fn }))
jest.mock('@/shared/services/products.service')

const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>

function makeAxiosError(status: number, message: string) {
  return Object.assign(new Error(message), {
    isAxiosError: true,
    response: { status, data: { message } },
  })
}

describe('Given loadProductDetail', () => {
  beforeEach(() => mockNotFound.mockClear())

  describe('When the product is found', () => {
    it('Then it returns the product detail', async () => {
      mockGetProductById.mockResolvedValueOnce(productDetailFixture)
      const { loadProductDetail } = await import('./loadProduct')

      const result = await loadProductDetail('SMG-S24U')

      expect(result).toEqual(productDetailFixture)
    })
  })

  describe('When the product id is not in the catalog', () => {
    it('Then it calls notFound() so Next.js renders the 404 page', async () => {
      mockGetProductById.mockRejectedValueOnce(makeAxiosError(404, 'Product not found'))
      const { loadProductDetail } = await import('./loadProduct')

      await expect(loadProductDetail('INVALID')).rejects.toThrow('NEXT_NOT_FOUND')
      expect(mockNotFound).toHaveBeenCalledTimes(1)
    })
  })

  describe('When the product id is malformed', () => {
    it('Then it calls notFound() without hitting the external API', async () => {
      const { ProductNotFoundError } = await import('@/shared/services/products.api')
      mockGetProductById.mockRejectedValueOnce(new ProductNotFoundError())
      const { loadProductDetail } = await import('./loadProduct')

      await expect(loadProductDetail('foo/bar')).rejects.toThrow('NEXT_NOT_FOUND')
      expect(mockNotFound).toHaveBeenCalledTimes(1)
    })
  })

  describe('When a non-404 error is thrown', () => {
    it('Then it rethrows so the error boundary catches it', async () => {
      mockGetProductById.mockRejectedValueOnce(makeAxiosError(500, 'Server error'))
      const { loadProductDetail } = await import('./loadProduct')

      await expect(loadProductDetail('SMG-S24U')).rejects.toThrow('Server error')
      expect(mockNotFound).not.toHaveBeenCalled()
    })
  })
})

describe('Given buildProductDetailMetadata', () => {
  it('Then it returns the product name + brand as title and description', async () => {
    const { buildProductDetailMetadata } = await import('./loadProduct')

    const meta = buildProductDetailMetadata(productDetailFixture)

    expect(meta.title).toBe(`${productDetailFixture.name} - ${productDetailFixture.brand}`)
    expect(meta.description).toBe(productDetailFixture.description)
  })
})
