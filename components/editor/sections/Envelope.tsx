'use client'

import * as React from 'react'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useWeddingStore } from '@/store/weddingStore'
import { uploadMedia } from '@/lib/upload-client'
import { UploadIcon, ImageIcon } from 'lucide-react'

type EnvelopeStyleType = 'default' | 'custom'

/**
 * Envelope — editor section
 * Store paths:
 *   - `envelopeStyle`   ('default' | 'custom')
 *   - `sharePhotoUrl`   (string | null)
 */
export function Envelope() {
  const updateField = useWeddingStore((s) => s.updateField)
  const wedding = useWeddingStore((s) => s.wedding)

  const currentEnvelopeStyle = (wedding?.envelopeStyle ?? 'default') as EnvelopeStyleType
  const currentSharePhotoUrl = wedding?.sharePhotoUrl ?? null

  const [greeting, setGreeting] = React.useState('Thân Mời')
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleGreetingChange(e: React.ChangeEvent<HTMLInputElement>) {
    setGreeting(e.target.value)
    updateField('greeting', e.target.value)
  }

  function selectStyle(style: EnvelopeStyleType) {
    updateField('envelopeStyle', style)
    if (style === 'default') {
      updateField('sharePhotoUrl', null)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setUploadError('Chỉ hỗ trợ JPG, PNG, WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ảnh tối đa 5MB')
      return
    }

    setUploadError(null)
    setUploading(true)

    try {
      const fileUrl = await uploadMedia(file, 'envelope')

      updateField('sharePhotoUrl', fileUrl)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <SectionWrapper title="Phong bì / Chia sẻ" icon="✉️">
      <div className="space-y-4">
        {/* Greeting input */}
        <div className="space-y-1.5">
          <Label htmlFor="envelope-greeting" className="text-sm font-medium">
            Lời mời
          </Label>
          <Input
            id="envelope-greeting"
            value={greeting}
            onChange={handleGreetingChange}
            placeholder="Thân Mời"
          />
          <p className="text-xs text-muted-foreground">
            Dòng chữ hiển thị trên phong bì thiệp
          </p>
        </div>

        {/* Preview image style selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Ảnh xem trước khi chia sẻ</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => selectStyle('default')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition-all ${
                currentEnvelopeStyle === 'default'
                  ? 'border-[#e83e8c] bg-[#e83e8c]/5 text-[#e83e8c]'
                  : 'border-border bg-background text-muted-foreground hover:border-[#e83e8c]/40'
              }`}
            >
              <ImageIcon className="size-5" />
              Phong bì thiệp
            </button>

            <button
              type="button"
              onClick={() => selectStyle('custom')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition-all ${
                currentEnvelopeStyle === 'custom'
                  ? 'border-[#e83e8c] bg-[#e83e8c]/5 text-[#e83e8c]'
                  : 'border-border bg-background text-muted-foreground hover:border-[#e83e8c]/40'
              }`}
            >
              <UploadIcon className="size-5" />
              Ảnh của bạn
            </button>
          </div>
        </div>

        {/* Custom photo upload */}
        {currentEnvelopeStyle === 'custom' && (
          <div className="space-y-2">
            {/* Preview thumbnail */}
            {currentSharePhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSharePhotoUrl}
                  alt="Ảnh xem trước"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-medium gap-1"
                >
                  <UploadIcon className="size-3.5" />
                  Đổi ảnh
                </button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 py-6 gap-2 cursor-pointer hover:border-[#e83e8c]/50 hover:bg-[#e83e8c]/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-5 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs font-medium">Nhấn để tải ảnh lên</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP — tối đa 5MB</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleUpload}
            />

            {/* Upload button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <UploadIcon className="size-3.5" />
              {uploading ? 'Đang tải lên…' : currentSharePhotoUrl ? 'Đổi ảnh khác' : 'Chọn ảnh'}
            </Button>

            {uploading && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                Đang tải lên…
              </p>
            )}

            {uploadError && (
              <p className="text-xs text-center text-destructive">{uploadError}</p>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
