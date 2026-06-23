import type { Metadata } from 'next'

export const SITE_NAME = 'Mobile Catalog'

export const DEFAULT_DESCRIPTION =
  'Browse the latest smartphones. Search the catalog, compare specs, configure color and storage, and add to cart.'

interface PageMetadataOptions {
  title: string
  description?: string
}

/** Ensures every page exposes meta, Open Graph and Twitter descriptions for crawlers. */
export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}
