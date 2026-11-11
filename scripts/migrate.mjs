// Chạy `prisma migrate deploy` lúc build để tự tạo/cập nhật bảng.
// - Idempotent: DB trống -> tạo bảng; đã có -> bỏ qua; không xóa dữ liệu.
// - Migration nên chạy qua kết nối trực tiếp (không PgBouncer): ưu tiên DIRECT_URL,
//   nếu không có thì tự bỏ "-pooler" khỏi host của DATABASE_URL (Neon).
// - Không có DATABASE_URL (vd build local) -> bỏ qua, không làm hỏng build.
import { spawnSync } from 'node:child_process'

const url = process.env.DATABASE_URL
if (!url) {
  console.log('[migrate] DATABASE_URL not set — skipping migrate deploy')
  process.exit(0)
}

const direct = process.env.DIRECT_URL || url.replace('-pooler.', '.')
const res = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DATABASE_URL: direct },
})
process.exit(res.status ?? 1)
