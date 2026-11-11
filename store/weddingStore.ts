'use client'

import { create } from 'zustand'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'

// ──────────────────────────────────────────────
// Types — match Prisma Wedding model
// ──────────────────────────────────────────────

export type GalleryStyle = 'grid' | 'mosaic' | '3d'
export type DisplayOrder = 'groom_first' | 'bride_first'

export interface WeddingData {
  id: string
  adminToken: string
  slug: string
  groomName: string
  brideName: string
  groomShort: string | null
  brideShort: string | null
  groomTitle: string
  brideTitle: string
  displayOrder: DisplayOrder
  coverPhotoUrl: string | null
  galleryUrls: string[]
  galleryStyle: GalleryStyle
  groomFamily: unknown | null
  brideFamily: unknown | null
  announcement: string | null
  events: unknown[]
  reception: unknown | null
  rsvpConfig: unknown | null
  dressCode: unknown | null
  guestbook: boolean
  bankAccounts: unknown[]
  thankYouMsg: string | null
  bgMusicUrl: string | null
  envelopeStyle: string
  sharePhotoUrl: string | null
  settings: unknown | null
  createdAt: string
  updatedAt: string
}

// ──────────────────────────────────────────────
// Store state & actions
// ──────────────────────────────────────────────

export interface WeddingStore {
  // Data
  wedding: WeddingData | null
  adminToken: string | null
  // Status
  isSaving: boolean
  lastSaved: Date | null
  saveError: string | null
  // Debounce timer ref (stored outside re-render cycle)
  _saveTimer: ReturnType<typeof setTimeout> | null

  // Actions
  setWedding: (data: WeddingData) => void
  updateField: (path: string, value: unknown) => void
  setIsSaving: (value: boolean) => void
  _triggerSave: () => Promise<void>
}

// ──────────────────────────────────────────────
// Store implementation
// ──────────────────────────────────────────────

export const useWeddingStore = create<WeddingStore>((storeSet, storeGet) => ({
  wedding: null,
  adminToken: null,
  isSaving: false,
  lastSaved: null,
  saveError: null,
  _saveTimer: null,

  setWedding: (data: WeddingData) => {
    storeSet({
      wedding: data,
      adminToken: data.adminToken,
      saveError: null,
    })
  },

  setIsSaving: (value: boolean) => {
    storeSet({ isSaving: value })
  },

  updateField: (path: string, value: unknown) => {
    const { wedding, _saveTimer } = storeGet()
    if (!wedding) return

    // Deep-clone current wedding data and apply the lodash set
    const updated = set(cloneDeep(wedding), path, value)
    storeSet({ wedding: updated })

    // Debounce auto-save: clear existing timer, set a new one
    if (_saveTimer) {
      clearTimeout(_saveTimer)
    }

    const timer = setTimeout(() => {
      storeGet()._triggerSave()
    }, 1500)

    storeSet({ _saveTimer: timer })
  },

  _triggerSave: async () => {
    const { wedding, adminToken } = storeGet()
    if (!wedding || !adminToken) return

    storeSet({ isSaving: true, saveError: null })

    try {
      // Build a clean patch payload — exclude internal/readonly fields
      const {
        id: _id,
        adminToken: _at,
        slug: _slug,
        createdAt: _ca,
        updatedAt: _ua,
        ...patchData
      } = wedding

      // Suppress unused variable warnings
      void _id; void _at; void _slug; void _ca; void _ua

      // Ensure arrays are serializable (strip any non-plain values)
      // Also ensure array fields are never undefined
      const cleanPatch = JSON.parse(JSON.stringify({
        ...patchData,
        galleryUrls: patchData.galleryUrls ?? [],
        events: patchData.events ?? [],
        bankAccounts: patchData.bankAccounts ?? [],
      }))

      const res = await fetch(`/api/wedding/${adminToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPatch),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? 'Save failed')
      }

      storeSet({ isSaving: false, lastSaved: new Date(), saveError: null })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Save failed'
      storeSet({ isSaving: false, saveError: msg })
      console.error('[weddingStore] auto-save error:', error)
    }
  },
}))

// ──────────────────────────────────────────────
// Backward-compat alias
// Some sections (Announcement, DressCode, Events, Envelope, FamilyInfo,
// Reception, RSVP) were written before the store was finalized and use:
//   import { useweddingStore } from '@/store/weddingStore'
//   const { updateField, adminToken } = useweddingStore()
//
// This hook is a thin wrapper — it's NOT deprecated, just the lowercase 'w' naming.
// ──────────────────────────────────────────────

export function useweddingStore() {
  const updateField = useWeddingStore((s) => s.updateField)
  const adminToken = useWeddingStore((s) => s.adminToken)
  return { updateField, adminToken }
}
