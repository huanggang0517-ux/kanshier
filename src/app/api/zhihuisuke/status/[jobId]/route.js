import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req, { params }) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const openmaicBaseUrl = process.env.OPENMAIC_BASE_URL
    if (!openmaicBaseUrl) {
      return NextResponse.json({ error: '智慧速课服务未配置' }, { status: 500 })
    }

    const { jobId } = await params
    const recordId = req.nextUrl.searchParams.get('record_id')

    const openmaicRes = await fetch(`${openmaicBaseUrl}/api/generate-classroom/${jobId}`, {
      cache: 'no-store',
    })

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
              classroom_id: data.result?.id,
              classroom_url: data.result?.url,
              message: data.message,
              error: data.error,
              title: data.result?.stage?.title,
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
