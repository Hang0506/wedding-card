'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { responsiveImg, type ImgWidth } from '@/lib/img'

// Ảnh trong album: khung tối đa ~360px (thiệp rộng 480px) → srcset để màn hình nét lấy bản lớn
const TILE_WIDTHS: ImgWidth[] = [640, 828, 1080, 1200]
const TILE_SIZES = '(max-width: 480px) 75vw, 360px'
const tile = (url: string) => ({ ...responsiveImg(url, TILE_WIDTHS, 85), sizes: TILE_SIZES })

interface GalleryViewProps {
  urls: string[]
  style: string
}

const CSS = `
/* ── Lightbox ── */
.lb{position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;animation:lbIn .2s ease}
@keyframes lbIn{from{opacity:0}to{opacity:1}}
.lb-img{max-width:94vw;max-height:90vh;border-radius:10px;object-fit:contain;animation:lbImg .3s cubic-bezier(.34,1.2,.64,1) both}
@keyframes lbImg{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
.lb-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.12);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.2);color:#fff;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;transition:background .2s;border:none}
.lb-nav:hover{background:rgba(255,255,255,.25)}
.lb-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;border:none}
.lb-counter{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.5);font-size:13px}
.lb-dots{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);display:flex;gap:6px}
.lb-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);cursor:pointer;transition:all .2s}
.lb-dot.active{background:#fff;width:18px;border-radius:3px}

/* ── Grid Featured ── */
.g-featured{display:grid;gap:3px;border-radius:16px;overflow:hidden}
.g-featured .g-item{overflow:hidden;cursor:pointer;position:relative}
.g-featured .g-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
.g-featured .g-item:hover img{transform:scale(1.06)}
.g-more-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;font-family:'Cormorant Garamond',serif}

/* ── Masonry ── */
.g-masonry{columns:2;column-gap:6px}
.g-masonry .g-item{break-inside:avoid;margin-bottom:6px;border-radius:12px;overflow:hidden;cursor:pointer}
.g-masonry .g-item img{width:100%;height:auto;display:block;transition:transform .5s ease}
.g-masonry .g-item:hover img{transform:scale(1.04)}

/* ── Carousel coverflow (copy thông số chungdoi.com) ── */
.g-carousel{position:relative;width:100%;max-width:380px;margin:0 auto;padding:8px 0 36px;user-select:none;touch-action:pan-y;overflow:hidden}
.g-carousel-track{position:relative;height:340px;display:flex;align-items:center;justify-content:center;perspective:1000px}
/* Ảnh cao 92% khung, tỉ lệ dọc ~0.65; vị trí/góc xoay đặt bằng inline style theo offset */
.g-carousel-item{
  position:absolute;height:92%;aspect-ratio:0.65/1;
  cursor:pointer;border-radius:16px;overflow:hidden;
  box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);
  will-change:transform,opacity;
  transition:all 1100ms cubic-bezier(0.4,0,0.2,1);
}
.g-carousel-item.is-center{box-shadow:0 0 0 2px rgba(255,255,255,.3),0 20px 25px -5px rgba(0,0,0,.15),0 8px 10px -6px rgba(0,0,0,.1)}
.g-carousel-item img{width:100%;height:100%;object-fit:cover;object-position:50% 50%;display:block;pointer-events:none}

.g-carousel-btn{
  position:absolute;top:50%;transform:translateY(-60%);
  width:36px;height:36px;border-radius:50%;
  background:rgba(255,255,255,.92);
  border:1px solid rgba(201,169,110,.25);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:20px;
  box-shadow:0 2px 12px rgba(156,22,71,.12);
  z-index:20;
  transition:transform .2s,box-shadow .2s;
  color:#9c1647;
  -webkit-tap-highlight-color:transparent;
}
.g-carousel-btn:hover{transform:translateY(-60%) scale(1.1);box-shadow:0 4px 16px rgba(156,22,71,.2)}
.g-carousel-btn:active{transform:translateY(-60%) scale(.95)}
.g-carousel-btn.prev{left:2px}
.g-carousel-btn.next{right:2px}
.g-carousel-dots{display:flex;justify-content:center;gap:6px;margin-top:12px}
.g-carousel-dot{width:8px;height:8px;border-radius:9999px;background:#c9a96e;opacity:.25;transition:all .3s cubic-bezier(.4,0,.2,1);cursor:pointer;border:none;padding:0}
.g-carousel-dot:hover{opacity:.4}
.g-carousel-dot.active{width:24px;opacity:.7}
.g-carousel-counter{text-align:center;font-size:13px;color:#9a7a6a;margin-top:6px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;letter-spacing:2px}
`

