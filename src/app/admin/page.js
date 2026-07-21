'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Loading from '@/components/ui/Loading'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getUser } from '@/lib/utils'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [ebookOrders, setEbookOrders] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | ebook | kanshier

  const ADMIN_PHONE = '17614130826'

  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
    if (u.phone !== ADMIN_PHONE) { router.push('/'); return }
    setUser(u)
    fetch(`/api/admin?adminId=${u.id}`)
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setPendingOrders(data.pendingOrders || []); setEbookOrders(data.ebookOrders || []); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [router])

  async function handleAction(userId, action, orderId) {
    setMsg('')
    const body = orderId
      ? { userId, action, adminId: user.id, orderId }
      : { userId, action, adminId: user.id }
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) { setMsg(data.error); return }
    setMsg(data.message)

    if (action === 'confirm_payment') {
      setPendingOrders(prev => prev.filter(o => o.id !== orderId))
      fetch(`/api/admin?adminId=${user.id}`)
        .then(r => r.json())
        .then(data => setUsers(data.users || []))
      return
    }

    if (action === 'confirm_ebook_payment') {
      setEbookOrders(prev => prev.filter(o => o.id !== orderId))
      fetch(`/api/admin?adminId=${user.id}`)
        .then(r => r.json())
        .then(data => setUsers(data.users || []))
      return
    }

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
      <PageNav title="管理后台" onBack={() => router.push('/')} />

      {msg && (
        <p className="text-xs mb-4 text-center" style={{ color: 'var(--color-success)' }}>{msg}</p>
      )}

      {/* 管理入口 */}
      <div className="flex gap-2 mb-4">
        <Button fullWidth variant="gold" onClick={() => router.push('/admin/ebooks')}>
          书籍管理
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-4">
          {/* 待确认付款 — 书籍库 */}
          {ebookOrders.filter(o => o.input_data?.status === 'pending').length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 font-serif tracking-wider" style={{ color: 'var(--gold)' }}>
                书籍库待确认付款
              </h3>
              <div className="flex flex-col gap-2">
                {ebookOrders.filter(o => o.input_data?.status === 'pending').map(order => (
                  <Card key={order.id} variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium font-serif" style={{ color: 'var(--text-primary)' }}>{order.phone}</p>
                        <p className="text-xs mt-0.5 font-serif" style={{ color: 'var(--text-secondary)' }}>
                          {order.input_data?.method === 'wechat' ? '微信支付' : '支付宝'} · {new Date(order.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleAction(null, 'confirm_ebook_payment', order.id)}>
                        确认收款
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 待确认付款 — VIP */
}
          {pendingOrders.filter(o => o.input_data?.status === 'pending').length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 font-serif tracking-wider" style={{ color: 'var(--color-primary)' }}>
                VIP 待确认付款
              </h3>
              <div className="flex flex-col gap-2">
                {pendingOrders.filter(o => o.input_data?.status === 'pending').map(order => (
                  <Card key={order.id} variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium font-serif" style={{ color: 'var(--text-primary)' }}>{order.phone}</p>
                        <p className="text-xs mt-0.5 font-serif" style={{ color: 'var(--text-secondary)' }}>
                          {order.input_data?.method === 'wechat' ? '微信支付' : '支付宝'} · {new Date(order.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleAction(null, 'confirm_payment', order.id)}>
                        确认收款
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 用户管理 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium font-serif" style={{ color: 'var(--text-primary)' }}>用户管理</h3>
              <div className="flex gap-1">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'ebook', label: '藏经阁' },
                  { key: 'kanshier', label: '看事儿' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className="text-xs px-2.5 py-1 font-serif transition-colors"
                    style={{
                      background: filter === f.key ? 'var(--color-primary)' : 'transparent',
                      color: filter === f.key ? '#fff' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-pill)',
                      border: filter === f.key ? 'none' : '1px solid var(--border-color)',
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {users.filter(u => {
              if (filter === 'ebook') return u.ebook_access
              if (filter === 'kanshier') return !u.ebook_access
              return true
            }).map(u => (
              <Card key={u.id} variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} className="mb-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium font-serif" style={{ color: 'var(--text-primary)' }}>{u.phone}</p>
                    <p className="text-xs mt-0.5 font-serif" style={{ color: 'var(--text-secondary)' }}>
                      注册: {new Date(u.created_at).toLocaleDateString('zh-CN')} · 邀请码: {u.invite_code}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: u.is_vip ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
                        color: u.is_vip ? 'var(--color-success)' : 'var(--color-warning)',
                      }}
                    >
                      {u.is_vip ? '年卡' : '普通'}
                    </span>
                    {u.ebook_access && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: 'rgba(212,175,55,0.1)',
                          color: 'var(--gold)',
                        }}
                      >
                        书库
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>
                    剩余次数: {u.is_vip ? '∞' : u.free_count}
                  </span>
                  <div className="flex gap-2">
                    {u.is_vip ? (
                      <button onClick={() => handleAction(u.id, 'remove_vip')}
                        className="text-xs px-3 py-1.5 border transition-colors hover:opacity-70"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--color-warning)', borderRadius: 'var(--radius-pill)' }}>
                        取消年卡
                      </button>
                    ) : (
                      <button onClick={() => handleAction(u.id, 'set_vip')}
                        className="text-xs px-3 py-1.5 text-white font-medium transition-colors hover:opacity-90"
                        style={{ background: 'var(--color-primary)', borderRadius: 'var(--radius-pill)' }}>
                        开通年卡
                      </button>
                    )}
                    <button onClick={() => handleAction(u.id, 'add_count')}
                      className="text-xs px-3 py-1.5 border transition-colors hover:opacity-70"
                      style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-pill)' }}>
                      +1次
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
