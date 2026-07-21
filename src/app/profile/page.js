'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getUser, clearUser } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  useEffect(() => {
    const u = getUser()
    if (!u) router.push('/login')
    else setUser(u)
  }, [router])

  function handleLogout() {
    clearUser()
    router.push('/')
    router.refresh()
  }

  async function handleChangePassword() {
    setPwdError('')
    setPwdSuccess('')
    if (!oldPassword) { setPwdError('请输入旧密码'); return }
    if (!newPassword) { setPwdError('请输入新密码'); return }
    if (newPassword.length < 6) { setPwdError('新密码至少6位'); return }
    if (newPassword !== confirmPassword) { setPwdError('两次密码不一致'); return }

    setPwdLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, oldPassword, newPassword })
      })
      const data = await res.json()
      if (!res.ok) { setPwdError(data.error); return }
      setPwdSuccess('密码修改成功')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowChangePwd(false)
    } catch {
      setPwdError('网络错误')
    } finally {
      setPwdLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <Header />
      <PageNav title="我的" onBack={() => router.push('/')} />

      <div className="text-center py-8">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          {user.phone?.slice(-4)}
        </div>
        <p className="text-sm font-serif" style={{ color: 'var(--text-primary)' }}>{user.phone}</p>
      </div>

      <div className="flex gap-3 mb-8">
        <Card variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} padding={false}>
          <div className="p-4 text-center">
            <div className="text-lg font-semibold font-serif" style={{ color: 'var(--color-primary)' }}>
              {user.is_vip ? '∞' : user.free_count}
            </div>
            <div className="text-xs mt-1 font-serif" style={{ color: 'var(--text-secondary)' }}>
              {user.is_vip ? '年卡无限次' : '剩余看事儿次数'}
            </div>
          </div>
        </Card>
        <Card variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} padding={false}>
          <div className="p-4 text-center">
            <div className="text-lg font-semibold tracking-wider font-serif" style={{ color: 'var(--color-primary)' }}>
              {user.invite_code}
            </div>
            <div className="text-xs mt-1 font-serif" style={{ color: 'var(--text-secondary)' }}>
              邀请码（每邀1人+1次）
            </div>
          </div>
        </Card>
      </div>

      {/* 藏经阁状态 */}
      <Card variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} className="mb-4">
        <a href="/ebooks" className="flex justify-between items-center">
          <span className="text-sm font-serif" style={{ color: 'var(--text-primary)' }}>
            藏经阁 {user.ebook_access ? '· 已解锁' : ''}
          </span>
          <span className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>
            {user.ebook_access ? '进入 →' : '¥16.8 解锁 →'}
          </span>
        </a>
      </Card>

      {!user.is_vip && (
        <a href="/vip">
          <Card variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium font-serif" style={{ color: 'var(--text-primary)' }}>开通年卡 ¥18.8</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>→</span>
            </div>
          </Card>
        </a>
      )}

      {user.phone === '17614130826' && (
        <a href="/admin">
          <Card variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-serif" style={{ color: 'var(--text-secondary)' }}>管理后台</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>→</span>
            </div>
          </Card>
        </a>
      )}

      <div className="mb-4">
        <button
          onClick={() => { setShowChangePwd(!showChangePwd); setPwdError(''); setPwdSuccess('') }}
          className="w-full text-left font-serif"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            padding: '12px 16px',
            fontSize: 14,
          }}
        >
          修改密码 {showChangePwd ? '▲' : '▼'}
        </button>
        {showChangePwd && (
          <div className="mt-3 flex flex-col gap-3">
            <input type="password" placeholder="旧密码" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
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
            <input type="password" placeholder="新密码（至少6位）" value={newPassword} onChange={e => setNewPassword(e.target.value)}
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
            <input type="password" placeholder="确认新密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
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
            {pwdError && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{pwdError}</p>}
            {pwdSuccess && <p className="text-xs" style={{ color: 'var(--color-success)' }}>{pwdSuccess}</p>}
            <Button fullWidth loading={pwdLoading} disabled={pwdLoading} onClick={handleChangePassword}>
              {pwdLoading ? '修改中...' : '确认修改'}
            </Button>
          </div>
        )}
      </div>

      <Button
        fullWidth
        variant="outline"
        onClick={handleLogout}
      >
        退出登录
      </Button>
    </>
  )
}
