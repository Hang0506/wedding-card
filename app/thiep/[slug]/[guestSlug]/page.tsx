import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createHash } from 'node:crypto'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { fetchOgJpeg, imageSize, ogSourceUrl } from '@/lib/og-image'
import { inviteText, ogVersion } from '@/lib/og-text'
import { ensureWideOg } from '@/lib/og-wide'
import { WeddingCard } from '@/components/card/WeddingCard'

interface PageProps {
  params: Promise<{ slug: string; guestSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, guestSlug } = await params

  const wedding = await prisma.wedding.findUnique({ where: { slug } })
  if (!wedding) return { title: 'Thiệp cưới' }

  const guest = await prisma.guest.findUnique({
    where: { weddingId_slug: { weddingId: wedding.id, slug: guestSlug } },
  })
  if (!guest) return { title: 'Thiệp cưới' }

  // Toàn bộ chữ lấy từ DB (tên cô dâu chú rể, thứ tự, lời mời + tên khách, giờ/ngày, địa chỉ)
  const t = inviteText(wedding, guest)
  const { title, description } = t

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const origin = host ? `${proto}://${host}` : ''
  const pageUrl = origin ? `${origin}/thiep/${slug}/${guestSlug}` : undefined

  // Ảnh OG (theo DB): ảnh bìa + tên cô dâu chú rể, giờ/ngày, lời mời khách — khổ ngang 1200×630
  // DÙNG CHUNG cho mọi nền tảng (Facebook, Messenger, Zalo…): khổ chuẩn nên không bị cắt, không mất chữ.
  // Không chọn ảnh theo user-agent vì bot (vd Zalo) có lúc tự khai giống Facebook → mỗi link một kiểu.
  // Ảnh là FILE TĨNH trên Vercel Blob (vẽ 1 lần, CDN toàn cầu) → bot nào cũng tải tức thì.
  // `v` = hash dữ liệu hiển thị → đổi ảnh/tên/ngày/lời mời thì ra ảnh mới.
  // Dự phòng khi vẽ lỗi: ảnh bìa dọc (JPEG đã thu nhỏ).
  const rawOg = ogSourceUrl(wedding)
  const version = ogVersion(wedding, guest, createHash)
  let ogImage: { url: string; secureUrl: string; type: string; width?: number; height?: number; alt: string } | undefined
  if (origin) {
    try {
      // Vẽ sẵn + lưu tĩnh (nếu chưa có), rồi trỏ og:image về link .jpg trên chính domain thiệp
      await ensureWideOg(origin, wedding, guest, slug, guestSlug, version)
      const url = `${origin}/og/${slug}/${guestSlug}-${version}.jpg`
      ogImage = { url, secureUrl: url, type: 'image/jpeg', width: 1200, height: 630, alt: title }
    } catch (err) {
      console.error('[og] ensureWideOg failed', err)
      if (rawOg) {
        const url = `${origin}/api/og/${slug}?v=${version}`
        const img = await fetchOgJpeg(origin, rawOg)
        const size = img ? imageSize(img.body) : null
        ogImage = { url, secureUrl: url, type: img?.contentType ?? 'image/jpeg', alt: title, ...(size ?? {}) }
      }
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'vi_VN',
      siteName: title,
      ...(pageUrl && { url: pageUrl }),
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage && { images: [ogImage.url] }),
    },
  }
}

export default async function ThiepPage({ params }: PageProps) {
  const { slug, guestSlug } = await params

  const wedding = await prisma.wedding.findUnique({ where: { slug } })
  if (!wedding) return notFound()

  const guest = await prisma.guest.findUnique({
    where: { weddingId_slug: { weddingId: wedding.id, slug: guestSlug } },
  })
  if (!guest) return notFound()

  const { adminToken: _adminToken, createdAt, updatedAt, ...rest } = wedding

  const weddingPublic = {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }

  const guestNormalized = {
    ...guest,
    answeredAt: guest.answeredAt?.toISOString() ?? null,
  }

  return (
    <div className="min-h-screen" style={{ background: '#fdf8f4' }}>
      <WeddingCard wedding={weddingPublic} guest={guestNormalized} />
    </div>
  )
}
