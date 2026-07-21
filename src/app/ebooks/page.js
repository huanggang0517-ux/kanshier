'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import SealStamp from '@/components/ui/SealStamp'
import { getUser } from '@/lib/utils'

export default function EbooksPage() {
  const router = useRouter()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showPurchase, setShowPurchase] = useState(false)
  const [payMethod, setPayMethod] = useState('wechat')
  const [paid, setPaid] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  useEffect(() => {
    setUser(getUser())
    fetch('/api/ebooks')
      .then(r => r.json())
      .then(data => setBooks(data.books || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handlePurchase() {
    if (!user) { router.push('/login'); return }
    setPurchaseLoading(true)
    try {
      const res = await fetch('/api/ebooks/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, method: payMethod })
      })
      if (!res.ok) {
        const data = await res.json()
        if (data.error) { alert(data.error); return }
      }
      setPaid(true)
    } catch {}
    setPurchaseLoading(false)
  }

  const hasAccess = user?.ebook_access

  return (
    <>
      <Header />
      <div className="relative">
        {/* 卷轴装饰顶 */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.4 }}
        />

        <PageNav
          title="藏经阁"
          right={
            !hasAccess && user ? (
              <button
                onClick={() => setShowPurchase(true)}
                className="text-xs font-serif px-3 py-1 text-white transition-all hover:opacity-90"
                style={{ background: 'var(--color-primary)', borderRadius: 'var(--radius-pill)' }}
              >
                ¥16.8 解锁
              </button>
            ) : null
          }
        />

        {/* 经阁题记 */}
        <div className="text-center py-4 mb-2">
          <p className="font-serif text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
            书中自有乾坤
          </p>
        </div>

        {loading ? (
          <Loading text="翻阅经卷..." />
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3 opacity-30">📜</div>
            <p className="font-serif text-sm tracking-wider" style={{ color: 'var(--text-muted)' }}>
              经阁尚空 · 待君添藏
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {books.map(book => (
              <Card
                key={book.id}
                variant="parchment"
                elevation="sm"
                decorations={{ corners: true, innerBorder: true }}
                onClick={() => {
                  if (hasAccess) {
                    router.push(`/ebooks/${book.id}`)
                  } else if (!user) {
                    router.push('/login')
                  } else {
                    setShowPurchase(true)
                  }
                }}
              >
                <div className="flex gap-4 items-start relative">
                  {/* 经卷图标 */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 font-serif text-lg"
                    style={{
                      background: 'var(--gradient-gold)',
                      color: '#fff',
                      boxShadow: 'var(--shadow-gold)',
                    }}
                  >
                    经
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-base font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                      {book.title}
                    </h2>
                    {book.author && (
                      <p className="font-serif text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {book.author}
                      </p>
                    )}
                    {book.description && (
                      <p className="text-xs mt-1.5 leading-relaxed line-clamp-2 font-serif" style={{ color: 'var(--text-secondary)' }}>
                        {book.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {book.file_size > 0 && (
                        <span className="text-[10px] font-serif" style={{ color: 'var(--text-muted)' }}>
                          {(book.file_size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                      {!book.is_published && (
                        <SealStamp variant="ink" size="sm" rotation={0}>
                          待刊
                        </SealStamp>
                      )}
                    </div>
                  </div>

                  {hasAccess && (
                    <span
                      className="text-xs shrink-0 mt-1 transition-all group-hover:translate-x-1"
                      style={{ color: 'var(--color-primary)', opacity: 0.5 }}
                    >
                      →
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 购买弹窗 */}
      {showPurchase && !hasAccess && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={() => { if (!paid) setShowPurchase(false) }}
        >
          <Card
            variant="glass"
            elevation="lg"
            decorations={{ corners: false, innerBorder: false }}
            className="w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            {paid ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-3">🙏</div>
                <h3 className="font-serif text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  已提交开通申请
                </h3>
                <p className="text-xs font-serif leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  管理员确认收款后即可解锁全部书籍
                </p>
                <p className="text-xs mt-3 font-serif" style={{ color: 'var(--text-muted)' }}>
                  付款时请备注手机号 <span style={{ color: 'var(--color-primary)' }}>{user?.phone}</span>
                </p>
                <button
                  onClick={() => { setShowPurchase(false); setPaid(false) }}
                  className="mt-4 text-xs underline font-serif"
                  style={{ color: 'var(--text-muted)' }}
                >
                  关闭
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    解锁藏经阁
                  </h3>
                  <p className="font-serif text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    全部书籍 · 一次付费 · 永久阅读
                  </p>
                </div>

                <div className="text-center py-4 mb-4" style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                }}>
                  <div className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>限时特惠</div>
                  <div className="text-3xl font-bold font-serif my-2" style={{ color: 'var(--color-primary)' }}>
                    ¥16.8
                    <span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>/永久</span>
                  </div>
                  <div className="text-xs font-serif" style={{ color: 'var(--text-secondary)' }}>
                    已收录 {books.length} 本 · 持续更新
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {['wechat', 'alipay'].map(m => (
                    <button key={m} onClick={() => setPayMethod(m)}
                      className="flex-1 py-3 text-sm font-medium transition-all font-serif"
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

                <div className="text-center mb-4">
                  <img src={`/${payMethod}-pay.jpg`} alt={`${payMethod}收款码`}
                    className="w-40 h-40 mx-auto mb-2"
                    style={{ borderRadius: 'var(--radius-md)' }}
                    onError={e => { e.target.style.display = 'none' }} />
                  <p className="text-xs font-serif" style={{ color: 'var(--text-secondary)' }}>
                    打开{payMethod === 'wechat' ? '微信' : '支付宝'}扫一扫付款
                  </p>
                </div>

                <Button fullWidth loading={purchaseLoading} disabled={purchaseLoading || !user} onClick={handlePurchase}>
                  {user ? '我已付款，申请开通' : '请先登录'}
                </Button>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
