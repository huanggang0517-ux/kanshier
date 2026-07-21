import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { checkVipExpiry } from '@/lib/auth'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const openmaicBaseUrl = process.env.OPENMAIC_BASE_URL
    if (!openmaicBaseUrl) {
      return NextResponse.json({ error: '智慧速课服务未配置' }, { status: 500 })
    }

    const { userId, requirement } = await req.json()

    if (!requirement || !userId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('free_count, is_vip, vip_expiry')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const activeUser = await checkVipExpiry(supabase, user)
    const canProceed = activeUser.is_vip || activeUser.free_count > 0
    if (!canProceed) {
      return NextResponse.json({ error: '次数不足，请购买年卡', needPayment: true }, { status: 403 })
    }

    if (!activeUser.is_vip) {
      await supabase
        .from('users')
        .update({ free_count: activeUser.free_count - 1 })
        .eq('id', userId)
    }

    const openmaicRes = await fetch(`${openmaicBaseUrl}/api/generate-classroom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement }),
    })

    if (!openmaicRes.ok) {
      const errText = await openmaicRes.text()
      if (!activeUser.is_vip) {
        await supabase
          .from('users')
          .update({ free_count: activeUser.free_count })
          .eq('id', userId)
      }
      return NextResponse.json({ error: `课程生成服务异常: ${openmaicRes.status}` }, { status: 502 })
    }

    const data = await openmaicRes.json()

    const { data: reading } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
        service_type: 'zhihuisuke',
        input_data: { requirement, openmaic_job_id: data.jobId },
        result_data: { status: 'generating', step: data.step, progress: data.progress },
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      jobId: data.jobId,
      courseRecordId: reading.id,
      pollUrl: `/api/zhihuisuke/status/${data.jobId}?record_id=${reading.id}`,
      remaining: activeUser.is_vip ? -1 : activeUser.free_count - 1,
    })
  } catch (err) {
    console.error('zhihuisuke generate error:', err)
    return NextResponse.json({ error: '服务器繁忙，请稍后重试' }, { status: 500 })
  }
}
