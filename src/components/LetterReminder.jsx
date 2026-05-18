'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/utils'

export default function LetterReminder() {
  const router = useRouter()
  const [letter, setLetter] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) return

    fetch(`/api/letter?userId=${u.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.has_deliverable && data.letters.length > 0) {
          setLetter(data.letters[0])
        }
      })
      .catch(() => {})
  }, [])

  if (!letter || dismissed) return null

  async function handleOpen() {
    const u = getUser()
    if (!u) return
    try {
      await fetch('/api/letter/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, readingId: letter.id })
      })
    } catch {}
    router.push(`/result/${letter.id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={{ animation: 'fadeIn 0.3s' }}>
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl p-8 text-center shadow-xl border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="text-5xl mb-4 animate-bounce">📬</div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          你有一封来信
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          来自 {new Date(letter.created_at).getFullYear()} 年的自己<br />
          已经到了开启的时候了
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDismissed(true)}
            className="flex-1 rounded-xl py-2.5 text-sm border"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            稍后
          </button>
          <button
            onClick={handleOpen}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: 'var(--gold-primary)' }}
          >
            开启
          </button>
        </div>
      </div>
    </div>
  )
}
