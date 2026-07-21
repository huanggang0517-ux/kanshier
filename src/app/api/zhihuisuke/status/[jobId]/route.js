import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req, { params }) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { jobId } = await params
    const recordId = req.nextUrl.searchParams.get('record_id')

    // 先尝试从 Supabase 读取（webhook 持续同步中）
    if (recordId) {
      const { data: record } = await supabase
        .from('readings')
        .select('result_data')
        .eq('id', recordId)
        .single()

      const rd = record?.result_data
      if (rd?.status === 'succeeded' || rd?.status === 'failed') {
        return NextResponse.json(rd)
      }
    }

    // 未完成则通过 proxy 轮询 OpenMAIC
    const proxyUrl = `https://kanshier.top/api/zhihuisuke/openmaic/generate-classroom/${jobId}`
    const openmaicRes = await fetch(proxyUrl, { cache: 'no-store' })

    if (!openmaicRes.ok) {
      return NextResponse.json({ error: '无法获取生成状态' }, { status: openmaicRes.status })
    }

    const data = await openmaicRes.json()

    if (recordId) {
      const { data: existing } = await supabase
        .from('readings')
        .select('result_data')
        .eq('id', recordId)
        .single()

      const wasNotDone = existing?.result_data?.status !== 'succeeded' && existing?.result_data?.status !== 'failed'

      if (wasNotDone && (data.status === 'succeeded' || data.status === 'failed')) {
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
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('zhihuisuke status error:', err)
    return NextResponse.json({ error: '服务器繁忙，请稍后重试' }, { status: 500 })
  }
}
