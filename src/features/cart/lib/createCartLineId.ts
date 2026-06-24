/** Unique cart line id — duplicate adds stay separate rows (Figma has no qty control). */
export function createCartLineId(productId: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${productId}-${crypto.randomUUID()}`
  }

  return `${productId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
