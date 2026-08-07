'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import ResultDisplay from '@/components/ResultDisplay'
import { useAuth } from '@/contexts/AuthContext'

export default function ResultPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [result, setResult] = useState(null)
  const [serviceType, setServiceType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    async function fetchResult() {
      try {
        const res = await fetch(`/api/kanshier?id=${id}`)
        const data = await res.json()

        if (!res.ok) {
          router.push('/')
          return
        }

        setResult(data.result)
        setServiceType(data.reading?.service_type || 'kanshier')
      } catch {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id, router, authLoading, user])

  if (loading) {
    return (
      <>
        <Header />
        <Loading />
      </>
    )
  }

  if (!result) return null

  const serviceLabels = { kanshier: '看事儿', letter: '写给明年' }
  const nextLabels = { letter: '再写一封' }

  return (
    <>
      <Header />
      <PageNav
        title={(serviceLabels[serviceType] || '看事儿') + ' · 结果'}
        onBack={() => router.push('/')}
      />

      <ResultDisplay result={result} />

      <div className="flex gap-2 pb-8">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: '玄机·看事儿',
                text: `我刚刚问了一事，得了「${result.gua_name}」${result.judgment}`,
                url: window.location.href
              }).catch(() => {})
            } else {
              navigator.clipboard?.writeText(`玄机·看事儿：${result.gua_name}，${result.judgment}`)
              alert('已复制到剪贴板')
            }
          }}
        >
          📤 分享
        </Button>
        <Button
          variant="gold"
          fullWidth
          onClick={() => {
            const paths = { letter: '/letter' }
            router.push(paths[serviceType] || '/kanshier')
          }}
        >
          {(nextLabels[serviceType] || '再问一事')}
        </Button>
      </div>

      <div className="text-center pb-6 font-serif" style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 1 }}>
        心诚则灵
      </div>
    </>
  )
}
