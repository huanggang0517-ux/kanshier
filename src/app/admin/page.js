'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const ADMIN_PHONE = '17614130826'

  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
    if (u.phone !== ADMIN_PHONE) { router.push('/'); return }
    setUser(u)
    fetch(`/api/admin?adminId=${u.id}`)
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [router])

  async function handleAction(userId, action) {
    setMsg('')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, adminId: user.id })
    })
    const data = await res.json()
    if (!res.ok) { setMsg(data.error); return }
    setMsg(data.message)

    const updated = users.map(u =>
      u.id === userId
        ? { ...u, is_vip: action === 'set_vip', vip_expiry: action === 'set_vip' ? new Date().toISOString() : null, free_count: action === 'set_vip' ? 999 : 0 }
        : u
    )
    setUsers(updated)
  }

  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.push('/')} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>管理后台</span>
      </div>

      {msg && <p className="text-green-500 text-xs mb-4 text-center">{msg}</p>}

      {loading ? (
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>加载中...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map(u => (
            <div key={u.id} className="rounded-xl p-4 border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p style={{ color: 'var(--text-primary)' }} className="font-medium">{u.phone}</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
                    注册: {new Date(u.created_at).toLocaleDateString('zh-CN')} · 邀请码: {u.invite_code}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_vip ? 'text-green-500' : 'text-orange-500'}`}
                  style={{ background: u.is_vip ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)' }}>
                  {u.is_vip ? '年卡' : '普通'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }} className="text-xs">剩余次数: {u.is_vip ? '∞' : u.free_count}</span>
                <div className="flex gap-2">
                  {u.is_vip ? (
                    <button onClick={() => handleAction(u.id, 'remove_vip')}
                      className="text-xs px-3 py-1.5 rounded-full border text-orange-500"
                      style={{ borderColor: 'var(--border-color)' }}>
                      取消年卡
                    </button>
                  ) : (
                    <button onClick={() => handleAction(u.id, 'set_vip')}
                      className="text-xs px-3 py-1.5 rounded-full text-white font-medium"
                      style={{ background: 'var(--gold-primary)' }}>
                      开通年卡
                    </button>
                  )}
                  <button onClick={() => handleAction(u.id, 'add_count')}
                    className="text-xs px-3 py-1.5 rounded-full border"
                    style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                    +1次
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
