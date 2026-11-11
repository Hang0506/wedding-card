'use client'

import { useState, useEffect, useCallback } from 'react'
import { ExternalLink, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CopyLinkButton } from './CopyLinkButton'
import { toSlug } from '@/lib/slug'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Guest {
  id: string
  weddingId: string
  name: string
  slug: string
  greeting: string
  message: string | null
  group: string | null
  rsvpStatus: 'pending' | 'attending' | 'declined'
  rsvpCount: number | null
  answeredAt: string | null
  createdAt: string
}

interface GuestModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  guest?: Guest
  adminToken: string
  weddingSlug: string
  existingGroups?: string[]
  onSuccess: () => void
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function rsvpLabel(status: string) {
  if (status === 'attending') return 'Tham dự'
  if (status === 'declined') return 'Từ chối'
  return 'Chờ phản hồi'
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const day = d.getDate()
  const month = d.getMonth() + 1
  return `${h}:${m} — ${day} tháng ${month}`
}

// ──────────────────────────────────────────────
// Toast (minimal inline)
// ──────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      {message}
    </div>
  )
}

// ──────────────────────────────────────────────
// Tab component
// ──────────────────────────────────────────────

type TabId = 'details' | 'edit' | 'preview'

function Tabs({
  active,
  onChange,
}: {
  active: TabId
  onChange: (t: TabId) => void
}) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'details', label: 'Chi tiết' },
    { id: 'edit', label: 'Sửa' },
    { id: 'preview', label: 'Xem trước' },
  ]
  return (
    <div className="flex border-b border-border -mx-4 px-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === t.id
              ? 'border-[#e83e8c] text-[#e83e8c]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function GuestModal({
  open,
  onClose,
  mode,
  guest,
  adminToken,
  weddingSlug,
  existingGroups = [],
  onSuccess,
}: GuestModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('edit')
  const [isLoading, setIsLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // Form state
  const [greeting, setGreeting] = useState('Thân Mời')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [group, setGroup] = useState('')
  const [newGroup, setNewGroup] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)

  const slugPreview = toSlug(name) || name.toLowerCase().replace(/\s+/g, '-')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const guestLink = guest
    ? `${baseUrl}/thiep/${weddingSlug}/${guest.slug}`
    : ''

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && guest) {
      setGreeting(guest.greeting || 'Thân Mời')
      setName(guest.name)
      setMessage(guest.message ?? '')
      setGroup(guest.group ?? '')
      setActiveTab('details')
    } else {
      setGreeting('Thân Mời')
      setName('')
      setMessage('')
      setGroup('')
      setNewGroup('')
      setShowNewGroup(false)
      setActiveTab('edit')
    }
  }, [mode, guest, open])

  function showToast(msg: string) {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) return
    setIsLoading(true)

    const resolvedGroup = showNewGroup ? newGroup.trim() || undefined : group || undefined

    try {
      if (mode === 'create') {
        const res = await fetch(`/api/wedding/${adminToken}/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            greeting: greeting.trim() || 'Thân Mời',
            message: message.trim() || undefined,
            group: resolvedGroup,
          }),
        })
        if (!res.ok) throw new Error('Tạo khách thất bại')
        showToast('Đã thêm khách mời!')
        onSuccess()
        onClose()
      } else if (mode === 'edit' && guest) {
        const res = await fetch(`/api/wedding/${adminToken}/guests/${guest.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            greeting: greeting.trim() || 'Thân Mời',
            message: message.trim() || null,
            group: resolvedGroup ?? null,
          }),
        })
        if (!res.ok) throw new Error('Cập nhật thất bại')
        showToast('Đã lưu!')
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error(err)
      showToast('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [adminToken, greeting, group, guest, message, mode, name, newGroup, onClose, onSuccess, showNewGroup])

  const handleDelete = useCallback(async () => {
    if (!guest) return
    if (!confirm(`Xóa khách "${guest.name}"?`)) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/wedding/${adminToken}/guests/${guest.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Xóa thất bại')
      showToast('Đã xóa khách mời!')
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      showToast('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [adminToken, guest, onClose, onSuccess])

  const allGroups = Array.from(new Set([...existingGroups, ...(group ? [group] : [])]))

  return (
    <>
      <Dialog open={open} onOpenChange={(o: boolean) => { if (!o) onClose() }}>
        <DialogContent
          className="sm:max-w-md max-h-[90vh] overflow-y-auto"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'edit' && guest ? (
                <span>
                  {guest.name}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    /{weddingSlug}/{guest.slug}
                  </span>
                </span>
              ) : (
                'Thêm khách mời'
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs — only in edit mode */}
          {mode === 'edit' && (
            <Tabs active={activeTab} onChange={setActiveTab} />
          )}

          {/* ── Tab: Chi tiết ── */}
          {mode === 'edit' && activeTab === 'details' && guest && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Tên</p>
                  <p className="font-medium">{guest.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Slug</p>
                  <p className="font-mono text-xs">{guest.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Phản hồi</p>
                  <Badge
                    variant={
                      guest.rsvpStatus === 'attending'
                        ? 'default'
                        : guest.rsvpStatus === 'declined'
                        ? 'destructive'
                        : 'outline'
                    }
                    className={
                      guest.rsvpStatus === 'attending'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : guest.rsvpStatus === 'declined'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }
                  >
                    {rsvpLabel(guest.rsvpStatus)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Thời gian RSVP</p>
                  <p className="text-xs">{formatDateTime(guest.answeredAt)}</p>
                </div>
              </div>

              {/* Link thiệp */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Link thiệp</p>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <p className="flex-1 truncate font-mono text-xs text-muted-foreground">
                    {guestLink}
                  </p>
                  <CopyLinkButton
                    url={guestLink}
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Sửa / Create form ── */}
          {(activeTab === 'edit' || mode === 'create') && activeTab !== 'details' && activeTab !== 'preview' && (
            <div className="space-y-4 pt-2">
              {/* Greeting */}
              <div className="space-y-1.5">
                <Label htmlFor="greeting">Lời mời</Label>
                <Input
                  id="greeting"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Thân Mời"
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Tên khách <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
                {name && (
                  <p className="text-xs text-muted-foreground">
                    Slug:{' '}
                    <span className="font-mono text-foreground/70">{slugPreview}</span>
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="message">Lời nhắn</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Chúc mừng..."
                  rows={3}
                />
              </div>

              {/* Group */}
              <div className="space-y-1.5">
                <Label htmlFor="group">Nhóm</Label>
                {!showNewGroup ? (
                  <div className="flex gap-2">
                    <select
                      id="group"
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">— Không có nhóm —</option>
                      {allGroups.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewGroup(true)}
                    >
                      + Tạo nhóm
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={newGroup}
                      onChange={(e) => setNewGroup(e.target.value)}
                      placeholder="Tên nhóm mới..."
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewGroup(false)}
                    >
                      Huỷ
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                {mode === 'edit' ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <Trash2 className="size-3.5" />
                    Xóa
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading || !name.trim()}
                  className="bg-[#e83e8c] hover:bg-[#d63179] text-white border-transparent"
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </div>
          )}

          {/* ── Tab: Xem trước ── */}
          {mode === 'edit' && activeTab === 'preview' && guest && (
            <div className="space-y-3 pt-2">
              <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                <iframe
                  src={`/thiep/${weddingSlug}/${guest.slug}`}
                  className="h-[400px] w-full"
                  title={`Xem trước thiệp của ${guest.name}`}
                />
              </div>
              <div className="flex justify-end">
                <a
                  href={`/thiep/${weddingSlug}/${guest.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="size-3.5" />
                    Mở tab mới
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toast message={toastMsg} visible={toastVisible} />
    </>
  )
}
