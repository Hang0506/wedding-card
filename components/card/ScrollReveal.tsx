'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right' | 'fade'
  delay?: number // ms
  className?: string
  style?: React.CSSProperties
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect() // chỉ animate 1 lần
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const transforms: Record<string, string> = {
    up:    'translateY(40px)',
    left:  'translateX(-50px)',
    right: 'translateX(50px)',
    fade:  'scale(0.95)',
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : transforms[direction],
        // Reveal: trung bình giữa bản cũ 0.65s và bản chậm 1.4s → ~1s
        transition: `opacity 1s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 1s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
