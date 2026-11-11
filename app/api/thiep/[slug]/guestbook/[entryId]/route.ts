import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteParams = { params: Promise<{ slug: string; entryId: string }> }

// DELETE /api/thiep/[slug]/guestbook/[entryId] — admin only
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { slug, entryId } = await params

    // Auth check
    const adminToken = req.headers.get('X-Admin-Token')
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const wedding = await prisma.wedding.findUnique({ where: { slug } })
    if (!wedding) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (wedding.adminToken !== adminToken) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the entry (must belong to this wedding)
    const deleted = await prisma.guestbookEntry.deleteMany({
      where: { id: entryId, weddingId: wedding.id },
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
