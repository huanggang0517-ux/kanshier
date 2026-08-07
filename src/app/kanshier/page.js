'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import GoldBadge from '@/components/ui/GoldBadge'
import Button from '@/components/ui/Button'
import InkInput from '@/components/ui/InkInput'
import { useAuth } from '@/contexts/AuthContext'

export default function KanshierPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [question, setQuestion] = useState('')
  const [inputType, setInputType] = useState('char')
  const [chars, setChars] = useState(['', '', ''])
  const [numbers, setNumbers] = useState(['', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

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
      <PageNav
        title="看事儿"
        right={
          <span className="text-xs font-serif" style={{ color: 'var(--text-secondary)' }}>
            剩余 <span style={{ color: 'var(--color-primary)' }}>{remaining}</span> 次
          </span>
        }
      />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <GoldBadge>1</GoldBadge>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            你想问什么事？
          </span>
        </div>
        <textarea
          placeholder="例如：昨晚梦见一条黑狗追我，不知道是吉是凶..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="w-full resize-none h-20 leading-relaxed"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            padding: '12px 16px',
            fontSize: 14,
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
          maxLength={500}
        />
        <div className="text-right text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{question.length}/500</div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <GoldBadge>2</GoldBadge>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            给三个字 或 三个数字
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setInputType('char')}
            className="px-4 py-1.5 text-xs font-medium transition-all"
            style={{
              background: inputType === 'char' ? 'var(--color-primary)' : 'var(--bg-card)',
              color: inputType === 'char' ? '#fff' : 'var(--text-secondary)',
              border: inputType === 'char' ? 'none' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-pill)',
            }}
          >测字</button>
          <button
            onClick={() => setInputType('number')}
            className="px-4 py-1.5 text-xs font-medium transition-all"
            style={{
              background: inputType === 'number' ? 'var(--color-primary)' : 'var(--bg-card)',
              color: inputType === 'number' ? '#fff' : 'var(--text-secondary)',
              border: inputType === 'number' ? 'none' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-pill)',
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
                className="w-16 h-16 text-center text-xl outline-none"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${i === 0 && !chars[0] ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
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
                className="w-16 h-16 text-center text-xl outline-none"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${i === 0 && !numbers[0] ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                }}
                placeholder="0"
              />
            )
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-center mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}

      <Button
        fullWidth
        size="lg"
        loading={loading}
        disabled={loading}
        onClick={handleSubmit}
      >
        {user?.free_count > 0 || user?.is_vip ? '开始解读' : '开始解读 · ¥8.8'}
      </Button>
    </>
  )
}
