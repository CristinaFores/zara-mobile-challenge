import { NextRequest, NextResponse } from 'next/server'

import {
  CACHE_MAX_AGE,
  DEFAULT_QUALITY,
  DEFAULT_WIDTH,
  fetchRemoteImage,
  ImageFetchError,
  MAX_WIDTH,
  normalizeImage,
} from '@/shared/lib/imageProcessing'

const ALLOWED_IMAGE_HOSTS = new Set(['prueba-tecnica-api-tienda-moviles.onrender.com'])
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

const IMAGE_RESPONSE_HEADERS = {
  'Content-Type': 'image/webp',
  'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
  // Override Next.js RSC Vary injection — browser uses these as cache-key discriminators,
  // causing a cache miss on every navigation even for identical image URLs.
  Vary: 'Accept-Encoding',
}

// In-process cache: avoids re-fetching from onrender.com + re-running Sharp on warm requests.
// Keyed by `${url}|${width}|${quality}`. Bounded to ~MAX_ENTRIES to cap memory usage.
const MAX_ENTRIES = 200
const processedCache = new Map<string, Buffer>()

function getCacheKey(url: string, width: number, quality: number): string {
  return `${url}|${width}|${quality}`
}

function setWithEviction(key: string, value: Buffer): void {
  if (processedCache.size >= MAX_ENTRIES) {
    const oldest = processedCache.keys().next().value
    if (oldest !== undefined) processedCache.delete(oldest)
  }
  processedCache.set(key, value)
}

function parseAllowedUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw)
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null
    if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) return null
    return parsed
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  if (!parseAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed', url }, { status: 400 })
  }

  const width = Math.min(Number(searchParams.get('w')) || DEFAULT_WIDTH, MAX_WIDTH)
  const quality = Number(searchParams.get('q')) || DEFAULT_QUALITY
  const cacheKey = getCacheKey(url, width, quality)

  const cached = processedCache.get(cacheKey)
  if (cached) {
    return new NextResponse(cached as unknown as BodyInit, { headers: IMAGE_RESPONSE_HEADERS })
  }

  let source: Buffer
  try {
    source = await fetchRemoteImage(url)
  } catch (error) {
    if (error instanceof ImageFetchError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  try {
    const processedImage = await normalizeImage(source, { width, quality })
    setWithEviction(cacheKey, processedImage)
    return new NextResponse(processedImage as unknown as BodyInit, {
      headers: IMAGE_RESPONSE_HEADERS,
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Image processing failed:', error)
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 })
  }
}
