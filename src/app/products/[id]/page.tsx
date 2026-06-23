import type { Metadata } from 'next'

import { ProductDetailView } from '@/features/product-detail/components/ProductDetail/ProductDetailView'
import { buildProductDetailMetadata, loadProductDetail } from '@/shared/lib/loadProduct'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return buildProductDetailMetadata(await loadProductDetail(id))
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  return <ProductDetailView product={await loadProductDetail(id)} />
}
