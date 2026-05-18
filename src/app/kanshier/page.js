'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function KanshierPage() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [inputType, setInputType] = useState('char')
  const [chars, setChars] = useState(['', '', ''])
  const [numbers, setNumbers] = useState(['', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const u = getUser()
    if (!u) router.push('/login')
    else setUser(u)
  }, [router])

  function getInputValue() {
    return inputType === 'char' ? chars.join('') : numbers.join('')
  }

  async function handleSubmit() {
    if (!user) { router.push('/login'); return }

    const value = getInputValue()
    if (!question.trim()) { setError('请描述你想问的事'); return }
    if (value.length < 3) { setError('请填满三个字或三个数字'); return }

    const charRegex = /^[一-鿿]{3}$/
    const numRegex = /^\d{3}$/
    if (inputType === 'char' && !charRegex.test(value)) {
      setError('请输三个汉字')
      return
    }
    if (inputType === 'number' && !numRegex.test(value)) {
      setError('请输三个数字（0-9）')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/kanshier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          question: question.trim(),
          inputType,
          inputValue: value
        })
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.needPayment) { router.push('/vip'); return }
        setError(data.error)
        return
      }

      window.location.href = `/result/${data.reading_id}`
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  function handleCharChange(i, val) {
    if (val && !/^[一-鿿]$/.test(val) && val.length === 1) return
    const next = [...chars]
    next[i] = val
    setChars(next)
    if (val && i < 2) setTimeout(() => document.getElementById(`char-${i + 1}`)?.focus(), 50)
  }

  function handleNumberChange(i, val) {
    if (val && !/^\d$/.test(val)) return
    const next = [...numbers]
    next[i] = val
    setNumbers(next)
    if (val && i < 2) setTimeout(() => document.getElementById(`num-${i + 1}`)?.focus(), 50)
  }

  const remaining = user ? (user.is_vip ? '∞' : user.free_count) : '—'

  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>看事儿</span>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>
          剩余 <span style={{ color: 'var(--gold-primary)' }}>{remaining}</span> 次
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-primary)' }}>1</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>你想问什么事？</span>
        </div>
        <textarea
          placeholder="例如：昨晚梦见一条黑狗追我，不知道是吉是凶..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="w-full rounded-xl p-3 text-sm outline-none border resize-none h-20"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          maxLength={500}
        />
        <div className="text-right text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{question.length}/500</div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-primary)' }}>2</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>给三个字 或 三个数字</span>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setInputType('char')}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: inputType === 'char' ? 'var(--gold-primary)' : 'var(--bg-card)',
              color: inputType === 'char' ? '#fff' : 'var(--text-secondary)',
              border: inputType === 'char' ? 'none' : '1px solid var(--border-color)'
            }}
          >测字</button>
          <button
            onClick={() => setInputType('number')}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: inputType === 'number' ? 'var(--gold-primary)' : 'var(--bg-card)',
              color: inputType === 'number' ? '#fff' : 'var(--text-secondary)',
              border: inputType === 'number' ? 'none' : '1px solid var(--border-color)'
            }}
          >数字</button>
        </div>

        <div className="flex gap-3 justify-center mb-4">
          {[0, 1, 2].map(i => (
            inputType === 'char' ? (
              <input
                key={i}
                id={`char-${i}`}
                type="text"
                maxLength={1}
                value={chars[i]}
                onChange={e => handleCharChange(i, e.target.value)}
                className="w-16 h-16 text-center text-xl rounded-xl border outline-none"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: i === 0 && !chars[0] ? 'var(--gold-primary)' : 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="字"
              />
            ) : (
              <input
                key={i}
                id={`num-${i}`}
                type="text"
                maxLength={1}
                value={numbers[i]}
                onChange={e => handleNumberChange(i, e.target.value)}
                className="w-16 h-16 text-center text-xl rounded-xl border outline-none"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: i === 0 && !numbers[0] ? 'var(--gold-primary)' : 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="0"
              />
            )
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: 'var(--gold-primary)' }}
      >
        {loading ? '解卦中...' : user?.free_count > 0 || user?.is_vip ? '开始解读' : '开始解读 · ¥8.8'}
      </button>
    </>
  )
}
