'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MianxiangPage() {
  const router = useRouter()
  return (
    <>
      <Header />
      <div className="flex items-center gap-3 py-2 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', fontSize: 18 }}>←</button>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>AI 面相</span>
      </div>
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🚧</div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>功能开发中，敬请期待</p>
        <button onClick={() => router.push('/')} className="mt-6 text-xs underline" style={{ color: 'var(--gold-primary)' }}>
          返回首页
        </button>
      </div>
    </>
  )
}
