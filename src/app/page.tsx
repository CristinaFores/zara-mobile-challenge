import type { Metadata } from 'next'

import { ProductList } from '@/components/ProductList/ProductList'
import { getPhones } from '@/services/phones.service'

export const metadata: Metadata = {
  title: 'Smartphones',
  description: 'Browse the latest smartphones — filter by color, compare specs and add to cart.',
}

interface HomeProps {
  searchParams: Promise<{ search?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { search = '' } = await searchParams
  const phones = await getPhones(search)

  return (
    <>
      <ProductList phones={phones} />
    </>
  )
}
