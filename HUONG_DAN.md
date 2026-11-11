# Hướng Dẫn Web Thiệp Cưới Online
> Tạo lần cuối: 2026-09-26 | Cập nhật khi có thay đổi lớn

---

## 🌐 URL Production
```
https://wedding-card-gamma-ochre.vercel.app
```

---

## 🔑 Thông tin credentials (GIỮ BÍ MẬT)

| Service | Thông tin |
|---------|-----------|
| **Neon Postgres** | `ep-twilight-dust-b525pbrc-pooler.c-7.us-east-2.aws.neon.tech` |
| **Neon Console** | https://console.neon.tech |
| **AWS S3 Bucket** | `wedding-card-photos` (region: ap-southeast-1) |
| **AWS Console** | https://console.aws.amazon.com |
| **Vercel Project** | https://vercel.com/hang-03ab/wedding-card |
| **Vercel Team** | `hang-03ab` |

> ⚠️ Credentials thật lưu trong `D:\AI\ai-native-client\wedding-card\.env.local` — KHÔNG commit file này lên git

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS-in-JS inline |
| UI Components | shadcn/ui |
| State | Zustand |
| Database | Prisma 5.22 + Neon Postgres (serverless) |
| File Storage | AWS S3 (presigned URL upload) |
| Deploy | Vercel |

---

## 📁 Cấu trúc thư mục quan trọng

```
wedding-card/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── admin/[adminToken]/
│   │   ├── page.tsx                ← Editor thiệp
│   │   └── guests/page.tsx         ← Quản lý khách mời
│   ├── thiep/[slug]/[guestSlug]/
│   │   └── page.tsx                ← Trang thiệp public
│   └── api/
│       ├── wedding/                ← CRUD thiệp
│       ├── upload/                 ← S3 presigned URL
│       └── thiep/[slug]/[guestSlug]/ ← Public API + RSVP
├── components/
│   ├── editor/                     ← 14 sections editor
│   ├── card/                       ← Thiệp public (WeddingCard, MusicPlayer...)
│   └── guests/                     ← Quản lý khách
├── store/weddingStore.ts            ← Zustand state + auto-save
├── lib/
│   ├── prisma.ts                   ← Prisma client singleton
│   ├── s3.ts                       ← S3 upload helpers
│   ├── validators.ts               ← Zod schemas
│   └── slug.ts                     ← Slug generation
├── prisma/schema.prisma            ← Database schema
├── .env.local                      ← Credentials thật (KHÔNG commit)
├── .env.example                    ← Template credentials (có thể commit)
└── package.json
```

---

## 🚀 Quy trình làm việc

### 1. Chỉnh sửa code → chạy local

```powershell
cd D:\AI\ai-native-client\wedding-card

# Set DATABASE_URL (vì Conda override)
$env:DATABASE_URL="postgresql://neondb_owner:npg_qi9r0fdhYFKg@ep-twilight-dust-b525pbrc-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Chạy dev server
npm run dev
```

Mở: http://localhost:3000

---

### 2. Kiểm tra TypeScript trước khi deploy

```powershell
cd D:\AI\ai-native-client\wedding-card
npx tsc --noEmit
```
→ Phải thấy **0 errors** mới deploy.

---

### 3. Đổi schema DB → migrate lên Neon

```powershell
cd D:\AI\ai-native-client\wedding-card
$env:DATABASE_URL="postgresql://neondb_owner:npg_qi9r0fdhYFKg@ep-twilight-dust-b525pbrc-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
npx prisma db push
```

---

### 4. Deploy lên Vercel production

```powershell
cd D:\AI\ai-native-client\wedding-card
vercel --prod
```

**Xong.** Build tự chạy `prisma generate && next build` rồi deploy.

---

### 5. Kiểm tra sau deploy

```powershell
# Test API hoạt động không
Invoke-RestMethod -Uri "https://wedding-card-gamma-ochre.vercel.app/api/wedding" -Method POST -ContentType "application/json" -Body '{}'
```
→ Phải trả về `{ id, adminToken, slug }`

---

## ⚙️ Env vars trên Vercel

Nếu cần update env vars (ví dụ đổi DB, đổi S3):

```powershell
# Xóa var cũ
vercel env rm TEN_VAR production --yes

# Thêm var mới
echo "gia_tri_moi" | vercel env add TEN_VAR production

# Redeploy để apply
vercel --prod
```

Danh sách env vars hiện tại:
- `DATABASE_URL` — Neon Postgres connection string
- `AWS_REGION` — `ap-southeast-1`
- `AWS_ACCESS_KEY_ID` — AWS IAM key
- `AWS_SECRET_ACCESS_KEY` — AWS IAM secret
- `S3_BUCKET_NAME` — `wedding-card-photos`
- `NEXT_PUBLIC_BASE_URL` — `https://wedding-card-gamma-ochre.vercel.app`

