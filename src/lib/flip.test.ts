import type { Phone } from '@/types'

import { clearFlipStyles, findExitingCards, haveIdsChanged, playFlip, snapshotRects } from './flip'

function makePhone(id: string): Phone {
  return { id, brand: 'Brand', name: `Phone ${id}`, basePrice: 100, imageUrl: 'x.webp' }
}

function makeElement(rect: Partial<DOMRect>): HTMLElement {
  const element = document.createElement('div')
  element.getBoundingClientRect = jest.fn(() => ({ left: 0, top: 0, ...rect }) as DOMRect)
  return element
}

describe('Given haveIdsChanged', () => {
  describe('When the lists have different lengths', () => {
    it('Then it reports a change', () => {
      expect(haveIdsChanged([makePhone('a')], [makePhone('a'), makePhone('b')])).toBe(true)
    })
  })

  describe('When the lists hold the same ids', () => {
    it('Then it reports no change', () => {
      expect(
        haveIdsChanged([makePhone('a'), makePhone('b')], [makePhone('a'), makePhone('b')])
      ).toBe(false)
    })
  })

  describe('When the lists share length but differ in ids', () => {
    it('Then it reports a change', () => {
      expect(haveIdsChanged([makePhone('a')], [makePhone('b')])).toBe(true)
    })
  })
})

describe('Given snapshotRects', () => {
  describe('When given mounted card elements', () => {
    it('Then it records each bounding box keyed by id', () => {
      const elements = new Map([
        ['a', makeElement({ left: 10, top: 20 })],
        ['b', makeElement({ left: 30, top: 40 })],
      ])

      const snapshot = snapshotRects(elements)

      expect(snapshot.get('a')).toMatchObject({ left: 10, top: 20 })
      expect(snapshot.get('b')).toMatchObject({ left: 30, top: 40 })
    })
  })
})

describe('Given findExitingCards', () => {
  describe('When a phone is absent from the next ids', () => {
    it('Then it returns that phone with its snapshotted rect', () => {
      const leaving = makePhone('a')
      const snapshot = new Map([['a', { left: 5, top: 5 } as DOMRect]])

      const result = findExitingCards([leaving], new Set(['b']), snapshot)

      expect(result).toEqual([{ phone: leaving, rect: { left: 5, top: 5 } }])
    })
  })

  describe('When the phone has no snapshot', () => {
    it('Then it is skipped', () => {
      const result = findExitingCards([makePhone('a')], new Set<string>(), new Map())
      expect(result).toEqual([])
    })
  })

  describe('When the phone remains in the next ids', () => {
    it('Then it is not exiting', () => {
      const snapshot = new Map([['a', { left: 0, top: 0 } as DOMRect]])
      expect(findExitingCards([makePhone('a')], new Set(['a']), snapshot)).toEqual([])
    })
  })
})

describe('Given playFlip', () => {
  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => jest.restoreAllMocks())

  describe('When a card moved beyond the 1px threshold', () => {
    it('Then it applies and then clears the transform', () => {
      const element = makeElement({ left: 0, top: 0 })
      const snapshot = new Map([['a', { left: 50, top: 80 } as DOMRect]])

      playFlip(new Map([['a', element]]), snapshot, 500)

      expect(element.style.transition).toContain('500ms')
      expect(element.style.transform).toBe('')
    })
  })

  describe('When a card barely moved', () => {
    it('Then it leaves the element untouched', () => {
      const element = makeElement({ left: 0, top: 0 })
      const snapshot = new Map([['a', { left: 0, top: 0 } as DOMRect]])

      playFlip(new Map([['a', element]]), snapshot, 500)

      expect(element.style.transform).toBe('')
      expect(element.style.transition).toBe('')
    })
  })

  describe('When a card has no snapshot', () => {
    it('Then it is skipped', () => {
      const element = makeElement({ left: 0, top: 0 })
      playFlip(new Map([['a', element]]), new Map(), 500)
      expect(element.style.transform).toBe('')
    })
  })
})

describe('Given clearFlipStyles', () => {
  describe('When elements carry inline animation styles', () => {
    it('Then it removes transition and transform', () => {
      const element = document.createElement('div')
      element.style.transition = 'transform 500ms'
      element.style.transform = 'translate(1px, 1px)'

      clearFlipStyles(new Map([['a', element]]))

      expect(element.style.transition).toBe('')
      expect(element.style.transform).toBe('')
    })
  })
})
