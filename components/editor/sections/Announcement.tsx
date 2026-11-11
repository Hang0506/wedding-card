"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionWrapper } from "@/components/editor/SectionWrapper"
import { useWeddingStore } from "@/store/weddingStore"

export function Announcement() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)

  if (!wedding) return null

  const text = wedding.announcement ?? ""

  return (
    <SectionWrapper
      title="Câu thông báo"
      icon="📢"
      showToggle
      toggleValue={!!text}
      onToggleChange={(val) => { if (!val) updateField("announcement", null) }}
    >
      <div className="space-y-1">
        <Label htmlFor="announcement-text">Nội dung thông báo</Label>
        <Textarea
          id="announcement-text"
          value={text}
          onChange={(e) => updateField("announcement", e.target.value)}
          placeholder={"TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI"}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Xuống dòng bằng Enter để tách đoạn
        </p>
      </div>
    </SectionWrapper>
  )
}
