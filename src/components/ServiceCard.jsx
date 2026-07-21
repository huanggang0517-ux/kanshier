'use client'

import Link from 'next/link'

export default function ServiceCard({ href, icon, title, subtitle, price }) {
  return (
    <Link href={href}>
      <div
        className="text-center transition-all active:scale-[0.97]"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 12px',
        }}
      >
        <div className="text-xl mb-1.5">{icon || '·'}</div>
        <div className="font-serif text-sm font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
          {title}
        </div>
        {subtitle && (
          <div className="font-serif text-[11px] mt-1 tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
        {price && (
          <div className="font-serif text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
            {price}
          </div>
        )}
      </div>
    </Link>
  )
}
