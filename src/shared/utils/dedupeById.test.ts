import { dedupeById } from './dedupeById'

describe('Given a list with duplicate ids', () => {
  describe('When dedupeById is called', () => {
    it('Then it keeps the first occurrence of each id', () => {
      const items = [
        { id: 'a', name: 'First A' },
        { id: 'b', name: 'B' },
        { id: 'a', name: 'Second A' },
      ]

      expect(dedupeById(items)).toEqual([
        { id: 'a', name: 'First A' },
        { id: 'b', name: 'B' },
      ])
    })
  })
})
