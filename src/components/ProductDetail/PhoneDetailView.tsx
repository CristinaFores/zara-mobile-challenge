import { BackLink } from '@/components/BackLink/BackLink'
import { SimilarProducts } from '@/components/SimilarProducts/SimilarProducts'
import { SpecsTable } from '@/components/SpecsTable/SpecsTable'
import { ROUTES } from '@/constants'
import type { PhoneDetail } from '@/types'

import { ProductDetailHero } from './ProductDetailHero'

import styles from './PhoneDetailView.module.scss'

interface PhoneDetailViewProps {
  phone: PhoneDetail
}

function buildSpecRows(phone: PhoneDetail) {
  return [
    { label: 'Brand', value: phone.brand },
    { label: 'Name', value: phone.name },
    { label: 'Description', value: phone.description },
    { label: 'Screen', value: phone.specs.screen },
    { label: 'Resolution', value: phone.specs.resolution },
    { label: 'Processor', value: phone.specs.processor },
    { label: 'Main camera', value: phone.specs.mainCamera },
    { label: 'Selfie camera', value: phone.specs.selfieCamera },
    { label: 'Battery', value: phone.specs.battery },
    { label: 'OS', value: phone.specs.os },
    { label: 'Screen refresh rate', value: phone.specs.screenRefreshRate },
  ]
}

export function PhoneDetailView({ phone }: PhoneDetailViewProps) {
  return (
    <>
      <BackLink href={ROUTES.HOME} />
      <article className={styles['phone-detail-view']}>
        <ProductDetailHero phone={phone} />
        <SpecsTable rows={buildSpecRows(phone)} />
      </article>
      <SimilarProducts products={phone.similarProducts} />
    </>
  )
}
