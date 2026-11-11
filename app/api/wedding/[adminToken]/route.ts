import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateWeddingSchema } from '@/lib/validators'

type RouteParams = { params: Promise<{ adminToken: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { adminToken } = await params
    const wedding = await prisma.wedding.findUnique({ where: { adminToken } })
    if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    return NextResponse.json(wedding)
  } catch (error) {
    console.error('[GET /api/wedding/[adminToken]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { adminToken } = await params

    const existing = await prisma.wedding.findUnique({ where: { adminToken } })
    if (!existing) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const parsed = updateWeddingSchema.safeParse(body)

    if (!parsed.success) {
      console.error('[PATCH wedding] Zod error:', JSON.stringify(parsed.error.flatten(), null, 2))
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Filter undefined, then deep-serialize to ensure Prisma gets plain JSON
    const raw = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined),
    )

    if (Object.keys(raw).length === 0) return NextResponse.json(existing)

    // Deep serialize — converts class instances, Dates, etc to plain JSON
    // This prevents Prisma from receiving non-serializable values
    const updateData = JSON.parse(JSON.stringify(raw))

    // Ensure String[] fields are clean arrays of strings
    if (updateData.galleryUrls !== undefined) {
      updateData.galleryUrls = Array.isArray(updateData.galleryUrls)
        ? updateData.galleryUrls.filter((u: unknown) => typeof u === 'string' && u.length > 0)
        : []
    }

    const updated = await prisma.wedding.update({
      where: { adminToken },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[PATCH /api/wedding/[adminToken]]', msg)
    return NextResponse.json({ error: 'Internal server error', detail: msg }, { status: 500 })
  }
}
