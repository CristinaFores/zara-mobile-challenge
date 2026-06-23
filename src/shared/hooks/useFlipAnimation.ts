'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  clearFlipStyles,
  findExitingCards,
  haveIdsChanged,
  playFlip,
  snapshotRects,
  type ExitingCard,
} from '@/shared/lib/flip'
import type { Product } from '@/shared/types'

export type { ExitingCard } from '@/shared/lib/flip'

const FLIP_TRANSITION_MS = 500

export type AnimationPhase = 'idle' | 'animating'

interface FlipAnimationResult {
  displayedProducts: Product[]
  exitingCards: ExitingCard[]
  animationPhase: AnimationPhase
  cardRef: (id: string, el: HTMLElement | null) => void
}

/**
 * Animates the catalog grid with the FLIP technique when its products change:
 * remaining cards slide to their new slots and removed cards fade out in place.
 *
 * The hook owns the React state and the update queue; the DOM measurements and
 * the transform maths live in `@/shared/lib/flip` so they can be reasoned about and
 * tested in isolation.
 */
export function useFlipAnimation(targetProducts: readonly Product[]): FlipAnimationResult {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([...targetProducts])
  const [exitingCards, setExitingCards] = useState<ExitingCard[]>([])
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle')

  const previousProductsRef = useRef<readonly Product[]>(targetProducts)
  const queuedUpdateRef = useRef<Product[] | null>(null)
  const isAnimatingRef = useRef(false)
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardElementsRef = useRef(new Map<string, HTMLElement>())
  const isFirstRender = useRef(true)
  const animateRef = useRef<(nextProducts: Product[]) => void>(() => {})

  const cardRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) cardElementsRef.current.set(id, el)
    else cardElementsRef.current.delete(id)
  }, [])

  const animate = useCallback((nextProducts: Product[]) => {
    isAnimatingRef.current = true
    const nextIds = new Set(nextProducts.map((product) => product.id))

    const snapshot = snapshotRects(cardElementsRef.current)
    const leaving = findExitingCards(previousProductsRef.current, nextIds, snapshot)

    setDisplayedProducts(nextProducts)
    setExitingCards(leaving)
    setAnimationPhase('animating')
    previousProductsRef.current = nextProducts

    playFlip(cardElementsRef.current, snapshot, FLIP_TRANSITION_MS)

    cleanupTimerRef.current = setTimeout(() => {
      setExitingCards([])
      setAnimationPhase('idle')
      isAnimatingRef.current = false
      clearFlipStyles(cardElementsRef.current)

      if (queuedUpdateRef.current) {
        const queued = queuedUpdateRef.current
        queuedUpdateRef.current = null
        animateRef.current(queued)
      }
    }, FLIP_TRANSITION_MS)
  }, [])

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousProductsRef.current = targetProducts
      return
    }

    if (!haveIdsChanged(previousProductsRef.current, targetProducts)) {
      if (!isAnimatingRef.current) {
        setDisplayedProducts([...targetProducts])
        previousProductsRef.current = targetProducts
      }
      return
    }

    const nextProducts = [...targetProducts]

    if (isAnimatingRef.current) {
      queuedUpdateRef.current = nextProducts
      return
    }

    animate(nextProducts)
  }, [targetProducts, animate])

  return { displayedProducts, exitingCards, animationPhase, cardRef }
}
