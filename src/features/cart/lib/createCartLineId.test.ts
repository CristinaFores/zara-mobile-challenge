import { createCartLineId } from './createCartLineId'

describe('Given createCartLineId', () => {
  describe('When called twice for the same product', () => {
    it('Then it returns two different line ids', () => {
      const first = createCartLineId('smg-s24-ultra')
      const second = createCartLineId('smg-s24-ultra')

      expect(first).not.toBe(second)
      expect(first.startsWith('smg-s24-ultra-')).toBe(true)
      expect(second.startsWith('smg-s24-ultra-')).toBe(true)
    })
  })

  describe('When called once', () => {
    it('Then the id embeds a UUID suffix', () => {
      const lineId = createCartLineId('iphone-15-pro')

      expect(lineId).toMatch(
        /^iphone-15-pro-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })
  })
})
