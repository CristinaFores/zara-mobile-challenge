import { getPhoneById } from '@/services/phones.service'
import { phoneDetailFixture } from '@/test-utils/fixtures/phones.fixtures'

const mockNotFound = jest.fn().mockImplementation(() => {
  throw Object.assign(new Error('NEXT_NOT_FOUND'), { digest: 'NEXT_NOT_FOUND' })
})

jest.mock('next/navigation', () => ({ notFound: () => mockNotFound() }))
jest.mock('react', () => ({ ...jest.requireActual('react'), cache: (fn: unknown) => fn }))
jest.mock('@/services/phones.service')

const mockGetPhoneById = getPhoneById as jest.MockedFunction<typeof getPhoneById>

function makeAxiosError(status: number, message: string) {
  return Object.assign(new Error(message), {
    isAxiosError: true,
    response: { status, data: { message } },
  })
}

describe('Given loadPhoneDetail', () => {
  beforeEach(() => mockNotFound.mockClear())

  describe('When the phone is found', () => {
    it('Then it returns the phone detail', async () => {
      mockGetPhoneById.mockResolvedValueOnce(phoneDetailFixture)
      const { loadPhoneDetail } = await import('./loadPhone')

      const result = await loadPhoneDetail('SMG-S24U')

      expect(result).toEqual(phoneDetailFixture)
    })
  })

  describe('When the phone id is not in the catalog', () => {
    it('Then it calls notFound() so Next.js renders the 404 page', async () => {
      mockGetPhoneById.mockRejectedValueOnce(makeAxiosError(404, 'Product not found'))
      const { loadPhoneDetail } = await import('./loadPhone')

      await expect(loadPhoneDetail('INVALID')).rejects.toThrow('NEXT_NOT_FOUND')
      expect(mockNotFound).toHaveBeenCalledTimes(1)
    })
  })

  describe('When a non-404 error is thrown', () => {
    it('Then it rethrows so the error boundary catches it', async () => {
      mockGetPhoneById.mockRejectedValueOnce(makeAxiosError(500, 'Server error'))
      const { loadPhoneDetail } = await import('./loadPhone')

      await expect(loadPhoneDetail('SMG-S24U')).rejects.toThrow('Server error')
      expect(mockNotFound).not.toHaveBeenCalled()
    })
  })
})

describe('Given buildPhoneDetailMetadata', () => {
  it('Then it returns the phone name + brand as title and description', async () => {
    const { buildPhoneDetailMetadata } = await import('./loadPhone')

    const meta = buildPhoneDetailMetadata(phoneDetailFixture)

    expect(meta.title).toBe(`${phoneDetailFixture.name} - ${phoneDetailFixture.brand}`)
    expect(meta.description).toBe(phoneDetailFixture.description)
  })
})
