/**
 * Pick a cute emoji + pastel background for a guest based on their name.
 * Deterministic: the same name always gets the same avatar.
 */

const PASTELS = [
  '#ffe4ec', // pink
  '#fff1d6', // peach
  '#e6f6ff', // sky
  '#e9fbe5', // mint
  '#f1e9ff', // lavender
  '#fff9d9', // lemon
  '#ffe9e3', // coral
  '#e3f7f4', // aqua
]

// Cute pool for friends / individuals so the list feels varied
const CUTE = ['🐰', '🐻', '🐼', '🦊', '🐱', '🐨', '🐥', '🦄', '🐹', '🐶', '🐧', '🦋']

function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

/** Lowercase + strip Vietnamese diacritics for keyword matching. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

export interface GuestAvatar {
  emoji: string
  bg: string
  label: string
}

export function guestAvatar(name: string): GuestAvatar {
  const n = normalize(name)
  const h = hash(n)
  const bg = PASTELS[h % PASTELS.length]
  const words = n.split(/\s+/)
  const has = (re: RegExp) => re.test(n)

  const pick = (pool: string[]) => pool[h % pool.length]

  // Order matters: most specific first
  if (has(/\b(thay|co giao)\b/)) return { emoji: '👨‍🏫', bg, label: 'Thầy cô' }
  if (has(/\b(gd|gia dinh)\b/) || has(/\+\s*gd\b/)) return { emoji: pick(['👨‍👩‍👧', '👨‍👩‍👦', '🏡', '👨‍👩‍👧‍👦']), bg, label: 'Gia đình' }
  if (has(/\bvo chong\b/)) return { emoji: pick(['💑', '👩‍❤️‍👨', '💍']), bg, label: 'Vợ chồng' }
  if (has(/[+&]\s*nt\b/) || has(/\bnguoi thuong\b/)) return { emoji: pick(['💕', '💞', '💖', '💗', '💘', '🥰']), bg, label: 'Đi cùng người thương' }
  if (has(/[+&]/)) return { emoji: pick(['👫', '👭', '🤝']), bg, label: 'Đi cặp' }
  if (words[0] === 'anh' || words[0] === 'chi') return { emoji: pick(['😎', '🧑‍💼', '🤵']), bg, label: 'Anh chị' }
  if (words[0] === 'em') return { emoji: pick(['🌸', '🌼', '🌷', '🍀']), bg, label: 'Em' }

  return { emoji: pick(CUTE), bg, label: 'Bạn bè' }
}
