import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditorLayout } from '@/components/editor/EditorLayout'

interface AdminPageProps {
  params: Promise<{ adminToken: string }>
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { adminToken } = await params

  // Query Prisma directly — no HTTP round-trip, faster + no env var issue
  const wedding = await prisma.wedding.findUnique({ where: { adminToken } })

  if (!wedding) return notFound()

  // Serialize Date -> string for client component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialData = {
    ...wedding,
    createdAt: wedding.createdAt.toISOString(),
    updatedAt: wedding.updatedAt.toISOString(),
  } as any

  return <EditorLayout initialData={initialData} />
}

export const metadata = {
  title: 'Chỉnh sửa thiệp cưới',
}
