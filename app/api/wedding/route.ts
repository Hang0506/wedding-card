import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { createWeddingSchema } from '@/lib/validators'
import { toSlug, randomSlug, withSuffix } from '@/lib/slug'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = createWeddingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { groomName, brideName } = parsed.data

    // 1. Generate adminToken
    const adminToken = nanoid(25)

    // 2. Generate slug
    let baseSlug: string
    if (groomName || brideName) {
      const combined = [groomName, brideName].filter(Boolean).join('-')
      baseSlug = toSlug(combined) || randomSlug()
    } else {
      baseSlug = randomSlug()
    }

    // 3. Handle slug conflict
    let slug = baseSlug
    let existing = await prisma.wedding.findUnique({ where: { slug } })
    if (existing) {
      slug = withSuffix(baseSlug)
      existing = await prisma.wedding.findUnique({ where: { slug } })
      if (existing) {
        slug = withSuffix(baseSlug)
      }
    }

    // 4. Create wedding record
    const wedding = await prisma.wedding.create({
      data: {
        adminToken,
        slug,
        groomName: groomName ?? '',
        brideName: brideName ?? '',
      },
    })

    return NextResponse.json(
      { id: wedding.id, adminToken: wedding.adminToken, slug: wedding.slug },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/wedding]', error)
    const code = (error as { code?: string })?.code
    return NextResponse.json({ error: 'Internal server error', code }, { status: 500 })
  }
}
