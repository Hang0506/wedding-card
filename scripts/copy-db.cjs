// Chép toàn bộ dữ liệu từ DB cũ sang DB mới (cùng Prisma schema).
// Dùng:  $env:SRC_URL="<db cũ>"; $env:DST_URL="<db mới>"; node scripts/copy-db.cjs
// - DB mới phải đã có bảng (chạy `node scripts/migrate.mjs` với DATABASE_URL=DST_URL trước).
// - Từ chối chạy nếu DB mới đã có dữ liệu, để tránh ghi đè/trùng.
// - Chép theo thứ tự quan hệ: Wedding -> Guest, Question, GuestbookEntry -> Answer.
const { PrismaClient } = require('@prisma/client')

const SRC_URL = process.env.SRC_URL
const DST_URL = process.env.DST_URL
if (!SRC_URL || !DST_URL) {
  console.error('Thiếu SRC_URL hoặc DST_URL')
  process.exit(1)
}
if (SRC_URL === DST_URL) {
  console.error('SRC_URL và DST_URL giống nhau')
  process.exit(1)
}

const src = new PrismaClient({ datasourceUrl: SRC_URL })
const dst = new PrismaClient({ datasourceUrl: DST_URL })

// Các model theo thứ tự cha -> con
const MODELS = ['wedding', 'guest', 'question', 'guestbookEntry', 'answer']

;(async () => {
  try {
    for (const m of MODELS) {
      const n = await dst[m].count()
      if (n > 0) throw new Error(`DB mới đã có dữ liệu ở bảng ${m} (${n} dòng) — dừng để tránh trùng`)
    }

    await dst.$transaction(async (tx) => {
      for (const m of MODELS) {
        const rows = await src[m].findMany()
        if (rows.length) await tx[m].createMany({ data: rows })
        console.log(`${m}: ${rows.length}`)
      }
    }, { timeout: 120000 })

    // Kiểm tra số dòng khớp
    for (const m of MODELS) {
      const [a, b] = await Promise.all([src[m].count(), dst[m].count()])
      if (a !== b) throw new Error(`Lệch số dòng ở ${m}: nguồn ${a}, đích ${b}`)
    }
    console.log('COPY OK — số dòng khớp ở mọi bảng')
  } catch (e) {
    console.error('COPY FAILED:', e.message)
    process.exitCode = 1
  } finally {
    await Promise.all([src.$disconnect(), dst.$disconnect()])
  }
})()
