'use client'

import Link from 'next/link'

export default function ServiceCard({ href, icon, title, subtitle, price, featured }) {
  if (featured) {
    return (
      <Link href={href}>
        <div
          className="rounded-2xl text-center py-5 px-3 mb-4"
          style={{ background: 'linear-gradient(135deg, #c9a96e, #b8944f)' }}
        >
          <div className="text-2xl mb-1">🔮</div>
          <div className="text-white text-base font-semibold tracking-wider">{title}</div>
          <div className="text-white/80 text-xs mt-1">{subtitle}</div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href}>
      <div
        className="rounded-2xl py-5 px-2 text-center transition-transform active:scale-95"
        style={{
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="text-2xl mb-1.5">{icon}</div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{price}</div>
      </div>
    </Link>
  )
}
