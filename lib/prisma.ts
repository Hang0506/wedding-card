import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// Force override DATABASE_URL from .env.local before Prisma reads it.
// Needed because Conda sets DATABASE_URL=postgresql+psycopg2://... at system level,
// which takes priority over Next.js's .env.local loading in some environments.
function forceEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      process.env[key] = val
    }
  } catch {
    // silently ignore — will fall back to system env
  }
}

forceEnvLocal()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
