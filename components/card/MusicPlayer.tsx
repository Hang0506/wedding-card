'use client'

import { useRef, useState } from 'react'

export function MusicPlayer({ musicUrl, groomName, brideName, weddingDate }: {
  musicUrl: string
  groomName?: string
  brideName?: string
  weddingDate?: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'opening' | 'done'>('idle')

  const handleOpen = async () => {
    if (phase !== 'idle') return
    setPhase('opening')
    const audio = audioRef.current
    if (audio) { try { await audio.play(); setIsPlaying(true) } catch { /**/ } }
    setTimeout(() => {
      setPhase('done')
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        requestAnimationFrame(() => {
          const total = document.documentElement.scrollHeight - window.innerHeight
          if (total <= 0) return
          // Tự cuộn — copy theo chungdoi.com (đo thực tế): dừng ~3 giây rồi trượt ĐỀU 50px/giây
          // tới cuối trang. Dùng tốc độ thay vì tổng thời gian để trang dài/ngắn đều trượt
          // cùng cảm giác (thiệp ~3.750px → ~75 giây trượt).
          // Chỉ có 0,4 giây tăng tốc lúc khởi hành và 0,4 giây giảm tốc lúc dừng để khỏi bị giật cục.
          const SPEED_PX_PER_S = 53
          const HOLD_MS = 2000
          const RAMP_MS = 400
          const MOVE_MS = (total / SPEED_PX_PER_S) * 1000 + RAMP_MS
          const cruise = total / (MOVE_MS - RAMP_MS) // = SPEED_PX_PER_S / 1000 px/ms
          const posAt = (t: number) => {
            if (t <= 0) return 0
            if (t >= MOVE_MS) return total
            if (t < RAMP_MS) return (cruise * t * t) / (2 * RAMP_MS)
            if (t > MOVE_MS - RAMP_MS) return total - (cruise * (MOVE_MS - t) ** 2) / (2 * RAMP_MS)
            return cruise * (RAMP_MS / 2 + (t - RAMP_MS))
          }
          let last: number | null = null
          let clock = 0 // ms đã chạy (không tính lúc tab bị ẩn)
          let cancelled = false

          // Cancel nếu user tự scroll / bấm phím / kéo thanh cuộn
          const onUserScroll = () => { cancelled = true }
          const cancelEvents = ['wheel', 'touchmove', 'keydown', 'mousedown'] as const
          cancelEvents.forEach((ev) => window.addEventListener(ev, onUserScroll, { once: true, passive: true }))
          const cleanup = () => cancelEvents.forEach((ev) => window.removeEventListener(ev, onUserScroll))

          // Chống giật: trình duyệt chỉ cuộn theo nguyên pixel (màn hình 1x thấy rõ nhất),
          // nên cuộn phần nguyên + dịch phần lẻ (<1px) bằng transform trên nội dung thiệp
          // (GPU vẽ được sub-pixel) → trượt liền mạch.
          const dpr = window.devicePixelRatio || 1
          const content = document.querySelector<HTMLElement>('.wc-inner')
          if (content) content.style.willChange = 'transform'
          const resetContent = () => {
            if (!content) return
            content.style.transform = ''
            content.style.willChange = ''
          }

          const step = (ts: number) => {
            if (cancelled) { cleanup(); resetContent(); return }
            if (last === null) last = ts
            clock += Math.min(ts - last, 250) // giữ đúng lịch kể cả khi có khung nặng; chỉ chặn nhảy cóc lúc tab bị ẩn
            last = ts
            const pos = posAt(clock - HOLD_MS)
            const whole = Math.floor(pos * dpr) / dpr
            window.scrollTo(0, whole)
            if (content) content.style.transform = `translate3d(0, ${-(pos - whole).toFixed(3)}px, 0)`
            if (pos < total) requestAnimationFrame(step)
            else { cleanup(); resetContent() }
          }
          requestAnimationFrame(step)
        })
      }))
    }, 2000)
  }

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) { try { await audio.play(); setIsPlaying(true) } catch { /**/ } }
    else { audio.pause(); setIsPlaying(false) }
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={musicUrl} loop preload="auto"
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,600&family=Montserrat:wght@300;400;500&display=swap');

        /* ══ OVERLAY ══ */
        .ov {
          position: fixed; inset: 0; z-index: 99999;
          cursor: pointer; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: #fdf3ee;
        }

        /* Background gradient */
        .ov-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 20%, #fde8e0 0%, #fdf3ee 45%),
                      radial-gradient(ellipse at 70% 80%, #fde0e8 0%, transparent 55%);
        }

        /* Floral watercolor images */
        .ov-fl {
          position: absolute; pointer-events: none;
          background-size: contain; background-repeat: no-repeat;
        }
        /* Top left bouquet */
        .ov-fl-tl {
          top: -40px; left: -40px;
          width: clamp(220px, 45vw, 320px);
          height: clamp(220px, 45vw, 320px);
          background-image: url('https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=400&q=80&auto=format&fit=crop');
          border-radius: 50%;
          opacity: 0.22;
          animation: ovFlFloat 7s ease-in-out infinite;
          filter: saturate(1.2);
        }
        /* Bottom right bouquet */
        .ov-fl-br {
          bottom: -40px; right: -40px;
          width: clamp(200px, 40vw, 300px);
          height: clamp(200px, 40vw, 300px);
          background-image: url('https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=400&q=80&auto=format&fit=crop');
          border-radius: 50%;
          opacity: 0.18;
          animation: ovFlFloatR 8s ease-in-out infinite 1s;
          filter: saturate(1.1) hue-rotate(-15deg);
          transform: rotate(180deg) scaleX(-1);
        }
        /* Small top right */
        .ov-fl-tr {
          top: -20px; right: -20px;
          width: clamp(120px, 25vw, 180px);
          height: clamp(120px, 25vw, 180px);
          background-image: url('https://images.unsplash.com/photo-1490750967868-88df5691cc88?w=300&q=70&auto=format&fit=crop');
          border-radius: 50%;
          opacity: 0.2;
          animation: ovFlFloat 9s ease-in-out infinite 2s;
          filter: saturate(1.3) hue-rotate(10deg);
        }
        /* Small bottom left */
        .ov-fl-bl {
          bottom: -20px; left: -20px;
          width: clamp(100px, 22vw, 160px);
          height: clamp(100px, 22vw, 160px);
          background-image: url('https://images.unsplash.com/photo-1490750967868-88df5691cc88?w=300&q=70&auto=format&fit=crop');
          border-radius: 50%;
          opacity: 0.17;
          animation: ovFlFloatR 10s ease-in-out infinite 0.5s;
          filter: saturate(1.2);
        }

        @keyframes ovFlFloat  { 0%,100%{transform:translateY(0) rotate(0deg) scale(1)} 50%{transform:translateY(-12px) rotate(3deg) scale(1.02)} }
        @keyframes ovFlFloatR { 0%,100%{transform:rotate(180deg) scaleX(-1) translateY(0)} 50%{transform:rotate(180deg) scaleX(-1) translateY(-10px)} }

        /* ── Card container ── */
        .ov-card {
          position: relative; z-index: 10;
          width: min(340px, 88vw);
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(201,169,110,.3);
          box-shadow:
            0 20px 60px rgba(156,22,71,.12),
            0 4px 20px rgba(0,0,0,.06),
            inset 0 1px 0 rgba(255,255,255,.8);
          padding: 36px 28px 32px;
          text-align: center;
          animation: ovCardIn .8s cubic-bezier(.34,1.2,.64,1) .2s both;
        }
        @keyframes ovCardIn {
          from { opacity:0; transform:translateY(30px) scale(.92); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* Gold geometric lines on card */
        .ov-card::before {
          content: '';
          position: absolute; inset: 10px;
          border: 1px solid rgba(201,169,110,.2);
          border-radius: 18px;
          pointer-events: none;
        }

        /* Rose image inside card */
        .ov-card-rose {
          width: 80px; height: 80px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 16px;
          border: 3px solid rgba(201,169,110,.3);
          box-shadow: 0 4px 16px rgba(156,22,71,.15);
          display: block;
          animation: ovCardIn 1s cubic-bezier(.34,1.4,.64,1) .4s both;
        }

        /* Gold divider */
        .ov-gold-div {
          display: flex; align-items: center; gap: 8px;
          margin: 14px 0;
        }
        .ov-gold-div::before, .ov-gold-div::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, transparent, #c9a96e, transparent);
        }
        .ov-gold-div span { font-size: 11px; color: #c9a96e; letter-spacing: 4px; }

        /* Please join text */
        .ov-please {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px; letter-spacing: 4px;
          text-transform: uppercase; color: #c9a96e;
          margin: 0 0 8px;
          animation: ovFadeUp .7s ease .6s both;
        }

        /* Main title */
        .ov-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(38px, 10vw, 50px);
          color: #9c1647;
          margin: 0 0 4px;
          line-height: 1.2;
          text-shadow: 0 2px 8px rgba(156,22,71,.15);
          animation: ovFadeUp .7s ease .7s both;
        }
        .ov-title-amp {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; color: rgba(201,169,110,.7);
          letter-spacing: 4px; margin: 0 0 4px;
          animation: ovFadeUp .7s ease .8s both;
          display: block;
        }

        /* Wedding invitation text */
        .ov-invitation {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 15px;
          color: #7a5a4a; line-height: 1.6;
          margin: 0; animation: ovFadeUp .7s ease .9s both;
        }

        /* Open button */
        .ov-btn {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 20px;
          background: linear-gradient(135deg, #9c1647, #c2185b, #e83e8c);
          color: #fff; border: none; border-radius: 50px;
          padding: 13px 36px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer;
          box-shadow: 0 6px 20px rgba(156,22,71,.3);
          transition: transform .15s, box-shadow .15s;
          animation: ovFadeUp .7s ease 1s both;
          position: relative; overflow: hidden;
        }
        .ov-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
          transform: translateX(-100%);
          transition: transform .5s;
        }
        .ov-btn:hover::before { transform: translateX(100%); }
        .ov-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(156,22,71,.4); }
        .ov-btn:active { transform: translateY(0); }

        /* Music note */
        .ov-music-note {
          position: absolute; bottom: 20px; left: 0; right: 0;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-size: 9px; color: rgba(156,22,71,.3);
          letter-spacing: 2px; text-transform: uppercase;
          animation: ovFadeUp .7s ease 1.2s both;
        }

        /* Closing animation */
        @keyframes ovClose {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.05); }
        }
        .ov.closing { animation: ovClose .8s ease forwards; pointer-events: none; }

        @keyframes ovFadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Music toggle button ── */
        @keyframes wcMusicGlow {
          0%,100% { box-shadow: 0 4px 14px rgba(201,169,110,.4); }
          50%     { box-shadow: 0 4px 28px rgba(201,169,110,.8); }
        }
        .wc-music-btn {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 46px; height: 46px; border-radius: 50%; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #c9a96e, #a07840); color: #fff;
        }
        .wc-music-btn.playing { animation: wcMusicGlow 1.5s ease infinite; }
      `}</style>

      {/* ════════════════ OVERLAY ════════════════ */}
      {phase !== 'done' && (
        <div className={`ov${phase === 'opening' ? ' closing' : ''}`} onClick={handleOpen}>
          <div className="ov-bg" />

          {/* Floral background images */}
          <div className="ov-fl ov-fl-tl" />
          <div className="ov-fl ov-fl-br" />
          <div className="ov-fl ov-fl-tr" />
          <div className="ov-fl ov-fl-bl" />

          {/* Card */}
          <div className="ov-card">
            {/* Rose SVG inline */}
            <div style={{
              width: 72, height: 72,
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#fce4ec,#f8bbd9)',
              border: '2px solid rgba(201,169,110,.3)',
              boxShadow: '0 4px 16px rgba(156,22,71,.15)',
              overflow: 'hidden',
              animation: 'ovCardIn 1s cubic-bezier(.34,1.4,.64,1) .4s both',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/chibi.png"
                alt="Phong & Hằng"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 38%', transform: 'scale(1.9)', transformOrigin: '50% 38%' }}
              />
            </div>

            <p className="ov-please">Wedding Invitation</p>
            <div className="ov-gold-div"><span>✦</span></div>
            {(groomName || brideName) ? (
              <>
                <p className="ov-title" style={{fontSize:'clamp(32px,9vw,44px)',marginBottom:2}}>
                  {groomName || ''}
                </p>
                <span className="ov-title-amp" style={{fontSize:20,margin:'2px 0 2px'}}>
                  &amp;
                </span>
                <p className="ov-title" style={{fontSize:'clamp(32px,9vw,44px)',marginBottom:8}}>
                  {brideName || ''}
                </p>
              </>
            ) : (
              <p className="ov-title">The Wedding</p>
            )}

            {/* Ngày cưới */}
            {weddingDate && (
              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 11, letterSpacing: 2, color: '#c9a96e',
                margin: '4px 0 16px', textTransform: 'uppercase',
              }}>
                💍 {weddingDate}
              </p>
            )}

            <div className="ov-gold-div" style={{marginTop: weddingDate ? 0 : 16}}><span>✦</span></div>

            <p className="ov-invitation">
              Trân trọng kính mời<br/>
              Quý khách đến dự hôn lễ
            </p>

            <div className="ov-gold-div" style={{marginTop:16}}><span>✦</span></div>

            <button className="ov-btn">
              💌 &nbsp; Mở Thiệp
            </button>
          </div>

          <p className="ov-music-note">🎵 Nhạc sẽ tự phát khi mở</p>
        </div>
      )}

      {/* Music toggle */}
      {phase === 'done' && (
        <button onClick={toggle} className={`wc-music-btn${isPlaying ? ' playing' : ''}`}
          aria-label={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}>
          {isPlaying ? '🎵' : '🔇'}
        </button>
      )}
    </>
  )
}
