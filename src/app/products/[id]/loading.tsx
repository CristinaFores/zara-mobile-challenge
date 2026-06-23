'use client'

import { useParams } from 'next/navigation'
import { useLayoutEffect } from 'react'
import type { CSSProperties } from 'react'

import heroStyles from '@/features/product-detail/components/ProductDetail/ProductDetailHero.module.scss'
import detailStyles from '@/features/product-detail/components/ProductDetail/ProductDetailView.module.scss'
import { BackLink } from '@/shared/components/BackLink/BackLink'
import { ProductImage } from '@/shared/components/ProductImage/ProductImage'
import { ROUTES } from '@/shared/constants'
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
        viewTransitionName: getProductViewTransitionName(productPreview.id, 'image'),
      } satisfies ViewTransitionStyle)
    : undefined

  useLayoutEffect(() => {
    if (!productId) return

    scrollToProductDetailTop()

    if (!productPreview) {
      resolveProductRouteViewTransition(productId)
      return
    }

    const frame = requestAnimationFrame(() => {
      resolveProductRouteViewTransition(productId)
    })

    return () => cancelAnimationFrame(frame)
  }, [productId, productPreview])

  return (
    <>
      <BackLink href={ROUTES.HOME} />
      <article className={detailStyles['product-detail-view']}>
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
                  sizes="(max-width: 834px) 100vw, 43vw"
                />
              </figure>
            ) : null}
          </div>

          <div className={heroStyles['product-detail-hero__info']} aria-hidden="true">
            <div className={styles['detail-loading__line']} data-variant="title" />
            <div className={styles['detail-loading__line']} data-variant="price" />
            <div className={styles['detail-loading__selectors']}>
              <div className={styles['detail-loading__line']} data-variant="label" />
              <div className={styles['detail-loading__row']}>
                <span className={styles['detail-loading__chip']} />
                <span className={styles['detail-loading__chip']} />
                <span className={styles['detail-loading__chip']} />
              </div>
            </div>
            <div className={styles['detail-loading__button']} />
          </div>
        </section>

        <section className={styles['detail-loading__specs']} aria-hidden="true">
          {Array.from({ length: SPEC_ROW_COUNT }, (_, index) => (
            <div className={styles['detail-loading__spec-row']} key={index}>
              <span className={styles['detail-loading__line']} data-variant="spec-label" />
              <span className={styles['detail-loading__line']} data-variant="spec-value" />
            </div>
          ))}
        </section>
      </article>
    </>
  )
}
