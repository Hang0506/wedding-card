/**
 * Serve uploaded photos through Next.js Image Optimization (resize + WebP/AVIF).
 * Original uploads can be 30+ megapixels / 15+ MB; decoding those while the card
 * auto-scrolls causes visible hitches. Widths must be in Next's default sizes
 * (640, 750, 828, 1080, 1200, 1920, 2048, 3840); qualities must be listed in
 * `images.qualities` in next.config.ts.
 */
export type ImgWidth = 640 | 750 | 828 | 1080 | 1200 | 1920 | 2048

const OPTIMIZABLE = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//

export function optimizedImg(url: string | null | undefined, width: ImgWidth, quality = 75): string {
  if (!url) return ''
  if (!OPTIMIZABLE.test(url)) return url
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

/**
 * Responsive variant: returns `src` + `srcSet` so the browser picks the size that
 * matches the screen density (retina / phone screens get the larger files → sharp).
 */
export function responsiveImg(
  url: string | null | undefined,
  widths: ImgWidth[],
  quality = 85,
): { src: string; srcSet?: string } {
  if (!url) return { src: '' }
  if (!OPTIMIZABLE.test(url)) return { src: url }
  return {
    src: optimizedImg(url, widths[widths.length - 1], quality),
    srcSet: widths.map((w) => `${optimizedImg(url, w, quality)} ${w}w`).join(', '),
  }
}
