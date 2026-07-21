'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Loading from '@/components/ui/Loading'
import { getUser } from '@/lib/utils'
import { createCanvasState, renderAllStrokes } from '@/lib/manifest/brush'

export default function ManifestEntryPage() {
  const { date } = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('loading')
  const [hiddenText, setHiddenText] = useState('')

  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const animRef = useRef(null)
  const longPressRef = useRef(null)
  const stateRef = useRef(null)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    if (!u) router.push('/login')
  }, [router])

  useEffect(() => {
    if (!user) return
    fetch(`/api/manifest?user_id=${user.id}&year=${date?.slice(0, 4)}`)
      .then(r => r.json())
      .then(data => {
        const found = (data.entries || []).find(e => e.date === date)
        if (!found) { router.push('/manifest'); return }
        setEntry(found)
        setHiddenText(found.hidden_message || '')
        setLoading(false)
      })
      .catch(() => router.push('/manifest'))
  }, [user, date, router])

  // 回放
  useEffect(() => {
    if (loading || !entry || !canvasRef.current || !wrapRef.current) return

    const w = wrapRef.current.clientWidth
    const h = wrapRef.current.clientHeight
    const state = createCanvasState(canvasRef.current, w, h)
    stateRef.current = state

    const strokeData = typeof entry.stroke_data === 'string' ? JSON.parse(entry.stroke_data) : entry.stroke_data
    const strokes = strokeData.strokes || (strokeData.points ? [strokeData] : [])
    if (strokes.length === 0) { setPhase('idle'); return }

    let totalDuration = 0
    for (const s of strokes) {
      if (s.points.length > 0) totalDuration = Math.max(totalDuration, s.points[s.points.length - 1].t)
    }
    if (totalDuration < 100) totalDuration = 2000

    setPhase('replaying')
    const start = performance.now()
    let running = true

    function frame() {
      if (!running) return
      const elapsed = performance.now() - start
      const p = Math.min(1, elapsed / totalDuration)
      state.ctx.clearRect(0, 0, w, h)
      renderAllStrokes(state.ctx, strokeData, p)
      if (p < 1) animRef.current = requestAnimationFrame(frame)
      else setPhase('idle')
    }

    animRef.current = requestAnimationFrame(frame)
    return () => { running = false; if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [loading, entry])

  const redraw = useCallback(() => {
    if (!entry || !stateRef.current) return
    const s = stateRef.current
    const strokeData = typeof entry.stroke_data === 'string' ? JSON.parse(entry.stroke_data) : entry.stroke_data
    s.ctx.clearRect(0, 0, s.width, s.height)
    renderAllStrokes(s.ctx, strokeData, 1)
  }, [entry])

  const dissolve = useCallback(() => {
    if (!stateRef.current || !hiddenText) return
    const { ctx, width, height, dpr } = stateRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = ctx.getImageData(0, 0, width * dpr, height * dpr)
    const orig = new Uint8ClampedArray(imageData.data)
    const duration = 1500
    const start = performance.now()
    let running = true

    function frame() {
      if (!running) return
      const elapsed = performance.now() - start
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 2)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const alpha = orig[i + 3]
        if (alpha === 0) continue
        data[i + 3] = Math.max(0, alpha * (1 - eased))
      }

      ctx.putImageData(imageData, 0, 0)
      if (t >= 1) setPhase('revealed')
      else animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)
    return () => { running = false }
  }, [hiddenText])

  const handleDown = useCallback(() => {
    if (phase !== 'idle' || !hiddenText) return
    longPressRef.current = setTimeout(() => {
      setPhase('dissolving')
      dissolve()
    }, 800)
  }, [phase, hiddenText, dissolve])

  const handleUp = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
    longPressRef.current = null

    if (phase === 'dissolving' || phase === 'revealed') {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      redraw()
      setPhase('idle')
    }
  }, [phase, redraw])

  return (
    <>
      <Header />
      <PageNav title={`${date} · 著`} onBack={() => router.push('/manifest')} />

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
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-serif" style={{ color: 'var(--text-secondary)' }}>
            加载中...
          </div>
        )}

        {phase === 'replaying' && (
          <div
            className="absolute bottom-5 left-1/2 font-serif tracking-wider"
            style={{ fontSize: 11, color: 'var(--text-muted)', transform: 'translateX(-50%)' }}
          >
            重现中...
          </div>
        )}

        {phase === 'idle' && (
          <div
            className="absolute bottom-5 left-1/2 font-serif tracking-wider"
            style={{ fontSize: 11, color: 'var(--text-muted)', transform: 'translateX(-50%)', animation: 'pulse 2s ease-in-out infinite' }}
          >
            {hiddenText ? '长按读取藏话' : date}
          </div>
        )}

        {phase === 'dissolving' && (
          <div
            className="absolute bottom-5 left-1/2 font-serif tracking-wider"
            style={{ fontSize: 11, color: 'var(--text-muted)', transform: 'translateX(-50%)' }}
          >
            墨迹散开...
          </div>
        )}

        {phase === 'revealed' && hiddenText && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: 32, zIndex: 2, pointerEvents: 'none' }}
          >
            <p className="font-serif" style={{ fontSize: 16, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.8, letterSpacing: 1 }}>
              {hiddenText}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
