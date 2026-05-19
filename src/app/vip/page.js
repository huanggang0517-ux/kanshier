'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function VipPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [payMethod, setPayMethod] = useState('wechat')
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  async function handleConfirmPayment() {
    if (!user) { router.push('/login'); return }
    setPaid(true)

    // 提交开通申请到后端，记录用户和支付方式
    try {
      await fetch('/api/vip/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, method: payMethod })
      })
    } catch {}
  }

  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>年卡会员</span>
      </div>

      <div className="text-center py-6">
        <div className="text-4xl mb-4">👑</div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>年卡会员</h2>
        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>全部服务无限次使用 · 一年有效</p>
      </div>

      <div className="rounded-2xl p-6 mb-6 border text-center"
        style={{ background: 'var(--gradient-card)', borderColor: 'var(--border-color)' }}>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>限时特惠</div>
        <div className="text-4xl font-bold my-3" style={{ color: 'var(--gold-primary)' }}>
          ¥18.8
          <span className="text-base font-normal" style={{ color: 'var(--text-secondary)' }}>/年</span>
        </div>
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          八字精批 · 测桃花 · AI起名 · 写给明年<br />
          全部无限次使用
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['wechat', 'alipay'].map(m => (
          <button key={m} onClick={() => setPayMethod(m)}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{
              background: payMethod === m ? 'var(--gold-primary)' : 'var(--bg-card)',
              color: payMethod === m ? '#fff' : 'var(--text-secondary)',
              border: payMethod === m ? 'none' : '1px solid var(--border-color)'
            }}>
            {m === 'wechat' ? '微信支付' : '支付宝'}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-6 border text-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <img src={`/${payMethod}-pay.jpg`} alt={`${payMethod}收款码`}
          className="w-48 h-48 mx-auto mb-3 rounded-lg"
          onError={e => { e.target.style.display = 'none' }} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          打开{payMethod === 'wechat' ? '微信' : '支付宝'}扫一扫付款<br />
          付款后点击下方按钮申请开通
        </p>
      </div>

      {paid ? (
        <div className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          <p>已提交开通申请，管理员确认收款后即会开通。</p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            付款时请备注手机号 <span style={{ color: 'var(--gold-primary)' }}>{user?.phone}</span>，方便核对
          </p>
        </div>
      ) : (
        <button onClick={handleConfirmPayment}
          disabled={!user}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 mt-4"
          style={{ background: 'var(--gold-primary)' }}>
          {user ? '我已付款，申请开通' : '请先登录'}
        </button>
      )}

      <div className="flex flex-col gap-3 mt-6 mb-8">
        {['看事儿（三字测吉凶）', '八字精批', '测桃花', '姓名·起名', '写给明年'].map(s => (
          <div key={s} className="flex justify-between items-center text-sm px-2" style={{ color: 'var(--text-primary)' }}>
            <span>{s}</span>
            <span style={{ color: 'var(--gold-primary)' }}>无限次</span>
          </div>
        ))}
      </div>
    </>
  )
}