---

## 🗃️ Database

**Xem data trực tiếp:**
1. Vào https://console.neon.tech
2. Chọn project → **SQL Editor**
3. Query ví dụ:
```sql
-- Xem tất cả thiệp
SELECT id, slug, "groomName", "brideName", "adminToken", "createdAt" FROM "Wedding" ORDER BY "createdAt" DESC;

-- Xem khách mời của 1 thiệp
SELECT name, slug, "rsvpStatus", "rsvpCount", "answeredAt" FROM "Guest" WHERE "weddingId" = 'ID_THIEP';

-- Reset RSVP của khách (để test lại)
UPDATE "Guest" SET "rsvpStatus"='pending', "answeredAt"=NULL, "rsvpCount"=NULL WHERE slug='ten-khach';
```

---

## 🖼️ S3 Bucket

- **Bucket:** `wedding-card-photos`
- **Region:** `ap-southeast-1`
- **URL format:** `https://wedding-card-photos.s3.ap-southeast-1.amazonaws.com/{weddingId}/{folder}/{timestamp}-{filename}`
- **Folders:** `cover/`, `gallery/`, `music/`, `uploads/`

Nếu ảnh không hiển thị → kiểm tra bucket có **Public Access** và **Bucket Policy** chưa:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::wedding-card-photos/*"
  }]
}
```

---

## 🎨 Chỉnh sửa UI

| Muốn đổi | Sửa file |
|----------|---------|
| Overlay mở thiệp | `components/card/MusicPlayer.tsx` |
| Trang thiệp public | `components/card/WeddingCard.tsx` |
| Gallery ảnh | `components/card/GalleryView.tsx` |
| Đồng hồ đếm ngược | `components/card/Countdown.tsx` |
| Editor sidebar | `components/editor/EditorLayout.tsx` |
| Section thông tin cơ bản | `components/editor/sections/BasicInfo.tsx` |
| Section tiệc cưới | `components/editor/sections/Reception.tsx` |
| Landing page | `app/page.tsx` |
| Màu accent | Tìm `#e83e8c` hoặc `#c2185b` trong các file |

---

## 🔧 Lỗi thường gặp

| Lỗi | Nguyên nhân | Fix |
|-----|------------|-----|
| `DATABASE_URL must start with postgresql://` | Conda override env var | Set `$env:DATABASE_URL=...` trước khi chạy |
| `PrismaClientInitializationError` trên Vercel | Chưa generate Prisma | `package.json` build script đã có `prisma generate &&` rồi, chỉ cần redeploy |
| Ảnh không hiển thị | S3 chưa có public policy | Thêm bucket policy (xem phần S3 ở trên) |
| 500 trên API | Xem Vercel logs: `vercel logs wedding-card-gamma-ochre.vercel.app` | |
| RSVP đã submit không sửa được | Idempotent by design | Reset qua SQL: `UPDATE "Guest" SET "answeredAt"=NULL...` |

---

## 📱 Flow sử dụng

```
1. Mở https://wedding-card-gamma-ochre.vercel.app
2. Click "Bắt đầu tạo thiệp" → nhận link admin (lưu lại!)
3. Vào editor → điền thông tin → upload ảnh → chọn nhạc
4. Vào "Quản lý khách mời" → thêm từng khách → copy link
5. Gửi link cho khách qua Zalo/Messenger
6. Khách mở link → xem thiệp → RSVP
7. Chủ thiệp xem trạng thái RSVP trong danh sách khách
```

---

## 💡 Notes quan trọng

- **AdminToken** nằm trong URL `/admin/{token}` — **bookmark lại** vì không có login, mất token = mất quyền quản lý thiệp
- **Auto-save** 1.5 giây sau khi ngừng gõ — chờ "Đã lưu ✓" mới đóng tab
- **Nhạc** upload file MP3 lên S3 qua editor là tốt nhất (không bị block như CDN ngoài)
- **AWS credits** còn ~$92, hết hạn Oct 7 nhưng sau đó vẫn dùng được (trả theo usage, rất rẻ)
- **Neon free tier**: 0.5GB storage, đủ dùng cho hàng trăm thiệp

---

*File này tạo bởi AI ngày 2026-09-26. Cập nhật khi có thay đổi infrastructure.*
https://wedding-card-gamma-ochre.vercel.app/admin/yo5RYgUmw_dpkGNXgtb55rkjG/guests
https://vercel.com/hang-03ab/wedding-card => url check code deploy
https://console.neon.tech/ => check db 
sau khi code xong thi vao code mo terminal go lenh   vercel --prod