/** Browser runtime helpers — single place for globalThis (Sonar S7764). */

export function isBrowser(): boolean {
  return globalThis.window !== undefined
}

export function hasBrowserHistory(): boolean {
  if (!isBrowser()) return false

  // Navigation API (Chrome 102+) correctly excludes about:blank and external
  // referrers from the app's own history stack. Falls back to history.length
  // for browsers that don't support it yet.

  const nav = (globalThis as typeof globalThis & { navigation?: { canGoBack?: boolean } })
    .navigation

  if (typeof nav?.canGoBack === 'boolean') return nav.canGoBack

  return globalThis.history.length > 1
}

export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false
  return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToTop(): void {
  globalThis.scrollTo({ top: 0, left: 0 })
}

/** Updates query params without a Next.js navigation (avoids RSC refetch on detail). */
export function replaceSearchParamsInHistory(pathname: string, params: URLSearchParams): void {
  if (!isBrowser()) return

  const query = params.toString()
  const url = query ? `${pathname}?${query}` : pathname
  globalThis.history.replaceState(globalThis.history.state, '', url)
}

const popstateListeners = new Set<() => void>()
let popstateListenerRegistered = false

function notifyPopstateListeners(): void {
  popstateListeners.forEach((listener) => listener())
}

function ensurePopstateListener(): void {
  if (!isBrowser() || popstateListenerRegistered) return
  globalThis.addEventListener('popstate', notifyPopstateListeners)
  popstateListenerRegistered = true
}

/** Shared popstate subscription for URL-driven client state (e.g. useSyncExternalStore). */
export function subscribeToPopstate(listener: () => void): () => void {
  if (!isBrowser()) return () => undefined

  ensurePopstateListener()
  popstateListeners.add(listener)
  return () => {
    popstateListeners.delete(listener)
  }
}

export function getBrowserSearchParamsSnapshot(): string | null {
  if (!isBrowser()) return null
  return globalThis.window.location.search
}

export function readBrowserSearchParams(): URLSearchParams | null {
  const search = getBrowserSearchParamsSnapshot()
  if (search === null) return null
  return new URLSearchParams(search)
}

export function scheduleTimeout(
  callback: () => void,
  delayMs: number
): ReturnType<typeof setTimeout> {
  return globalThis.setTimeout(callback, delayMs)
}

export function cancelScheduledTimeout(timer: ReturnType<typeof setTimeout>): void {
  globalThis.clearTimeout(timer)
}
