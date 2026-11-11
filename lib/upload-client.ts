'use client'

import { upload } from '@vercel/blob/client'
import { useWeddingStore } from '@/store/weddingStore'
import { sanitizeFileName, type UploadFolder } from '@/lib/media'

/**
 * Upload a file from the browser straight to Vercel Blob.
 * Reads adminToken + wedding id from the store; returns the public URL.
 */
export async function uploadMedia(file: File, folder: UploadFolder, contentType?: string): Promise<string> {
  const { adminToken, wedding } = useWeddingStore.getState()
  if (!adminToken || !wedding?.id) throw new Error('Chưa tải xong thiệp, vui lòng thử lại.')

  const pathname = `${wedding.id}/${folder}/${sanitizeFileName(file.name)}`

  try {
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      clientPayload: JSON.stringify({ adminToken, folder }),
      contentType: contentType || file.type || undefined,
      multipart: file.size > 8 * 1024 * 1024,
    })
    return blob.url
  } catch (err) {
    const detail = err instanceof Error ? err.message : ''
    throw new Error(detail ? `Upload thất bại: ${detail}` : 'Upload thất bại')
  }
}
