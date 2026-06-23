'use client'

import { useParams } from 'next/navigation'
import { useLayoutEffect } from 'react'
import type { CSSProperties } from 'react'

import heroStyles from '@/features/product-detail/components/ProductDetail/ProductDetailHero.module.scss'
import detailStyles from '@/features/product-detail/components/ProductDetail/ProductDetailView.module.scss'
import specsStyles from '@/features/product-detail/components/SpecsTable/SpecsTable.module.scss'
import rowStyles from '@/features/product-detail/components/SpecsTable/SpecsTableRow.module.scss'
import { BackLink } from '@/shared/components/BackLink/BackLink'
import { ProductImage } from '@/shared/components/ProductImage/ProductImage'
import { DETAIL_HERO_IMAGE_SIZES, DETAIL_HERO_IMAGE_WIDTH } from '@/shared/constants'
import {
  getProductDetailHref,
  getProductViewTransitionName,
  resolveProductRouteViewTransition,
  scrollToProductDetailTop,
  useProductPreview,
} from '@/shared/store/productNavigation'

import styles from './loading.module.scss'

const SPEC_ROW_COUNT = 11

interface ViewTransitionStyle extends CSSProperties {
  readonly viewTransitionName?: string
}

export default function ProductDetailLoading() {
  const params = useParams<{ id?: string }>()
  const productId = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')
  const preview = useProductPreview(productId)
  const productPreview = preview?.href === getProductDetailHref(productId) ? preview : null
  const hasPreview = productPreview !== null

  const imageTransitionStyle = productPreview
    ? ({
        viewTransitionName: getProductViewTransitionName(productPreview.id),
      } satisfies ViewTransitionStyle)
    : undefined

  useLayoutEffect(() => {
    if (!productId) return

    scrollToProductDetailTop()
    resolveProductRouteViewTransition(productId)
  }, [productId])

  return (
    <>
      <BackLink productId={productId} />
      <article className={detailStyles['product-detail-view']} data-page="product-detail">
        <section className={heroStyles['product-detail-hero']} aria-label="Loading product">
          <div
            className={`${heroStyles['product-detail-hero__gallery']} ${styles['detail-loading__media']}`}
            data-has-preview={hasPreview}
            style={imageTransitionStyle}
            aria-hidden={!hasPreview}
          >
            {productPreview ? (
              <figure className={heroStyles['product-detail-hero__image']}>
                <ProductImage
                  src={productPreview.imageUrl}
                  alt={`${productPreview.brand} ${productPreview.name}`}
                  priority
                  sizes={DETAIL_HERO_IMAGE_SIZES}
                  fixedProxyWidth={DETAIL_HERO_IMAGE_WIDTH}
                />
              </figure>
            ) : null}
          </div>

          <div className={heroStyles['product-detail-hero__info']} aria-hidden="true">
            <div className={styles['detail-loading__heading']}>
              <div className={styles['detail-loading__line']} data-variant="title" />
              <div className={styles['detail-loading__line']} data-variant="price" />
            </div>

            <div className={styles['detail-loading__selectors']}>
              <div className={styles['detail-loading__selector']}>
                <div className={styles['detail-loading__line']} data-variant="label" />
                <div className={styles['detail-loading__chips']}>
                  <span className={styles['detail-loading__chip']} />
                  <span className={styles['detail-loading__chip']} />
                </div>
              </div>

              <div className={styles['detail-loading__selector']}>
                <div className={styles['detail-loading__line']} data-variant="label" />
                <div className={styles['detail-loading__row']}>
                  <span className={styles['detail-loading__swatch']} />
                  <span className={styles['detail-loading__swatch']} />
                  <span className={styles['detail-loading__swatch']} />
                  <span className={styles['detail-loading__swatch']} />
                </div>
              </div>
            </div>

            <div className={styles['detail-loading__button']} />
          </div>
        </section>

        <section className={specsStyles['specs-table']} aria-label="Loading specifications">
          <div className={styles['detail-loading__line']} data-variant="heading" />
          <div className={specsStyles['specs-table__list']}>
            {Array.from({ length: SPEC_ROW_COUNT }, (_, index) => (
              <div className={rowStyles['specs-table-row']} key={index}>
                <span className={styles['detail-loading__line']} data-variant="spec-label" />
                <span className={styles['detail-loading__line']} data-variant="spec-value" />
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  )
}
