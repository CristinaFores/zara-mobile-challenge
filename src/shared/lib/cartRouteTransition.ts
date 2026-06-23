import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { prefersReducedMotion, scrollToTop } from '@/shared/lib/browser'

export const CART_ROUTE_CLASS = 'cart-route-view-transition'

function canUseViewTransition(): boolean {
  const viewTransitionDocument = document as typeof document & {
    readonly startViewTransition?: Document['startViewTransition']
  }

  return typeof viewTransitionDocument.startViewTransition === 'function' && !prefersReducedMotion()
}

function scrollToPageTop(): void {
  scrollToTop()
}

function prepareCartRouteTransition(): void {
  const root = document.documentElement
  root.classList.remove('product-route-view-transition', 'product-route-view-transition-ready')
  root.classList.add(CART_ROUTE_CLASS)
}

function clearProductViewTransitionNames(): void {
  for (const element of document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]')) {
    element.style.viewTransitionName = 'none'
  }
}

export function navigateToCart(
  router: AppRouterInstance,
  href: string,
  onBeforeNavigate?: () => void
): void {
  prepareCartRouteTransition()
  clearProductViewTransitionNames()

  if (!canUseViewTransition()) {
    onBeforeNavigate?.()
    scrollToPageTop()
    router.push(href)
    document.documentElement.classList.remove(CART_ROUTE_CLASS)
    return
  }

  const root = document.documentElement

  const transition = document.startViewTransition?.(async () => {
    onBeforeNavigate?.()
    scrollToPageTop()
    router.push(href)
  })

  transition?.finished.finally(() => {
    root.classList.remove(CART_ROUTE_CLASS)
  })
}
