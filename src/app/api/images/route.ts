import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const DEFAULT_WIDTH = 640
const MAX_WIDTH = 1200
const DEFAULT_QUALITY = 75
const PADDING_RATIO = 0
const CACHE_MAX_AGE = 31_536_000
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 } as const

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  const width = Math.min(Number(searchParams.get('w')) || DEFAULT_WIDTH, MAX_WIDTH)
  const quality = Number(searchParams.get('q')) || DEFAULT_QUALITY

  let imageBuffer: Buffer
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }
    imageBuffer = Buffer.from(await response.arrayBuffer())
  } catch {
    return NextResponse.json({ error: 'Network error fetching image' }, { status: 502 })
  }

  try {
    const padding = Math.round(width * PADDING_RATIO)
    const inner = width - padding * 2

    const normalized = await sharp(imageBuffer)
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

    return new NextResponse(normalized as unknown as BodyInit, {
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
