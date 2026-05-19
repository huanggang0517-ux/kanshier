'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function XingmingPage() {
  const router = useRouter()
  const [mode, setMode] = useState('score')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [babyGender, setBabyGender] = useState('')
  const [babyBirthday, setBabyBirthday] = useState('')
  const [requirements, setRequirements] = useState('')
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
    if (mode === 'score' && !name) { setError('请输入姓名'); return }
    if (mode === 'name' && !surname) { setError('请输入姓氏'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/xingming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, mode, name, surname, babyGender, babyBirthday, requirements })
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403) { router.push('/vip'); return }
        setError(data.error)
        return
      }

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
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>姓名·起名</span>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('score')}
          className="flex-1 py-2 rounded-full text-xs font-medium"
          style={{
            background: mode === 'score' ? 'var(--gold-primary)' : 'var(--bg-card)',
            color: mode === 'score' ? '#fff' : 'var(--text-secondary)',
            border: mode === 'score' ? 'none' : '1px solid var(--border-color)'
          }}
        >姓名测算（免费）</button>
        <button
          onClick={() => setMode('name')}
          className="flex-1 py-2 rounded-full text-xs font-medium"
          style={{
            background: mode === 'name' ? 'var(--gold-primary)' : 'var(--bg-card)',
            color: mode === 'name' ? '#fff' : 'var(--text-secondary)',
            border: mode === 'name' ? 'none' : '1px solid var(--border-color)'
          }}
        >宝贝起名（¥1.8）</button>
      </div>

      {mode === 'score' ? (
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>你的姓名</label>
          <input
            type="text"
            placeholder="输入姓名"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>姓氏</label>
            <input
              type="text"
              placeholder="例如：张"
              value={surname}
              onChange={e => setSurname(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>宝宝性别</label>
            <div className="flex gap-3">
              {['男', '女'].map(g => (
                <button
                  key={g}
                  onClick={() => setBabyGender(g)}
                  className="flex-1 rounded-xl py-3 text-sm font-medium"
                  style={{
                    background: babyGender === g ? 'var(--gold-primary)' : 'var(--bg-card)',
                    color: babyGender === g ? '#fff' : 'var(--text-secondary)',
                    border: babyGender === g ? 'none' : '1px solid var(--border-color)'
                  }}
                >{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>宝宝出生日期（可选）</label>
            <input type="date" value={babyBirthday} onChange={e => setBabyBirthday(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>起名要求（可选）</label>
            <textarea placeholder="例如：希望名字带寓意好、五行互补..." value={requirements} onChange={e => setRequirements(e.target.value)}
              className="w-full rounded-xl p-3 text-sm outline-none border resize-none h-20"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 mt-8"
        style={{ background: 'var(--gold-primary)' }}
      >
        {loading ? '处理中...' : mode === 'score' ? '免费测算' : '开始起名 · ¥1.8'}
      </button>
    </>
  )
}
