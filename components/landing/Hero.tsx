'use client'

interface HeroProps {
  onStart: () => void
  loading: boolean
}

export function Hero({ onStart, loading }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #fff0f6 0%, #fce4ec 40%, #f8bbd9 70%, #f48fb1 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: '#e83e8c' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: '#c2185b' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── Left: copy ── */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ background: 'rgba(232,62,140,0.12)', color: '#c2185b' }}>
            💕 Hoàn toàn miễn phí
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
            Làm thiệp cưới điện tử miễn phí{' '}
            <span className="italic" style={{ color: '#e83e8c' }}>
              &amp; quản lý khách mời
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-md mx-auto lg:mx-0">
            Giữ nét đẹp truyền thống · Tiện lợi thời hiện đại
          </p>

          {/* CTA */}
          <button
            onClick={onStart}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #e83e8c 0%, #c2185b 100%)',
              boxShadow: '0 6px 20px 0 rgba(232, 62, 140, 0.4)',
            }}
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>✨ Bắt đầu tạo thiệp</>
            )}
          </button>

          <p className="text-sm text-gray-400">Không cần đăng ký · Bắt đầu trong 30 giây</p>
        </div>

        {/* ── Right: demo card ── */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <div
            className="relative w-72 sm:w-80 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #fff8fb 0%, #fce4ec 100%)',
              border: '1px solid rgba(232,62,140,0.2)',
            }}
          >
            {/* Demo cover */}
            <div
              className="h-40 w-full flex items-end pb-4 px-4"
              style={{
                background:
                  'linear-gradient(160deg, #f48fb1 0%, #e83e8c 60%, #c2185b 100%)',
              }}
            >
              <p
                className="text-white text-2xl font-bold drop-shadow"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Minh &amp; Linh
              </p>
            </div>

            {/* Demo content */}
            <div className="p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest" style={{ color: '#e83e8c' }}>
                Trân trọng kính mời
              </p>
              <p className="font-semibold text-gray-700 text-sm">Thân mời, Nguyễn Văn A</p>

              <div className="rounded-xl p-3 text-xs text-gray-500 space-y-1"
                style={{ background: 'rgba(232,62,140,0.06)' }}>
                <p>📅 Thứ Bảy, 15/02/2026</p>
                <p>🕕 18:00 · Tiệc cưới</p>
                <p>📍 Trung tâm tiệc cưới ABC, Hà Nội</p>
              </div>

              <div
                className="w-full py-2 rounded-xl text-center text-xs font-semibold text-white"
                style={{ background: '#e83e8c' }}
              >
                💌 Xác nhận tham dự
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
