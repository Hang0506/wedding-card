'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function calcTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null
  const s = Math.floor(diff / 1000)
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

export function Countdown({ targetDate }: CountdownProps) {
  // Start null to avoid SSR/client mismatch — only calculate after hydration
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const tick = () => setTimeLeft(calcTimeLeft(targetDate))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  // Before mount: show placeholder to match server HTML (avoids mismatch)
  if (!mounted) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <p style={{ fontSize: 13, color: '#c2185b', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px', opacity: .7 }}>
          Đếm ngược đến ngày trọng đại
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {['Ngày','Giờ','Phút','Giây'].map((label) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                width: 60, height: 60, borderRadius: 14,
                background: 'linear-gradient(135deg,#fce4ec,#f8bbd9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(194,24,91,.12)',
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#c2185b', fontFamily: 'Cormorant Garamond,serif' }}>
                  --
                </span>
              </div>
              <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, display: 'block' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (timeLeft === null) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <p style={{ fontSize: 20, color: '#c2185b', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>
          Chúc mừng ngày cưới! 💕
        </p>
      </div>
    )
  }

  const units = [
    { value: timeLeft.days,    label: 'Ngày' },
    { value: timeLeft.hours,   label: 'Giờ' },
    { value: timeLeft.minutes, label: 'Phút' },
    { value: timeLeft.seconds, label: 'Giây' },
  ]

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <p style={{ fontSize: 11, color: '#c2185b', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px', opacity: .7, fontFamily: 'Montserrat,sans-serif' }}>
        Đếm ngược đến ngày trọng đại
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {units.map(({ value, label }, idx) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 62, height: 62, borderRadius: 14,
                background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(194,24,91,.15)',
              }}>
                <span style={{
                  fontSize: 24, fontWeight: 700, color: '#9c1647',
                  fontFamily: "'Mali', Georgia, serif",
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {pad(value)}
                </span>
              </div>
              <span style={{ fontSize: 10, color: '#b08090', marginTop: 5, display: 'block', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Montserrat,sans-serif' }}>
                {label}
              </span>
            </div>
            {idx < units.length - 1 && (
              <span style={{ fontSize: 20, fontWeight: 700, color: '#e0b0c0', paddingBottom: 18, lineHeight: 1 }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
