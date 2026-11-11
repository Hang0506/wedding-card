'use client'

import { useState } from 'react'

interface RSVPQuestion {
  id: string
  text: string
  type: 'text' | 'select' | 'number'
  options: string[]
}

interface RSVPConfig {
  enabled: boolean
  displayMode?: 'button' | 'inline'
  guestMode?: 'free' | 'limited'
  guestLimit?: number
  questions?: RSVPQuestion[]
}

interface RSVPFormProps {
  weddingSlug: string
  guestSlug: string
  rsvpConfig: RSVPConfig | null
  isSubmitted: boolean
}

export function RSVPForm({
  weddingSlug,
  guestSlug,
  rsvpConfig,
  isSubmitted: initialSubmitted,
}: RSVPFormProps) {
  const [submitted, setSubmitted] = useState(initialSubmitted)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [attending, setAttending] = useState<'attending' | 'declined' | null>(null)
  const [guestCount, setGuestCount] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const config = rsvpConfig
  if (!config?.enabled) return null

  const displayMode = config.displayMode ?? 'inline'
  const guestMode = config.guestMode ?? 'free'
  const questions = config.questions ?? []

  // If already submitted
  if (submitted) {
    return (
      <section className="py-8 px-4 text-center">
        <div
          className="inline-block rounded-2xl px-8 py-6 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #fff0f7 100%)' }}
        >
          <p className="text-3xl mb-2">💌</p>
          <p className="text-lg font-semibold" style={{ color: '#e83e8c' }}>
            Cảm ơn bạn đã xác nhận!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Chúng tôi rất mong được gặp bạn.
          </p>
        </div>
      </section>
    )
  }

  if (alreadyDone) {
    return (
      <section className="py-8 px-4 text-center">
        <div
          className="inline-block rounded-2xl px-8 py-6 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)' }}
        >
          <p className="text-3xl mb-2">✅</p>
          <p className="text-lg font-semibold text-yellow-700">Đã xác nhận rồi</p>
          <p className="text-sm text-gray-500 mt-1">Bạn đã gửi xác nhận trước đó.</p>
        </div>
      </section>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attending) return

    setLoading(true)
    setError(null)

    const answersArr = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }))

    const body: {
      rsvpStatus: 'attending' | 'declined'
      rsvpCount?: number
      answers?: { questionId: string; value: string }[]
    } = {
      rsvpStatus: attending,
      answers: answersArr.length > 0 ? answersArr : undefined,
    }

    if (attending === 'attending' && guestMode === 'free') {
      body.rsvpCount = guestCount
    }

    try {
      const res = await fetch(`/api/thiep/${weddingSlug}/${guestSlug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 409) {
        setAlreadyDone(true)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Có lỗi xảy ra, vui lòng thử lại.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Không thể kết nối. Vui lòng kiểm tra mạng.')
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Attending radio */}
      <div className="space-y-2">
        <p className="font-medium text-gray-700 text-sm">Bạn có tham dự không?</p>
        <div className="flex gap-3">
          {[
            { value: 'attending' as const, label: '💐 Có, tôi sẽ đến', bg: '#fce4ec' },
            { value: 'declined' as const, label: '😔 Không, tôi bận', bg: '#f5f5f5' },
          ].map(({ value, label, bg }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAttending(value)}
              className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all"
              style={{
                borderColor: attending === value ? '#e83e8c' : '#e0e0e0',
                background: attending === value ? bg : '#fff',
                color: attending === value ? '#c2185b' : '#555',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Guest count — only when attending + free mode */}
      {attending === 'attending' && guestMode === 'free' && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="rsvp-count">
            Số người tham dự (bao gồm bạn)
          </label>
          <input
            id="rsvp-count"
            type="number"
            min={1}
            max={20}
            value={guestCount === 0 ? '' : guestCount}
            onChange={(e) => {
              const val = e.target.value
              if (val === '') { setGuestCount(0); return }
              const n = parseInt(val)
              if (!isNaN(n) && n >= 1 && n <= 20) setGuestCount(n)
            }}
            onBlur={() => { if (guestCount === 0) setGuestCount(1) }}
            placeholder="Nhập số..."
            className="w-28 h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300"
            style={{fontFamily:'Montserrat,sans-serif'}}
          />
        </div>
      )}

      {/* Dynamic questions */}
      {attending && questions.length > 0 && (
        <div className="space-y-4 pt-1">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
            Thêm vài thông tin
          </p>
          {questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{q.text}</label>
              {q.type === 'select' ? (
                <select
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 bg-white"
                >
                  <option value="">-- Chọn --</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : q.type === 'number' ? (
                <input
                  type="number"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  className="w-24 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300"
                />
              ) : (
                <input
                  type="text"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300"
                  placeholder="Câu trả lời của bạn..."
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={!attending || loading}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #e83e8c 0%, #c2185b 100%)',
          boxShadow: '0 4px 14px 0 rgba(232, 62, 140, 0.35)',
        }}
      >
        {loading ? 'Đang gửi...' : 'Xác nhận'}
      </button>
    </form>
  )

  if (displayMode === 'button' && !open) {
    return (
      <section className="py-8 px-4 text-center">
        <button
          onClick={() => setOpen(true)}
          className="px-8 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #e83e8c 0%, #c2185b 100%)',
            boxShadow: '0 4px 14px 0 rgba(232, 62, 140, 0.35)',
          }}
        >
          💌 Xác nhận tham dự
        </button>
      </section>
    )
  }

  return (
    <section className="py-8 px-4">
      <h3
        className="text-xl font-semibold text-center mb-6"
        style={{ color: '#e83e8c', fontFamily: 'var(--font-cormorant, serif)' }}
      >
        Xác nhận tham dự
      </h3>
      {formContent}
    </section>
  )
}
