# Hướng dẫn Deploy Wedding Card

## Bước 1: Chuẩn bị Neon Postgres

1. Đăng ký tại https://neon.tech
2. Tạo project — chọn region Singapore
3. Connection Details → chọn "Prisma" → copy `DATABASE_URL`
4. Chạy migration:
   ```bash
   cd wedding-card
   npx prisma db push
   ```

## Bước 2: Config AWS S3

1. Tạo S3 bucket, region `ap-southeast-1`, tắt **Block Public Access**
2. Bucket → **Permissions** → **CORS** → dán nội dung từ `docs/s3-cors-policy.json`
3. **IAM** → tạo user với policy `AmazonS3FullAccess` → **Security credentials** → tạo Access Key → lưu Access Key ID và Secret Access Key

## Bước 3: Deploy lên Vercel

1. Cài Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Đăng nhập:
   ```bash
   vercel login
   ```
3. Deploy lần đầu (follow prompts — framework: Next.js):
   ```bash
   cd wedding-card
   vercel
   ```
4. Trong **Vercel Dashboard** → Project → **Settings** → **Environment Variables**, thêm:
   - `DATABASE_URL`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET_NAME`
   - `NEXT_PUBLIC_BASE_URL` (URL Vercel cấp hoặc domain của bạn)
5. Deploy production:
   ```bash
   vercel --prod
   ```

## Bước 4: Custom Domain với DuckDNS

1. Vào https://www.duckdns.org → đăng ký / đăng nhập
2. Tạo subdomain (VD: `thiepvui.duckdns.org`)
3. Set CNAME record trỏ về `cname.vercel-dns.com`
4. **Vercel Dashboard** → Project → **Settings** → **Domains** → Add `thiepvui.duckdns.org`
5. Vercel tự cấp SSL certificate (mất 1–2 phút)
6. Cập nhật biến môi trường `NEXT_PUBLIC_BASE_URL` = `https://thiepvui.duckdns.org`
7. Redeploy:
   ```bash
   vercel --prod
   ```

## Bước 5: Test End-to-End

1. Mở domain → **landing page** hiển thị đúng
2. Click "Bắt đầu tạo thiệp" → vào editor, điền thông tin cặp đôi
3. Upload ảnh → kiểm tra ảnh được lưu lên S3
4. **Thêm khách mời** → copy link RSVP
5. Mở link RSVP trên thiết bị khác (hoặc ẩn danh) → khách RSVP → kiểm tra danh sách cập nhật trong admin
