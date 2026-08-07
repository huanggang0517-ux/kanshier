'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between py-3">
      <Link href="/" className="flex items-center gap-2 group">
        <span
          className="font-serif text-lg font-bold tracking-widest transition-colors"
          style={{ color: 'var(--color-primary)' }}
        >
          玄机
        </span>
        <span
          className="text-[10px] font-serif tracking-wider transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          看事儿
        </span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          href="/manifest"
          className="font-serif text-xs tracking-widest transition-all hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          著
        </Link>
        <Link
          href="/zhihuisuke"
          className="font-serif text-xs tracking-widest transition-all hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          课
        </Link>
        <Link
          href={user ? '/profile' : '/login'}
          className="font-serif text-xs tracking-wider transition-all hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          {user ? '我的' : '登录'}
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  )
}
