import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createGuestSchema } from '@/lib/validators'
import { toSlug, withSuffix } from '@/lib/slug'

type RouteParams = { params: Promise<{ adminToken: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { adminToken } = await params

    const wedding = await prisma.wedding.findUnique({ where: { adminToken } })
    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const guests = await prisma.guest.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(guests)
  } catch (error) {
    console.error('[GET /api/wedding/[adminToken]/guests]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { adminToken } = await params

    const wedding = await prisma.wedding.findUnique({ where: { adminToken } })
    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = createGuestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, greeting, message, group } = parsed.data

    // Generate slug from name
    let slug = toSlug(name) || name.toLowerCase().replace(/\s+/g, '-')

    // Check for slug conflict within the same wedding
    const existing = await prisma.guest.findUnique({
      where: { weddingId_slug: { weddingId: wedding.id, slug } },
    })
    if (existing) {
      slug = withSuffix(slug)
    }

    const guest = await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        name,
        slug,
        ...(greeting !== undefined && { greeting }),
        ...(message !== undefined && { message }),
        ...(group !== undefined && { group }),
      },
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('[POST /api/wedding/[adminToken]/guests]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
