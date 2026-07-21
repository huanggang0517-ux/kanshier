'use client'

/**
 * SealStamp — 朱砂印章组件
 * 用于显示价格标签、特殊标识等
 */
export default function SealStamp({
  children,
  variant = 'cinnabar',
  size = 'sm',
  rotation = -2,
  className = '',
}) {
  const colors = {
    cinnabar: { background: 'var(--cinnabar)', color: '#fff' },
    gold: { background: 'var(--gold)', color: '#fff' },
    ink: { background: 'var(--ink)', color: '#fff' },
  }

  const sizes = {
    sm: { padding: '3px 8px', fontSize: 11 },
    md: { padding: '5px 12px', fontSize: 12 },
    lg: { padding: '8px 18px', fontSize: 14 },
  }

  const c = colors[variant] || colors.cinnabar
  const s = sizes[size] || sizes.sm

  return (
    <span
      className={`inline-flex items-center justify-center font-serif select-none ${className}`}
      style={{
        background: c.background,
        color: c.color,
        padding: s.padding,
        fontSize: s.fontSize,
        letterSpacing: 'var(--tracking-wide)',
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {children}
    </span>
  )
}
