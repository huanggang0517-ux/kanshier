'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { createCanvasState, startStroke, moveStroke, endStroke } from '@/lib/manifest/brush'

function WriteCanvas() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const { user, loading: authLoading } = useAuth()
  const [phase, setPhase] = useState('loading')
  const [entryId, setEntryId] = useState(null)
  const [hiddenMsg, setHiddenMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mood, setMood] = useState(50)
  const [futureDate, setFutureDate] = useState(false)

  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  // 检查该日期是否已有著定
  useEffect(() => {
    if (authLoading || !user) return

    // 未来日期不可写
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      setFutureDate(true)
      setPhase('alreadyLocked')
      return
    }

    fetch(`/api/manifest?year=${date.slice(0, 4)}`)
      .then(r => r.json())
      .then(data => {
        const found = (data.entries || []).find(e => e.date === date)
        if (found?.is_locked) {
          setPhase('alreadyLocked')
        } else {
          setPhase('writing')
          setTimeout(() => {
            if (!canvasRef.current || !wrapRef.current) return
            const w = wrapRef.current.clientWidth
            const h = wrapRef.current.clientHeight
            stateRef.current = createCanvasState(canvasRef.current, w, h)
          }, 50)
        }
      })
      .catch(() => setPhase('writing'))
  }, [authLoading, user, date])

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0, p: 0.5 }
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top
    return { x, y, p: Math.max(0.05, Math.min(1, e.pressure || 0.5)) }
  }, [])

  const handleDown = useCallback((e) => {
    if (phase !== 'writing') return
    e.preventDefault()
    const { x, y, p } = getPos(e)
    const state = stateRef.current
    if (!state) return
    stateRef.current = startStroke(state, x, y, p)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }, [phase, getPos])

  const handleMove = useCallback((e) => {
    if (phase !== 'writing') return
    e.preventDefault()
    const { x, y, p } = getPos(e)
    const s = stateRef.current
    if (!s?.currentStroke) return
    stateRef.current = moveStroke(s, x, y, p)
  }, [phase, getPos])

  const handleUp = useCallback((e) => {
    if (phase !== 'writing') return
    e.preventDefault()
    const s = stateRef.current
    if (!s) return
    stateRef.current = endStroke(s)
  }, [phase])

  const handleClear = useCallback(() => {
    const s = stateRef.current
    if (!s) return
    s.ctx.clearRect(0, 0, s.width, s.height)
    s.strokes = []
    s.currentStroke = null
  }, [])

  const handleSave = useCallback(async () => {
    const s = stateRef.current
    if (!s || s.strokes.length === 0) return
    setSaving(true)
    setError('')

    const strokeData = {
      version: 1,
      width: s.width,
      height: s.height,
      strokes: s.strokes.map(st => ({
        points: st.points.map(p => ({ x: Math.round(p.x), y: Math.round(p.y), p: Math.round(p.p * 100) / 100, t: Math.round(p.t) }))
      }))
    }

    try {
      const res = await fetch('/api/manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, strokeData, mood })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEntryId(data.entry.id)

      await fetch('/api/manifest', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: data.entry.id, lock: true, mood })
      })

      if (navigator.vibrate) navigator.vibrate(200)
      setPhase('locked')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [user, date])

  const goToGrid = useCallback(() => {
    router.replace('/manifest')
  }, [router])

  const handleSaveHidden = useCallback(async () => {
    if (!entryId) return
    try {
      await fetch('/api/manifest', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, hiddenMessage: hiddenMsg, mood })
      })
    } catch {}
    goToGrid()
  }, [entryId, hiddenMsg, goToGrid])

  if (phase === 'loading') {
    return <><Header /><div className="text-center py-16 text-sm font-serif" style={{ color: 'var(--text-secondary)' }}>加载中...</div></>
  }

  if (phase === 'alreadyLocked') {
    return (
      <>
        <Header />
        <PageNav title={date} onBack={() => router.push('/manifest')} />
        <div className="text-center py-16">
          <p className="text-sm font-serif tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {futureDate ? '未来之日 · 尚待机缘' : '该日已著定 · 一字不改'}
          </p>
          {futureDate ? (
            <Button onClick={() => router.push('/manifest')} className="mt-4">返回</Button>
          ) : (
            <Button onClick={() => router.push(`/manifest/entry/${date}`)} className="mt-4">查看</Button>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <PageNav title={`著字 · ${date}`} onBack={() => router.push('/manifest')} />

      <div
        ref={wrapRef}
        style={{
          width: '100%',
          height: 'calc(100dvh - 160px)',
          background: 'var(--parchment-light)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {phase === 'writing' && (
        <>
          <div className="flex gap-3 mt-3">
            <Button variant="outline" fullWidth onClick={handleClear}>清空</Button>
            <Button variant="gold" fullWidth onClick={() => {
              if (stateRef.current?.strokes.length === 0) { setError('请先写一个字'); return }
              setError(''); setPhase('confirming')
            }}>著定</Button>
          </div>
          {error && <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>{error}</p>}
        </>
      )}

      {phase === 'confirming' && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'var(--bg-overlay)', zIndex: 'var(--z-modal)' }}
          onClick={() => { setPhase('writing'); setError('') }}
        >
          <div onClick={e => e.stopPropagation()} className="text-center" style={{ padding: 40, maxWidth: 360 }}>
            <h2 className="font-serif" style={{ fontSize: 36, color: '#fff', letterSpacing: 8, fontWeight: 400, marginBottom: 8 }}>
              著定？
            </h2>
            <p className="font-serif text-xs tracking-wider" style={{ color: '#aaa', marginBottom: 32 }}>
              一字落定 · 终生不改
            </p>
            {error && <p style={{ fontSize: 12, color: '#e88', marginBottom: 16 }}>{error}</p>}
            <div className="flex gap-4 justify-center">
              <button onClick={() => { setPhase('writing'); setError('') }}
                className="px-8 py-2.5 text-sm cursor-pointer"
                style={{ background: 'none', border: '1px solid #555', color: '#aaa', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', letterSpacing: 4 }}>
                再想想
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-8 py-2.5 text-sm cursor-pointer disabled:opacity-50"
                style={{ background: saving ? '#666' : 'var(--gold)', border: 'none', color: '#fff', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', letterSpacing: 4 }}>
                {saving ? '保存中...' : '定'}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'locked' && (
        <Card variant="parchment" elevation="sm" decorations={{ corners: false, innerBorder: false }} className="mt-3">
          <div className="text-center mb-3">
            <span className="text-xs font-serif tracking-wider" style={{ color: 'var(--text-secondary)' }}>已著定 · 落子无悔</span>
          </div>

          {/* 情绪选择 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] tracking-wider font-serif" style={{ color: 'var(--text-muted)' }}>今日心境</span>
              <span className="text-xs font-serif" style={{ color: 'var(--ink)' }}>{mood}%</span>
            </div>
            <div className="relative h-6 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={e => setMood(Number(e.target.value))}
                className="w-full appearance-none h-1 rounded-full cursor-pointer outline-none"
                style={{
                  background: `linear-gradient(to right, #5B8DEC 0%, var(--gold) ${mood}%, var(--border-color) ${mood}%)`,
                  height: 4,
                  borderRadius: 2,
                  transition: 'background 0.15s ease',
                }}
              />
              <style>{`
                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: var(--parchment-light);
                  border: 2px solid var(--gold);
                  cursor: pointer;
                  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                }
              `}</style>
            </div>
            <div className="flex justify-between text-[10px] mt-1 px-0.5" style={{ opacity: 0.6 }}>
              <span className="font-serif" style={{ color: '#5B8DEC' }}>不悦</span>
              <span className="font-serif" style={{ color: 'var(--ink-muted)' }}>平和</span>
              <span className="font-serif" style={{ color: 'var(--gold)' }}>极佳</span>
            </div>
          </div>

          <textarea
            placeholder="藏一句话在此字背后...（选填）"
            value={hiddenMsg}
            onChange={e => setHiddenMsg(e.target.value.slice(0, 140))}
            rows={3}
            className="w-full resize-none leading-relaxed"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '12px 16px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
            maxLength={140}
          />
          <div className="text-right text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hiddenMsg.length}/140</div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" fullWidth onClick={goToGrid}>跳过</Button>
            <Button variant="gold" fullWidth onClick={handleSaveHidden}>封存</Button>
          </div>
        </Card>
      )}
    </>
  )
}

export default function ManifestWritePage() {
  return (
    <Suspense fallback={
      <><Header /><div className="text-center py-16 text-sm font-serif" style={{ color: 'var(--text-secondary)' }}>加载中...</div></>
    }>
      <WriteCanvas />
    </Suspense>
  )
}
