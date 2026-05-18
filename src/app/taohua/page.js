'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function TaohuaPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [birthday, setBirthday] = useState('')
  const [crushName, setCrushName] = useState('')
  const [question, setQuestion] = useState('')
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
    if (!name.trim()) { setError('请输入你的名字'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/taohua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: name.trim(), gender, birthday, crushName: crushName.trim(), question: question.trim() })
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

  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>测桃花</span>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>你的名字 *</label>
          <input type="text" placeholder="输入名字" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>性别</label>
          <div className="flex gap-3">
            {['男', '女'].map(g => (
              <button key={g} onClick={() => setGender(g)}
                className="flex-1 rounded-xl py-3 text-sm font-medium"
                style={{ background: gender === g ? 'var(--gold-primary)' : 'var(--bg-card)', color: gender === g ? '#fff' : 'var(--text-secondary)', border: gender === g ? 'none' : '1px solid var(--border-color)' }}>{g}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>生日（可选）</label>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>心仪对象名字（可选）</label>
          <input type="text" placeholder="留空则看整体桃花运" value={crushName} onChange={e => setCrushName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>想说的话（可选）</label>
          <textarea placeholder="例如：想知道今年能不能遇到正缘..." value={question} onChange={e => setQuestion(e.target.value)}
            className="w-full rounded-xl p-3 text-sm outline-none border resize-none h-16"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 mt-8"
        style={{ background: 'var(--gold-primary)' }}>
        {loading ? '测算中...' : '测桃花 · ¥19.9'}
      </button>
    </>
  )
}
