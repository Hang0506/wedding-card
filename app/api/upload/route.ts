import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { prisma } from '@/lib/prisma'
import { FOLDER_RULES, isUploadFolder } from '@/lib/media'

type ClientPayload = { adminToken?: unknown; folder?: unknown }

/**
 * Issues short-lived client tokens so the browser can upload directly to Vercel Blob.
 * The token is only granted when:
 *  - adminToken belongs to an existing wedding
 *  - folder is whitelisted
 *  - pathname is scoped to `<weddingId>/<folder>/...`
 * Content type and size are enforced by Vercel Blob via the token.
 */
export async function POST(request: Request) {
  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: ClientPayload = {}
        try {
          payload = JSON.parse(clientPayload ?? '{}') as ClientPayload
        } catch {
          throw new Error('Invalid client payload')
        }

        const { adminToken, folder } = payload
        if (typeof adminToken !== 'string' || !adminToken) throw new Error('Missing adminToken')
        if (!isUploadFolder(folder)) throw new Error('Invalid folder')

        const wedding = await prisma.wedding.findUnique({
          where: { adminToken },
          select: { id: true },
        })
        if (!wedding) throw new Error('Wedding not found')

        const prefix = `${wedding.id}/${folder}/`
        if (!pathname.startsWith(prefix) || pathname.includes('..')) {
          throw new Error('Invalid pathname')
        }

        const rules = FOLDER_RULES[folder]
        return {
          allowedContentTypes: rules.contentTypes,
          maximumSizeInBytes: rules.maxBytes,
          addRandomSuffix: true,
        }
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    console.error('[POST /api/upload]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
