/**
 * Builds the unique key that identifies a cart line:
 * the same phone in two colour/storage combinations becomes two separate lines.
 */
export const buildKey = (id: string, colorName: string, capacity: string): string =>
  `${id}::${colorName}::${capacity}`
