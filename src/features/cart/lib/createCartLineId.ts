/** Unique cart line id — duplicate adds stay separate rows (Figma has no qty control). */
export function createCartLineId(productId: string): string {
  return `${productId}-${crypto.randomUUID()}`
}
