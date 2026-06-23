'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { IMAGE_CROSSFADE_MS } from '@/shared/constants'
import { buildProxyUrl } from '@/shared/utils/imageProxy'

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
      transition: incomingReady ? `opacity ${IMAGE_CROSSFADE_MS}ms ease` : 'none',
    }
  }

  if (incoming === null && front === slot) {
    return { zIndex: 2, opacity: 1, transition: 'none' }
  }

  if (incoming !== null && front === slot) {
    return { zIndex: 1, opacity: 1, transition: 'none' }
  }

  return { zIndex: 1, opacity: 0, transition: 'none' }
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

    let cancelled = false

    const startCrossfade = () => {
      if (cancelled) return
      setState((prev) => {
        const back: 0 | 1 = prev.front === 0 ? 1 : 0
        const backCurrentUrl = back === 0 ? prev.slot0Url : prev.slot1Url
        return {
          ...prev,
          incoming: back,
          imageLoaded: backCurrentUrl === targetUrl,
          incomingReady: false,
          epoch: prev.epoch + 1,
          slot0Url: back === 0 ? targetUrl : prev.slot0Url,
          slot1Url: back === 1 ? targetUrl : prev.slot1Url,
        }
      })
    }

    const probe = new globalThis.Image()
    probe.src = buildProxyUrl(targetUrl, 828)

    if (probe.complete) {
      startCrossfade()
    } else {
      probe.onload = startCrossfade
      probe.onerror = startCrossfade
    }

    return () => {
      cancelled = true
      probe.onload = null
      probe.onerror = null
    }
  }, [targetUrl])

  useEffect(() => {
    if (!state.imageLoaded || state.incoming === null) return
    const slot = state.incoming

    function markReady() {
      setState((prev) =>
        prev.incoming === slot && prev.imageLoaded ? { ...prev, incomingReady: true } : prev
      )
    }

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(markReady)
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
    }, IMAGE_CROSSFADE_MS)
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
