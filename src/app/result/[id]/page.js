'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ResultDisplay from '@/components/ResultDisplay'
import { getUser } from '@/lib/utils'

export default function ResultPage() {
  const { id } = useParams()
  const router = useRouter()
  const [result, setResult] = useState(null)
  const [serviceType, setServiceType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResult() {
      try {
        const user = getUser()
        if (!user) { router.push('/login'); return }

        const res = await fetch(`/api/kanshier?id=${id}&user_id=${user.id}`)
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
  }, [id, router])

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}> loading...</div>
        </div>
      </>
    )
  }

  if (!result) return null

  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-2" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.push('/')} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
          {({ kanshier: '看事儿', bazi: '八字精批', taohua: '测桃花', xingming: '姓名·起名', letter: '写给明年' })[serviceType] || '看事儿'} · 结果
        </span>
      </div>

      <ResultDisplay result={result} />

      <div className="flex gap-2 pb-8">
        <button
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
          className="flex-1 rounded-xl py-3 text-xs border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          📤 分享
        </button>
        <button
          onClick={() => {
            const paths = { bazi: '/bazi', taohua: '/taohua', xingming: '/xingming', letter: '/letter' }
            router.push(paths[serviceType] || '/kanshier')
          }}
          className="flex-1 rounded-xl py-3 text-xs font-semibold text-white"
          style={{ background: 'var(--gold-primary)' }}
        >
          {({ bazi: '再批一命', taohua: '再测桃花', xingming: '继续测算', letter: '再写一封' })[serviceType] || '再问一事'}
        </button>
      </div>

      <div className="text-center pb-6" style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 1 }}>
        心诚则灵
      </div>
    </>
  )
}
