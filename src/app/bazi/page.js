'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function BaziPage() {
  const router = useRouter()
  const [birthday, setBirthday] = useState('')
  const [birthHour, setBirthHour] = useState('')
  const [gender, setGender] = useState('')
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
    if (!birthday) { setError('请选择出生日期'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, birthday, birthHour, gender })
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
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>八字精批</span>
        {user && <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>剩余 <span style={{ color: 'var(--gold-primary)' }}>{user.is_vip ? '∞' : user.free_count}</span> 次</span>}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>出生日期</label>
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>出生时辰（可选）</label>
          <select
            value={birthHour}
            onChange={e => setBirthHour(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="">不确定</option>
            {['子(23-1)', '丑(1-3)', '寅(3-5)', '卯(5-7)', '辰(7-9)', '巳(9-11)', '午(11-13)', '未(13-15)', '申(15-17)', '酉(17-19)', '戌(19-21)', '亥(21-23)'].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>性别</label>
          <div className="flex gap-3">
            {['男', '女'].map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className="flex-1 rounded-xl py-3 text-sm font-medium"
                style={{
                  background: gender === g ? 'var(--gold-primary)' : 'var(--bg-card)',
                  color: gender === g ? '#fff' : 'var(--text-secondary)',
                  border: gender === g ? 'none' : '1px solid var(--border-color)'
                }}
              >{g}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 mt-8"
        style={{ background: 'var(--gold-primary)' }}
      >
        {loading ? '排盘中...' : '开始批算 · ¥19.9'}
      </button>
    </>
  )
}
