import sharp from 'sharp'

export const DEFAULT_WIDTH = 640
export const MAX_WIDTH = 1200
export const DEFAULT_QUALITY = 75
export const CACHE_MAX_AGE = 31_536_000

const CANVAS_PADDING_RATIO = 0
const TRANSPARENT_RGBA = { r: 0, g: 0, b: 0, alpha: 0 } as const

/** Keeps Sharp work below libuv's default thread-pool size so other I/O stays responsive. */
const SHARP_CONCURRENCY_LIMIT = 3
let runningSharpJobs = 0
const waitingSharpJobs: Array<() => void> = []

const acquireSharpSlot = (): Promise<void> =>
  new Promise((resolve) => {
    if (runningSharpJobs < SHARP_CONCURRENCY_LIMIT) {
      runningSharpJobs++
      resolve()
    } else {
      waitingSharpJobs.push(() => {
        runningSharpJobs++
        resolve()
      })
    }
  })

const releaseSharpSlot = (): void => {
  runningSharpJobs--
  const runNextJob = waitingSharpJobs.shift()
  if (runNextJob) runNextJob()
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
    const apiKey = process.env.API_KEY
    response = await fetch(url, {
      ...(apiKey ? { headers: { 'x-api-key': apiKey } } : {}),
    })
  } catch {
    throw new ImageFetchError(502, 'Network error fetching image')
  }

  if (!response.ok) {
    throw new ImageFetchError(response.status, 'Failed to fetch image')
  }

  return Buffer.from(await response.arrayBuffer())
}

interface ProcessImageOptions {
  width: number
  quality: number
}

const NEAR_WHITE_RGB_THRESHOLD = 240

/**
 * Flood-fill from the image borders: edge-connected near-white pixels become
 * transparent. Internal white (e.g. phone screen) is preserved because it is
 * not reachable from the border.
 */
export function removeWhiteBackground(
  rgbaBuffer: Buffer,
  imageWidth: number,
  imageHeight: number,
  nearWhiteThreshold = NEAR_WHITE_RGB_THRESHOLD
): Buffer {
  const pixels = new Uint8ClampedArray(
    rgbaBuffer.buffer,
    rgbaBuffer.byteOffset,
    rgbaBuffer.byteLength
  )
  const visited = new Uint8Array(imageWidth * imageHeight)

  const isNearWhitePixel = (pixelIndex: number): boolean => {
    const channelIndex = pixelIndex * 4
    return (
      pixels[channelIndex] >= nearWhiteThreshold &&
      pixels[channelIndex + 1] >= nearWhiteThreshold &&
      pixels[channelIndex + 2] >= nearWhiteThreshold
    )
  }

  const borderFillQueue: number[] = []
  for (let x = 0; x < imageWidth; x++) {
    borderFillQueue.push(x, (imageHeight - 1) * imageWidth + x)
  }
  for (let y = 1; y < imageHeight - 1; y++) {
    borderFillQueue.push(y * imageWidth, y * imageWidth + (imageWidth - 1))
  }

  while (borderFillQueue.length > 0) {
    const pixelIndex = borderFillQueue.pop()
    if (pixelIndex === undefined || visited[pixelIndex] || !isNearWhitePixel(pixelIndex)) continue

    visited[pixelIndex] = 1
    pixels[pixelIndex * 4 + 3] = 0

    const x = pixelIndex % imageWidth
    const y = Math.floor(pixelIndex / imageWidth)
    if (x > 0) borderFillQueue.push(pixelIndex - 1)
    if (x < imageWidth - 1) borderFillQueue.push(pixelIndex + 1)
    if (y > 0) borderFillQueue.push(pixelIndex - imageWidth)
    if (y < imageHeight - 1) borderFillQueue.push(pixelIndex + imageWidth)
  }

  return Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength)
}

/** Trims whitespace, fits the image onto a transparent square and re-encodes it as WebP. */
export async function normalizeImage(
  sourceBuffer: Buffer,
  { width: outputWidth, quality }: ProcessImageOptions
): Promise<Buffer> {
  await acquireSharpSlot()

  try {
    const { data: rawRgba, info: sourceMetadata } = await sharp(sourceBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const rgbaWithoutBackground = removeWhiteBackground(
      rawRgba,
      sourceMetadata.width,
      sourceMetadata.height
    )

    const canvasPadding = Math.round(outputWidth * CANVAS_PADDING_RATIO)
    const drawableSize = outputWidth - canvasPadding * 2

    return sharp(rgbaWithoutBackground, {
      raw: { width: sourceMetadata.width, height: sourceMetadata.height, channels: 4 },
    })
      .trim({ threshold: 40 })
      .resize(drawableSize, drawableSize, { fit: 'contain', background: TRANSPARENT_RGBA })
      .extend({
        top: canvasPadding,
        bottom: canvasPadding,
        left: canvasPadding,
        right: canvasPadding,
        background: TRANSPARENT_RGBA,
      })
      .webp({ quality })
      .toBuffer()
  } finally {
    releaseSharpSlot()
  }
}
