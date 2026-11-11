"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionWrapper } from "@/components/editor/SectionWrapper"
import { useWeddingStore } from "@/store/weddingStore"

interface FamilyData {
  title?: string
  fatherName?: string
  motherName?: string
  address?: string
}

function FamilySide({ label, storeKey }: { label: string; storeKey: "groomFamily" | "brideFamily" }) {
  const store = useWeddingStore()
  const data = (store.wedding?.[storeKey] as FamilyData | null) ?? {}

  // Always read fresh from store to avoid stale closure
  const set = (field: keyof FamilyData, value: string) => {
    const current = (useWeddingStore.getState().wedding?.[storeKey] as FamilyData | null) ?? {}
    useWeddingStore.getState().updateField(storeKey, { ...current, [field]: value })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#e83e8c]">{label}</p>
      <div className="space-y-1">
        <Label>Danh xưng</Label>
        <Input
          value={data.title ?? "Ông Bà"}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Ông Bà"
        />
      </div>
      <div className="space-y-1">
        <Label>Tên cha</Label>
        <Input
          value={data.fatherName ?? ""}
          onChange={(e) => set("fatherName", e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </div>
      <div className="space-y-1">
        <Label>Tên mẹ</Label>
        <Input
          value={data.motherName ?? ""}
          onChange={(e) => set("motherName", e.target.value)}
          placeholder="Nguyễn Thị B"
        />
      </div>
      <div className="space-y-1">
        <Label>Địa chỉ</Label>
        <Textarea
          value={data.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Địa chỉ nhà..."
          rows={2}
        />
      </div>
    </div>
  )
}

export function FamilyInfo() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)
  if (!wedding) return null

  return (
    <SectionWrapper
      title="Thông tin gia đình"
      icon="👨‍👩‍👧"
      showToggle
      toggleValue={!!(wedding.groomFamily || wedding.brideFamily)}
      onToggleChange={(val) => {
        if (!val) {
          updateField("groomFamily", null)
          updateField("brideFamily", null)
        }
      }}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FamilySide label="Nhà trai" storeKey="groomFamily" />
        <FamilySide label="Nhà gái" storeKey="brideFamily" />
      </div>
    </SectionWrapper>
  )
}
