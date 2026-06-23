import { ProductCatalog } from '@/features/catalog/components/ProductCatalog/ProductCatalog'
import { buildPageMetadata } from '@/shared/lib/siteMetadata'
import { getProducts } from '@/shared/services/products.service'

export const metadata = buildPageMetadata({
  title: 'Smartphones',
  description:
    'Browse the latest smartphones. Search the catalog, compare specs, configure variants, and add to cart.',
})

interface HomeProps {
  searchParams: Promise<{ search?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { search = '' } = await searchParams
  const products = await getProducts(search || undefined)

  return <ProductCatalog products={products} initialSearch={search} />
}
