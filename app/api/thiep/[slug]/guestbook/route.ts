import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type RouteParams = { params: Promise<{ slug: string }> }

// GET /api/thiep/[slug]/guestbook — public, load entries
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params
    const wedding = await prisma.wedding.findUnique({ where: { slug } })
    if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const entries = await prisma.guestbookEntry.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(entries)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

const schema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
})

// POST /api/thiep/[slug]/guestbook — public, submit entry
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params
    const wedding = await prisma.wedding.findUnique({ where: { slug } })
    if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

    const entry = await prisma.guestbookEntry.create({
      data: {
        weddingId: wedding.id,
        name: parsed.data.name,
        message: parsed.data.message,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
