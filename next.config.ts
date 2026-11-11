import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Force-load .env.local to override any system-level DATABASE_URL
// (e.g. Conda sets postgresql+psycopg2:// which breaks Prisma)
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    // Always override — .env.local takes priority over system env
    process.env[key] = val;
  }
}
loadEnvLocal();

const nextConfig: NextConfig = {
  images: {
    // Chất lượng dùng trong lib/img.ts (Next 16 mặc định chỉ cho phép 75)
    qualities: [75, 85, 90],
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.ap-southeast-1.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.us-east-1.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.us-east-2.amazonaws.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
      { protocol: 'https', hostname: 's3.ap-southeast-1.amazonaws.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https: http: blob:",
              "frame-src 'self' https://www.openstreetmap.org https://www.google.com https://maps.google.com",
              "connect-src 'self' https: wss:",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
