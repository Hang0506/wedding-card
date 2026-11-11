import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { ensureWideOg } from '@/lib/og-wide'
import { ogVersion } from '@/lib/og-text'

type RouteParams = { params: Promise<{ slug: string; file: string }> }

/**
 * Ảnh xem trước link (dùng cho MỌI nền tảng): /og/<slug>/<guestSlug>-<v>.jpg
 *  - JPEG ngang 1200×630, nằm trên CHÍNH domain thiệp, đuôi .jpg, có Content-Length
 *    → đúng công thức Facebook/Messenger hiện ảnh ổn định (Zalo cũng hiện trọn).
 *  - Ảnh thật lưu tĩnh trên Vercel Blob (vẽ 1 lần); route này chỉ trả lại bytes, rất nhanh.
 *  - `v` = hash dữ liệu trong DB; nếu `v` cũ thì vẫn trả ảnh mới nhất (link cũ không bị gãy).
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { slug, file } = await params
  const m = file.match(/^(.+)-([0-9a-f]{10})\.jpg$/)
  if (!m) return new Response('Not found', { status: 404 })
  const guestSlug = m[1]

  const wedding = await prisma.wedding.findUnique({ where: { slug } })
  if (!wedding) return new Response('Not found', { status: 404 })
  const guest = guestSlug === '_'
    ? null
    : await prisma.guest.findUnique({ where: { weddingId_slug: { weddingId: wedding.id, slug: guestSlug } } })
  if (guestSlug !== '_' && !guest) return new Response('Not found', { status: 404 })

  const version = ogVersion(wedding, guest, createHash)
  const blobUrl = await ensureWideOg(new URL(request.url).origin, wedding, guest, slug, guestSlug, version)
  const res = await fetch(blobUrl)
  if (!res.ok) return new Response('Image unavailable', { status: 502 })
  const body = await res.arrayBuffer()

  return new Response(body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(body.byteLength),
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400',
    },
  })
}
