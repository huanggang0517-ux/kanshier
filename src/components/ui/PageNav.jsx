'use client'

import { useRouter } from 'next/navigation'

/**
 * PageNav — 统一页面导航栏
 * 包含返回按钮 + 标题 + 可选的右侧附加元素
 */
export default function PageNav({
  title,
  right,
  onBack,
}) {
  const router = useRouter()

  return (
    <div
      className="flex items-center gap-3 py-2 border-b mb-6"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <button
        onClick={onBack || (() => router.back())}
        className="flex items-center justify-center w-8 h-8 -ml-1 rounded-lg transition-colors hover:opacity-70"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="返回"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span
        className="text-base font-medium font-serif tracking-wider"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </span>
      {right && (
        <span className="ml-auto">{right}</span>
      )}
    </div>
  )
}
