import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSessionUser, unauth, forbidden } from '@/lib/session'

export async function GET(req, { params }) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()

    const { jobId } = await params
    const recordId = req.nextUrl.searchParams.get('record_id')

    // 有 record_id 时校验该记录归属当前用户
    if (recordId) {
      const { data: record } = await supabase
        .from('readings')
        .select('user_id, result_data')
        .eq('id', recordId)
        .single()

      if (!record) return NextResponse.json({ error: '记录不存在' }, { status: 404 })
      if (record.user_id !== user.id) return forbidden()

      const rd = record?.result_data
      if (rd?.status) {
        return NextResponse.json(rd)
      }
    }

    // Supabase 无数据则轮询 OpenMAIC（优先本地 URL）
    const openmaicUrl = process.env.OPENMAIC_BASE_URL
      ? `${process.env.OPENMAIC_BASE_URL}/api/generate-classroom/${jobId}`
      : `https://openmaic.kanshier.top/api/generate-classroom/${jobId}`
    const openmaicRes = await fetch(openmaicUrl, { cache: 'no-store' })

    if (!openmaicRes.ok) {
      return NextResponse.json({ error: '无法获取生成状态' }, { status: openmaicRes.status })
    }

    const data = await openmaicRes.json()

    // 缓存完成状态到 Supabase
    if (recordId && (data.status === 'succeeded' || data.status === 'failed')) {
      await supabase
        .from('readings')
        .update({
          result_data: {
            status: data.status,
            step: data.step,
            progress: data.progress,
            classroom_id: data.result?.classroomId,
            classroom_url: data.result?.url,
            scenes_count: data.result?.scenesCount,
            message: data.message,
            error: data.error,
          },
        })
        .eq('id', recordId)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('zhihuisuke status error:', err)
    return NextResponse.json({ error: '服务器繁忙，请稍后重试' }, { status: 500 })
  }
}
