'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  memo,
  useCallback,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { flushSync } from 'react-dom'

import {
  beginProductRouteViewTransition,
  getProductDetailHref,
  getProductViewTransitionName,
  scrollToProductDetailTop,
  setProductPreview,
} from '@/store/productNavigation'
import type { Phone } from '@/types'

import { ProductImage } from '../ProductImage/ProductImage'

import styles from './ProductCard.module.scss'

type ProductCardProps = Phone & {
  className?: string
  priority?: boolean
  cardRef?: (element: HTMLElement | null) => void
}

interface ViewTransitionStyle extends CSSProperties {
  readonly viewTransitionName?: string
}

function shouldHandleClientNavigation(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.currentTarget.target !== '_blank'
  )
}

export const ProductCard = memo(function ProductCard({
  id,
  brand,
  name,
  basePrice,
  imageUrl,
  priority = false,
  cardRef,
  className,
}: ProductCardProps) {
  const router = useRouter()
  const [prefetchFull, setPrefetchFull] = useState(false)
  const [isTransitionSource, setIsTransitionSource] = useState(false)
  const href = getProductDetailHref(id)

  const rememberProduct = useCallback(() => {
    setProductPreview({ id, brand, name, basePrice, imageUrl, href })
  }, [basePrice, brand, href, id, imageUrl, name])

  const warmRoute = useCallback(() => {
    rememberProduct()
    setPrefetchFull(true)
    router.prefetch(href)
  }, [href, rememberProduct, router])

  const activateNavigation = useCallback(() => {
    rememberProduct()
    flushSync(() => {
      setIsTransitionSource(true)
    })
  }, [rememberProduct])

  const activatePointerNavigation = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.button !== 0) return
      activateNavigation()
    },
    [activateNavigation]
  )

  const navigateWithViewTransition = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!shouldHandleClientNavigation(event)) return

      const viewTransitionDocument = document as typeof document & {
        readonly startViewTransition?: Document['startViewTransition']
      }
      const canUseViewTransition =
        typeof viewTransitionDocument.startViewTransition === 'function' &&
        !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!canUseViewTransition) {
        activateNavigation()
        return
      }

      event.preventDefault()
      warmRoute()
      activateNavigation()

      const root = document.documentElement
      root.classList.add('product-route-view-transition')
      const destinationReady = beginProductRouteViewTransition(id)

      const transition = viewTransitionDocument.startViewTransition?.(async () => {
        scrollToProductDetailTop()
        router.push(href)
        await destinationReady
      })

      transition?.ready.then(
        () => {
          root.classList.add('product-route-view-transition-ready')
        },
        () => {}
      )
      transition?.finished.finally(() => {
        root.classList.remove(
          'product-route-view-transition',
          'product-route-view-transition-ready'
        )
      })
    },
    [activateNavigation, href, id, router, warmRoute]
  )

  const imageTransitionStyle = isTransitionSource
    ? ({
        viewTransitionName: getProductViewTransitionName(id, 'image'),
      } satisfies ViewTransitionStyle)
    : undefined

  return (
    <li
      ref={cardRef ? (element) => cardRef(element) : undefined}
      className={[styles['product-card'], className].filter(Boolean).join(' ')}
    >
      <Link
        href={href}
        className={styles['product-card__link']}
        aria-label={`${brand} ${name}, ${basePrice} EUR`}
        prefetch={prefetchFull || priority ? true : 'auto'}
        transitionTypes={['product-detail']}
        onMouseEnter={warmRoute}
        onFocus={warmRoute}
        onTouchStart={warmRoute}
        onPointerDown={activatePointerNavigation}
        onClick={navigateWithViewTransition}
        onNavigate={activateNavigation}
      >
        <span className={styles['product-card__image-wrapper']} style={imageTransitionStyle}>
          <ProductImage
            src={imageUrl}
            alt={`${brand} ${name}`}
            sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            priority={priority}
          />
        </span>
        <div className={styles['product-card__info']}>
          <hgroup className={styles['product-card__details']}>
            <p className={styles['product-card__brand']}>{brand}</p>
            <h3 className={styles['product-card__name']}>{name}</h3>
          </hgroup>
          <p className={styles['product-card__price']}>{basePrice} EUR</p>
        </div>
      </Link>
    </li>
  )
})
