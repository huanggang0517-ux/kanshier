'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Loading from '@/components/ui/Loading'
import { getUser } from '@/lib/utils'

export default function ClassroomPage({ params }) {
  const { id: classroomId } = params
  const router = useRouter()
  const [openmaicUrl, setOpenmaicUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const u = getUser()
    if (!u) {
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
  }, [router])

  if (loading) {
    return (
      <>
        <Header />
        <PageNav title="智慧课堂" onBack={() => router.push('/zhihuisuke')} />
        <Loading text="加载课堂中..." />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <PageNav title="智慧课堂" onBack={() => router.push('/zhihuisuke')} />
        <div className="text-center py-16">
          <p className="text-sm font-serif" style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      </>
    )
  }

  const iframeSrc = `${openmaicUrl}/classroom/${classroomId}`

  return (
    <>
      <PageNav title="智慧课堂" onBack={() => router.push('/zhihuisuke')} />
      <div
        className="w-full border rounded-lg overflow-hidden"
        style={{
          borderColor: 'var(--border-color)',
          height: 'calc(100vh - 100px)',
        }}
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
