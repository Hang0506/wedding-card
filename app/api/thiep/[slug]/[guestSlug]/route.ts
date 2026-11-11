import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteParams = { params: Promise<{ slug: string; guestSlug: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
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

    // Strip adminToken from response
    const { adminToken: _adminToken, ...weddingPublic } = wedding

    return NextResponse.json({ wedding: weddingPublic, guest })
  } catch (error) {
    console.error('[GET /api/thiep/[slug]/[guestSlug]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
