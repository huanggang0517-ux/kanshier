'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser, clearUser } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

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

      <button
        onClick={handleLogout}
        className="w-full rounded-xl py-3 text-sm border mt-8"
        style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
      >
        退出登录
      </button>
    </>
  )
}
