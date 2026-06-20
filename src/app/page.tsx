import type { Metadata } from 'next'

import { PhoneCatalog } from '@/components/PhoneCatalog/PhoneCatalog'
import { getPhones } from '@/services/phones.service'

export const metadata: Metadata = {
  title: 'Smartphones',
  description: 'Browse the latest smartphones — search the catalog, compare specs and add to cart.',
}

interface HomeProps {
  readonly searchParams: Promise<{ search?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { search = '' } = await searchParams
  const phones = await getPhones()

  return <PhoneCatalog phones={phones} initialSearch={search} />
}
