/**
 * Zod validation schemas for all API request bodies.
 * Using Zod v4 — z.record() requires (keyType, valueType), z.url() is standalone.
 */
import { z } from 'zod'

// Helpers for Zod v4
const anyRecord = z.record(z.string(), z.unknown())
const urlString = z.string()  // URL validation via z.url() or kept simple

// ─── Wedding ────────────────────────────────────────────────────────────────

export const createWeddingSchema = z.object({
  groomName: z.string().optional(),
  brideName: z.string().optional(),
})

export const updateWeddingSchema = z.object({
  groomName: z.string().optional(),
  brideName: z.string().optional(),
  groomShort: z.string().nullable().optional(),
  brideShort: z.string().nullable().optional(),
  groomTitle: z.string().optional(),
  brideTitle: z.string().optional(),
  displayOrder: z.string().optional(),
  coverPhotoUrl: z.string().nullable().optional(),
  galleryUrls: z.array(z.string()).optional(),
  galleryStyle: z.string().optional(),
  groomFamily: z.unknown().optional(),
  brideFamily: z.unknown().optional(),
  announcement: z.string().nullable().optional(),
  events: z.array(z.unknown()).optional(),
  reception: z.unknown().optional(),
  rsvpConfig: z.unknown().optional(),
  dressCode: z.unknown().optional(),
  guestbook: z.boolean().optional(),
  bankAccounts: z.array(z.unknown()).optional(),
  thankYouMsg: z.string().nullable().optional(),
  bgMusicUrl: z.string().nullable().optional(),
  envelopeStyle: z.string().optional(),
  sharePhotoUrl: z.string().nullable().optional(),
  settings: z.unknown().optional(),
})

// ─── Guests ─────────────────────────────────────────────────────────────────

export const createGuestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  greeting: z.string().optional(),
  message: z.string().optional(),
  group: z.string().optional(),
})

export const updateGuestSchema = z.object({
  name: z.string().min(1).optional(),
  greeting: z.string().optional(),
  message: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
  rsvpStatus: z.enum(['pending', 'attending', 'declined']).optional(),
  rsvpCount: z.number().int().min(0).optional().nullable(),
})

// ─── RSVP ────────────────────────────────────────────────────────────────────

export const rsvpAnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.string(),
})

export const rsvpSchema = z.object({
  rsvpStatus: z.enum(['attending', 'declined']),
  rsvpCount: z.number().int().min(0).optional(),
  answers: z.array(rsvpAnswerSchema).optional(),
})

// ─── Export types ─────────────────────────────────────────────────────────────

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>
export type CreateGuestInput = z.infer<typeof createGuestSchema>
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>
export type RsvpInput = z.infer<typeof rsvpSchema>
