/**
 * Shared upload rules for Vercel Blob (used by both server route and client helper).
 */

export const UPLOAD_FOLDERS = ['cover', 'gallery', 'envelope', 'qr', 'music'] as const
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3']

const MB = 1024 * 1024

/** Allowed content types + max size enforced server-side per folder. */
export const FOLDER_RULES: Record<UploadFolder, { contentTypes: string[]; maxBytes: number }> = {
  cover: { contentTypes: IMAGE_TYPES, maxBytes: 50 * MB },
  gallery: { contentTypes: IMAGE_TYPES, maxBytes: 50 * MB },
  envelope: { contentTypes: IMAGE_TYPES, maxBytes: 5 * MB },
  qr: { contentTypes: IMAGE_TYPES, maxBytes: 10 * MB },
  music: { contentTypes: AUDIO_TYPES, maxBytes: 50 * MB },
}

export function isUploadFolder(value: unknown): value is UploadFolder {
  return typeof value === 'string' && (UPLOAD_FOLDERS as readonly string[]).includes(value)
}

/** Strip path segments and unsafe characters from a user-provided file name. */
export function sanitizeFileName(name: string): string {
  const base = name.replace(/.*[/\\]/, '')
  const safe = base.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  return safe || 'file'
}
