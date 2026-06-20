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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
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
