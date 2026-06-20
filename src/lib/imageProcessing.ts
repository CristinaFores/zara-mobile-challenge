import sharp from 'sharp'

export const DEFAULT_WIDTH = 640
export const MAX_WIDTH = 1200
export const DEFAULT_QUALITY = 75
export const CACHE_MAX_AGE = 31_536_000

const PADDING_RATIO = 0
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 } as const

/**
 * Raised while downloading the source image. Carries the HTTP status the route
 * should respond with: the upstream status for a non-ok response, or 502 for a
 * network failure.
 */
export class ImageFetchError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ImageFetchError'
  }
}

/** Downloads the source image. Throws {@link ImageFetchError} on any failure. */
export async function fetchRemoteImage(url: string): Promise<Buffer> {
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new ImageFetchError(502, 'Network error fetching image')
  }

  if (!response.ok) {
    throw new ImageFetchError(response.status, 'Failed to fetch image')
  }

  return Buffer.from(await response.arrayBuffer())
}

interface NormalizeOptions {
  width: number
  quality: number
}

/** Trims whitespace, fits the image onto a transparent square and re-encodes it as WebP. */
export async function normalizeImage(
  source: Buffer,
  { width, quality }: NormalizeOptions
): Promise<Buffer> {
  const padding = Math.round(width * PADDING_RATIO)
  const inner = width - padding * 2

  return sharp(source)
    .ensureAlpha()
    .trim({ threshold: 40 })
    .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: TRANSPARENT,
    })
    .webp({ quality })
    .toBuffer()
}
