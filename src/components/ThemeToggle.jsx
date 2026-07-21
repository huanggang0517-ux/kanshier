'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300"
      style={{ background: dark ? 'var(--gold-dark)' : 'var(--border-color)' }}
      aria-label="切换主题"
    >
      <div
        className="w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-[10px]"
        style={{
          background: dark ? 'var(--taiji-yin-bg)' : '#fff',
          transform: dark ? 'translateX(20px)' : 'translateX(0)',
          color: dark ? 'var(--gold)' : 'var(--ink-muted)',
        }}
      >
        {dark ? '☾' : '☀'}
      </div>
    </button>
  )
}
