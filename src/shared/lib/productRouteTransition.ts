import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { ROUTES } from '@/shared/constants'
import { hasBrowserHistory, prefersReducedMotion } from '@/shared/lib/browser'
import {
  beginProductRouteViewTransition,
  setReturningProductId,
} from '@/shared/store/productNavigation'

export const PRODUCT_ROUTE_CLASS = 'product-route-view-transition'
export const PRODUCT_ROUTE_READY_CLASS = 'product-route-view-transition-ready'

function canUseViewTransition(): boolean {
  const viewTransitionDocument = document as typeof document & {
    readonly startViewTransition?: Document['startViewTransition']
  }

  return typeof viewTransitionDocument.startViewTransition === 'function' && !prefersReducedMotion()
}

function prepareProductRouteTransition(productId: string): Promise<void> {
  const root = document.documentElement
  root.classList.remove('cart-route-view-transition')
  setReturningProductId(productId)
  root.classList.add(PRODUCT_ROUTE_CLASS)
  return beginProductRouteViewTransition(productId)
}

export function navigateBackFromProductDetail(
  router: AppRouterInstance,
  productId: string,
  fallbackHref: string = ROUTES.HOME
): void {
  const navigate = (): void => {
    if (hasBrowserHistory()) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  if (!canUseViewTransition()) {
    navigate()
    return
  }

  const root = document.documentElement
  const destinationReady = prepareProductRouteTransition(productId)

  const transition = document.startViewTransition?.(async () => {
    navigate()
    await destinationReady
  })

  transition?.ready.then(
    () => {
      root.classList.add(PRODUCT_ROUTE_READY_CLASS)
    },
    () => {}
  )

  transition?.finished.finally(() => {
    root.classList.remove(PRODUCT_ROUTE_CLASS, PRODUCT_ROUTE_READY_CLASS)
    setReturningProductId(null)
  })
}
