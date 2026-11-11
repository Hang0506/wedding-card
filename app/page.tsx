'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Không thể tạo thiệp. Vui lòng thử lại.')
      }

      const data = await res.json() as { adminToken: string }
      router.push(`/admin/${data.adminToken}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.')
      setLoading(false)
    }
  }

  return (
    <main>
      <Hero onStart={handleStart} loading={loading} />
      <HowItWorks />

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl shadow-lg text-sm z-50">
          {error}
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        <p>Thiệp Cưới Điện Tử · Miễn phí · Chia sẻ ngay</p>
      </footer>
    </main>
  )
}
