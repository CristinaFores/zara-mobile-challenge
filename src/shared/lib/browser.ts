/** Browser runtime helpers — single place for globalThis (Sonar S7764). */

export function isBrowser(): boolean {
  return globalThis.window !== undefined
}

export function hasBrowserHistory(): boolean {
  return isBrowser() && globalThis.history.length > 1
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
