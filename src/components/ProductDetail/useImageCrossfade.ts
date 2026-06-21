'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const FADE_MS = 450

export interface ImageSlot {
  url: string
  zIndex: number
  opacity: number
  transition: string
  onLoad: () => void
}

interface CrossfadeState {
  front: 0 | 1
  slot0Url: string
  slot1Url: string
  incoming: 0 | 1 | null
  imageLoaded: boolean
  incomingReady: boolean
  epoch: number
}

function slotStyle(
  slot: 0 | 1,
  { front, incoming, incomingReady }: CrossfadeState
): Pick<ImageSlot, 'zIndex' | 'opacity' | 'transition'> {
  if (incoming === slot) {
    return {
      zIndex: 2,
      opacity: incomingReady ? 1 : 0,
      transition: incomingReady ? `opacity ${FADE_MS}ms ease` : 'none',
    }
  }
  return {
    zIndex: front === slot && incoming === null ? 2 : 1,
    opacity: 1,
    transition: 'none',
  }
}

export function useImageCrossfade(targetUrl: string): [ImageSlot, ImageSlot] {
  const [state, setState] = useState<CrossfadeState>({
    front: 0,
    slot0Url: targetUrl,
    slot1Url: targetUrl,
    incoming: null,
    imageLoaded: false,
    incomingReady: false,
    epoch: 0,
  })

  const prevUrlRef = useRef(targetUrl)

  useEffect(() => {
    if (targetUrl === prevUrlRef.current) return
    prevUrlRef.current = targetUrl

    setState((prev) => {
      const back: 0 | 1 = prev.front === 0 ? 1 : 0
      const backCurrentUrl = back === 0 ? prev.slot0Url : prev.slot1Url
      // If the back slot already has the target URL, onLoad won't fire again — skip waiting.
      const imageLoaded = backCurrentUrl === targetUrl
      return {
        ...prev,
        incoming: back,
        imageLoaded,
        incomingReady: false,
        epoch: prev.epoch + 1,
        slot0Url: back === 0 ? targetUrl : prev.slot0Url,
        slot1Url: back === 1 ? targetUrl : prev.slot1Url,
      }
    })
  }, [targetUrl])

  useEffect(() => {
    if (!state.imageLoaded || state.incoming === null) return
    const slot = state.incoming
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setState((prev) =>
          prev.incoming === slot && prev.imageLoaded ? { ...prev, incomingReady: true } : prev
        )
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [state.imageLoaded, state.incoming, state.epoch])

  useEffect(() => {
    if (!state.incomingReady || state.incoming === null) return
    const settled = state.incoming
    const id = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        front: settled,
        incoming: null,
        imageLoaded: false,
        incomingReady: false,
      }))
    }, FADE_MS)
    return () => clearTimeout(id)
  }, [state.incomingReady, state.incoming])

  const onSlot0Load = useCallback(() => {
    setState((prev) => (prev.incoming === 0 ? { ...prev, imageLoaded: true } : prev))
  }, [])

  const onSlot1Load = useCallback(() => {
    setState((prev) => (prev.incoming === 1 ? { ...prev, imageLoaded: true } : prev))
  }, [])

  return [
    { url: state.slot0Url, ...slotStyle(0, state), onLoad: onSlot0Load },
    { url: state.slot1Url, ...slotStyle(1, state), onLoad: onSlot1Load },
  ] as const
}
