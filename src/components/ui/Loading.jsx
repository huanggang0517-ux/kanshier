'use client'

/**
 * Loading — 通用加载状态
 */
export default function Loading({
  text = '加载中...',
  className = '',
}) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div
        className="w-8 h-8 mx-auto mb-3 rounded-full border-2"
        style={{
          borderColor: 'var(--border-color)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p className="text-sm font-serif tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {text}
      </p>
    </div>
  )
}
