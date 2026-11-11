'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from 'cn'

interface SectionWrapperProps {
  /** Section title shown in the header */
  title: string
  /** Emoji icon shown before the title */
  icon?: string
  /** Children: section body content */
  children: React.ReactNode
  /** Whether to show a toggle switch to hide/show section on the card */
  showToggle?: boolean
  /** Current toggle value (new API) */
  toggleValue?: boolean
  /** Called when toggle changes (new API) */
  onToggleChange?: (value: boolean) => void
  /** @deprecated Use toggleValue instead */
  visible?: boolean
  /** @deprecated Use onToggleChange instead */
  onToggleVisible?: (value: boolean) => void
  /** Whether the section body is initially expanded */
  defaultOpen?: boolean
}

export function SectionWrapper({
  title,
  icon,
  children,
  showToggle,
  toggleValue,
  onToggleChange,
  // Legacy aliases
  visible,
  onToggleVisible,
  defaultOpen = true,
}: SectionWrapperProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Resolve toggle value: prefer new API, fall back to legacy
  const resolvedToggleValue = toggleValue ?? visible ?? true
  const resolvedOnToggleChange = onToggleChange ?? onToggleVisible
  // Show toggle if explicitly requested OR if legacy visible/onToggleVisible props provided
  const shouldShowToggle = showToggle || (visible !== undefined || onToggleVisible !== undefined)

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer select-none hover:bg-muted/40 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {/* Left: icon + title + chevron */}
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="text-base leading-none" aria-hidden>
              {icon}
            </span>
          )}
          <span className="text-sm font-semibold text-foreground truncate">
            {title}
          </span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180',
            )}
          />
        </div>

        {/* Right: toggle switch */}
        {shouldShowToggle && (
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-muted-foreground">
              {resolvedToggleValue ? 'Hiện' : 'Ẩn'}
            </span>
            <Switch
              checked={resolvedToggleValue}
              onCheckedChange={resolvedOnToggleChange}
              size="sm"
              aria-label={`Hiển thị ${title} trên thiệp`}
            />
          </div>
        )}
      </div>

      {/* Body — animated collapse */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="px-4 pb-4 pt-1 border-t border-border/60">
          {children}
        </div>
      </div>
    </div>
  )
}
