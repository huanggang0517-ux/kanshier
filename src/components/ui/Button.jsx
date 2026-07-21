'use client'

/**
 * Button — 古风融合按钮组件
 * variant: 'gold' | 'ink' | 'cinnabar' | 'outline' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'gold',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const variants = {
    gold: {
      background: 'var(--bg-action-normal)',
      color: 'var(--text-on-primary)',
      hover: 'var(--bg-action-hover)',
    },
    ink: {
      background: 'var(--gradient-ink)',
      color: 'var(--text-on-primary)',
      hover: 'var(--ink)',
    },
    cinnabar: {
      background: 'var(--bg-action-accent)',
      color: 'var(--text-on-primary)',
      hover: 'var(--color-accent-hover)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-color)',
      hover: 'var(--bg-card)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      hover: 'var(--bg-secondary)',
    },
  }

  const sizes = {
    sm: { padding: '6px 14px', fontSize: 11 },
    md: { padding: '10px 24px', fontSize: 13 },
    lg: { padding: '14px 32px', fontSize: 14 },
  }

  const v = variants[variant] || variants.gold
  const s = sizes[size] || sizes.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative font-semibold rounded-xl transition-all select-none
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-default' : 'cursor-pointer active:scale-[0.97]'}
        ${className}`}
      style={{
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        padding: s.padding,
        fontSize: s.fontSize,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading && v.hover) {
          e.currentTarget.style.background = v.hover
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = v.background
        }
      }}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
