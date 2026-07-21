'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PageNav from '@/components/ui/PageNav'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import InkInput from '@/components/ui/InkInput'
import Loading from '@/components/ui/Loading'
import { getUser } from '@/lib/utils'

export default function ZhihuisukePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [requirement, setRequirement] = useState('')
  const [generating, setGenerating] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [doneCourse, setDoneCourse] = useState(null)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    const u = getUser()
    if (!u) router.push('/login')
    else setUser(u)
  }, [router])

  const loadCourses = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/zhihuisuke/courses?user_id=${user.id}`)
      const data = await res.json()
      if (data.courses) setCourses(data.courses)
    } catch {} finally {
      setCoursesLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadCourses()
  }, [user, loadCourses])

  async function handleGenerate() {
    if (!requirement.trim()) return
    setGenerating(true)
    setError('')
    setStatusMsg('正在启动课程生成...')
    setProgress(0)
    setDoneCourse(null)

    try {
      const res = await fetch('/api/zhihuisuke/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, requirement: requirement.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.needPayment) {
          router.push('/vip')
          return
        }
        setError(data.error || '生成失败')
        setGenerating(false)
        return
      }

      setStatusMsg('正在生成课程内容，请稍候...')
      setProgress(10)

      const pollId = data.jobId
      const recordId = data.courseRecordId

      // 轮询生成状态
      let pollCount = 0
      const poll = async () => {
        try {
          const statusRes = await fetch(`/api/zhihuisuke/status/${pollId}?record_id=${recordId}`)
          const status = await statusRes.json()

          if (status.progress) setProgress(Math.round(status.progress * 100))
          if (status.message) setStatusMsg(status.message)

          if (status.status === 'succeeded' || status.done === true) {
            setProgress(100)
            setStatusMsg('课程生成完成！')
            setDoneCourse({
              id: status.result?.id,
              url: status.result?.url,
              title: status.result?.stage?.title || requirement.trim(),
            })
            setGenerating(false)
            loadCourses()
            return
          }

          if (status.status === 'failed') {
            setError(status.error || '课程生成失败')
            setGenerating(false)
            return
          }

          pollCount++
          if (pollCount < 120) {
            setTimeout(poll, 5000)
          } else {
            setError('生成超时，请稍后刷新查看')
            setGenerating(false)
          }
        } catch {
          setError('查询状态失败')
          setGenerating(false)
        }
      }

      setTimeout(poll, 5000)
    } catch {
      setError('网络错误，请重试')
      setGenerating(false)
    }
  }

  const isVip = user?.is_vip

  return (
    <>
      <Header />
      <PageNav title="智慧速课" />

      {/* 额度展示 */}
      <Card variant="parchment" elevation="xs" decorations={{ corners: false, innerBorder: false }} padding={false} className="mb-5">
        <div className="p-3 flex items-center justify-between">
          <span className="text-xs font-serif" style={{ color: 'var(--text-secondary)' }}>
            {isVip ? '年卡用户 · 无限次' : `剩余次数：${user?.free_count ?? 0} 次`}
          </span>
          {!isVip && (
            <a href="/vip" className="text-xs font-serif" style={{ color: 'var(--color-accent)' }}>
              开通年卡 →
            </a>
          )}
        </div>
      </Card>

      {/* 生成表单 */}
      <Card variant="parchment" elevation="sm" className="mb-6">
        <h2 className="text-sm font-serif tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
          输入课程主题
        </h2>
        <InkInput
          variant="textarea"
          rows={4}
          placeholder="例如：介绍太阳系八大行星，适合小学生"
          value={requirement}
          onChange={e => setRequirement(e.target.value)}
          disabled={generating}
        />
        <div className="mt-4">
          <Button
            fullWidth
            loading={generating}
            disabled={generating || !requirement.trim() || (!isVip && (user?.free_count ?? 0) === 0)}
            onClick={handleGenerate}
          >
            {generating ? '生成中...' : '生成课程'}
          </Button>
        </div>
      </Card>

      {/* 生成进度 */}
      {generating && (
        <Card variant="glass" elevation="sm" className="mb-6">
          <div className="mb-2">
            <div className="text-xs font-serif mb-1" style={{ color: 'var(--text-secondary)' }}>
              {statusMsg}
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'var(--color-primary)' }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* 生成完成 */}
      {doneCourse && !generating && (
        <Card variant="gold" elevation="md" className="mb-6 text-center">
          <p className="text-sm font-serif mb-3">课程已就绪</p>
          <Button
            variant="ink"
            onClick={() => {
              if (doneCourse.url) {
                const classroomId = doneCourse.url.split('/').pop()
                router.push(`/zhihuisuke/classroom/${classroomId}`)
              }
            }}
          >
            进入课堂
          </Button>
        </Card>
      )}

      {/* 错误提示 */}
      {error && !generating && (
        <div
          className="text-xs font-serif mb-6 p-3 rounded-lg"
          style={{ background: 'var(--color-error)', color: '#fff', opacity: 0.9 }}
        >
          {error}
        </div>
      )}

      {/* 历史课程 */}
      <div className="mb-4">
        <h3 className="text-xs font-serif tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          历史课程
        </h3>
        {coursesLoading ? (
          <Loading text="加载中..." />
        ) : courses.length === 0 ? (
          <p className="text-xs font-serif text-center py-6" style={{ color: 'var(--text-muted)' }}>
            暂无课程
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {courses.map(course => (
              <Card
                key={course.id}
                variant="parchment"
                elevation="xs"
                decorations={{ corners: false, innerBorder: false }}
                padding={false}
              >
                <div
                  className="p-3 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
                  onClick={() => {
                    if (course.status === 'succeeded' && course.classroomUrl) {
                      const classroomId = course.classroomUrl.split('/').pop()
                      router.push(`/zhihuisuke/classroom/${classroomId}`)
                    }
                  }}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-serif truncate" style={{ color: 'var(--text-primary)' }}>
                      {course.requirement}
                    </p>
                    <p className="text-xs mt-0.5 font-serif" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(course.createdAt)} · {statusLabel(course.status)}
                    </p>
                  </div>
                  {course.status === 'succeeded' && (
                    <span className="text-sm flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>→</span>
                  )}
                  {course.status === 'failed' && (
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-error)' }}>失败</span>
                  )}
                  {course.status === 'generating' && (
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>生成中</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function statusLabel(status) {
  const map = { succeeded: '已完成', failed: '失败', generating: '生成中', unknown: '未知' }
  return map[status] || status
}
