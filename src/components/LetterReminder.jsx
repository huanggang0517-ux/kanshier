'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function LetterReminder() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [letter, setLetter] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (loading || !user) return

    fetch(`/api/letter`)
      .then(r => r.json())
      .then(data => {
        if (data.has_deliverable && data.letters.length > 0) {
          setLetter(data.letters[0])
        }
      })
      .catch(() => {})
  }, [loading, user])

  if (!letter || dismissed) return null

  async function handleOpen() {
    try {
      await fetch('/api/letter/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: letter.id })
      })
    } catch {}
    router.push(`/result/${letter.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center"
      style={{ background: 'var(--bg-overlay)', animation: 'fadeIn 0.3s' }}
    >
      <Card variant="glass" elevation="lg" decorations={{ corners: false, innerBorder: false }} className="mx-4 w-full max-w-sm text-center">
        <div className="text-5xl mb-4" style={{ animation: 'taiji-float 3s ease-in-out infinite' }}>📬</div>
        <h3 className="text-lg font-semibold mb-2 font-serif tracking-wider" style={{ color: 'var(--text-primary)' }}>
          你有一封来信
        </h3>
        <p className="text-sm mb-6 font-serif" style={{ color: 'var(--text-secondary)' }}>
          来自 {new Date(letter.created_at).getFullYear()} 年的自己<br />
          已经到了开启的时候了
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setDismissed(true)}
          >
            稍后
          </Button>
          <Button
            variant="gold"
            fullWidth
            onClick={handleOpen}
          >
            开启
          </Button>
        </div>
      </Card>
    </div>
  )
}
