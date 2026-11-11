'use client'

import * as React from 'react'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useWeddingStore } from '@/store/weddingStore'
import { uploadMedia } from '@/lib/upload-client'
import { Music2Icon, UploadIcon, CheckIcon } from 'lucide-react'

interface PresetTrack {
  label: string
  url: string
}

const PRESET_TRACKS: PresetTrack[] = [
  {
    label: 'Canon in D — Pachelbel',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Johann_Pachelbel_-_Canon_in_D_major_%28Roland_Noll%29.ogg',
  },
  {
    label: 'Wedding March — Mendelssohn',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Mendelssohn_Wedding_March.ogg',
  },
  {
    label: 'Clair de Lune — Debussy',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Clair_de_lune.ogg',
  },
  {
    label: 'Gymnopédie No.1 — Satie',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Gymnop%C3%A9die_No._1.ogg',
  },
  {
    label: 'Liebestraum — Liszt',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Liebestraum-3_by_Franz_Liszt.ogg',
  },
  {
    label: 'Nhạc từ file của bạn',
    url: '__upload__',
  },
]

/** Derive a display label from a URL or preset */
function labelFromUrl(url: string): string {
  const preset = PRESET_TRACKS.find((t) => t.url === url)
  if (preset) return preset.label
  // Extract filename from URL
  const parts = url.split('/')
  const filename = parts[parts.length - 1] ?? url
  return filename.replace(/\.mp3$/i, '').replace(/[-_]/g, ' ')
}

type TabType = 'preset' | 'upload'

/**
 * Music — editor section
 * Store path: `bgMusicUrl` (string | null)
 */
export function Music() {
  const updateField = useWeddingStore((s) => s.updateField)
  const wedding = useWeddingStore((s) => s.wedding)

  const currentUrl = wedding?.bgMusicUrl ?? null
  const [musicEnabled, setMusicEnabled] = React.useState(currentUrl !== null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<TabType>('preset')
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync toggle state khi store load từ DB (adjust state during render, không dùng effect)
  const [prevUrl, setPrevUrl] = React.useState(currentUrl)
  if (prevUrl !== currentUrl) {
    setPrevUrl(currentUrl)
    setMusicEnabled(currentUrl !== null)
  }

  function handleToggle(checked: boolean) {
    setMusicEnabled(checked)
    if (!checked) {
      updateField('bgMusicUrl', null)
    }
  }

  function selectPreset(track: PresetTrack) {
    if (track.url === '__upload__') {
      setActiveTab('upload')
      return
    }
    updateField('bgMusicUrl', track.url)
    setDialogOpen(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.mp3')) {
      setUploadError('Chỉ hỗ trợ file MP3')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File tối đa 50MB')
      return
    }

    setUploadError(null)
    setUploading(true)

    try {
      const fileUrl = await uploadMedia(file, 'music', file.type || 'audio/mpeg')

      updateField('bgMusicUrl', fileUrl)
      setDialogOpen(false)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <SectionWrapper
      title="Nhạc nền"
      icon="🎵"
      showToggle
      toggleValue={musicEnabled}
      onToggleChange={handleToggle}
    >
      <div className="space-y-2">
        {/* Current selection */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 min-h-9">
          <Music2Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-sm truncate flex-1 text-muted-foreground">
            {currentUrl ? labelFromUrl(currentUrl) : 'Chưa chọn bài nhạc'}
          </span>
        </div>

        {/* Dialog trigger */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium hover:bg-muted transition-colors"
          >
            <Music2Icon className="size-3.5" />
            Chọn nhạc
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chọn nhạc nền</DialogTitle>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex border-b border-border -mx-4 px-4">
              <button
                type="button"
                onClick={() => setActiveTab('preset')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'preset'
                    ? 'text-[#e83e8c] border-b-2 border-[#e83e8c]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Nhạc có sẵn
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-[#e83e8c] border-b-2 border-[#e83e8c]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tải lên
              </button>
            </div>

            {/* Tab: Preset */}
            {activeTab === 'preset' && (
              <div className="space-y-1 py-1 max-h-64 overflow-y-auto">
                {PRESET_TRACKS.map((track) => (
                  <button
                    key={track.url}
                    type="button"
                    onClick={() => selectPreset(track)}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                  >
                    <Music2Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{track.label}</span>
                    {currentUrl === track.url && (
                      <CheckIcon className="size-3.5 shrink-0 text-[#e83e8c]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Upload */}
            {activeTab === 'upload' && (
              <div className="py-4 space-y-3">
                <div
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 py-8 gap-3 cursor-pointer hover:border-[#e83e8c]/50 hover:bg-[#e83e8c]/5 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="size-6 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Nhấn để chọn file MP3</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tối đa 10MB</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,audio/mpeg"
                  className="hidden"
                  onChange={handleUpload}
                />

                {uploading && (
                  <p className="text-sm text-center text-muted-foreground animate-pulse">
                    Đang tải lên…
                  </p>
                )}

                {uploadError && (
                  <p className="text-sm text-center text-destructive">{uploadError}</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SectionWrapper>
  )
}
