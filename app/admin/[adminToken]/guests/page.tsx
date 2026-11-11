'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ArrowLeft, UserPlus, RefreshCw, MessageCircleHeart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GuestList } from '@/components/guests/GuestList'
import { GuestModal } from '@/components/guests/GuestModal'
import type { Guest } from '@/components/guests/GuestModal'

interface GuestbookEntry { id: string; name: string; message: string; createdAt: string }
interface GuestsPageProps { params: Promise<{ adminToken: string }> }

export default function GuestsPage({ params }: GuestsPageProps) {
  const { adminToken } = use(params)

  const [activeTab, setActiveTab] = useState<'guests' | 'guestbook'>('guests')
  const [guests, setGuests] = useState<Guest[]>([])
  const [weddingSlug, setWeddingSlug] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([])
  const [gbLoading, setGbLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>(undefined)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      const ts = Date.now()
      const wRes = await fetch(`/api/wedding/${adminToken}?t=${ts}`, { cache: 'no-store' })
      if (!wRes.ok) throw new Error('Không tìm thấy thiệp cưới')
      const wedding = await wRes.json()
      setWeddingSlug(wedding.slug ?? '')
      const gRes = await fetch(`/api/wedding/${adminToken}/guests?t=${ts}`, { cache: 'no-store' })
      if (!gRes.ok) throw new Error('Không thể tải danh sách khách mời')
      const data = await gRes.json()
      setGuests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally { setIsLoading(false) }
  }, [adminToken])

  const fetchGuestbook = useCallback(async (slug: string) => {
    if (!slug) return
    setGbLoading(true)
    try {
      const r = await fetch(`/api/thiep/${slug}/guestbook?t=${Date.now()}`, { cache: 'no-store' })
      if (r.ok) setGuestbookEntries(await r.json())
    } catch { /**/ } finally { setGbLoading(false) }
  }, [])

  useEffect(() => {
    void fetchData()
    const interval = setInterval(() => void fetchData(), 30_000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    if (activeTab === 'guestbook' && weddingSlug) void fetchGuestbook(weddingSlug)
  }, [activeTab, weddingSlug, fetchGuestbook])

  async function deleteEntry(id: string) {
    if (deletingId) return
    setDeletingId(id)
    try {
      const r = await fetch(`/api/thiep/${weddingSlug}/guestbook/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken },
      })
      if (r.ok) setGuestbookEntries(prev => prev.filter(e => e.id !== id))
    } catch { /**/ } finally { setDeletingId(null) }
  }

  function openCreateModal() { setEditingGuest(undefined); setModalMode('create'); setModalOpen(true) }
  function openEditModal(g: Guest) { setEditingGuest(g); setModalMode('edit'); setModalOpen(true) }
  const existingGroups = Array.from(new Set(guests.map(g => g.group).filter(Boolean) as string[]))

  function fmtDate(iso: string) {
    try {
      const d = new Date(iso)
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
    } catch { return '' }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/admin/${adminToken}`}>
              <Button variant="ghost" size="icon-sm" title="Quay lại thiệp"><ArrowLeft className="size-4" /></Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-base font-semibold leading-tight">Quản lý khách mời</h1>
              <p className="text-xs text-muted-foreground truncate">Tạo thiệp mới với tên và link riêng cho từng khách</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon-sm"
              onClick={() => activeTab === 'guests' ? void fetchData() : void fetchGuestbook(weddingSlug)}
              disabled={isLoading || gbLoading} title="Làm mới">
              <RefreshCw className={`size-4 ${(isLoading || gbLoading) ? 'animate-spin' : ''}`} />
            </Button>
            {activeTab === 'guests' && (
              <Button size="sm" onClick={openCreateModal}
                className="bg-[#e83e8c] hover:bg-[#d63179] text-white border-transparent gap-1.5">
                <UserPlus className="size-3.5" />
                <span className="hidden sm:inline">Thêm khách</span>
                <span className="sm:hidden">+</span>
              </Button>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="mx-auto max-w-3xl px-4 flex border-t border-border">
          <button onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab==='guests'?'border-[#e83e8c] text-[#e83e8c]':'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <UserPlus className="size-3.5" />Khách mời
            <span className="text-xs opacity-60">({guests.length})</span>
          </button>
          <button onClick={() => setActiveTab('guestbook')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab==='guestbook'?'border-[#e83e8c] text-[#e83e8c]':'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <MessageCircleHeart className="size-3.5" />Lời chúc
            {guestbookEntries.length > 0 && <span className="text-xs opacity-60">({guestbookEntries.length})</span>}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {activeTab === 'guests' && (
          isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-sm text-muted-foreground animate-pulse">Đang tải...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData}>Thử lại</Button>
            </div>
          ) : (
            <GuestList guests={guests} weddingSlug={weddingSlug} baseUrl={baseUrl}
              onAddGuest={openCreateModal} onEditGuest={openEditModal} />
          )
        )}

        {activeTab === 'guestbook' && (
          gbLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-sm text-muted-foreground animate-pulse">Đang tải...</div>
            </div>
          ) : guestbookEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircleHeart className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Chưa có lời chúc nào</p>
              <p className="text-xs text-muted-foreground mt-1">Lời chúc xuất hiện khi khách gửi trên thiệp</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{guestbookEntries.length} lời chúc</p>
              {guestbookEntries.map(e => (
                <div key={e.id} className="rounded-xl border border-border bg-background p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm" style={{color:'#9c1647'}}>{e.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{fmtDate(e.createdAt)}</p>
                      <button
                        onClick={() => void deleteEntry(e.id)}
                        disabled={deletingId === e.id}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                        title="Xóa lời chúc"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed italic">"{e.message}"</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <GuestModal open={modalOpen} onClose={() => setModalOpen(false)} mode={modalMode}
        guest={editingGuest} adminToken={adminToken} weddingSlug={weddingSlug}
        existingGroups={existingGroups} onSuccess={() => void fetchData()} />
    </div>
  )
}
