import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateGuestSchema } from '@/lib/validators'

type RouteParams = { params: Promise<{ adminToken: string; guestId: string }> }

async function verifyGuestOwnership(adminToken: string, guestId: string) {
  const wedding = await prisma.wedding.findUnique({ where: { adminToken } })
  if (!wedding) return { error: 'Wedding not found', status: 404, guest: null }

  const guest = await prisma.guest.findFirst({
    where: { id: guestId, weddingId: wedding.id },
  })
  if (!guest) return { error: 'Guest not found', status: 404, guest: null }

  return { error: null, status: 200, guest }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { adminToken, guestId } = await params

    const { error, status, guest } = await verifyGuestOwnership(adminToken, guestId)
    if (error || !guest) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = updateGuestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const updateData = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined),
    )

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/wedding/[adminToken]/guests/[guestId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { adminToken, guestId } = await params

    const { error, status } = await verifyGuestOwnership(adminToken, guestId)
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    await prisma.guest.delete({ where: { id: guestId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/wedding/[adminToken]/guests/[guestId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
