'use client'

import { useState, useMemo } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CopyLinkButton } from './CopyLinkButton'
import { guestAvatar } from '@/lib/guest-avatar'
import type { Guest } from './GuestModal'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type RsvpFilter = 'all' | 'pending' | 'attending' | 'declined'

interface GuestListProps {
  guests: Guest[]
  weddingSlug: string
  baseUrl: string
  onAddGuest: () => void
  onEditGuest: (guest: Guest) => void
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function rsvpBadge(status: string, count?: number | null) {
  if (status === 'attending') {
    return (
      <div className="flex items-center gap-1.5">
        <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs font-medium">
          Tham dự
        </Badge>
        {count && count > 1 && (
          <span className="text-xs text-muted-foreground font-medium">{count} người</span>
        )}
        {count === 1 && (
          <span className="text-xs text-muted-foreground">1 người</span>
        )}
      </div>
    )
  }
  if (status === 'declined') {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 border text-xs font-medium">
        Từ chối
      </Badge>
    )
  }
  return (
    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border text-xs font-medium">
      Chờ
    </Badge>
  )
}

function formatTime(iso: string | null): { time: string; date: string } {
  if (!iso) return { time: '—', date: '' }
  const d = new Date(iso)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const day = d.getDate()
  const month = d.getMonth() + 1
  return { time: `${h}:${m}`, date: `${day} tháng ${month}` }
}

// ──────────────────────────────────────────────
// Filter tab
// ──────────────────────────────────────────────

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
        active
          ? 'bg-[#e83e8c]/10 text-[#e83e8c]'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {label} <span className="text-xs opacity-70">{count}</span>
    </button>
  )
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

export function GuestList({
  guests,
  weddingSlug,
  baseUrl,
  onAddGuest,
  onEditGuest,
}: GuestListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RsvpFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Counts per status
  const counts = useMemo(() => {
    return {
      all: guests.length,
      pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
      attending: guests.filter((g) => g.rsvpStatus === 'attending').length,
      declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
    }
  }, [guests])

  // Filtered + searched
  const displayed = useMemo(() => {
    let list = guests
    if (filter !== 'all') {
      list = list.filter((g) => g.rsvpStatus === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((g) => g.name.toLowerCase().includes(q))
    }
    return list
  }, [guests, filter, search])

  // Select all
  const allSelected = displayed.length > 0 && displayed.every((g) => selected.has(g.id))
  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(displayed.map((g) => g.id)))
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelected(next)
  }

  // Empty state
  if (guests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <UserPlus className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Chưa có khách mời nào</p>
        <p className="text-xs text-muted-foreground mb-4">
          Thêm khách để tạo link thiệp riêng cho mỗi người
        </p>
        <Button
          onClick={onAddGuest}
          size="sm"
          className="bg-[#e83e8c] hover:bg-[#d63179] text-white border-transparent gap-1.5"
        >
          <UserPlus className="size-3.5" />
          Thêm khách mời
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        <FilterTab
          label="Tất cả"
          count={counts.all}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterTab
          label="Chờ"
          count={counts.pending}
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        />
        <FilterTab
          label="Tham dự"
          count={counts.attending}
          active={filter === 'attending'}
          onClick={() => setFilter('attending')}
        />
        <FilterTab
          label="Từ chối"
          count={counts.declined}
          active={filter === 'declined'}
          onClick={() => setFilter('declined')}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên..."
          className="pl-8"
        />
      </div>

      {/* Total */}
      <p className="text-sm text-muted-foreground">
        {displayed.length === guests.length ? (
          <>Tổng cộng <span className="font-semibold text-foreground">{guests.length}</span> khách mời</>
        ) : (
          <>
            Đang hiển thị <span className="font-semibold text-foreground">{displayed.length}</span> /{' '}
            {guests.length} khách mời
          </>
        )}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-10 px-3 py-2.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-input accent-[#e83e8c] cursor-pointer"
                  aria-label="Chọn tất cả"
                />
              </th>
              <th className="w-12 px-2 py-2.5 text-center font-medium text-muted-foreground">STT</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Khách</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Phản hồi</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground hidden sm:table-cell">
                Thời gian
              </th>
              <th className="w-12 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy khách nào
                </td>
              </tr>
            ) : (
              displayed.map((guest, index) => {
                const guestUrl = `${baseUrl}/thiep/${weddingSlug}/${guest.slug}`
                const { time, date } = formatTime(guest.answeredAt)
                return (
                  <tr
                    key={guest.id}
                    onClick={() => onEditGuest(guest)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td
                      className="w-10 px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(guest.id)}
                        onChange={() => toggleSelect(guest.id)}
                        className="rounded border-input accent-[#e83e8c] cursor-pointer"
                        aria-label={`Chọn ${guest.name}`}
                      />
                    </td>
                    <td className="w-12 px-2 py-3 text-center text-sm font-medium tabular-nums text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        {(() => {
                          const av = guestAvatar(guest.name)
                          return (
                            <span
                              className="flex size-9 shrink-0 items-center justify-center rounded-full text-lg leading-none shadow-sm ring-1 ring-black/5"
                              style={{ backgroundColor: av.bg }}
                              title={av.label}
                              role="img"
                              aria-label={av.label}
                            >
                              {av.emoji}
                            </span>
                          )
                        })()}
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">{guest.name}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                            {weddingSlug}/{guest.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{rsvpBadge(guest.rsvpStatus, guest.rsvpCount)}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      {guest.answeredAt ? (
                        <div className="text-xs leading-tight">
                          <p className="font-medium">{time}</p>
                          <p className="text-muted-foreground">{date}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td
                      className="w-12 px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CopyLinkButton url={guestUrl} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
