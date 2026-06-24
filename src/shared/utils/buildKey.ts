/**
 * Builds the configuration fingerprint for a cart line (product + colour + storage).
 * Used in tests; cart lines use unique ids per add, not this key.
 */
export const buildKey = (id: string, colorName: string, capacity: string): string =>
  `${id}::${colorName}::${capacity}`
