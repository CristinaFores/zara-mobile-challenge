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
  eager?: boolean
  /** Forces a single `/api/images?w=` so preloads and hero share the browser cache. */
  fixedProxyWidth?: number
  onLoad?: () => void
}

function sharpLoader({ src, width, quality }: ImageLoaderProps): string {
  return buildProxyUrl(src, width, quality)
}

function ImageFallback({ alt }: { alt: string }) {
  return (
    <span className={styles['image-fallback']} role="img" aria-label={alt}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="14" y="4" width="20" height="40" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="21"
          y1="9"
          x2="27"
          y2="9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="39" r="1.5" fill="currentColor" />
      </svg>
    </span>
  )
}

function ImageLoadingPlaceholder({ isLoaded }: { isLoaded: boolean }) {
  return (
    <span
      className={[styles['image-placeholder'], isLoaded ? styles['image-placeholder--loaded'] : '']
        .filter(Boolean)
        .join(' ')}
      data-testid="product-image-placeholder"
      aria-hidden="true"
    >
      <span className={styles['image-placeholder__phone']} />
    </span>
  )
}

export const ProductImage = memo(function ProductImage({
  src,
  alt,
  sizes = '(max-width: 834px) 100vw, 43vw',
  priority = false,
  eager = false,
  fixedProxyWidth,
  onLoad,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [prevSrc, setPrevSrc] = useState(src)

  // Reset error when src changes (e.g. color switch) — setState during render
  // is the React-recommended pattern for syncing derived state with props
  if (prevSrc !== src) {
    setPrevSrc(src)
    setHasError(false)
    setIsLoaded(false)
  }

  const showFallback = !src || hasError

  // Signal onLoad on fallback/error so hero handoff can complete.
  useEffect(() => {
    if (showFallback) onLoad?.()
  }, [showFallback, onLoad])

  if (showFallback) {
    return <ImageFallback alt={alt} />
  }

  const imageClassName = [styles['product-image'], isLoaded ? styles['product-image--loaded'] : '']
    .filter(Boolean)
    .join(' ')

  const sharedImageProps = {
    fill: true as const,
    sizes,
    className: imageClassName,
    priority,
    loading: (priority || eager ? 'eager' : 'lazy') as 'eager' | 'lazy',
    onLoad: () => {
      setIsLoaded(true)
      onLoad?.()
    },
    onError: () => setHasError(true),
  }

  return (
    <span className={styles['product-image-root']}>
      <ImageLoadingPlaceholder isLoaded={isLoaded} />
      {fixedProxyWidth !== undefined ? (
        <Image
          alt={alt}
          {...sharedImageProps}
          src={buildProxyUrl(src, fixedProxyWidth)}
          unoptimized
        />
      ) : (
        <Image alt={alt} {...sharedImageProps} loader={sharpLoader} src={src} />
      )}
    </span>
  )
})
