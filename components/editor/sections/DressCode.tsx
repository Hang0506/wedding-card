"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionWrapper } from "@/components/editor/SectionWrapper"
import { useWeddingStore } from "@/store/weddingStore"

interface DressCodeData {
  visible?: boolean
  instructions?: string
}

export function DressCode() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)

  if (!wedding) return null

  const data: DressCodeData = (wedding.dressCode as DressCodeData) ?? { visible: false, instructions: "" }

  const update = (field: keyof DressCodeData, value: string | boolean) =>
    updateField("dressCode", { ...data, [field]: value })

  return (
    <SectionWrapper
      title="Dress Code"
      icon="👗"
      showToggle
      toggleValue={!!data.visible}
      onToggleChange={(val) => update("visible", val)}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="dresscode-instructions">Hướng dẫn trang phục</Label>
          <Textarea
            id="dresscode-instructions"
            value={data.instructions ?? ""}
            onChange={(e) => update("instructions", e.target.value)}
            placeholder="VD: Trang phục lịch sự, tông màu pastel. Tránh màu trắng và đen."
            rows={3}
          />
        </div>
        {!data.visible && (
          <p className="text-xs text-muted-foreground text-center py-1">
            Bật công tắc để hiển thị dress code trên thiệp
          </p>
        )}
      </div>
    </SectionWrapper>
  )
}
