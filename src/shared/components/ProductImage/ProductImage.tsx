'use client'

import Image, { type ImageLoaderProps } from 'next/image'
import { memo, useEffect, useState } from 'react'

import { buildProxyUrl } from '@/shared/utils/imageProxy'

import styles from './ProductImage.module.scss'

interface ProductImageProps {
  src?: string
  alt: string
  sizes?: string
  priority?: boolean
  onLoad?: () => void
}

// WIP
function sharpLoader({ src, width, quality }: ImageLoaderProps): string {
  return buildProxyUrl(src, width, quality)
}

// WIP
function ImageFallback() {
  return (
    <span className={styles['image-fallback']} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
      </svg>
    </span>
  )
}

export const ProductImage = memo(function ProductImage({
  src,
  alt,
  sizes = '(max-width: 834px) 100vw, 43vw',
  priority = false,
  onLoad,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const [prevSrc, setPrevSrc] = useState(src)

  // Reset error when src changes (e.g. color switch) — setState during render
  // is the React-recommended pattern for syncing derived state with props
  if (prevSrc !== src) {
    setPrevSrc(src)
    setHasError(false)
  }

  const showFallback = !src || hasError

  // Signal onLoad even for fallback so crossfade completes normally
  useEffect(() => {
    if (showFallback) onLoad?.()
  }, [showFallback, onLoad])

  if (showFallback) {
    return <ImageFallback />
  }

  return (
    <Image
      loader={sharpLoader}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={styles['product-image']}
      priority={priority}
      onLoad={onLoad}
      onError={() => setHasError(true)}
    />
  )
})
