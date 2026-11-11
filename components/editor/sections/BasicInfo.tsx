'use client'

import { useEffect } from 'react'
import { useWeddingStore } from '@/store/weddingStore'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

/** Lấy tên đầu tiên (first token) từ chuỗi họ tên */
function extractFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1] ?? ''
}

export function BasicInfoSection() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)

  if (!wedding) return null

  const {
    groomName,
    brideName,
    groomShort,
    brideShort,
    groomTitle,
    brideTitle,
    displayOrder,
  } = wedding

  // Auto-fill groomShort when groomName changes and groomShort is still null/empty
  const handleGroomNameChange = (value: string) => {
    updateField('groomName', value)
    if (!groomShort) {
      updateField('groomShort', extractFirstName(value))
    }
  }

  // Auto-fill brideShort when brideName changes and brideShort is still null/empty
  const handleBrideNameChange = (value: string) => {
    updateField('brideName', value)
    if (!brideShort) {
      updateField('brideShort', extractFirstName(value))
    }
  }

  return (
    <SectionWrapper title="Thông tin cơ bản" icon="💑" defaultOpen>
      <div className="space-y-4">
        {/* ── Thứ tự hiển thị ── */}
        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground uppercase tracking-wide">
            Thứ tự hiển thị
          </Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField('displayOrder', 'groom_first')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                displayOrder === 'groom_first'
                  ? 'border-[#e83e8c] bg-[#e83e8c]/10 text-[#e83e8c]'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              🤵 Nhà trai trước
            </button>
            <button
              type="button"
              onClick={() => updateField('displayOrder', 'bride_first')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                displayOrder === 'bride_first'
                  ? 'border-[#e83e8c] bg-[#e83e8c]/10 text-[#e83e8c]'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              👰 Nhà gái trước
            </button>
          </div>
        </div>

        {/* ── Chú Rể ── */}
        <div className="rounded-lg bg-muted/40 p-3 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Chú Rể
          </p>
          {/* Danh xưng */}
          <div>
            <Label htmlFor="groomTitle" className="mb-1 text-xs">
              Danh xưng
            </Label>
            <Input
              id="groomTitle"
              value={groomTitle}
              onChange={(e) => updateField('groomTitle', e.target.value)}
              placeholder="Chú Rể"
            />
          </div>
          {/* Họ tên đầy đủ */}
          <div>
            <Label htmlFor="groomName" className="mb-1 text-xs">
              Họ và tên
            </Label>
            <Input
              id="groomName"
              value={groomName}
              onChange={(e) => handleGroomNameChange(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>
          {/* Tên ngắn */}
          <div>
            <Label htmlFor="groomShort" className="mb-1 text-xs">
              Tên ngắn
            </Label>
            <div className="flex gap-2">
              <Input
                id="groomShort"
                value={groomShort ?? ''}
                onChange={(e) => updateField('groomShort', e.target.value)}
                placeholder={extractFirstName(groomName) || 'Tên ngắn'}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                title="Reset về tên mặc định"
                onClick={() =>
                  updateField('groomShort', extractFirstName(groomName))
                }
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Cô Dâu ── */}
        <div className="rounded-lg bg-muted/40 p-3 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Cô Dâu
          </p>
          {/* Danh xưng */}
          <div>
            <Label htmlFor="brideTitle" className="mb-1 text-xs">
              Danh xưng
            </Label>
            <Input
              id="brideTitle"
              value={brideTitle}
              onChange={(e) => updateField('brideTitle', e.target.value)}
              placeholder="Cô Dâu"
            />
          </div>
          {/* Họ tên đầy đủ */}
          <div>
            <Label htmlFor="brideName" className="mb-1 text-xs">
              Họ và tên
            </Label>
            <Input
              id="brideName"
              value={brideName}
              onChange={(e) => handleBrideNameChange(e.target.value)}
              placeholder="Trần Thị B"
            />
          </div>
          {/* Tên ngắn */}
          <div>
            <Label htmlFor="brideShort" className="mb-1 text-xs">
              Tên ngắn
            </Label>
            <div className="flex gap-2">
              <Input
                id="brideShort"
                value={brideShort ?? ''}
                onChange={(e) => updateField('brideShort', e.target.value)}
                placeholder={extractFirstName(brideName) || 'Tên ngắn'}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                title="Reset về tên mặc định"
                onClick={() =>
                  updateField('brideShort', extractFirstName(brideName))
                }
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
