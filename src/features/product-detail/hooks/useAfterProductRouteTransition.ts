'use client'

import { useSyncExternalStore } from 'react'

function subscribe(listener: () => void): () => void {
  const observer = new MutationObserver(listener)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

function isAfterProductRouteTransition(): boolean {
  return !document.documentElement.classList.contains('product-route-view-transition')
}

/**
 * False while the catalog → detail shared-element transition is running.
 * Prevents carousel cards, crossfades and other motion from fighting the morph.
 */
export function useAfterProductRouteTransition(): boolean {
  return useSyncExternalStore(subscribe, isAfterProductRouteTransition, () => true)
}
