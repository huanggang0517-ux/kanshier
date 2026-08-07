'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageNav from '@/components/ui/PageNav'
import Loading from '@/components/ui/Loading'
import { useAuth } from '@/contexts/AuthContext'

export default function ClassroomPage({ params }) {
  const { id: classroomId } = params
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [openmaicUrl, setOpenmaicUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    async function init() {
      try {
        const res = await fetch('/api/zhihuisuke/server')
        if (!res.ok) throw new Error('服务未配置')
        const data = await res.json()
        setOpenmaicUrl(data.baseUrl)
      } catch {
        setError('智慧速课服务暂未配置')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [authLoading, user, router])

  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const tryFullscreen = () => {
    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#000' }}>
        <Loading text="加载课堂中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#000' }}>
        <p className="text-sm font-serif" style={{ color: 'var(--color-error)' }}>{error}</p>
      </div>
    )
  }

  const iframeSrc = `${openmaicUrl}/classroom/${classroomId}`

  return (
    <>
      {isPortrait && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
          style={{ background: '#0a0a0a' }}
        >
          <svg className="w-16 h-16 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="#d4a853" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p className="text-sm font-serif" style={{ color: 'var(--text-muted)' }}>
            请将设备横屏使用
          </p>
          <button
            onClick={tryFullscreen}
            className="text-xs font-serif px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            全屏
          </button>
        </div>
      )}
      <div
        className="fixed inset-0"
        style={{ background: '#000', top: isPortrait ? 'auto' : 0 }}
      >
        <iframe
          src={iframeSrc}
          className="w-full h-full"
          allow="microphone *"
          style={{ border: 'none' }}
          title="智慧课堂"
        />
      </div>
    </>
  )
}
