'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser } from '@/lib/utils'

export default function VipPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  async function handlePurchase() {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    // 支付待接入 — 用户用自己的收款方式
    alert('支付功能待接入。当前支持微信/支付宝转账开通。\n\n联系客服手动开通年卡会员。')
    setLoading(false)
  }

  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>看事儿年卡</span>
      </div>

      <div className="text-center py-8">
        <div className="text-4xl mb-4">👑</div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>看事儿年卡</h2>
        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>看事儿功能无限次使用 · 一年有效</p>
      </div>

      <div
        className="rounded-2xl p-6 mb-6 border text-center"
        style={{ background: 'var(--gradient-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>限时特惠</div>
        <div className="text-4xl font-bold my-3" style={{ color: 'var(--gold-primary)' }}>
          ¥58
          <span className="text-base font-normal" style={{ color: 'var(--text-secondary)' }}>/年</span>
        </div>
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          看事儿三字测吉凶 · 无限次问事<br />
          ¥8.8/次 → 全年免费
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between items-center text-sm px-2" style={{ color: 'var(--text-primary)' }}>
          <span>每日任意问事</span>
          <span style={{ color: 'var(--gold-primary)' }}>不限次</span>
        </div>
        <div className="flex justify-between items-center text-sm px-2" style={{ color: 'var(--text-primary)' }}>
          <span>测字 + 数字卦</span>
          <span style={{ color: 'var(--gold-primary)' }}>全部支持</span>
        </div>
        <div className="flex justify-between items-center text-sm px-2" style={{ color: 'var(--text-primary)' }}>
          <span>新用户免费 6 次</span>
          <span style={{ color: 'var(--gold-primary)' }}>可叠加</span>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: 'var(--gold-primary)' }}
      >
        {loading ? '处理中...' : '立即开通 ¥58'}
      </button>

      <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
        开通后自动生效，无需额外操作
      </p>
    </>
  )
}
