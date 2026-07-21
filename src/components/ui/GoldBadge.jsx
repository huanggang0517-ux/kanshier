'use client'

/**
 * GoldBadge — 金色圆形数字徽标 (用于步骤指示)
 */
export default function GoldBadge({ number, children }) {
  return (
    <span
      className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'var(--color-primary)' }}
    >
      {children || number}
    </span>
  )
}
