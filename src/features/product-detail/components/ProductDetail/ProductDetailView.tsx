import { SimilarProducts } from '@/features/product-detail/components/SimilarProducts/SimilarProducts'
import { SpecsTable } from '@/features/product-detail/components/SpecsTable/SpecsTable'
import { BackLink } from '@/shared/components/BackLink/BackLink'
import type { ProductDetail } from '@/shared/types'

import { ProductDetailHero } from './ProductDetailHero'

import styles from './ProductDetailView.module.scss'

interface ProductDetailViewProps {
  product: ProductDetail
}

function buildSpecRows(product: ProductDetail) {
  return [
    { label: 'Brand', value: product.brand },
    { label: 'Name', value: product.name },
    { label: 'Description', value: product.description },
    { label: 'Screen', value: product.specs.screen },
    { label: 'Resolution', value: product.specs.resolution },
    { label: 'Processor', value: product.specs.processor },
    { label: 'Main camera', value: product.specs.mainCamera },
    { label: 'Selfie camera', value: product.specs.selfieCamera },
    { label: 'Battery', value: product.specs.battery },
    { label: 'OS', value: product.specs.os },
    { label: 'Screen refresh rate', value: product.specs.screenRefreshRate },
  ]
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <>
      <BackLink productId={product.id} />
      <article className={styles['product-detail-view']} data-page="product-detail">
        <ProductDetailHero product={product} />
        <SpecsTable rows={buildSpecRows(product)} />
        <SimilarProducts products={product.similarProducts} currentProductId={product.id} />
      </article>
    </>
  )
}
