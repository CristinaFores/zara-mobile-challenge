import sharp from 'sharp'

export const DEFAULT_WIDTH = 640
export const MAX_WIDTH = 1200
export const DEFAULT_QUALITY = 75
export const CACHE_MAX_AGE = 31_536_000

const PADDING_RATIO = 0
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 } as const

/** Keeps Sharp work below libuv's default thread-pool size so other I/O stays responsive. */
const MAX_CONCURRENT_SHARP = 3
let activeSharp = 0
const sharpQueue: Array<() => void> = []

const acquireSharpSlot = (): Promise<void> =>
  new Promise((resolve) => {
    if (activeSharp < MAX_CONCURRENT_SHARP) {
      activeSharp++
      resolve()
    } else {
      sharpQueue.push(() => {
        activeSharp++
        resolve()
      })
    }
  })

const releaseSharpSlot = (): void => {
  activeSharp--
  const next = sharpQueue.shift()
  if (next) next()
}

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

const BACKGROUND_THRESHOLD = 240

/**
 * Flood-fill from the image borders: edge-connected near-white pixels become
 * transparent. Internal white (e.g. phone screen) is preserved because it is
 * not reachable from the border.
 */
export function removeWhiteBackground(
  data: Buffer,
  width: number,
  height: number,
  threshold = BACKGROUND_THRESHOLD
): Buffer {
  const pixels = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength)
  const visited = new Uint8Array(width * height)

  const isBackground = (pos: number): boolean => {
    const i = pos * 4
    return pixels[i] >= threshold && pixels[i + 1] >= threshold && pixels[i + 2] >= threshold
  }

  const queue: number[] = []
  for (let x = 0; x < width; x++) {
    queue.push(x)
    queue.push((height - 1) * width + x)
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(y * width)
    queue.push(y * width + (width - 1))
  }

  while (queue.length > 0) {
    const pos = queue.pop()
    if (pos === undefined || visited[pos] || !isBackground(pos)) continue

    visited[pos] = 1
    pixels[pos * 4 + 3] = 0

    const x = pos % width
    const y = Math.floor(pos / width)
    if (x > 0) queue.push(pos - 1)
    if (x < width - 1) queue.push(pos + 1)
    if (y > 0) queue.push(pos - width)
    if (y < height - 1) queue.push(pos + width)
  }

  return Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength)
}

/** Trims whitespace, fits the image onto a transparent square and re-encodes it as WebP. */
export async function normalizeImage(
  source: Buffer,
  { width, quality }: NormalizeOptions
): Promise<Buffer> {
  await acquireSharpSlot()

  try {
    const { data, info } = await sharp(source)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const cleaned = removeWhiteBackground(data, info.width, info.height)

    const padding = Math.round(width * PADDING_RATIO)
    const inner = width - padding * 2

    return sharp(cleaned, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
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
  } finally {
    releaseSharpSlot()
  }
}
