'use client'

import { useEffect } from 'react'

import type { ColorOption } from '@/types'
import { buildProxyUrl } from '@/utils/imageProxy'

// Covers 1x DPR (640) and 2x DPR (828) — the two most common on mobile
const PRELOAD_WIDTHS = [640, 828]

export function useColorVariantPreload(colorOptions: ColorOption[], activeUrl: string): void {
  useEffect(() => {
    colorOptions.forEach(({ imageUrl }) => {
      if (!imageUrl || imageUrl === activeUrl) return
      PRELOAD_WIDTHS.forEach((w) => {
        const img = new window.Image()
        img.src = buildProxyUrl(imageUrl, w)
      })
    })
  }, [colorOptions, activeUrl])
}
