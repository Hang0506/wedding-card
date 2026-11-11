'use client'

import * as React from 'react'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { useWeddingStore } from '@/store/weddingStore'

/**
 * Guestbook — editor section
 * Store path: `guestbook` (boolean — show/hide guestbook)
 */
export function Guestbook() {
  const updateField = useWeddingStore((s) => s.updateField)
  const wedding = useWeddingStore((s) => s.wedding)

  const guestbookEnabled = wedding?.guestbook ?? false

  function handleToggle(checked: boolean) {
    updateField('guestbook', checked)
  }

  return (
    <SectionWrapper
      title="Sổ lưu bút"
      icon="📖"
      showToggle
      toggleValue={guestbookEnabled}
      onToggleChange={handleToggle}
    >
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          0 lời chúc
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Lời chúc của khách mời sẽ hiển thị tại đây
        </p>
      </div>
    </SectionWrapper>
  )
}
