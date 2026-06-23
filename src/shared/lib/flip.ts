import type { Phone } from '@/shared/types'

/** A card that left the grid, captured with the position it occupied so it can animate out. */
export interface ExitingCard {
  phone: Phone
  rect: DOMRect
}

/** Snapshot of each card's on-screen position, keyed by phone id (the FLIP "First" read). */
export type RectSnapshot = Map<string, DOMRect>

/** True when the two lists differ in length or contain a different set of ids. */
export function haveIdsChanged(prev: readonly Phone[], next: readonly Phone[]): boolean {
  if (prev.length !== next.length) return true
  const prevIds = new Set(prev.map((phone) => phone.id))
  return next.some((phone) => !prevIds.has(phone.id))
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
  previousPhones: readonly Phone[],
  nextIds: ReadonlySet<string>,
  snapshot: RectSnapshot
): ExitingCard[] {
  const exiting: ExitingCard[] = []
  for (const phone of previousPhones) {
    if (nextIds.has(phone.id)) continue
    const rect = snapshot.get(phone.id)
    if (rect) exiting.push({ phone, rect })
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
