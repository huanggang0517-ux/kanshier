'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Loading from '@/components/ui/Loading'
import { getUser } from '@/lib/utils'

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getMonthStartDay(year, month) {
  return new Date(year, month, 1).getDay()
}

function moodColor(value) {
  if (value == null) return 'var(--text-muted)'
  const t = value / 100
  const r = Math.round(60 + (230 - 60) * t)
  const g = Math.round(120 + (60 - 120) * t)
  const b = Math.round(235 + (60 - 235) * t)
  return `rgb(${r},${g},${b})`
}

function moodBg(value) {
  if (value == null) return 'var(--bg-elevated)'
  const t = value / 100
  const r = 60 + Math.round((230 - 60) * t)
  const g = 120 + Math.round((60 - 120) * t)
  const b = 235 + Math.round((60 - 235) * t)
  return `rgba(${r},${g},${b},0.18)`
}

// 缩略图渲染 — 在 canvas 上重绘笔迹
function Thumbnail({ strokeData }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const data = typeof strokeData === 'string' ? JSON.parse(strokeData) : strokeData
    const strokes = data.strokes || (data.points ? [data] : [])
    if (!strokes.length) return

    const w = canvas.clientWidth || 60
    const h = canvas.clientHeight || 60
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const sW = data.width || 1080
    const sH = data.height || 1920
    const scale = Math.min(w / sW, h / sH) * 0.85
    const ox = (w - sW * scale) / 2
    const oy = (h - sH * scale) / 2

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for (const stroke of strokes) {
      const pts = stroke.points
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1]
        const p1 = pts[i]
        const speed = (p1.t - p0.t) > 0 ? Math.hypot(p1.x - p0.x, p1.y - p0.y) / (p1.t - p0.t) : 0
        const alpha = Math.max(0.3, Math.min(1, 0.5 / (speed + 0.05)))
        const width = Math.max(0.5, (p1.p * 6 * Math.max(0.2, 1 - speed * 3)) * scale)

        ctx.beginPath()
        ctx.moveTo(p0.x * scale + ox, p0.y * scale + oy)
        ctx.lineTo(p1.x * scale + ox, p1.y * scale + oy)
        ctx.strokeStyle = `rgba(30, 30, 30, ${alpha})`
        ctx.lineWidth = width
        ctx.stroke()
      }
    }
  }, [strokeData])

  return <canvas ref={ref} style={{ width: '100%', height: '100%' }} />
}

// 迷你月视图 — 用于总览
function MiniMonth({ year, month, entries, today, onClick, onDateClick }) {
  const days = getDaysInMonth(year, month)
  const startDay = getMonthStartDay(year, month)
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const filledCount = Array.from({ length: days }, (_, i) => {
    const date = `${monthKey}-${String(i + 1).padStart(2, '0')}`
    return entries[date] ? 1 : 0
  }).reduce((a, b) => a + b, 0)

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '6px 4px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
      }}
    >
      <div className="font-serif text-center mb-1" style={{ fontSize: 11, color: 'var(--text-primary)', letterSpacing: 1 }}>
        {MONTHS[month]}
        {filledCount > 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: 9, marginLeft: 4 }}>{filledCount}</span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {Array.from({ length: startDay }, (_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const date = `${monthKey}-${String(i + 1).padStart(2, '0')}`
          const entry = entries[date]
          const isFuture = date > today
          const disabled = isFuture && !entry
          return (
            <div
              key={date}
              onClick={(e) => {
                e.stopPropagation()
                if (disabled) return
                onDateClick(date, !!entry)
              }}
              style={{
                aspectRatio: '1',
                borderRadius: '50%',
                cursor: disabled ? 'default' : 'pointer',
                background: entry
                  ? moodColor(entry.mood)
                  : 'transparent',
                opacity: entry ? 1 : 0.12,
                border: entry ? '1px solid ' + moodColor(entry.mood) : '1px solid var(--text-muted)',
                boxShadow: entry ? '0 0 3px ' + moodColor(entry.mood).replace('rgb', 'rgba').replace(')', ',0.4)') : 'none',
              }}
            />
          )
        })}
      </div>
      {filledCount > 0 && (
        <div style={{ display: 'flex', gap: 1, marginTop: 3 }}>
          {Array.from({ length: days }, (_, i) => {
            const date = `${monthKey}-${String(i + 1).padStart(2, '0')}`
            const entry = entries[date]
            return entry ? (
              <div
                key={date}
                style={{
                  flex: 1,
                  height: 2,
                  borderRadius: 1,
                  background: moodColor(entry.mood),
                  opacity: 0.6,
                }}
              />
            ) : null
          })}
        </div>
      )}
    </div>
  )
}

