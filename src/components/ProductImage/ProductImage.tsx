'use client'

import Image, { type ImageLoaderProps } from 'next/image'

import styles from './ProductImage.module.scss'

interface ProductImageProps {
  readonly src: string
  readonly alt: string
  readonly priority?: boolean
}

function sharpLoader({ src, width, quality }: ImageLoaderProps): string {
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
  })
  return `/api/images?${params.toString()}`
}

export function ProductImage({ src, alt, priority = false }: ProductImageProps) {
  return (
    <Image
      loader={sharpLoader}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 834px) 100vw, (max-width: 1920px) 50vw, 25vw"
      className={styles.image}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
    />
  )
}
