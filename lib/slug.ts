/**
 * Slug generation helpers using `slugify`.
 */
import slugify from 'slugify'
import { customAlphabet } from 'nanoid'

// Lowercase alphanumeric alphabet: 26 letters + 10 digits = 36 chars
// 8 chars × log2(36) ≈ 41 bits of entropy — sufficient for collision avoidance
const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

/**
 * Generate a URL-safe slug from a string.
 */
export function toSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,    // remove special chars
    locale: 'vi',    // Vietnamese locale
    trim: true,
  })
}

/**
 * Generate a random 8-character lowercase alphanumeric slug.
 */
export function randomSlug(): string {
  return nanoidSlug()
}

/**
 * Append a random suffix to a slug to resolve conflicts.
 */
export function withSuffix(slug: string): string {
  return `${slug}-${randomSlug()}`
}
