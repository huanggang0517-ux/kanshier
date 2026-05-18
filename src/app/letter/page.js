'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function LetterPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [futureDate, setFutureDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const u = getUser()
    if (!u) router.push('/login')
    else setUser(u)
  }, [router])

  async function handleSubmit() {
    if (!user) { router.push('/login'); return }
    if (!content.trim()) { setError('请写一封信'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, content: content.trim(), futureDate })
      })
      const data = await res.json()
      if (!res.ok) { if (res.status === 403) { router.push('/vip'); return }; setError(data.error); return }
      window.location.href = `/result/${data.reading_id}`
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const prompts = [
    '一年后的自己，你还好吗？',
    '希望那时的我已经...',
    '别忘了现在的梦想...',
  ]

  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>写给明年</span>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>写一段话给明年的自己，到日子了会提醒你回来打开</p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p, i) => (
            <button key={i} onClick={() => setContent(prev => prev + p + '\n')}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        placeholder="亲爱的未来的我⋯⋯"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full rounded-xl p-4 text-sm outline-none border resize-none h-48 leading-relaxed"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        maxLength={2000}
      />
      <div className="text-right text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{content.length}/2000</div>

      <div className="mt-4">
        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>希望什么时候回看？（可选）</label>
        <input type="date" value={futureDate} onChange={e => setFutureDate(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
      </div>

      {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 mt-6"
        style={{ background: 'var(--gold-primary)' }}>
        {loading ? '寄送中...' : '寄给未来 · ¥0.52'}
      </button>
    </>
  )
}
