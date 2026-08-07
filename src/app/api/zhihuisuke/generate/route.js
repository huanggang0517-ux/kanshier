import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getActiveUser, unauth } from '@/lib/session'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getActiveUser()
    if (!user) return unauth()

    const { requirement } = await req.json()

    if (!requirement) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const canProceed = user.is_vip || user.free_count > 0
    if (!canProceed) {
      return NextResponse.json({ error: '次数不足，请购买年卡', needPayment: true }, { status: 403 })
    }

    if (!user.is_vip) {
      await supabase
        .from('users')
        .update({ free_count: user.free_count - 1 })
        .eq('id', user.id)
    }

    let openmaicData
    try {
      // OPENMAIC_BASE_URL 优先（本地开发/自建部署），否则走 Vercel rewrite proxy
      const openmaicUrl = process.env.OPENMAIC_BASE_URL
        ? `${process.env.OPENMAIC_BASE_URL}/api/generate-classroom`
        : `https://openmaic.kanshier.top/api/generate-classroom`
      const res = await fetch(openmaicUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, enableTTS: true }),
      })
      if (!res.ok) {
        throw new Error(`OpenMAIC returned ${res.status}`)
      }
      openmaicData = await res.json()
    } catch (e) {
      // OpenMAIC 不可达，回滚次数
      if (!user.is_vip) {
        await supabase.from('users').update({ free_count: user.free_count }).eq('id', user.id)
      }
      return NextResponse.json({ error: `课程生成服务不可达: ${e.message}` }, { status: 502 })
    }

    const { data: reading, error: readingErr } = await supabase
      .from('readings')
      .insert({
        user_id: user.id,
        service_type: 'zhihuisuke',
        input_data: { requirement, openmaic_job_id: openmaicData.jobId },
        result_data: { status: 'generating', step: openmaicData.step, progress: openmaicData.progress },
      })
      .select()
      .single()

    if (readingErr) {
      return NextResponse.json({ error: '记录保存失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      jobId: openmaicData.jobId,
      courseRecordId: reading.id,
      pollUrl: `/api/zhihuisuke/status/${openmaicData.jobId}?record_id=${reading.id}`,
      remaining: user.is_vip ? -1 : user.free_count - 1,
    })
  } catch (err) {
    console.error('zhihuisuke generate error:', err.message)
    return NextResponse.json({ error: '服务器繁忙，请稍后重试' }, { status: 500 })
  }
}
