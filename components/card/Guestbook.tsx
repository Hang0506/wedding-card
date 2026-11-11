'use client'

import { useState, useEffect, useCallback } from 'react'

interface Entry { id: string; name: string; message: string; createdAt: string }

interface GuestbookProps {
  weddingSlug: string
  guestName: string
}

export function Guestbook({ weddingSlug, guestName }: GuestbookProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [name, setName] = useState(guestName)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadEntries = useCallback(async () => {
    try {
      const r = await fetch(`/api/thiep/${weddingSlug}/guestbook`)
      if (r.ok) setEntries(await r.json())
    } catch { /**/ } finally { setLoading(false) }
  }, [weddingSlug])

  useEffect(() => { loadEntries() }, [loadEntries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) { setError('Vui lòng nhập lời chúc'); return }
    if (!name.trim())    { setError('Vui lòng nhập tên'); return }
    setSubmitting(true); setError('')
    try {
      const r = await fetch(`/api/thiep/${weddingSlug}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      })
      if (!r.ok) throw new Error()
      setMessage(''); setSubmitted(true)
      await loadEntries()
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại')
    } finally { setSubmitting(false) }
  }

  function fmtDate(iso: string) {
    try {
      const d = new Date(iso)
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')} ${d.getDate()}/${d.getMonth()+1}`
    } catch { return '' }
  }

  return (
    <div>
      {submitted ? (
        <div style={{ textAlign:'center', padding:'14px', background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius:12, marginBottom:16, border:'1px solid rgba(34,197,94,.2)' }}>
          <p style={{ color:'#15803d', fontSize:14, margin:0 }}>🎉 Đã gửi lời chúc! Cảm ơn bạn!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom:20 }}>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:11, color:'#c9a96e', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Tên của bạn</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nhập tên..."
              style={{ width:'100%', padding:'10px 12px', border:'1px solid rgba(201,169,110,.3)', borderRadius:10, fontSize:14, background:'#fffaf7', outline:'none', fontFamily:'Montserrat,sans-serif', color:'#3d2b1f' }} />
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:11, color:'#c9a96e', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Lời chúc</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Gửi lời chúc đến cặp đôi..." rows={3}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid rgba(201,169,110,.3)', borderRadius:10, fontSize:14, background:'#fffaf7', outline:'none', resize:'none', fontFamily:'Montserrat,sans-serif', color:'#3d2b1f', lineHeight:1.6 }} />
          </div>
          {error && <p style={{ color:'#dc2626', fontSize:12, margin:'0 0 8px' }}>{error}</p>}
          <button type="submit" disabled={submitting}
            style={{ width:'100%', padding:'11px', background:submitting?'#d1d5db':'linear-gradient(135deg,#9c1647,#c2185b)', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:submitting?'not-allowed':'pointer', letterSpacing:1, fontFamily:'Montserrat,sans-serif' }}>
            {submitting ? 'Đang gửi...' : '💌 Gửi lời chúc'}
          </button>
        </form>
      )}

      {loading && <p style={{ textAlign:'center', color:'#b09080', fontSize:13, padding:'8px 0' }}>Đang tải...</p>}

      {!loading && entries.length === 0 && !submitted && (
        <p style={{ textAlign:'center', color:'#b09080', fontSize:13, fontStyle:'italic', padding:'8px 0' }}>🪄 Hãy là người đầu tiên gửi lời chúc!</p>
      )}

      {entries.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {entries.map(e => (
            <div key={e.id} style={{ background:'#fffaf7', border:'1px solid rgba(201,169,110,.15)', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <p style={{ fontWeight:600, fontSize:13, color:'#9c1647', margin:0 }}>{e.name}</p>
                <p style={{ fontSize:10, color:'#b09080', margin:0 }}>{fmtDate(e.createdAt)}</p>
              </div>
              <p style={{ fontSize:13, color:'#5d3a28', lineHeight:1.6, margin:0, fontStyle:'italic' }}>"{e.message}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
