'use client'

/**
 * InkInput — 古风融合输入框
 * variant: 'default' | 'textarea' | 'solid'
 */
export default function InkInput({
  variant = 'default',
  label,
  error,
  helperText,
  className = '',
  ...props
}) {
  const baseStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    outline: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    fontSize: 14,
    width: '100%',
    transition: 'border-color var(--duration-fast) var(--ease-in-out)',
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}

      {variant === 'textarea' ? (
        <textarea
          className={`resize-none leading-relaxed ${className}`}
          style={baseStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
          {...props}
        />
      ) : (
        <input
          className={className}
          style={baseStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
          {...props}
        />
      )}

      {error && (
        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{helperText}</p>
      )}
    </div>
  )
}
