import type { Metadata } from 'next'

import { ProductCatalog } from '@/features/catalog/components/ProductCatalog/ProductCatalog'
import { getProducts } from '@/shared/services/products.service'

export const metadata: Metadata = {
  title: 'Smartphones',
  description: 'Browse the latest smartphones — search the catalog, compare specs and add to cart.',
}

interface HomeProps {
  searchParams: Promise<{ search?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { search = '' } = await searchParams
  const products = await getProducts(search || undefined)

  return <ProductCatalog products={products} initialSearch={search} />
}
