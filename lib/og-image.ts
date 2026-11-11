/**
 * Ảnh xem trước link (Open Graph) cho thiệp.
 * - Nguồn (theo DB): ảnh chia sẻ → ảnh bìa → ảnh đầu tiên trong album.
 * - Luôn trả JPEG đã thu nhỏ (rộng 1200px) qua bộ tối ưu ảnh của Next.js
 *   (ảnh gốc có thể 15MB+, Facebook/Zalo bỏ qua ảnh quá nặng).
 * - Đọc kích thước thật để khai báo og:image:width/height → Facebook hiện ảnh ngay lần chia sẻ đầu.
 */
import { optimizedImg } from '@/lib/img'

export const OG_WIDTH = 1200

export function ogSourceUrl(w: { sharePhotoUrl: string | null; coverPhotoUrl: string | null; galleryUrls: string[] }): string | null {
  return w.sharePhotoUrl || w.coverPhotoUrl || w.galleryUrls?.[0] || null
}

/** Lấy bản JPEG đã tối ưu của ảnh nguồn (cache 1 ngày ở data cache của Next). */
export async function fetchOgJpeg(origin: string, sourceUrl: string): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const path = optimizedImg(sourceUrl, OG_WIDTH, 85)
  const url = path.startsWith('/') ? `${origin}${path}` : path
  try {
    // Không gửi image/webp/avif trong Accept → bộ tối ưu trả đúng định dạng gốc (JPEG/PNG)
    const res = await fetch(url, { headers: { Accept: 'image/jpeg,image/png,*/*;q=0.8' }, next: { revalidate: 86400 } })
    if (!res.ok) return null
    return { body: await res.arrayBuffer(), contentType: res.headers.get('content-type') || 'image/jpeg' }
  } catch {
    return null
  }
}

/** Đọc width/height từ header JPEG (SOFn) hoặc PNG (IHDR) — không cần thư viện. */
export function imageSize(buf: ArrayBuffer): { width: number; height: number } | null {
  const b = new Uint8Array(buf)
  // PNG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    const dv = new DataView(buf)
    return { width: dv.getUint32(16), height: dv.getUint32(20) }
  }
  // JPEG
  if (b[0] !== 0xff || b[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue }
    const marker = b[i + 1]
    const len = (b[i + 2] << 8) | b[i + 3]
    // SOF0..SOF15 trừ DHT(C4), JPG(C8), DAC(CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] }
    }
    i += 2 + len
  }
  return null
}
