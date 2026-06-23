import { buildPageMetadata, DEFAULT_DESCRIPTION } from './siteMetadata'

describe('Given buildPageMetadata', () => {
  it('Then it returns meta, Open Graph and Twitter descriptions', () => {
    const metadata = buildPageMetadata({
      title: 'Smartphones',
      description: 'Browse smartphones.',
    })

    expect(metadata).toEqual({
      title: 'Smartphones',
      description: 'Browse smartphones.',
      openGraph: {
        title: 'Smartphones',
        description: 'Browse smartphones.',
        siteName: 'Mobile Catalog',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: 'Smartphones',
        description: 'Browse smartphones.',
      },
    })
  })

  it('Then it falls back to the default description when none is provided', () => {
    const metadata = buildPageMetadata({ title: 'Mobile Catalog' })

    expect(metadata.description).toBe(DEFAULT_DESCRIPTION)
    expect(metadata.openGraph?.description).toBe(DEFAULT_DESCRIPTION)
    expect(metadata.twitter?.description).toBe(DEFAULT_DESCRIPTION)
  })
})
