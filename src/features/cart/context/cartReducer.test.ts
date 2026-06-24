import { productDetailFixture, productListFixture } from '@/test-utils/fixtures/products.fixtures'

import { cartReducer, initialState } from './cartReducer'

const PRODUCT = productListFixture[0]
const COLOR_A = productDetailFixture.colorOptions[0]
const COLOR_B = productDetailFixture.colorOptions[1]
const STORAGE_256 = productDetailFixture.storageOptions[0]
const STORAGE_512 = productDetailFixture.storageOptions[1]

const add = (product = PRODUCT, selectedColor = COLOR_A, selectedStorage = STORAGE_256) => ({
  type: 'ADD' as const,
  payload: { product, selectedColor, selectedStorage },
})

describe('Given cartReducer', () => {
  describe('When ADD is dispatched', () => {
    it('Then identical combinations create separate lines with unique keys', () => {
      const afterFirst = cartReducer(initialState, add())
      const afterSecond = cartReducer(afterFirst, add())

      expect(afterSecond.cartItems).toHaveLength(2)
      expect(afterSecond.cartItems[0].key).not.toBe(afterSecond.cartItems[1].key)
      expect(afterSecond.cartItems[0].selectedColor.name).toBe(COLOR_A.name)
      expect(afterSecond.cartItems[1].selectedColor.name).toBe(COLOR_A.name)
    })

    it('Then three identical adds yield three lines and a triple total', () => {
      let state = initialState
      state = cartReducer(state, add())
      state = cartReducer(state, add())
      state = cartReducer(state, add())

      expect(state.cartItems).toHaveLength(3)
      expect(new Set(state.cartItems.map((item) => item.key)).size).toBe(3)
    })

    it('Then different colors stay on separate lines', () => {
      let state = cartReducer(initialState, add(PRODUCT, COLOR_A, STORAGE_256))
      state = cartReducer(state, add(PRODUCT, COLOR_B, STORAGE_256))

      expect(state.cartItems).toHaveLength(2)
      expect(state.cartItems.map((item) => item.selectedColor.name)).toEqual([
        COLOR_A.name,
        COLOR_B.name,
      ])
    })

    it('Then different storage tiers stay on separate lines', () => {
      let state = cartReducer(initialState, add(PRODUCT, COLOR_A, STORAGE_256))
      state = cartReducer(state, add(PRODUCT, COLOR_A, STORAGE_512))

      expect(state.cartItems).toHaveLength(2)
      expect(state.cartItems.map((item) => item.selectedStorage.capacity)).toEqual([
        STORAGE_256.capacity,
        STORAGE_512.capacity,
      ])
    })

    it('Then each line keeps quantity 1 and the selected storage price', () => {
      const state = cartReducer(initialState, add())

      expect(state.cartItems[0].quantity).toBe(1)
      expect(state.cartItems[0].price).toBe(STORAGE_256.price)
    })
  })

  describe('When REMOVE is dispatched with duplicate lines in the cart', () => {
    it('Then only the targeted line is removed', () => {
      let state = cartReducer(initialState, add())
      state = cartReducer(state, add())
      const keyToRemove = state.cartItems[0].key

      state = cartReducer(state, { type: 'REMOVE', payload: keyToRemove })

      expect(state.cartItems).toHaveLength(1)
      expect(state.cartItems[0].key).not.toBe(keyToRemove)
    })
  })

  describe('When CLEAR is dispatched', () => {
    it('Then all duplicate lines are removed', () => {
      let state = cartReducer(initialState, add())
      state = cartReducer(state, add())
      state = cartReducer(state, { type: 'CLEAR' })

      expect(state.cartItems).toEqual([])
    })
  })

  describe('When HYDRATE is dispatched', () => {
    it('Then duplicate saved lines are restored as-is', () => {
      const saved = [
        {
          key: 'line-a',
          id: PRODUCT.id,
          brand: PRODUCT.brand,
          name: PRODUCT.name,
          imageUrl: COLOR_A.imageUrl,
          selectedColor: COLOR_A,
          selectedStorage: STORAGE_256,
          price: STORAGE_256.price,
          quantity: 1,
        },
        {
          key: 'line-b',
          id: PRODUCT.id,
          brand: PRODUCT.brand,
          name: PRODUCT.name,
          imageUrl: COLOR_A.imageUrl,
          selectedColor: COLOR_A,
          selectedStorage: STORAGE_256,
          price: STORAGE_256.price,
          quantity: 1,
        },
      ]

      const state = cartReducer(initialState, { type: 'HYDRATE', payload: saved })

      expect(state.cartItems).toHaveLength(2)
      expect(state.isHydrated).toBe(true)
    })
  })
})
