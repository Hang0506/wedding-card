/**
 * Ảnh xem trước 1200×630 cho Facebook/Messenger: ảnh bìa + tên cô dâu chú rể, giờ/ngày, lời mời khách.
 * Vẽ MỘT lần rồi lưu thành file tĩnh trên Vercel Blob (CDN toàn cầu, có Content-Length, tải tức thì),
 * vì bot Facebook gọi từ Mỹ và bỏ cuộc nếu phải chờ vẽ ảnh (~4s) → link mất ảnh.
 * Tên file chứa `v` (hash dữ liệu) → dữ liệu đổi thì ra file mới.
 */
import { ImageResponse } from 'next/og'
import { head, put } from '@vercel/blob'
import { fetchOgJpeg, ogSourceUrl } from '@/lib/og-image'
import { inviteText } from '@/lib/og-text'

type WeddingRow = Parameters<typeof ogSourceUrl>[0] & Parameters<typeof inviteText>[0]
type GuestRow = { name: string; greeting: string }

/** Tải font Google (TTF) chỉ với các ký tự cần dùng → nhẹ, đủ dấu tiếng Việt. */
async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
      { next: { revalidate: 86400 } },
    )).text()
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!src) return null
    return await (await fetch(src, { next: { revalidate: 86400 } })).arrayBuffer()
  } catch {
    return null
  }
}

export async function renderWideOg(origin: string, wedding: WeddingRow, guest: GuestRow | null): Promise<ArrayBuffer> {
  const source = ogSourceUrl(wedding)
  const photo = source ? await fetchOgJpeg(origin, source) : null
  const t = inviteText(wedding, guest)
  const when = [t.time, t.weekday && t.dateShort ? `${t.weekday}, ${t.dateShort}` : t.dateShort].filter(Boolean).join(' · ')

  const [script, serif, sans] = await Promise.all([
    googleFont('Great Vibes', 400, `${t.left}${t.right}&`),
    googleFont('Cormorant Garamond', 600, `${when}${t.invite}`),
    googleFont('Montserrat', 500, 'THIỆP CƯỚI'),
  ])
  const fonts = [
    script && { name: 'Script', data: script, weight: 400 as const, style: 'normal' as const },
    serif && { name: 'Serif', data: serif, weight: 600 as const, style: 'normal' as const },
    sans && { name: 'Sans', data: sans, weight: 500 as const, style: 'normal' as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: 'normal' }[]

  const photoSrc = photo ? `data:${photo.contentType};base64,${Buffer.from(photo.body).toString('base64')}` : null
  const nameSize = Math.max(t.left.length, t.right.length) > 12 ? 74 : 92

  const res = new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', background: '#fdf8f4' }}>
        {photoSrc
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photoSrc} alt="" width={470} height={630} style={{ width: 470, height: 630, objectFit: 'cover', objectPosition: '50% 35%' }} />
          : <div style={{ width: 470, height: 630, background: 'linear-gradient(160deg,#fde8e8,#f5b8c4)' }} />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', borderLeft: '6px solid #c9a96e' }}>
          <div style={{ fontFamily: 'Sans', fontSize: 22, letterSpacing: 8, color: '#c9a96e', display: 'flex' }}>THIỆP CƯỚI</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 18, fontFamily: 'Script', color: '#9c1647', lineHeight: 1.05 }}>
            <div style={{ fontSize: nameSize, display: 'flex' }}>{t.left}</div>
            {t.right && <div style={{ fontSize: 48, color: '#c9a96e', display: 'flex' }}>&</div>}
            {t.right && <div style={{ fontSize: nameSize, display: 'flex' }}>{t.right}</div>}
          </div>
          <div style={{ width: 220, height: 2, background: '#c9a96e', opacity: 0.6, marginTop: 22, marginBottom: 18, display: 'flex' }} />
          {when && <div style={{ fontFamily: 'Serif', fontSize: 38, color: '#5a3e36', display: 'flex' }}>{when}</div>}
          {t.guestName && (
            <div style={{ fontFamily: 'Serif', fontSize: 30, color: '#9c1647', marginTop: 16, display: 'flex', textAlign: 'center' }}>{t.invite}</div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  )
  return res.arrayBuffer()
}

/** PNG → JPEG (Facebook/Messenger nhận JPEG ổn định nhất; nhẹ hơn PNG ~4 lần). */
async function toJpeg(png: ArrayBuffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default
  return sharp(Buffer.from(png)).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
}

export function wideOgPath(slug: string, guestSlug: string, version: string) {
  return `og/${slug}/${guestSlug}-${version}.jpg`
}

/** Trả URL file tĩnh trên Blob; nếu chưa có thì vẽ + lưu (chỉ xảy ra 1 lần cho mỗi phiên bản dữ liệu). */
export async function ensureWideOg(
  origin: string, wedding: WeddingRow, guest: GuestRow | null, slug: string, guestSlug: string, version: string,
): Promise<string> {
  const pathname = wideOgPath(slug, guestSlug, version)
  try {
    return (await head(pathname)).url
  } catch {
    const jpg = await toJpeg(await renderWideOg(origin, wedding, guest))
    const blob = await put(pathname, jpg, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/jpeg',
      cacheControlMaxAge: 31536000,
    })
    return blob.url
  }
}
