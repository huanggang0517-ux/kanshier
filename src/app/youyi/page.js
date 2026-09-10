'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'

export default function YouyiPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    fetch('/api/youyi')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErrMsg(data.error); return }
        setItems(data.items || [])
      })
      .catch(() => setErrMsg('加载失败，请刷新重试'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <div className="relative">
        {/* 卷轴装饰顶 */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.4 }}
        />

        <PageNav title="游艺阁" onBack={() => router.push('/')} />

        {/* 阁中题记 */}
        <div className="text-center py-4 mb-2">
          <p className="font-serif text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
            游于艺 · 寓教于乐
          </p>
        </div>

        {errMsg && (
          <p className="text-xs text-center mb-2" style={{ color: 'var(--color-error)' }}>{errMsg}</p>
        )}

        {loading ? (
          <Loading text="开阁迎客..." />
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3 opacity-30">🎐</div>
            <p className="font-serif text-sm tracking-wider" style={{ color: 'var(--text-muted)' }}>
              阁中尚虚 · 待君添趣
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <a
                key={item.id}
                href={`/youyi/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <Card variant="parchment" elevation="sm" decorations={{ corners: true, innerBorder: true }}>
                  <div className="flex gap-4 items-start relative">
                    {/* 团扇图标 */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 font-serif text-lg"
                      style={{
                        background: 'var(--gradient-gold)',
                        color: '#fff',
                        boxShadow: 'var(--shadow-gold)',
                      }}
                    >
                      游
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-serif text-base font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </h2>
                      {item.description && (
                        <p className="text-xs mt-1.5 leading-relaxed line-clamp-2 font-serif" style={{ color: 'var(--text-secondary)' }}>
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {item.file_size > 0 && (
                          <span className="text-[10px] font-serif" style={{ color: 'var(--text-muted)' }}>
                            {Math.max(1, Math.round(item.file_size / 1024))} KB
                          </span>
                        )}
                        <span className="text-[10px] font-serif" style={{ color: 'var(--text-muted)' }}>
                          新标签打开
                        </span>
                      </div>
                    </div>

                    <span
                      className="text-xs shrink-0 mt-1 transition-all group-hover:translate-x-1"
                      style={{ color: 'var(--color-primary)', opacity: 0.5 }}
                    >
                      →
                    </span>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
