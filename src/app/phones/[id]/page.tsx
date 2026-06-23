import type { Metadata } from 'next'

import { PhoneDetailView } from '@/features/product-detail/components/ProductDetail/PhoneDetailView'
import { buildPhoneDetailMetadata, loadPhoneDetail } from '@/shared/lib/loadPhone'

interface PhoneDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PhoneDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return buildPhoneDetailMetadata(await loadPhoneDetail(id))
}

export default async function PhoneDetailPage({ params }: PhoneDetailPageProps) {
  const { id } = await params
  return <PhoneDetailView phone={await loadPhoneDetail(id)} />
}
