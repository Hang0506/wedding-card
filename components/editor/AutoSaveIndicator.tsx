'use client'

import { useWeddingStore } from '@/store/weddingStore'

export function AutoSaveIndicator() {
  const isSaving = useWeddingStore((s) => s.isSaving)
  const lastSaved = useWeddingStore((s) => s.lastSaved)
  const saveError = useWeddingStore((s) => s.saveError)

  if (saveError) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <span className="inline-block size-1.5 rounded-full bg-destructive" />
        Lỗi lưu
      </span>
    )
  }

  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-yellow-400" />
        Đang lưu...
      </span>
    )
  }

  if (lastSaved) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-block size-1.5 rounded-full bg-green-500" />
        Đã lưu ✓
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="inline-block size-1.5 rounded-full bg-muted-foreground/40" />
      Lưu tự động
    </span>
  )
}
