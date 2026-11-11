/**
 * Chuẩn hoá dữ liệu hiển thị cho phần xem trước link — dùng chung cho thẻ meta và ảnh OG.
 * Mọi giá trị lấy từ DB (wedding + guest), không viết cứng.
 */
export interface ReceptionData { date?: string; time?: string; address?: string; partyType?: string }

interface WeddingLike {
  groomName: string; brideName: string; groomShort: string | null; brideShort: string | null
  displayOrder: string; reception: unknown
}
interface GuestLike { name: string; greeting: string }

const DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export function inviteText(wedding: WeddingLike, guest: GuestLike | null) {
  const groom = wedding.groomShort || wedding.groomName || ''
  const bride = wedding.brideShort || wedding.brideName || ''
  const groomFirst = wedding.displayOrder !== 'bride_first'
  const left = (groomFirst ? groom : bride) || guest?.name || ''
  const right = groomFirst ? bride : groom

  const reception = (wedding.reception ?? null) as ReceptionData | null
  let dateLong = '', dateShort = '', weekday = ''
  if (reception?.date) {
    const d = new Date(reception.date + 'T00:00:00')
    if (!Number.isNaN(d.getTime())) {
      weekday = DAYS[d.getDay()]
      dateLong = `${weekday}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`
      dateShort = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
    }
  }
  const time = reception?.time ? reception.time.slice(0, 5) : ''
  const greeting = (guest?.greeting || 'Kính Mời').trim()
  const invite = guest?.name ? `${greeting} ${guest.name}` : greeting

  const title = left && right
    ? `${left.toUpperCase()} & ${right.toUpperCase()}`
    : left ? `Thiệp Cưới Của ${left}` : 'Thiệp Cưới'

  const descParts = [invite]
  if (dateLong) descParts.push(time ? `${time} · ${dateLong}` : dateLong)
  if (reception?.address) descParts.push(reception.address)

  return { left, right, title, description: descParts.join(' | '), invite, greeting, guestName: guest?.name ?? '', weekday, dateLong, dateShort, time, address: reception?.address ?? '' }
}

type HashFn = (alg: string) => { update(s: string): { digest(enc: 'hex'): string } }

/** Phiên bản ảnh xem trước = hash dữ liệu hiển thị → dữ liệu trong DB đổi thì ra ảnh mới. */
export function ogVersion(
  wedding: WeddingLike & { sharePhotoUrl: string | null; coverPhotoUrl: string | null; galleryUrls: string[] },
  guest: GuestLike | null,
  createHash: HashFn,
): string {
  // Phiên bản ảnh = hash dữ liệu hiển thị (+ 'jpg1' = định dạng hiện tại) → dữ liệu trong DB đổi thì ra ảnh mới
  const t = inviteText(wedding, guest)
  const source = wedding.sharePhotoUrl || wedding.coverPhotoUrl || wedding.galleryUrls?.[0] || ''
  return createHash('sha1').update(['jpg1', source, t.left, t.right, t.time, t.dateShort, t.invite].join('|')).digest('hex').slice(0, 10)
}
