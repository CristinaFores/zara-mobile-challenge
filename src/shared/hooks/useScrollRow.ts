'use client'

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

interface UseScrollRowOptions {
  resetKey?: string
}

interface ScrollRowThumb {
  readonly width: number
  readonly left: number
  readonly visible: boolean
}

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>

const SCROLL_ROW_EMBLA_OPTIONS = {
  align: 'start',
  containScroll: 'trimSnaps',
  dragThreshold: 4,
  duration: 22,
  loop: false,
} as const

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value))
}

function getThumbState(emblaApi: EmblaApi): ScrollRowThumb {
  const viewport = emblaApi.rootNode()
  const container = emblaApi.containerNode()
  const viewportWidth = viewport.clientWidth
  const contentWidth = container.scrollWidth

  if (contentWidth <= viewportWidth + 1) {
    return { width: 100, left: 0, visible: false }
  }

  const width = (viewportWidth / contentWidth) * 100
  const left = clampProgress(emblaApi.scrollProgress()) * (100 - width)

  return { width, left, visible: true }
}

export function useScrollRow({ resetKey = '' }: UseScrollRowOptions = {}) {
  const [viewportRef, emblaApi] = useEmblaCarousel(SCROLL_ROW_EMBLA_OPTIONS)
  const [thumb, setThumb] = useState<ScrollRowThumb>({ width: 100, left: 0, visible: false })

  const updateThumb = useCallback((api: EmblaApi) => {
    setThumb(getThumbState(api))
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    const update = () => updateThumb(emblaApi)
    update()
    emblaApi.on('scroll', update)
    emblaApi.on('resize', update)
    emblaApi.on('reInit', update)
    emblaApi.on('slidesInView', update)

    return () => {
      emblaApi.off('scroll', update)
      emblaApi.off('resize', update)
      emblaApi.off('reInit', update)
      emblaApi.off('slidesInView', update)
    }
  }, [emblaApi, updateThumb])

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.scrollTo(0, true)
  }, [emblaApi, resetKey])

  useEffect(() => {
    const viewport = emblaApi?.rootNode()
    if (!viewport || !emblaApi) return

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      event.preventDefault()
      if (event.deltaY > 0) {
        emblaApi.scrollNext()
      } else {
        emblaApi.scrollPrev()
      }
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })

    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [emblaApi])

  return { viewportRef, thumb }
}
