import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rsvpSchema } from '@/lib/validators'

type RouteParams = { params: Promise<{ slug: string; guestSlug: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug, guestSlug } = await params

    const wedding = await prisma.wedding.findUnique({ where: { slug } })
    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const guest = await prisma.guest.findUnique({
      where: { weddingId_slug: { weddingId: wedding.id, slug: guestSlug } },
    })
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // IDEMPOTENT: already answered
    if (guest.answeredAt !== null) {
      return NextResponse.json({ error: 'Đã xác nhận rồi' }, { status: 409 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = rsvpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { rsvpStatus, rsvpCount, answers } = parsed.data

    // Save answers as JSON directly on Guest — avoids FK constraint against Question table
    // (questions live in rsvpConfig JSON, not as rows in Question table)
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus,
        ...(rsvpCount !== undefined && { rsvpCount }),
        answeredAt: new Date(),
        ...(answers && answers.length > 0 && { rsvpAnswers: answers }),
      },
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    console.error('[POST /api/thiep/[slug]/[guestSlug]/rsvp]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
