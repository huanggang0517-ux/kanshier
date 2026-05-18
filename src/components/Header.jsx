'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { getUser } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function Header() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  return (
    <div className="flex justify-between items-center py-2 px-0">
      <Link href="/" className="text-lg font-semibold tracking-widest" style={{ color: 'var(--gold-primary)' }}>
        玄机
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href={user ? '/profile' : '/login'}
          className="text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          {user ? '我的' : '登录'}
        </Link>
        <ThemeToggle />
      </div>
    </div>
  )
}
