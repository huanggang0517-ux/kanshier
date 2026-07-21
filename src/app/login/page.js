'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Button from '@/components/ui/Button'
import InkInput from '@/components/ui/InkInput'
import Card from '@/components/ui/Card'
import { setUser } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetPhone, setResetPhone] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetMsg, setResetMsg] = useState('')

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

      setUser(data.user)
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

        {isLogin && (
          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            <button onClick={() => setShowReset(true)} className="underline" style={{ color: 'var(--text-muted)' }}>
              忘记密码？
            </button>
          </p>
        )}

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? '没有账号？' : '已有账号？'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setShowReset(false); setInviteCode('') }}
            className="ml-1 underline"
            style={{ color: 'var(--color-primary)' }}
          >
            {isLogin ? '注册' : '登录'}
          </button>
        </p>

        {showReset && (
          <Card variant="parchment" elevation="sm" decorations={{ corners: false, innerBorder: false }} className="mt-6">
            <h3 className="text-sm font-medium mb-3 font-serif" style={{ color: 'var(--text-primary)' }}>重置密码</h3>
            <div className="flex flex-col gap-3">
              <input type="tel" placeholder="手机号" maxLength={11} value={resetPhone}
                onChange={e => setResetPhone(e.target.value)}
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
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }} />
              <input type="password" placeholder="新密码（至少6位）" value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
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
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }} />
              {resetMsg && (
                <p className={`text-xs ${resetMsg.includes('成功') ? '' : ''}`}
                  style={{ color: resetMsg.includes('成功') ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {resetMsg}
                </p>
              )}
              <Button fullWidth variant="gold" onClick={async () => {
                if (!resetPhone || !resetPassword) { setResetMsg('请填写完整'); return }
                if (resetPassword.length < 6) { setResetMsg('密码至少6位'); return }
                try {
                  const r = await fetch('/api/auth/reset-password', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: resetPhone, newPassword: resetPassword })
                  })
                  const d = await r.json()
                  if (!r.ok) { setResetMsg(d.error); return }
                  setResetMsg('密码重置成功，请用新密码登录')
                  setResetPhone('')
                  setResetPassword('')
                  setTimeout(() => setShowReset(false), 2000)
                } catch { setResetMsg('网络错误') }
              }}>
                重置密码
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