// Coverflow — thông số đo từ chungdoi.com: offset 0 / ±1 / ±2 (ảnh xa hơn thì ẩn sau, nghiêng 90°)
function coverflowStyle(offset: number): React.CSSProperties {
  const a = Math.abs(offset), s = Math.sign(offset)
  if (a === 0) return { transform: 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1)', opacity: 1, zIndex: 100 }
  if (a === 1) return { transform: `translateX(${s * 60}%) translateZ(-150px) rotateY(${s * 45}deg) scale(0.85)`, opacity: 0.75, zIndex: 99 }
  if (a === 2) return { transform: `translateX(${s * 120}%) translateZ(-300px) rotateY(${s * 90}deg) scale(0.7)`, opacity: 0.5, zIndex: 98 }
  return { transform: `translateX(${s * 150}%) translateZ(-400px) rotateY(${s * 90}deg) scale(0.6)`, opacity: 0, zIndex: 0, pointerEvents: 'none' }
}

export function GalleryView({ urls, style }: GalleryViewProps) {
  const [lb, setLb] = useState<number | null>(null)
  const [current, setCurrent] = useState(0)
  // Hướng trượt gần nhất (+1 = sang ảnh sau, -1 = ảnh trước) và cờ "đã trượt xong"
  const [dir, setDir] = useState<1 | -1>(1)
  const [settled, setSettled] = useState(true)
  const n = urls.length

  const open = (i: number) => setLb(i)
  const close = () => setLb(null)
  const lbPrev = () => setLb(i => i !== null ? (i - 1 + n) % n : null)
  const lbNext = () => setLb(i => i !== null ? (i + 1) % n : null)

  const goTo = useCallback((target: number, d: 1 | -1) => {
    setDir(d)
    setSettled(false)
    setCurrent(((target % n) + n) % n)
  }, [n])
  const prev = useCallback(() => goTo(current - 1, -1), [goTo, current])
  const next = useCallback(() => goTo(current + 1, 1), [goTo, current])

  // Sau khi trượt xong (0,6s) mới đưa ảnh ẩn sang mép sẽ xuất hiện tiếp theo (không hiệu ứng)
  useEffect(() => {
    if (settled) return
    const t = setTimeout(() => setSettled(true), 1150) // = thời gian trượt 1,1s + đệm
    return () => clearTimeout(t)
  }, [settled, current])

  // Drag/swipe với velocity detection (hooks phải gọi trước mọi return sớm)
  const dragX = useRef(0)
  const dragTime = useRef(0)

  // Carousel tự chuyển — copy nhịp chungdoi.com: trượt 1,1s + nghỉ 0,3s → mỗi 1,4 giây một ảnh.
  // Tạm dừng khi rê chuột / chạm giữ / đang xem ảnh lớn. Phụ thuộc `current` nên mỗi lần
  // người xem tự chuyển ảnh, bộ đếm được tính lại từ đầu.
  const AUTOPLAY_MS = 1400
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (style !== '3d' || n <= 1 || paused || lb !== null) return
    const timer = setTimeout(next, AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [style, n, paused, lb, current, next])

  if (!n) return null

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setPaused(true)
    dragX.current = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragTime.current = Date.now()
  }
  const onDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if ('changedTouches' in e) setPaused(false) // cảm ứng không có mouseleave
    const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const diff = dragX.current - endX
    const elapsed = Date.now() - dragTime.current
    const velocity = Math.abs(diff) / elapsed // px/ms
    // Swipe nếu kéo > 30px hoặc velocity > 0.3px/ms
    if (Math.abs(diff) > 30 || velocity > 0.3) {
      if (diff > 0) next()
      else prev()
    }
  }

  return (
    <>
      <style>{CSS}</style>

      {/* ── GRID ── */}
      {(style === 'grid' || !style) && (
        <div className="g-featured" style={{
          gridTemplateColumns: n === 1 ? '1fr' : n === 2 ? '1fr 1fr' : '2fr 1fr',
          gridTemplateRows: n >= 3 ? '1fr 1fr' : '1fr',
        }}>
          {(n <= 4 ? urls : urls.slice(0, 3)).map((url, i) => (
            <div key={i} className="g-item" style={{ height: n === 1 ? 300 : 160, gridRow: i === 0 && n >= 3 ? 'span 2' : undefined }}
              onClick={() => open(i)}>
              <img {...tile(url)} alt={`Ảnh ${i+1}`} decoding="async" />
            </div>
          ))}
          {n > 4 && (
            <div className="g-item" style={{ height: 160 }} onClick={() => open(3)}>
              <img {...tile(urls[3])} alt="more" decoding="async" />
              <div className="g-more-overlay">+{n - 3} ảnh</div>
            </div>
          )}
        </div>
      )}

      {/* ── MASONRY ── */}
      {style === 'mosaic' && (
        <div className="g-masonry">
          {urls.map((url, i) => (
            <div key={i} className="g-item" onClick={() => open(i)}>
              <img {...tile(url)} alt={`Ảnh ${i+1}`} decoding="async" />
            </div>
          ))}
        </div>
      )}

      {/* ── CAROUSEL 3D ── */}
      {style === '3d' && (
        <div className="g-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div
            className="g-carousel-track"
            onMouseDown={onDragStart}
            onMouseUp={onDragEnd}
            onTouchStart={onDragStart}
            onTouchEnd={onDragEnd}
          >
            {urls.map((url, i) => {
              let offset = i - current
              // Normalize to range [-n/2, n/2]
              if (offset > n / 2) offset -= n
              if (offset < -n / 2) offset += n
              const visible = Math.abs(offset) <= 2
              // Ảnh ẩn: lúc đang trượt thì ra phía ngược hướng (trượt ra ngoài);
              // khi đã xong thì đỗ sẵn ở phía sẽ đi vào lượt kế tiếp, nhảy tức thì (đang ẩn nên không thấy).
              const hiddenLeft = settled ? dir < 0 : dir > 0
              const pos = visible ? offset : hiddenLeft ? -3 : 3
              const instant = !visible && settled
              return (
                <div
                  key={i}
                  className={`g-carousel-item${offset === 0 ? ' is-center' : ''}`}
                  style={{ ...coverflowStyle(pos), ...(instant ? { transition: 'none' } : null) }}
                  onClick={() => offset === 0 ? open(i) : (offset < 0 ? prev() : next())}
                >
                  <img {...tile(url)} alt={`Ảnh ${i+1}`} decoding="async" />
                </div>
              )
            })}
          </div>

          {/* Nav buttons */}
          {n > 1 && (
            <>
              <button className="g-carousel-btn prev" onClick={prev}>‹</button>
              <button className="g-carousel-btn next" onClick={next}>›</button>
            </>
          )}

          {/* Dots */}
          <div className="g-carousel-dots">
            {urls.map((_, i) => (
              <button key={i} className={`g-carousel-dot ${i === current ? 'active' : ''}`}
                onClick={() => i !== current && goTo(i, i > current ? 1 : -1)} />
            ))}
          </div>

          {/* Counter */}
          <p className="g-carousel-counter">{current + 1} / {n}</p>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lb !== null && (
        <div className="lb" onClick={close}>
          <button className="lb-nav" style={{ left: 12 }} onClick={e => { e.stopPropagation(); lbPrev() }}>‹</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lb-img" {...responsiveImg(urls[lb], [1080, 1920, 2048], 90)} sizes="94vw" alt={`Ảnh ${lb+1}`} onClick={e => e.stopPropagation()} />
          <button className="lb-nav" style={{ right: 12 }} onClick={e => { e.stopPropagation(); lbNext() }}>›</button>
          <button className="lb-close" onClick={close}>✕</button>
          <p className="lb-counter">{lb + 1} / {n}</p>
          <div className="lb-dots">
            {urls.map((_, i) => (
              <div key={i} className={`lb-dot ${i === lb ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); setLb(i) }} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
