'use client'

import { useRef, useState } from 'react'
import { useWeddingStore } from '@/store/weddingStore'
import { uploadMedia } from '@/lib/upload-client'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
const MAX_SIZE_MB = 50
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function CoverPhotoSection() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!wedding) return null

  const { coverPhotoUrl } = wedding

  const handleFileSelect = async (file: File) => {
    setUploadError(null)

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Chỉ chấp nhận JPG, PNG, GIF, WebP, HEIC.')
      return
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`Ảnh không được vượt quá ${MAX_SIZE_MB}MB.`)
      return
    }

    setIsUploading(true)

    try {
      // Upload straight to Vercel Blob, then save URL (auto-save will kick in)
      const fileUrl = await uploadMedia(file, 'cover')
      updateField('coverPhotoUrl', fileUrl)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload thất bại'
      setUploadError(msg)
    } finally {
      setIsUploading(false)
      // Clear file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleRemove = () => {
    updateField('coverPhotoUrl', null)
    setUploadError(null)
  }

  return (
    <SectionWrapper
      title="Ảnh bìa"
      icon="🖼️"
      showToggle
      toggleValue={!!coverPhotoUrl}
      onToggleChange={(val) => {
        if (!val) updateField('coverPhotoUrl', null)
      }}
      defaultOpen
    >
      <div className="space-y-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Preview area */}
        {coverPhotoUrl ? (
          <div className="relative group rounded-lg overflow-hidden border border-border">
            <div className="relative aspect-video w-full bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPhotoUrl}
                alt="Ảnh bìa"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-white/90 hover:bg-white text-foreground"
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="size-3.5" />
                )}
                Thay ảnh
              </Button>
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <Trash2 className="size-3.5" />
                Xóa
              </Button>
            </div>
          </div>
        ) : (
          /* Upload placeholder */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-6 animate-spin" />
                <span className="text-sm">Đang tải lên...</span>
              </>
            ) : (
              <>
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">Tải lên ảnh bìa</span>
                <span className="text-xs">JPG, PNG, WebP, GIF, HEIC · tối đa {MAX_SIZE_MB}MB</span>
              </>
            )}
          </button>
        )}

        {/* Error message */}
        {uploadError && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}
      </div>
    </SectionWrapper>
  )
}
