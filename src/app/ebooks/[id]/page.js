'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Loading from '@/components/ui/Loading'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export default function EbookReaderPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [book, setBook] = useState(null)
  const [signedUrl, setSignedUrl] = useState('')
  const [notes, setNotes] = useState([])
  const [bookLoading, setBookLoading] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (loading || !user || !id) return

    async function load() {
      try {
        const bookRes = await fetch(`/api/ebooks?id=${id}`)
        if (!bookRes.ok) { router.push('/ebooks'); return }
        const bookData = await bookRes.json()
        setBook(bookData.book)

        // 尝试获取签名 URL（服务端校验权限：admin 或已解锁且已发布）
        const urlRes = await fetch(`/api/ebooks/read?id=${id}`)
        if (urlRes.ok) {
          const urlData = await urlRes.json()
          setSignedUrl(urlData.signedUrl)
        } else {
          router.push('/ebooks')
          return
        }

        // 加载笔记
        const notesRes = await fetch(`/api/ebooks/notes?ebookId=${id}`)
        if (notesRes.ok) {
          const notesData = await notesRes.json()
          setNotes(notesData.notes || [])
        }
      } catch {
        router.push('/ebooks')
      } finally {
        setBookLoading(false)
      }
    }
    load()
  }, [loading, user, id, router])

  if (bookLoading) {
    return (
      <>
        <Header />
        <Loading />
      </>
    )
  }

  if (!book) return null

  return (
    <>
      <Header />
      <PageNav title={book.title} onBack={() => router.push('/ebooks')} />

      {/* 书籍简介 */}
      <div className="mb-3 text-center">
        <p className="font-serif text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {book.author}
        </p>
        {book.description && (
          <p className="font-serif text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {book.description}
          </p>
        )}
      </div>

      {/* PDF 阅读器 */}
      <div
        style={{
          width: '100%',
          height: 'calc(100dvh - 200px)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          position: 'relative',
        }}
      >
        {signedUrl && !iframeError ? (
          <iframe
            src={signedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={book.title}
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
            <p className="font-serif text-sm" style={{ color: 'var(--text-secondary)' }}>
              {iframeError ? '阅读器加载失败' : '正在加载...'}
            </p>
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline font-serif"
                style={{ color: 'var(--color-primary)' }}
              >
                在新窗口打开
              </a>
            )}
          </div>
        )}
      </div>

      {/* 笔记切换 */}
      {notes.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-2 text-sm font-serif font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--color-primary)' }}>▎</span>
            批注 · {notes.length}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{showNotes ? '▲' : '▼'}</span>
          </button>

          {showNotes && (
            <div className="flex flex-col gap-2 mt-3">
              {notes.map(note => (
                <Card key={note.id} variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} padding={false}>
                  <div className="p-3">
                    <div className="text-xs font-serif leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {note.content}
                    </div>
                    <div className="text-[10px] mt-2 font-serif" style={{ color: 'var(--text-muted)' }}>
                      {new Date(note.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 底部操作 */}
      <div className="flex gap-2 mt-4 mb-8">
        {signedUrl && (
          <Button variant="outline" fullWidth onClick={() => window.open(signedUrl, '_blank')}>
            新窗口阅读
          </Button>
        )}
        <Button variant="gold" fullWidth onClick={() => router.push('/ebooks')}>
          返回经阁
        </Button>
      </div>
    </>
  )
}
