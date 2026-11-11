'use client'

interface MiniCalendarProps {
  dateStr: string // YYYY-MM-DD
}

const VI_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
const VI_DAYS = ['T2','T3','T4','T5','T6','T7','CN']

export function MiniCalendar({ dateStr }: MiniCalendarProps) {
  const target = new Date(dateStr + 'T00:00:00')
  const year = target.getFullYear()
  const month = target.getMonth()
  const day = target.getDate()

  // First day of month (0=Sun..6=Sat → convert to Mon-based)
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build grid
  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{
      background: 'linear-gradient(135deg,#fffaf7,#fef5ee)',
      border: '1px solid rgba(201,169,110,.2)',
      borderRadius: 16,
      padding: '16px 14px',
      marginTop: 16,
    }}>
      {/* Month/Year header */}
      <p style={{
        textAlign: 'center',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 16,
        color: '#9c1647',
        margin: '0 0 12px',
        fontWeight: 600,
      }}>
        {VI_MONTHS[month]} / {year}
      </p>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
        {VI_DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: '#b09080', letterSpacing: 0.5,
            fontFamily: "'Montserrat', sans-serif",
          }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            padding: '5px 2px',
            fontSize: 13,
            fontFamily: "'Mali', sans-serif",
            fontWeight: d === day ? 700 : 400,
            color: d === day ? '#fff' : d ? '#5d3a28' : 'transparent',
            background: d === day
              ? 'linear-gradient(135deg,#9c1647,#c2185b)'
              : 'transparent',
            borderRadius: d === day ? '50%' : 0,
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
            boxShadow: d === day ? '0 2px 8px rgba(156,22,71,.3)' : 'none',
            position: 'relative',
          }}>
            {d || ''}
            {/* Heart on wedding day */}
            {d === day && (
              <span style={{
                position: 'absolute', top: -6, right: -4,
                fontSize: 8, lineHeight: 1,
              }}>💗</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