export default function ManifestGridPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState('')
  const [expandedMonth, setExpandedMonth] = useState(null)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    if (!u) router.replace('/login')
  }, [router])

  const loadYear = useCallback((y) => {
    if (!user) return
    setLoading(true)
    setYear(y)
    setErrMsg('')
    setExpandedMonth(null)
    fetch(`/api/manifest?user_id=${user.id}&year=${y}`)
      .then(r => r.json().then(body => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) { setErrMsg(body.error || '请求失败'); setLoading(false); return }
        const map = {}
        for (const e of body.entries || []) map[e.date] = e
        setEntries(map)
        setLoading(false)
      })
      .catch((e) => { setErrMsg(e.message); setLoading(false) })
  }, [user])

  const pathname = usePathname()

  useEffect(() => {
    loadYear(year)
  }, [user, year, loadYear, pathname])

  const today = new Date().toISOString().split('T')[0]

  // 展开某个月
  const monthView = (month) => {
    if (expandedMonth !== null) {
      const days = getDaysInMonth(year, expandedMonth)
      const startDay = getMonthStartDay(year, expandedMonth)
      const monthKey = `${year}-${String(expandedMonth + 1).padStart(2, '0')}`
      return (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setExpandedMonth(null)}
              className="text-xs font-serif transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              ← 总览
            </button>
            <span className="text-sm font-serif" style={{ color: 'var(--text-primary)', letterSpacing: 2 }}>
              {MONTHS[expandedMonth]}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: startDay }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: days }, (_, i) => {
              const date = `${monthKey}-${String(i + 1).padStart(2, '0')}`
              const entry = entries[date]
              const isToday = date === today
              const isFuture = date > today
              const disabled = isFuture && !entry
              return (
                <div
                  key={date}
                  onClick={() => {
                    if (disabled) return
                    router.push(entry ? `/manifest/entry/${date}` : `/manifest/write?date=${date}`)
                  }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: disabled ? 'default' : 'pointer',
                    overflow: 'hidden',
                    background: entry ? moodBg(entry.mood) : 'transparent',
                    border: isToday
                      ? '1px solid var(--color-primary)'
                      : entry
                        ? '1px solid var(--border-color)'
                        : '1px dashed var(--border-color)',
                    opacity: disabled ? 0.35 : 1,
                    minHeight: 0,
                    transition: 'all var(--duration-fast) var(--ease-in-out)',
                  }}
                  onMouseEnter={e => {
                    if (disabled) return
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                    e.currentTarget.style.opacity = 0.8
                  }}
                  onMouseLeave={e => {
                    if (disabled) return
                    e.currentTarget.style.borderColor = isToday ? 'var(--color-primary)' : entry ? 'var(--border-color)' : 'var(--border-color)'
                    e.currentTarget.style.opacity = 1
                  }}
                >
                  {entry && <Thumbnail strokeData={entry.stroke_data} />}
                  {entry && entry.mood != null && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: `${entry.mood}%`,
                          height: 3,
                          background: moodColor(entry.mood),
                          borderRadius: '0 2px 2px 0',
                          transition: 'width 0.3s ease',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: 1,
                          right: 2,
                          fontSize: 7,
                          fontWeight: 700,
                          color: moodColor(entry.mood),
                          lineHeight: 1,
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        {entry.mood}
                      </span>
                    </>
                  )}
                  <span style={{ position: 'absolute', bottom: 1, right: 2, fontSize: 6, color: 'var(--text-muted)', lineHeight: 1 }}>
                    {i + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // 总览：4个月一横排
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {Array.from({ length: 12 }, (_, month) => (
          <MiniMonth
            key={month}
            year={year}
            month={month}
            entries={entries}
            today={today}
            onClick={() => setExpandedMonth(month)}
            onDateClick={(date, hasEntry) => router.push(hasEntry ? `/manifest/entry/${date}` : `/manifest/write?date=${date}`)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <Header />
      <PageNav
        title={expandedMonth !== null ? `著 · ${MONTHS[expandedMonth]}` : `著 · ${year}`}
        onBack={() => expandedMonth !== null ? setExpandedMonth(null) : router.push('/')}
        right={
          <div className="flex items-center gap-3">
            <button onClick={() => loadYear(year - 1)} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>‹</button>
            <span className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>{year}</span>
            <button onClick={() => loadYear(year + 1)} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>›</button>
          </div>
        }
      />

      {errMsg && (
        <p className="text-xs text-center mb-2" style={{ color: 'var(--color-error)' }}>{errMsg}</p>
      )}
      {loading ? (
        <Loading text="加载中..." />
      ) : (
        monthView(expandedMonth)
      )}
    </>
  )
}
