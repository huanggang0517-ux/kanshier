'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
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
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.push('/')} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>我的</span>
      </div>

      <div className="text-center py-8">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-semibold text-white"
          style={{ background: 'var(--gold-primary)' }}
        >
          {user.phone?.slice(-4)}
        </div>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{user.phone}</p>
      </div>

      <div className="flex gap-3 mb-8">
        <div
          className="flex-1 rounded-xl p-4 text-center border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="text-lg font-semibold" style={{ color: 'var(--gold-primary)' }}>
            {user.is_vip ? '∞' : user.free_count}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {user.is_vip ? '年卡无限次' : '剩余看事儿次数'}
          </div>
        </div>
        <div
          className="flex-1 rounded-xl p-4 text-center border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="text-lg font-semibold tracking-wider" style={{ color: 'var(--gold-primary)' }}>
            {user.invite_code}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            邀请码（每邀1人+1次）
          </div>
        </div>
      </div>

      {!user.is_vip && (
        <a href="/vip">
          <div
            className="rounded-xl p-4 mb-4 border flex justify-between items-center"
            style={{ background: 'var(--gradient-card)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>开通看事儿年卡 ¥58</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>→</span>
          </div>
        </a>
      )}

      <a href="/admin">
        <div
          className="rounded-xl p-4 mb-4 border flex justify-between items-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>管理后台</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>→</span>
        </div>
      </a>

      <div className="mb-4">
        <button
          onClick={() => { setShowChangePwd(!showChangePwd); setPwdError(''); setPwdSuccess('') }}
          className="w-full rounded-xl py-3 text-sm border text-left px-4"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
        >
          修改密码 {showChangePwd ? '▲' : '▼'}
        </button>
        {showChangePwd && (
          <div className="mt-3 flex flex-col gap-3">
            <input type="password" placeholder="旧密码" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            <input type="password" placeholder="新密码（至少6位）" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            <input type="password" placeholder="确认新密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            {pwdError && <p className="text-red-500 text-xs">{pwdError}</p>}
            {pwdSuccess && <p className="text-green-500 text-xs">{pwdSuccess}</p>}
            <button onClick={handleChangePassword} disabled={pwdLoading}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--gold-primary)' }}>
              {pwdLoading ? '修改中...' : '确认修改'}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full rounded-xl py-3 text-sm border"
        style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
      >
        退出登录
      </button>
    </>
  )
}
