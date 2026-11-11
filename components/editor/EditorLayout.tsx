'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWeddingStore, type WeddingData } from '@/store/weddingStore'
import { AutoSaveIndicator } from '@/components/editor/AutoSaveIndicator'
import { BasicInfoSection } from '@/components/editor/sections/BasicInfo'
import { CoverPhotoSection } from '@/components/editor/sections/CoverPhoto'
import { GallerySection } from '@/components/editor/sections/Gallery'
import { FamilyInfo } from '@/components/editor/sections/FamilyInfo'
import { Announcement } from '@/components/editor/sections/Announcement'
import { Events } from '@/components/editor/sections/Events'
import { Reception } from '@/components/editor/sections/Reception'
import { RSVP } from '@/components/editor/sections/RSVP'
import { DressCode } from '@/components/editor/sections/DressCode'
import { Guestbook } from '@/components/editor/sections/Guestbook'
import { GiftBox } from '@/components/editor/sections/GiftBox'
import { ThankYou } from '@/components/editor/sections/ThankYou'
import { Music } from '@/components/editor/sections/Music'
import { Envelope } from '@/components/editor/sections/Envelope'
import { Button } from '@/components/ui/button'
import { Users, PanelLeft, Eye, ExternalLink } from 'lucide-react'

interface EditorLayoutProps {
  initialData: WeddingData
}

type ActivePanel = 'editor' | 'preview'

export function EditorLayout({ initialData }: EditorLayoutProps) {
  const setWedding = useWeddingStore((s) => s.setWedding)
  const wedding = useWeddingStore((s) => s.wedding)
  const [activePanel, setActivePanel] = useState<ActivePanel>('editor')

  // Hydrate store on mount (and when initialData changes)
  useEffect(() => {
    setWedding(initialData)
  }, [initialData, setWedding])

  // While hydrating, show nothing (prevents flash of empty state)
  if (!wedding) return null

  const adminToken = wedding.adminToken

  // Derive reception date for preview
  const receptionData = wedding.reception as { date?: string } | null
  const weddingDate = receptionData?.date ?? null

  // Format date for display
  function formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/30">
      {/* ── Top bar ── */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4">
        {/* Left: card name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-[#e83e8c] truncate">
            💌 {wedding.groomShort || wedding.groomName || 'Chú Rể'}
            {' & '}
            {wedding.brideShort || wedding.brideName || 'Cô Dâu'}
          </span>
        </div>

        {/* Center: auto-save */}
        <AutoSaveIndicator />

        {/* Right: guest management link */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/admin/${adminToken}/guests`}>
            <Button variant="outline" size="sm">
              <Users className="size-3.5" />
              <span className="hidden sm:inline">Quản lý khách mời</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Mobile toggle ── */}
      <div className="flex md:hidden h-10 shrink-0 items-center gap-1 border-b border-border bg-background px-4">
        <button
          type="button"
          onClick={() => setActivePanel('editor')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activePanel === 'editor'
              ? 'bg-[#e83e8c]/10 text-[#e83e8c]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PanelLeft className="size-3.5" />
          Chỉnh sửa
        </button>
        <button
          type="button"
          onClick={() => setActivePanel('preview')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activePanel === 'preview'
              ? 'bg-[#e83e8c]/10 text-[#e83e8c]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Eye className="size-3.5" />
          Xem trước
        </button>
      </div>

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — editor panel */}
        <aside
          className={`
            ${activePanel === 'editor' ? 'flex' : 'hidden'}
            md:flex
            w-full md:w-[420px] md:min-w-[420px] md:max-w-[420px]
            flex-col overflow-y-auto
            border-r border-border bg-background
          `}
        >
          <div className="flex flex-col gap-3 p-4">
            {/* 1. BasicInfo */}
            <BasicInfoSection />
            {/* 2. CoverPhoto */}
            <CoverPhotoSection />
            {/* 3. Gallery */}
            <GallerySection />
            {/* 4. FamilyInfo */}
            <FamilyInfo />
            {/* 5. Announcement */}
            <Announcement />
            {/* 6. Events */}
            <Events />
            {/* 7. Reception */}
            <Reception />
            {/* 8. RSVP */}
            <RSVP />
            {/* 9. DressCode */}
            <DressCode />
            {/* 10. Guestbook */}
            <Guestbook />
            {/* 11. GiftBox */}
            <GiftBox />
            {/* 12. ThankYou */}
            <ThankYou />
            {/* 13. Music */}
            <Music />
            {/* 14. Envelope */}
            <Envelope />
          </div>
        </aside>

        {/* Preview panel */}
        <main
          className={`
            ${activePanel === 'preview' ? 'flex' : 'hidden'}
            md:flex
            flex-1 flex-col overflow-y-auto
            bg-muted/30
          `}
        >
          <div className="flex flex-1 flex-col items-center py-8 px-4 gap-4">
            {/* Preview card */}
            <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-md overflow-hidden">
              {/* Cover photo */}
              {wedding.coverPhotoUrl ? (
                <div className="relative w-full h-48 bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wedding.coverPhotoUrl}
                    alt="Ảnh bìa"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[#e83e8c]/10 to-[#e83e8c]/30 flex items-center justify-center">
                  <span className="text-4xl">💒</span>
                </div>
              )}

              {/* Card body */}
              <div className="p-5 text-center space-y-3">
                {/* Couple names */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Trân trọng kính mời
                  </p>
                  <h2 className="text-xl font-bold text-[#e83e8c]">
                    {wedding.groomShort || wedding.groomName || 'Chú Rể'}
                    {' '}
                    <span className="text-muted-foreground font-normal">&amp;</span>
                    {' '}
                    {wedding.brideShort || wedding.brideName || 'Cô Dâu'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {wedding.groomName && wedding.brideName
                      ? `${wedding.groomName} & ${wedding.brideName}`
                      : ''}
                  </p>
                </div>

                {/* Wedding date */}
                {weddingDate ? (
                  <div className="rounded-lg border border-[#e83e8c]/20 bg-[#e83e8c]/5 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Ngày cưới</p>
                    <p className="text-sm font-semibold text-[#e83e8c]">
                      {formatDate(weddingDate)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      Chưa đặt ngày tiệc cưới
                    </p>
                  </div>
                )}

                {/* Coming soon notice */}
                <p className="text-xs text-muted-foreground italic">
                  Đang xây dựng...
                </p>
              </div>
            </div>

            {/* Link to public card */}
            <div className="w-full max-w-sm rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground mb-2">Link thiệp công khai:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs text-foreground">
                  /thiep/{wedding.slug}/{'<guest-slug>'}
                </code>
                <Link
                  href={`/thiep/${wedding.slug}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="icon-sm">
                    <ExternalLink className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
