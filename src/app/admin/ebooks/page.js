'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import InkInput from '@/components/ui/InkInput'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminEbooksPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // 上传表单
  const [showUpload, setShowUpload] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadAuthor, setUploadAuthor] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // 笔记
  const [noteBookId, setNoteBookId] = useState(null)
  const [noteContent, setNoteContent] = useState('')
  const [notesData, setNotesData] = useState({})
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (user && !user.is_admin) { router.push('/'); return }
    if (user?.is_admin) loadBooks()
  }, [authLoading, user, router])

  async function loadBooks() {
    try {
      const res = await fetch('/api/ebooks?all=true')
      const data = await res.json()
      setBooks(data.books || [])

      // 加载所有笔记
      const noteMap = {}
      for (const book of (data.books || [])) {
        const nr = await fetch(`/api/ebooks/notes?ebookId=${book.id}`)
        if (nr.ok) {
          const nd = await nr.json()
          noteMap[book.id] = nd.notes || []
        }
      }
      setNotesData(noteMap)
    } catch {}
    setLoading(false)
  }

  async function handleUpload() {
    if (!uploadTitle.trim() || !uploadFile) {
      setMsg('请填写书名并选择 PDF 文件'); return
    }
    if (uploadFile.type !== 'application/pdf' && !uploadFile.name.endsWith('.pdf')) {
      setMsg('请上传 PDF 格式文件'); return
    }

    setUploading(true)
    setMsg('')
    try {
      const formData = new FormData()
      formData.append('action', 'upload')
      formData.append('title', uploadTitle.trim())
      formData.append('author', uploadAuthor.trim())
      formData.append('description', uploadDesc.trim())
      formData.append('file', uploadFile)

      const res = await fetch('/api/ebooks', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error); return }

      setMsg(`「${uploadTitle}」上传成功`)
      setShowUpload(false)
      setUploadTitle('')
      setUploadAuthor('')
      setUploadDesc('')
      setUploadFile(null)
      loadBooks()
    } catch {
      setMsg('上传失败')
    }
    setUploading(false)
  }

  async function handleTogglePublish(bookId) {
    const formData = new FormData()
    formData.append('action', 'toggle_publish')
    formData.append('bookId', bookId)

    const res = await fetch('/api/ebooks', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) setMsg(data.message)
    else setMsg(data.error)
    loadBooks()
  }

  async function handleDelete(bookId) {
    if (!confirm('确定删除此书？PDF 文件将被一并移除')) return
    const formData = new FormData()
    formData.append('action', 'delete')
    formData.append('bookId', bookId)

    const res = await fetch('/api/ebooks', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) setMsg(data.message)
    else setMsg(data.error)
    loadBooks()
  }

  async function handleAddNote(ebookId) {
    if (!noteContent.trim()) return
    setSavingNote(true)
    try {
      const res = await fetch('/api/ebooks/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ebookId, content: noteContent.trim() })
      })
      if (res.ok) {
        setNoteContent('')
        setMsg('批注已添加')
        loadBooks()
      }
    } catch {}
    setSavingNote(false)
  }

  async function handleDeleteNote(noteId) {
    const res = await fetch(`/api/ebooks/notes?noteId=${noteId}`, { method: 'DELETE' })
    if (res.ok) {
      setMsg('批注已删除')
      loadBooks()
    }
  }

  if (authLoading || loading) return <><Header /><Loading /></>

  return (
    <>
      <Header />
      <PageNav title="书籍管理" onBack={() => router.push('/admin')} />

      {msg && (
        <p className="text-xs text-center mb-4" style={{ color: msg.includes('成功') ? 'var(--color-success)' : 'var(--color-error)' }}>
          {msg}
        </p>
      )}

      {/* 上传按钮 */}
      <Button fullWidth onClick={() => setShowUpload(!showUpload)} className="mb-4">
        {showUpload ? '收起' : '+ 上传新书'}
      </Button>

      {/* 上传表单 */}
      {showUpload && (
        <Card variant="parchment" elevation="sm" decorations={{ corners: false, innerBorder: false }} className="mb-4">
          <div className="flex flex-col gap-3">
            <input
              type="text" placeholder="书名 *" value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                fontSize: 14,
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
            />
            <input
              type="text" placeholder="作者（选填）" value={uploadAuthor}
              onChange={e => setUploadAuthor(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                fontSize: 14,
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
            />
            <textarea
              placeholder="简介（选填）" value={uploadDesc}
              onChange={e => setUploadDesc(e.target.value)}
              rows={3}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                fontSize: 14,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
            />
            <div>
              <label
                className="flex items-center justify-center py-3 text-sm cursor-pointer transition-all hover:opacity-80"
                style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-card)',
                }}
              >
                <span className="font-serif">{uploadFile ? uploadFile.name : '选择 PDF 文件 *'}</span>
                <input type="file" accept=".pdf,application/pdf" onChange={e => setUploadFile(e.target.files[0])} className="hidden" />
              </label>
            </div>
            <Button fullWidth loading={uploading} disabled={uploading} onClick={handleUpload}>
              {uploading ? '上传中...' : '确认上传'}
            </Button>
          </div>
        </Card>
      )}

      {/* 书籍列表 */}
      {books.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-sm" style={{ color: 'var(--text-muted)' }}>暂无书籍，上传第一本吧</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {books.map(book => (
            <div key={book.id}>
              <Card variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} padding={false}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-serif text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {book.title}
                      </span>
                      {book.author && (
                        <span className="font-serif text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                          {book.author}
                        </span>
                      )}
                      {book.file_size > 0 && (
                        <span className="text-[10px] ml-2 font-serif" style={{ color: 'var(--text-muted)' }}>
                          {(book.file_size / 1024 / 1024).toFixed(1)}MB
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-serif ${book.is_published ? '' : ''}`}
                      style={{
                        background: book.is_published ? 'rgba(52,199,89,0.1)' : 'rgba(255,149,0,0.1)',
                        color: book.is_published ? 'var(--color-success)' : 'var(--color-warning)',
                      }}
                    >
                      {book.is_published ? '已发布' : '未发布'}
                    </span>
                  </div>

                  {book.description && (
                    <p className="text-xs mt-1 mb-3 font-serif" style={{ color: 'var(--text-secondary)' }}>
                      {book.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleTogglePublish(book.id)}
                      className="text-xs px-3 py-1.5 border transition-colors hover:opacity-70 font-serif"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-pill)' }}>
                      {book.is_published ? '下架' : '发布'}
                    </button>
                    <button onClick={() => handleDelete(book.id)}
                      className="text-xs px-3 py-1.5 border transition-colors hover:opacity-70 font-serif"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--color-error)', borderRadius: 'var(--radius-pill)' }}>
                      删除
                    </button>
                    <button onClick={() => {
                      setNoteBookId(noteBookId === book.id ? null : book.id)
                      setNoteContent('')
                    }}
                      className="text-xs px-3 py-1.5 border transition-colors hover:opacity-70 font-serif"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-pill)' }}>
                      批注 {noteBookId === book.id ? '▲' : `(${(notesData[book.id] || []).length})`}
                    </button>
                  </div>
                </div>
              </Card>

              {/* 笔记区域 */}
              {noteBookId === book.id && (
                <div className="mt-2 mb-2 pl-4" style={{ borderLeft: '2px solid var(--border-color)' }}>
                  {/* 已有笔记 */}
                  {(notesData[book.id] || []).map(note => (
                    <div key={note.id} className="mb-2 flex justify-between items-start">
                      <p className="text-xs font-serif leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {note.content}
                      </p>
                      <button onClick={() => handleDeleteNote(note.id)}
                        className="text-[10px] shrink-0 ml-2 hover:opacity-70"
                        style={{ color: 'var(--color-error)' }}>
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* 新笔记输入 */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text" placeholder="添加批注..." value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        padding: '8px 12px',
                        fontSize: 13,
                        outline: 'none',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
                    />
                    <button onClick={() => handleAddNote(book.id)} disabled={savingNote || !noteContent.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90"
                      style={{ background: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
                      添加
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
