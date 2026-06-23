import { buildKey } from './buildKey'

describe('Given a product id, a selected colour and a selected storage capacity', () => {
  describe('When buildKey is called', () => {
    it('Then it joins the three parts with "::" into a single cart-line key', () => {
      expect(buildKey('SMG-S24U', 'Titanium Black', '512 GB')).toBe(
        'SMG-S24U::Titanium Black::512 GB'
      )
    })

    it('And the same combination always produces the same key so lines deduplicate reliably', () => {
      expect(buildKey('SMG-S24U', 'Titanium Black', '256 GB')).toBe(
        buildKey('SMG-S24U', 'Titanium Black', '256 GB')
      )
    })
  })
})

describe('Given the same product configured differently', () => {
  describe('When only the colour differs', () => {
    it('Then the keys differ so each colour is a separate cart line', () => {
      expect(buildKey('SMG-S24U', 'Titanium Black', '256 GB')).not.toBe(
        buildKey('SMG-S24U', 'Titanium Violet', '256 GB')
      )
    })
  })

  describe('When only the storage tier differs', () => {
    it('Then the keys differ so each storage tier is a separate cart line', () => {
      expect(buildKey('SMG-S24U', 'Titanium Black', '256 GB')).not.toBe(
        buildKey('SMG-S24U', 'Titanium Black', '512 GB')
      )
    })
  })
})
