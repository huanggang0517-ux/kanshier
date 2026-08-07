'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export default function VipPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [payMethod, setPayMethod] = useState('wechat')
  const [paid, setPaid] = useState(false)

  async function handleConfirmPayment() {
    if (!user) { router.push('/login'); return }
    setPaid(true)

    try {
      await fetch('/api/vip/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: payMethod })
      })
    } catch {}
  }

  return (
    <>
      <Header />
      <PageNav title="年卡会员" />

      <div className="text-center py-6">
        <div className="text-4xl mb-4" style={{ filter: 'drop-shadow(0 2px 8px rgba(184,148,79,0.3))' }}>👑</div>
        <h2 className="text-xl font-semibold font-serif tracking-wider" style={{ color: 'var(--text-primary)' }}>
          年卡会员
        </h2>
        <p className="text-xs mt-2 font-serif" style={{ color: 'var(--text-secondary)' }}>
          全部服务无限次使用 · 一年有效
        </p>
      </div>

      <Card variant="parchment" elevation="md" decorations={{ corners: true, innerBorder: true }}>
        <div className="text-center">
          <div className="text-xs font-serif tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            限时特惠
          </div>
          <div className="text-4xl font-bold my-3 font-serif" style={{ color: 'var(--color-primary)' }}>
            ¥18.8
            <span className="text-base font-normal" style={{ color: 'var(--text-secondary)' }}>/年</span>
          </div>
          <div className="text-xs leading-relaxed font-serif" style={{ color: 'var(--text-secondary)' }}>
            看事儿 · 八字精批 · 测桃花 · AI起名 · 写给明年<br />
            全部无限次使用
          </div>
        </div>
      </Card>

      <div className="flex gap-2 my-4">
        {['wechat', 'alipay'].map(m => (
          <button key={m} onClick={() => setPayMethod(m)}
            className="flex-1 py-3 text-sm font-medium transition-all"
            style={{
              background: payMethod === m ? 'var(--color-primary)' : 'var(--bg-card)',
              color: payMethod === m ? '#fff' : 'var(--text-secondary)',
              border: payMethod === m ? 'none' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}>
            {m === 'wechat' ? '微信支付' : '支付宝'}
          </button>
        ))}
      </div>

      <Card variant="parchment" elevation="sm" decorations={{ corners: false, innerBorder: false }}>
        <div className="text-center">
          <img src={`/${payMethod}-pay.jpg`} alt={`${payMethod}收款码`}
            className="w-48 h-48 mx-auto mb-3 rounded-lg"
            style={{ borderRadius: 'var(--radius-md)' }}
            onError={e => { e.target.style.display = 'none' }} />
          <p className="text-xs font-serif" style={{ color: 'var(--text-secondary)' }}>
            打开{payMethod === 'wechat' ? '微信' : '支付宝'}扫一扫付款<br />
            付款后点击下方按钮申请开通
          </p>
        </div>
      </Card>

      {paid ? (
        <div className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          <p>已提交开通申请，管理员确认收款后即会开通。</p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            付款时请备注手机号 <span style={{ color: 'var(--color-primary)' }}>{user?.phone}</span>，方便核对
          </p>
        </div>
      ) : (
        <Button
          fullWidth
          size="lg"
          disabled={!user}
          onClick={handleConfirmPayment}
          className="mt-4"
        >
          {user ? '我已付款，申请开通' : '请先登录'}
        </Button>
      )}

      <div className="flex flex-col gap-3 mt-6 mb-8">
        {['看事儿（三字测吉凶）', '八字精批', '测桃花', '姓名·起名', '写给明年'].map(s => (
          <div key={s} className="flex justify-between items-center text-sm px-2" style={{ color: 'var(--text-primary)' }}>
            <span className="font-serif">{s}</span>
            <span className="font-serif" style={{ color: 'var(--color-primary)' }}>无限次</span>
          </div>
        ))}
      </div>
    </>
  )
}
