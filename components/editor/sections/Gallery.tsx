'use client'

import { useRef, useState } from 'react'
import { useWeddingStore, type GalleryStyle } from '@/store/weddingStore'
import { uploadMedia } from '@/lib/upload-client'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from 'cn'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
const MAX_SIZE_MB = 50
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const MAX_GALLERY_PHOTOS = 20

const STYLE_OPTIONS: { value: GalleryStyle; label: string; emoji: string }[] = [
  { value: 'grid', label: 'Lưới', emoji: '⊞' },
  { value: 'mosaic', label: 'Ghép ảnh', emoji: '🖼' },
  { value: '3d', label: 'Carousel', emoji: '🎠' },
]

export function GallerySection() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!wedding) return null

  const { galleryUrls, galleryStyle } = wedding

  const uploadFile = (file: File): Promise<string> => uploadMedia(file, 'gallery')

  const handleFilesSelected = async (files: FileList) => {
    setUploadError(null)

    const fileArray = Array.from(files)

    // Validate
    const remaining = MAX_GALLERY_PHOTOS - galleryUrls.length
    if (remaining <= 0) {
      setUploadError(`Tối đa ${MAX_GALLERY_PHOTOS} ảnh trong gallery.`)
      return
    }

    const toUpload = fileArray.slice(0, remaining)

    for (const file of toUpload) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError('Chỉ chấp nhận JPG, PNG, GIF, WebP, HEIC.')
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`Mỗi ảnh không được vượt quá ${MAX_SIZE_MB}MB.`)
        return
      }
    }

    setIsUploading(true)

    try {
      // Upload sequentially to avoid overwhelming the presigned URL limit
      const newUrls: string[] = []
      for (const file of toUpload) {
        const url = await uploadFile(file)
        newUrls.push(url)
      }

      // Merge with existing
      updateField('galleryUrls', [...galleryUrls, ...newUrls])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload thất bại'
      setUploadError(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (index: number) => {
    const newUrls = galleryUrls.filter((_, i) => i !== index)
    updateField('galleryUrls', newUrls)
  }

  const isGalleryFull = galleryUrls.length >= MAX_GALLERY_PHOTOS

  return (
    <SectionWrapper
      title="Bộ ảnh cưới"
      icon="📸"
      showToggle
      toggleValue={galleryUrls.length > 0}
      onToggleChange={(val) => {
        if (!val) updateField('galleryUrls', [])
      }}
      defaultOpen
    >
      <div className="space-y-4">
        {/* Style selector */}
        <div>
          <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            Kiểu hiển thị
          </p>
          <div className="flex gap-2">
            {STYLE_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateField('galleryStyle', value)}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                  galleryStyle === value
                    ? 'border-[#e83e8c] bg-[#e83e8c]/10 text-[#e83e8c]'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                <span className="block text-base">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Count + add button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {galleryUrls.length}/{MAX_GALLERY_PHOTOS} ảnh
          </p>
          {!isGalleryFull && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ImagePlus className="size-3.5" />
              )}
              + Thêm ảnh
            </Button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFilesSelected(e.target.files)
          }}
        />

        {/* Gallery grid */}
        {galleryUrls.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {galleryUrls.map((url, i) => (
              <div
                key={url}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gallery ảnh ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/80"
                  aria-label={`Xóa ảnh ${i + 1}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            {/* Upload slot in grid */}
            {!isGalleryFull && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="size-5" />
                    <span className="text-xs">Thêm</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          /* Empty state */
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
                <span className="text-sm font-medium">Thêm ảnh vào bộ sưu tập</span>
                <span className="text-xs">Tối đa {MAX_GALLERY_PHOTOS} ảnh · {MAX_SIZE_MB}MB/ảnh</span>
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
