export function buildProxyUrl(src: string, width: number, quality = 75): string {
  const params = new URLSearchParams({ url: src, w: String(width), q: String(quality) })
  return `/api/images?${params.toString()}`
}
