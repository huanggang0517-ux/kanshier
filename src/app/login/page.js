'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, inviteCode })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      login(data.user)
      router.push('/')
      router.refresh()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="pt-12">
        <h1 className="text-xl font-semibold text-center mb-2 font-serif tracking-wider" style={{ color: 'var(--text-primary)' }}>
          {isLogin ? '欢迎回来' : '注册'}
        </h1>
        <p className="text-xs text-center mb-8 font-serif" style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? '输入手机号和密码登录' : '新用户送 6 次免费看事儿'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            placeholder="手机号"
            maxLength={11}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '12px 16px',
              fontSize: 14,
              outline: 'none',
              width: '100%',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
          />
          <input
            type="password"
            placeholder="密码（至少6位）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '12px 16px',
              fontSize: 14,
              outline: 'none',
              width: '100%',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
          />

          {!isLogin && (
            <input
              type="text"
              placeholder="邀请码（选填）"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '12px 16px',
                fontSize: 14,
                outline: 'none',
                width: '100%',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
            />
          )}

          {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={loading}>
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </Button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? '没有账号？' : '已有账号？'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setInviteCode('') }}
            className="ml-1 underline"
            style={{ color: 'var(--color-primary)' }}
          >
            {isLogin ? '注册' : '登录'}
          </button>
        </p>

        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
          忘记密码？请联系管理员重置
        </p>
      </div>
    </>
  )
}
