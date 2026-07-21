'use client'

/**
 * Card — 古风融合卡片容器
 * variant: 'default' | 'parchment' | 'glass' | 'gold' | 'cinnabar'
 * decorations: corners (角饰), innerBorder (内框), stitches (书缝线)
 * elevation: 'none' | 'xs' | 'sm' | 'md' | 'lg'
 */
export default function Card({
  children,
  variant = 'default',
  decorations = { corners: true, innerBorder: true, stitches: false },
  elevation = 'sm',
  className = '',
  padding = true,
  accent = null, // 'left' | 'top' | null — 左侧或顶部强调色条
  onClick,
  as: Component = 'div',
  style = {},
  ...props
}) {
  const variants = {
    default: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
    },
    parchment: {
      background: 'var(--gradient-card)',
      border: '1px solid var(--border-color)',
    },
    glass: {
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--material-regular)',
      WebkitBackdropFilter: 'var(--material-regular)',
      border: '1px solid var(--glass-border)',
    },
    gold: {
      background: 'var(--gradient-gold)',
      border: 'none',
      color: '#fff',
    },
    cinnabar: {
      background: 'var(--gradient-cinnabar)',
      border: 'none',
      color: '#fff',
    },
  }

  const shadows = {
    none: 'none',
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  }

  const v = variants[variant] || variants.default

  return (
    <Component
      onClick={onClick}
      className={`relative overflow-hidden transition-all
        ${padding ? 'px-5 py-5' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${variant === 'glass' ? 'glass-card' : ''}
        ${className}`}
      style={{
        background: v.background,
        border: v.border,
        color: v.color,
        boxShadow: shadows[elevation] || shadows.sm,
        borderLeft: accent === 'left' ? `3px solid var(--color-accent)` : undefined,
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
      {...props}
    >
      {/* 角饰 */}
      {decorations.corners && (
        <>
          <div className="absolute top-0 left-0 w-3 h-px pointer-events-none" style={{ background: 'var(--color-primary)' }} />
          <div className="absolute top-0 left-0 w-px h-3 pointer-events-none" style={{ background: 'var(--color-primary)' }} />
          <div className="absolute bottom-0 right-0 w-3 h-px pointer-events-none" style={{ background: 'var(--color-primary)' }} />
          <div className="absolute bottom-0 right-0 w-px h-3 pointer-events-none" style={{ background: 'var(--color-primary)' }} />
        </>
      )}

      {/* 内框 */}
      {decorations.innerBorder && (
        <div className="absolute inset-[3px] pointer-events-none" style={{ border: '1px solid var(--border-color)', opacity: 0.4 }} />
      )}

      {/* 缝线装饰 */}
      {decorations.stitches && (
        <>
          <div className="absolute top-0 left-4 right-4 flex justify-between pointer-events-none">
            {[...Array(7)].map((_, i) => (
              <div key={`st-${i}`} className="w-px h-1.5" style={{ background: 'var(--color-primary)', opacity: 0.12 }} />
            ))}
          </div>
          <div className="absolute bottom-0 left-4 right-4 flex justify-between pointer-events-none">
            {[...Array(7)].map((_, i) => (
              <div key={`sb-${i}`} className="w-px h-1.5" style={{ background: 'var(--color-primary)', opacity: 0.12 }} />
            ))}
          </div>
        </>
      )}

      {children}
    </Component>
  )
}
