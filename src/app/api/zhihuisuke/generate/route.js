import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { checkVipExpiry } from '@/lib/auth'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

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

    // 通过 proxy 调用 OpenMAIC（kanshier.top 可被 Vercel 函数访问）
    let openmaicData
    try {
      const proxyUrl = `https://kanshier.top/api/zhihuisuke/openmaic/generate-classroom`
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement }),
      })
      if (!res.ok) {
        throw new Error(`OpenMAIC proxy returned ${res.status}`)
      }
      openmaicData = await res.json()
    } catch (e) {
      // OpenMAIC 不可达，回滚次数
      if (!activeUser.is_vip) {
        await supabase.from('users').update({ free_count: activeUser.free_count }).eq('id', userId)
      }
      return NextResponse.json({ error: `课程生成服务不可达: ${e.message}` }, { status: 502 })
    }

    const { data: reading, error: readingErr } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
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
      remaining: activeUser.is_vip ? -1 : activeUser.free_count - 1,
    })
  } catch (err) {
    console.error('zhihuisuke generate error:', err.message)
    return NextResponse.json({ error: '服务器繁忙，请稍后重试' }, { status: 500 })
  }
}
