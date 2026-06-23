import { CART_KEY } from '@/shared/constants'
import { phoneDetailFixture, phoneListFixture } from '@/test-utils/fixtures/phones.fixtures'

import { cartStorage } from './cartStorage'

const PHONE = phoneListFixture[0]
const COLOR = phoneDetailFixture.colorOptions[0]
const STORAGE = phoneDetailFixture.storageOptions[0]

const validCartItem = {
  key: `${PHONE.id}::${COLOR.name}::${STORAGE.capacity}`,
  id: PHONE.id,
  brand: PHONE.brand,
  name: PHONE.name,
  imageUrl: COLOR.imageUrl,
  selectedColor: COLOR,
  selectedStorage: STORAGE,
  price: STORAGE.price,
  quantity: 1,
}

describe('Given cartStorage.read', () => {
  beforeEach(() => localStorage.clear())

  describe('When localStorage is empty', () => {
    it('Then it returns an empty array', () => {
      expect(cartStorage.read()).toEqual([])
    })
  })

  describe('When localStorage holds a valid cart', () => {
    it('Then it restores the saved items', () => {
      localStorage.setItem(CART_KEY, JSON.stringify([validCartItem]))

      expect(cartStorage.read()).toEqual([validCartItem])
    })
  })

  describe('When localStorage holds invalid JSON', () => {
    it('Then it returns an empty array instead of throwing', () => {
      localStorage.setItem(CART_KEY, '{not-json')

      expect(cartStorage.read()).toEqual([])
    })
  })

  describe('When localStorage holds a JSON object instead of an array', () => {
    it('Then it returns an empty array so the cart provider cannot crash on reduce', () => {
      localStorage.setItem(CART_KEY, '{}')

      expect(cartStorage.read()).toEqual([])
    })
  })

  describe('When localStorage holds an array with invalid items', () => {
    it('Then it keeps only entries that match the cart item shape', () => {
      localStorage.setItem(CART_KEY, JSON.stringify([validCartItem, { id: 'broken' }, null]))

      expect(cartStorage.read()).toEqual([validCartItem])
    })
  })
})

describe('Given cartStorage.write', () => {
  beforeEach(() => localStorage.clear())

  describe('When localStorage quota is exceeded', () => {
    it('Then it fails silently without throwing to the caller', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      })

      expect(() => cartStorage.write([validCartItem])).not.toThrow()
    })
  })
})
