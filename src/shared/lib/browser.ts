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

export function scheduleTimeout(
  callback: () => void,
  delayMs: number
): ReturnType<typeof setTimeout> {
  return globalThis.setTimeout(callback, delayMs)
}

export function cancelScheduledTimeout(timer: ReturnType<typeof setTimeout>): void {
  globalThis.clearTimeout(timer)
}
