'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import InkInput from '@/components/ui/InkInput'
import SealStamp from '@/components/ui/SealStamp'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminYouyiPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const [showUpload, setShowUpload] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (user && !user.is_admin) { router.push('/'); return }
    if (user?.is_admin) loadItems()
  }, [authLoading, user, router])

  async function loadItems() {
    try {
      const res = await fetch('/api/youyi?all=true')
      const data = await res.json()
      setItems(data.items || [])
    } catch {}
    setLoading(false)
  }

  async function handleUpload() {
    if (!uploadTitle.trim() || !uploadFile) {
      setMsg('请填写名称并选择 HTML 文件'); return
    }
    if (!uploadFile.name.toLowerCase().endsWith('.html')) {
      setMsg('请上传 .html 单文件'); return
    }
    if (uploadFile.size > 4 * 1024 * 1024) {
      setMsg('文件超过 4MB 限制'); return
    }

    setUploading(true)
    setMsg('')
    try {
      const formData = new FormData()
      formData.append('action', 'upload')
      formData.append('title', uploadTitle.trim())
      formData.append('description', uploadDesc.trim())
      formData.append('file', uploadFile)

      const res = await fetch('/api/youyi', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || '上传失败'); return }

      const warn = data.externalRefs > 0
        ? `（注意：检测到 ${data.externalRefs} 处外链，会被安全策略拦截，工具将缺图或失效，请改为内联或 data: URI）`
        : ''
      setMsg(`「${uploadTitle}」上传成功${warn}`)
      setShowUpload(false)
      setUploadTitle('')
      setUploadDesc('')
      setUploadFile(null)
      loadItems()
    } catch {
      setMsg('上传失败')
    }
    setUploading(false)
  }

  async function handleTogglePublish(id) {
    const formData = new FormData()
    formData.append('action', 'toggle_publish')
    formData.append('id', id)

    const res = await fetch('/api/youyi', { method: 'POST', body: formData })
    const data = await res.json()
    setMsg(res.ok ? data.message : data.error)
    loadItems()
  }

  async function handleDelete(id, title) {
    if (!confirm(`确定删除「${title}」？HTML 文件将被一并移除`)) return
    const formData = new FormData()
    formData.append('action', 'delete')
    formData.append('id', id)

    const res = await fetch('/api/youyi', { method: 'POST', body: formData })
    const data = await res.json()
    setMsg(res.ok ? data.message : data.error)
    loadItems()
  }

  if (authLoading || loading) return <><Header /><Loading /></>

  return (
    <>
      <Header />
      <PageNav title="游艺阁管理" onBack={() => router.push('/admin')} />

      {msg && (
        <p className="text-xs text-center mb-4" style={{ color: msg.includes('成功') ? 'var(--color-success)' : 'var(--color-error)' }}>
          {msg}
        </p>
      )}

      <Button fullWidth onClick={() => setShowUpload(!showUpload)} className="mb-4">
        {showUpload ? '收起' : '+ 上传新工具'}
      </Button>

      {showUpload && (
        <Card variant="parchment" elevation="sm" decorations={{ corners: false, innerBorder: false }} className="mb-4">
          <div className="flex flex-col gap-3">
            <InkInput
              placeholder="名称 *"
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
            />
            <InkInput
              variant="textarea"
              placeholder="简介（选填）"
              rows={3}
              value={uploadDesc}
              onChange={e => setUploadDesc(e.target.value)}
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
                <span className="font-serif">{uploadFile ? uploadFile.name : '选择 HTML 文件 *'}</span>
                <input
                  type="file"
                  accept=".html,text/html"
                  onChange={e => setUploadFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                单个 .html 文件，4MB 以内，须自包含（内联样式与脚本）
              </p>
            </div>
            <Button fullWidth loading={uploading} disabled={uploading} onClick={handleUpload}>
              {uploading ? '上传中...' : '确认上传'}
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-sm" style={{ color: 'var(--text-muted)' }}>阁中尚虚，上传第一个吧</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <Card key={item.id} variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} padding={false}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-serif text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                    {item.file_size > 0 && (
                      <span className="text-[10px] ml-2 font-serif" style={{ color: 'var(--text-muted)' }}>
                        {Math.max(1, Math.round(item.file_size / 1024))} KB
                      </span>
                    )}
                    {!item.is_published && (
                      <span className="ml-2 align-middle">
                        <SealStamp variant="ink" size="sm" rotation={0}>待刊</SealStamp>
                      </span>
                    )}
                    {item.description && (
                      <p className="text-xs mt-1 leading-relaxed font-serif" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handleTogglePublish(item.id)}>
                    {item.is_published ? '下架' : '发布'}
                  </Button>
                  {item.is_published && (
                    <Button size="sm" variant="ghost" onClick={() => window.open(`/youyi/${item.id}`, '_blank', 'noopener')}>
                      预览
                    </Button>
                  )}
                  <Button size="sm" variant="cinnabar" onClick={() => handleDelete(item.id, item.title)}>
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
