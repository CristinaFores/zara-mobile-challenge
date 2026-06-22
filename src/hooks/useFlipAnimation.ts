'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  clearFlipStyles,
  findExitingCards,
  haveIdsChanged,
  playFlip,
  snapshotRects,
  type ExitingCard,
} from '@/lib/flip'
import type { Phone } from '@/types'

export type { ExitingCard } from '@/lib/flip'

const FLIP_TRANSITION_MS = 500

export type AnimationPhase = 'idle' | 'animating'

interface FlipAnimationResult {
  displayedPhones: Phone[]
  exitingCards: ExitingCard[]
  animationPhase: AnimationPhase
  cardRef: (id: string, el: HTMLElement | null) => void
}

/**
 * Animates the catalog grid with the FLIP technique when its phones change:
 * remaining cards slide to their new slots and removed cards fade out in place.
 *
 * The hook owns the React state and the update queue; the DOM measurements and
 * the transform maths live in `@/lib/flip` so they can be reasoned about and
 * tested in isolation.
 */
export function useFlipAnimation(targetPhones: readonly Phone[]): FlipAnimationResult {
  const [displayedPhones, setDisplayedPhones] = useState<Phone[]>([...targetPhones])
  const [exitingCards, setExitingCards] = useState<ExitingCard[]>([])
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle')

  const previousPhonesRef = useRef<readonly Phone[]>(targetPhones)
  const queuedUpdateRef = useRef<Phone[] | null>(null)
  const isAnimatingRef = useRef(false)
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardElementsRef = useRef(new Map<string, HTMLElement>())
  const isFirstRender = useRef(true)
  const animateRef = useRef<(nextPhones: Phone[]) => void>(() => {})

  const cardRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) cardElementsRef.current.set(id, el)
    else cardElementsRef.current.delete(id)
  }, [])

  const animate = useCallback((nextPhones: Phone[]) => {
    isAnimatingRef.current = true
    const nextIds = new Set(nextPhones.map((phone) => phone.id))

    const snapshot = snapshotRects(cardElementsRef.current)
    const leaving = findExitingCards(previousPhonesRef.current, nextIds, snapshot)

    setDisplayedPhones(nextPhones)
    setExitingCards(leaving)
    setAnimationPhase('animating')
    previousPhonesRef.current = nextPhones

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
      previousPhonesRef.current = targetPhones
      return
    }

    if (!haveIdsChanged(previousPhonesRef.current, targetPhones)) {
      if (!isAnimatingRef.current) {
        setDisplayedPhones([...targetPhones])
        previousPhonesRef.current = targetPhones
      }
      return
    }

    const nextPhones = [...targetPhones]

    if (isAnimatingRef.current) {
      queuedUpdateRef.current = nextPhones
      return
    }

    animate(nextPhones)
  }, [targetPhones, animate])

  return { displayedPhones, exitingCards, animationPhase, cardRef }
}
