'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  useCallback,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { flushSync } from 'react-dom'

import { ROUTES } from '@/shared/constants'
import { prefersReducedMotion } from '@/shared/lib/browser'
import {
  beginProductRouteViewTransition,
  getProductDetailHref,
  getProductViewTransitionName,
  scrollToProductDetailTop,
  setProductPreview,
} from '@/shared/store/productNavigation'
import type { Product } from '@/shared/types'
interface ViewTransitionStyle extends CSSProperties {
  readonly viewTransitionName?: string
}

type ProductNavigationSource = Pick<Product, 'id' | 'brand' | 'name' | 'basePrice' | 'imageUrl'>

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

export function useProductDetailNavigation(
  product: ProductNavigationSource,
  { enableViewTransition = true }: { enableViewTransition?: boolean } = {}
) {
  const router = useRouter()
  const pathname = usePathname()
  const shouldUseViewTransition =
    enableViewTransition && !pathname.startsWith(`${ROUTES.PRODUCT_DETAIL}/`)
  const [prefetchFull, setPrefetchFull] = useState(false)
  const [isTransitionSource, setIsTransitionSource] = useState(false)
  const { id, brand, name, basePrice, imageUrl } = product
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
    if (!shouldUseViewTransition) return

    flushSync(() => {
      setIsTransitionSource(true)
    })
  }, [rememberProduct, shouldUseViewTransition])

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

      if (!shouldUseViewTransition) {
        event.preventDefault()
        warmRoute()
        scrollToProductDetailTop()
        router.push(href)
        return
      }

      const viewTransitionDocument = document as typeof document & {
        readonly startViewTransition?: Document['startViewTransition']
      }
      const canUseViewTransition =
        typeof viewTransitionDocument.startViewTransition === 'function' && !prefersReducedMotion()

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
    [activateNavigation, href, id, router, shouldUseViewTransition, warmRoute]
  )

  const imageTransitionStyle =
    shouldUseViewTransition && isTransitionSource
      ? ({
          viewTransitionName: getProductViewTransitionName(id),
        } satisfies ViewTransitionStyle)
      : undefined

  const linkTransitionTypes = shouldUseViewTransition ? (['product-detail'] as const) : undefined

  return {
    href,
    prefetchFull,
    imageTransitionStyle,
    linkTransitionTypes,
    warmRoute,
    activatePointerNavigation,
    navigateWithViewTransition,
    activateNavigation,
  }
}
