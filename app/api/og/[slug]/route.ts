import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { fetchOgJpeg, ogSourceUrl } from '@/lib/og-image'
import { ensureWideOg } from '@/lib/og-wide'
import { ogVersion } from '@/lib/og-text'

type RouteParams = { params: Promise<{ slug: string }> }

const CACHE = 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400'

/**
 * Ảnh xem trước link cho thiệp.
 *  - /api/og/<slug>?v=…                     → ảnh bìa dọc (JPEG đã thu nhỏ) — Zalo & nền tảng khác
 *  - /api/og/<slug>?fmt=wide&g=<khách>&v=…   → ảnh ngang 1200×630 (Facebook). Thẻ meta trỏ thẳng
 *    file tĩnh trên Blob; route này chỉ để vẽ sẵn / dự phòng.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params
  const url = new URL(request.url)
  const wedding = await prisma.wedding.findUnique({ where: { slug } })
  if (!wedding) return new Response('Not found', { status: 404 })
  const origin = url.origin

  if (url.searchParams.get('fmt') === 'wide') {
    const guestSlug = url.searchParams.get('g') ?? ''
    const guest = guestSlug
      ? await prisma.guest.findUnique({ where: { weddingId_slug: { weddingId: wedding.id, slug: guestSlug } } })
      : null
    if (guestSlug && !guest) return new Response('Not found', { status: 404 })
    const version = ogVersion(wedding, guest, createHash)
    const blobUrl = await ensureWideOg(origin, wedding, guest, slug, guestSlug || '_', version)
    const res = await fetch(blobUrl)
    const body = await res.arrayBuffer()
    return new Response(body, {
      headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(body.byteLength), 'Cache-Control': CACHE, 'X-OG-Source': blobUrl },
    })
  }

  const source = ogSourceUrl(wedding)
  const photo = source ? await fetchOgJpeg(origin, source) : null
  if (!photo) return new Response('Image unavailable', { status: source ? 502 : 404 })
  return new Response(photo.body, {
    headers: { 'Content-Type': photo.contentType, 'Content-Length': String(photo.body.byteLength), 'Cache-Control': CACHE },
  })
}
