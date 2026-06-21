import { NextRequest, NextResponse } from 'next/server'

import {
  CACHE_MAX_AGE,
  DEFAULT_QUALITY,
  DEFAULT_WIDTH,
  fetchRemoteImage,
  ImageFetchError,
  MAX_WIDTH,
  normalizeImage,
} from '@/lib/imageProcessing'

const ALLOWED_IMAGE_HOSTS = new Set(['prueba-tecnica-api-tienda-moviles.onrender.com'])
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

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
    return new NextResponse(processedImage as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
      },
    })
  } catch (error) {
    console.error('Image processing failed:', error)
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 })
  }
}
