import type { Product } from '@/shared/types'

/** A card that left the grid, captured with the position it occupied so it can animate out. */
export interface ExitingCard {
  product: Product
  rect: DOMRect
}

/** Snapshot of each card's on-screen position, keyed by product id (the FLIP "First" read). */
export type RectSnapshot = Map<string, DOMRect>

/** True when the two lists differ in length or contain a different set of ids. */
export function haveIdsChanged(prev: readonly Product[], next: readonly Product[]): boolean {
  if (prev.length !== next.length) return true
  const prevIds = new Set(prev.map((product) => product.id))
  return next.some((product) => !prevIds.has(product.id))
}

/** Records the current bounding box of every mounted card. */
export function snapshotRects(elements: ReadonlyMap<string, HTMLElement>): RectSnapshot {
  const snapshot: RectSnapshot = new Map()
  for (const [id, element] of elements) {
    snapshot.set(id, element.getBoundingClientRect())
  }
  return snapshot
}

/** Cards present before the update but absent after, paired with their last known position. */
export function findExitingCards(
  previousProducts: readonly Product[],
  nextIds: ReadonlySet<string>,
  snapshot: RectSnapshot
): ExitingCard[] {
  const exiting: ExitingCard[] = []
  for (const product of previousProducts) {
    if (nextIds.has(product.id)) continue
    const rect = snapshot.get(product.id)
    if (rect) exiting.push({ product, rect })
  }
  return exiting
}

/**
 * FLIP "Invert + Play": for every card still on screen, jump it back to its old
 * position with no transition, then release it so it animates to the new one.
 */
export function playFlip(
  elements: ReadonlyMap<string, HTMLElement>,
  snapshot: RectSnapshot,
  durationMs: number
): void {
  requestAnimationFrame(() => {
    for (const [id, element] of elements) {
      const originalRect = snapshot.get(id)
      if (!originalRect) continue

      const currentRect = element.getBoundingClientRect()
      const deltaX = originalRect.left - currentRect.left
      const deltaY = originalRect.top - currentRect.top

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue

      element.style.transition = 'none'
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`

      requestAnimationFrame(() => {
        element.style.transition = `transform ${durationMs}ms cubic-bezier(0.25, 0, 0.25, 1)`
        element.style.transform = ''
      })
    }
  })
}

/** Removes the inline transition/transform styles applied during the animation. */
export function clearFlipStyles(elements: ReadonlyMap<string, HTMLElement>): void {
  for (const [, element] of elements) {
    element.style.removeProperty('transition')
    element.style.removeProperty('transform')
  }
}
